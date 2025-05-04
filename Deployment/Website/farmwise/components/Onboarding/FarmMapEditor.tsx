'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, FeatureGroup, GeoJSON } from 'react-leaflet';
import L, { LatLngExpression, Layer, Map } from 'leaflet';
import '@geoman-io/leaflet-geoman-free'; // Import Geoman JS

// --- Leaflet Icon Fix (copy from onboarding page) ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});
// --- End Icon Fix ---

// Define types for GeoJSON Features (can be expanded)
type PolygonGeoJsonFeature = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;

interface FarmMapEditorProps {
  center: LatLngExpression;
  zoom: number;
  boundary: PolygonGeoJsonFeature | null; // Currently edited/selected boundary
  setBoundary: (boundary: PolygonGeoJsonFeature | null) => void;
  detectedBoundaries?: PolygonGeoJsonFeature[]; // Optional array of detected boundaries
  onBoundarySelect?: (boundary: PolygonGeoJsonFeature) => void; // Callback when a detected boundary is clicked
  setMapInstance?: (map: Map) => void; // Callback to pass map instance up
  editableBoundaryKey?: number | string; // Key to force GeoJSON layer remount when boundary changes
}

// Internal component to handle Geoman integration and loading external GeoJSON
const GeomanIntegration = ({
    boundary, // The currently selected/active boundary
    setBoundary, // Function to update the active boundary
    editableBoundaryKey, // Key to help reset state
    detectedBoundaries // Pass detected boundaries down
  }: {
    boundary: FarmMapEditorProps['boundary'];
    setBoundary: FarmMapEditorProps['setBoundary'];
    editableBoundaryKey?: FarmMapEditorProps['editableBoundaryKey'];
    detectedBoundaries?: FarmMapEditorProps['detectedBoundaries']; // Add prop type
  }) => {
  const map = useMap();
  const drawnItemsRef = useRef<L.FeatureGroup>(null); // Ref for editable layer group
  const isEditingRef = useRef(false); // Ref to track if we are currently editing

  // Effect to load the active boundary into Geoman when it changes externally
  useEffect(() => {
    console.log(`[GeomanIntegration Effect] Running. Boundary set: ${!!boundary}, Key: ${editableBoundaryKey}`);
    // Clear previous editable layers first
    drawnItemsRef.current?.clearLayers();
    isEditingRef.current = false; // Reset editing flag

    // Always disable drawing initially in this effect, enable conditionally below
    map.pm.disableDraw();

    if (boundary && drawnItemsRef.current) {
      console.log("[GeomanIntegration Effect] Boundary exists, attempting to load into Geoman.");
      // Convert GeoJSON to Leaflet layer(s)
      try {
          const leafletLayer = L.geoJSON(boundary, {
              style: { // Style for the editable layer
                color: '#ffcc00',
                fillColor: '#ffcc00',
                fillOpacity: 0.4,
                weight: 3
              }
          });
          console.log("[GeomanIntegration Effect] Converted GeoJSON to Leaflet layer:", leafletLayer);

          // Add layer(s) to the FeatureGroup
          leafletLayer.getLayers().forEach(layer => {
            if (layer instanceof L.Path) { // Check if it's a path (polygon, rectangle, etc.)
                 console.log("[GeomanIntegration Effect] Adding layer to drawnItemsRef:", layer);
                 drawnItemsRef.current?.addLayer(layer);
                 // Enable editing ONLY on this layer
                 try {
                    console.log("[GeomanIntegration Effect] Enabling Geoman editing (pm.enable) on layer:", layer);
                    (layer as any).pm.enable({ allowSelfIntersection: false });
                    console.log("[GeomanIntegration Effect] Geoman editing enabled.");
                    isEditingRef.current = true;

                    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
                        // Fit bounds to the loaded layer
                        if (layer.getBounds().isValid()) {
                            console.log("[GeomanIntegration Effect] Fitting map bounds to layer.");
                            map.fitBounds(layer.getBounds());
                        } else {
                             console.warn("[GeomanIntegration Effect] Layer bounds are invalid, cannot fit map.");
                        }
                    }
                 } catch (pmEnableError) {
                    // Log specific error when enabling Geoman editing fails
                    console.error("[GeomanIntegration Effect] Error enabling Geoman editing (pm.enable):", pmEnableError, "Layer:", layer, "Boundary Data:", boundary);
                 }
            } else {
                console.warn("[GeomanIntegration Effect] Layer created from GeoJSON is not an L.Path, cannot enable editing:", layer);
            }
          });
      } catch (geoJsonConversionError) {
          // Log specific error when L.geoJSON fails
          console.error("[GeomanIntegration Effect] Error converting GeoJSON boundary to Leaflet layer:", geoJsonConversionError, "Boundary Data:", boundary);
      }
      // map.pm.disableDraw(); // Already disabled above
    } else {
        console.log("[GeomanIntegration Effect] No boundary selected.");
        // If no boundary is selected...
        if (!detectedBoundaries || detectedBoundaries.length === 0) {
           // ...AND no detected boundaries are showing, enable drawing for initial outline
           console.log("[GeomanIntegration Effect] No detected boundaries, enabling drawing.");
           map.pm.enableDraw('Polygon');
           map.pm.enableDraw('Rectangle');
        } else {
           // ...BUT detected boundaries ARE showing, keep drawing disabled.
           console.log("[GeomanIntegration Effect] Detected boundaries exist, drawing remains disabled.");
           // map.pm.disableDraw(); // Already disabled above
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundary, map, editableBoundaryKey, setBoundary, detectedBoundaries]); // Dependencies remain the same

  useEffect(() => {
    // Initialize Geoman controls
    map.pm.addControls({
      position: 'topleft',
      drawPolygon: true,
      drawMarker: false,
      drawPolyline: false,
      drawRectangle: true,
      drawCircle: false,
      drawCircleMarker: false,
      drawText: false,
      editMode: true,
      dragMode: true,
      cutPolygon: true,
      removalMode: true,
    });

    // Restrict drawing to one polygon
    map.pm.setGlobalOptions({ limitMarkersToCount: 1 }); // Not exactly for polygons, but helps manage layers

    // Set shape options (optional)
    map.pm.setPathOptions({
      color: '#ffcc00', // Example: yellow lines
      fillColor: '#ffcc00',
      fillOpacity: 0.4,
    });

    // Modify event handlers to work with the editable layer
    const handleDrawStart = (e: any) => {
      // Only clear if not currently editing an existing boundary
      if (!isEditingRef.current) {
          const layers = map.pm.getGeomanDrawLayers().concat(map.pm.getGeomanLayers());
           if (layers.length > 0) {
              layers.forEach(layer => layer.remove());
              setBoundary(null);
          }
      }
    };

    const handleCreate = (e: any) => {
      const layer = e.layer;
      if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        drawnItemsRef.current?.addLayer(layer); // Add to our feature group
        const geojson = layer.toGeoJSON() as PolygonGeoJsonFeature;
        console.log('Polygon Created:', geojson);
        setBoundary(geojson); // Update the main boundary state
        isEditingRef.current = true; // Now we are editing this new shape

        if (layer.getBounds && layer.getBounds().isValid()) {
          map.fitBounds(layer.getBounds());
        }
      }
      map.pm.disableDraw();
    };

    const handleEdit = (e: any) => {
      // Find the edited layer within our feature group if needed
      // const layer = e.layer; // Geoman gives the layer directly
      const layer = e.layer || e.target; // Sometimes it's target
      if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
          const geojson = layer.toGeoJSON() as PolygonGeoJsonFeature;
          console.log('Polygon Edited:', geojson);
          setBoundary(geojson);
      }
    };

    const handleRemove = (e: any) => {
      console.log('Polygon Removed');
      setBoundary(null);
      isEditingRef.current = false;
      // Do NOT re-enable drawing here. User should select a detected boundary if available.
      map.pm.disableDraw(); 
    };
    
    // Geoman event listeners
    map.on('pm:drawstart', handleDrawStart);
    map.on('pm:create', handleCreate);
    // Listen for edits on the map level (catches edits on layers)
    map.on('pm:edit', handleEdit);
    // Listen for removals on the map level
    map.on('pm:remove', handleRemove);

    // Cleanup function
    return () => {
      // Remove controls if they exist
      try {
          map.pm.removeControls();
      } catch (error) { console.warn("Couldn't remove Geoman controls:", error); }
      // Remove listeners
      map.off('pm:drawstart', handleDrawStart);
      map.off('pm:create', handleCreate);
      map.off('pm:edit', handleEdit);
      map.off('pm:remove', handleRemove);
      // Disable editing on all layers on unmount (important)
      map.pm.getGeomanLayers().forEach(layer => (layer as any).pm?.disable());
    };
  }, [map, setBoundary]); // Only depends on map and setBoundary for setup/cleanup

  return (
    <FeatureGroup ref={drawnItemsRef}>
        {/* This group now holds the layer being actively edited */}
    </FeatureGroup>
  );
};

