'use client';
import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, useMap } from 'react-leaflet';
import L, { LatLngExpression, Control } from 'leaflet';
import 'leaflet-draw';
import { useMantineTheme } from '@mantine/core';

// Re-import interfaces/types if they are not globally defined
interface FarmField {
  id: string;
  name: string;
  crop: string;
  area: number; 
  geoJson?: GeoJSON.Feature<GeoJSON.Polygon>;
  color: string;
}

interface MapComponentProps {
    fields: FarmField[];
    selectedFieldId: string | null;
    onFieldUpdate: (updatedFields: FarmField[]) => void;
    onSelectionChange: (newSelectedId: string | null) => void;
}

// Calculate center (can be moved here or passed as prop)
const calculateCenter = (fields: FarmField[]): LatLngExpression => {
    if (fields.length === 0 || !fields[0].geoJson) return [47.17, 19.5]; // Default
    const firstCoords = fields[0].geoJson.geometry.coordinates[0];
    if (firstCoords.length === 0) return [47.17, 19.5];
    return [firstCoords[0][1], firstCoords[0][0]]; // Lat, Lng for Leaflet
};

// --- Wrapper for Leaflet Draw Control --- 
const DrawControlWrapper = (props: any) => {
    const map = useMap(); // Get map instance

    useEffect(() => {
        if (!map) return;

        const drawControl = new L.Control.Draw({
            position: props.position || 'topright',
            draw: props.draw,
            edit: {
                featureGroup: props.featureGroupRef.current, // Essential: Pass the FeatureGroup
                edit: props.edit?.edit ?? true,
                remove: props.edit?.remove ?? true,
            },
        });

        map.addControl(drawControl);

        // --- Event Handlers --- 
        const onDrawCreated = (e: any) => {
            if (props.onCreated) props.onCreated(e);
            // Optionally add layer to featureGroup automatically if needed
             if (props.featureGroupRef.current) {
                 const layer = e.layer;
                 props.featureGroupRef.current.addLayer(layer);
             }
        };
        const onDrawEdited = (e: any) => { if (props.onEdited) props.onEdited(e); };
        const onDrawDeleted = (e: any) => { if (props.onDeleted) props.onDeleted(e); };
        // Add other handlers like onDrawStart, onDrawStop if needed

        map.on(L.Draw.Event.CREATED, onDrawCreated);
        map.on(L.Draw.Event.EDITED, onDrawEdited);
        map.on(L.Draw.Event.DELETED, onDrawDeleted);

        // Cleanup function
        return () => {
            map.removeControl(drawControl);
            map.off(L.Draw.Event.CREATED, onDrawCreated);
            map.off(L.Draw.Event.EDITED, onDrawEdited);
            map.off(L.Draw.Event.DELETED, onDrawDeleted);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, props.featureGroupRef]); // Rerun effect if map or featureGroupRef changes

    return null; // This component doesn't render anything itself
};

export default function MapComponent({ 
    fields, 
    selectedFieldId, 
    onFieldUpdate, 
    onSelectionChange 
}: MapComponentProps) {
    
  const theme = useMantineTheme();
  const featureGroupRef = useRef<L.FeatureGroup>(null);
  const mapCenter = calculateCenter(fields);

  // --- Leaflet Draw Handlers ---
  const onCreated = (e: any) => {
    const layer = e.layer;
    const geoJson = layer.toGeoJSON();
    if (geoJson.geometry.type !== 'Polygon') {
        console.warn("Only polygon features are currently supported.");
        return;
    }
    console.log('Layer created:', geoJson);
    const newId = `new-${Math.random().toString(16).substring(2, 8)}`;
    const newField: FarmField = {
      id: newId,
      name: `New Field ${newId}`,
      crop: 'Unassigned',
      area: 0, // TODO: Calculate area
      geoJson: geoJson as GeoJSON.Feature<GeoJSON.Polygon>,
      color: 'purple',
    };
    // Update state in the parent component
    onFieldUpdate([...fields, newField]); 
    onSelectionChange(newId); 
  };

  const onEdited = (e: any) => {
    console.log('Layers edited:', e.layers);
    const updatedFields = [...fields]; // Create a mutable copy
    let changed = false;
    e.layers.eachLayer((layer: any) => {
      const leafletId = layer._leaflet_id;
      const geoJson = layer.toGeoJSON();
      console.log(`Edited layer ${leafletId}:`, geoJson);
      
      // Find the index of the field to update
      // This still uses simplistic geometry matching - needs improvement for robustness
      const fieldIndex = updatedFields.findIndex(field => 
          field.geoJson && JSON.stringify(field.geoJson.geometry) === JSON.stringify(geoJson.geometry)
      );
      
      if (fieldIndex !== -1) {
         console.log(`Updating field ${updatedFields[fieldIndex].id}`);
         updatedFields[fieldIndex] = { 
             ...updatedFields[fieldIndex], 
             geoJson: geoJson as GeoJSON.Feature<GeoJSON.Polygon>,
             // TODO: Recalculate area
         };
         changed = true;
      } else {
          console.warn("Could not find matching field in state for edited layer:", leafletId);
      }
    });
    if (changed) {
        onFieldUpdate(updatedFields);
    }
  };

  const onDeleted = (e: any) => {
    console.log('Layers deleted:', e.layers);
    let currentFields = [...fields];
    let changed = false;
     e.layers.eachLayer((layer: any) => {
         const leafletId = layer._leaflet_id;
         const initialLength = currentFields.length;
         // Filter out the deleted field
         currentFields = currentFields.filter(field => {
             return !(field.geoJson && JSON.stringify(field.geoJson.geometry) === JSON.stringify(layer.toGeoJSON().geometry));
         });
         if (currentFields.length < initialLength) {
             changed = true;
         }
     });
     if (changed) {
         onFieldUpdate(currentFields);
         onSelectionChange(null); // Clear selection after delete
     }
  };

  // --- Leaflet Icon Fix ---
   useEffect(() => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
            iconUrl: require('leaflet/dist/images/marker-icon.png').default,
            shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
        });
    }, []);

  return (
    <MapContainer 
        center={mapCenter} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
    >
         <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
         />
         
         <FeatureGroup ref={featureGroupRef}>
             <DrawControlWrapper
                position="topright"
                onCreated={onCreated}
                onEdited={onEdited}
                onDeleted={onDeleted}
                featureGroupRef={featureGroupRef}
                draw={{
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
                    marker: false,
                    polyline: false,
                    polygon: { allowIntersection: false },
                }}
                edit={{ 
                    edit: true, 
                    remove: true 
                }}
             />
             
             {fields.map(field => {
                 if (!field.geoJson) return null;
                 const positions = field.geoJson.geometry.coordinates[0].map(coord => [coord[1], coord[0]] as LatLngExpression);
                 return (
                    <Polygon 
                        key={field.id}
                        positions={positions}
                        pathOptions={{
                            color: theme.colors[field.color]?.[7] || '#555',
                            fillColor: theme.colors[field.color]?.[4] || '#888',
                            fillOpacity: 0.5,
                            weight: selectedFieldId === field.id ? 3 : 1.5
                        }}
                        eventHandlers={{
                            click: () => onSelectionChange(field.id),
                        }}
                     />
                 );
             })}
        </FeatureGroup>
    </MapContainer>
  );
} 