const FarmMapEditor: React.FC<FarmMapEditorProps> = ({
    center,
    zoom,
    boundary,
    setBoundary,
    detectedBoundaries = [], // Default to empty array
    onBoundarySelect,
    setMapInstance, // Accept the map instance setter
    editableBoundaryKey
  }) => {

  const mapRef = useRef<Map>(null); // Ref for the map instance

  // Pass map instance up when ready
  useEffect(() => {
    console.log('FarmMapEditor: useEffect for map instance, mapRef.current:', mapRef.current);
    if (mapRef.current && setMapInstance) {
      console.log('FarmMapEditor: Calling setMapInstance with:', mapRef.current);
      setMapInstance(mapRef.current);
    }
  }, [mapRef.current, setMapInstance]); // Trigger when the ref value changes OR the function changes

  // Style for detected boundaries (not selected yet)
  const detectedStyle = {
    color: "#3388ff", // Blue
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.1,
  };

  // Click handler for detected boundaries
  const onDetectedClick = useCallback((feature: PolygonGeoJsonFeature) => {
    if (onBoundarySelect) {
      onBoundarySelect(feature);
    }
  }, [onBoundarySelect]);

  return (
    <MapContainer
      ref={mapRef} // Assign ref
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxZoom={20} // Allow deeper zoom for details
        tileSize={512} // Use higher res tiles if available
        zoomOffset={-1}
        detectRetina={true}
      />
      
      {/* Geoman Controls and Editable Layer */}
      <GeomanIntegration 
         boundary={boundary} 
         setBoundary={setBoundary} 
         editableBoundaryKey={editableBoundaryKey} 
         detectedBoundaries={detectedBoundaries} // Pass detected boundaries down
      />

      {/* Display Detected Boundaries (if any and boundary not yet selected) */}
      {!boundary && detectedBoundaries.map((feat, index) => (
          <GeoJSON
            key={`detected-${index}`} // Use index or a feature ID if available
            data={feat}
            style={detectedStyle}
            eventHandlers={{
              click: () => onDetectedClick(feat),
            }}
          />
      ))}

    </MapContainer>
  );
};

export default FarmMapEditor; 