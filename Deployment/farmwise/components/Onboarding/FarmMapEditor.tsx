'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, FeatureGroup, GeoJSON } from 'react-leaflet';
import L, { LatLngExpression, Layer, Map } from 'leaflet';
import '@geoman-io/leaflet-geoman-free'; // Import Geoman JS
import { ActionIcon, Badge, Tooltip } from '@mantine/core';
import { IconMapPin, IconPencil } from '@tabler/icons-react';
import classes from './FarmMapEditor.module.css'; // Import the CSS module
import * as turf from '@turf/turf';

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
  boundary?: PolygonGeoJsonFeature | null; // Renamed from initialBoundary for profile page
  setBoundary?: (boundary: PolygonGeoJsonFeature | null) => void; // Optional for readonly mode
  detectedBoundaries?: PolygonGeoJsonFeature[]; // Optional array of detected boundaries
  onBoundarySelect?: (boundary: PolygonGeoJsonFeature) => void; // Callback when a detected boundary is clicked
  setMapInstance?: (map: Map) => void; // Callback to pass map instance up
  editableBoundaryKey?: number | string; // Key to force GeoJSON layer remount when boundary changes
  hideAttribution?: boolean; // Whether to hide the attribution text
  readOnly?: boolean; // Whether the map is readonly (no editing)
  allowToggleEdit?: boolean; // Whether to allow toggling edit mode (for profile page)
}

// Internal component to handle Geoman integration and loading external GeoJSON
const GeomanIntegration = ({
    boundary, // The currently selected/active boundary
    setBoundary, // Function to update the active boundary
    editableBoundaryKey, // Key to help reset state
    detectedBoundaries // Pass detected boundaries down
  }: {
    boundary: FarmMapEditorProps['boundary'];
    setBoundary: NonNullable<FarmMapEditorProps['setBoundary']>; // Ensure non-null
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

    // Enable snapping for more precise drawing
    map.pm.setGlobalOptions({
      limitMarkersToCount: 1, // Restrict to one polygon
      editable: true,
      preventMarkerRemoval: false,
      snappable: true,
      snapDistance: 15,
      allowSelfIntersection: false,
      tooltips: true,
      // Set path options for drawn polygons
      pathOptions: {
        color: '#ffcc00',
        fillColor: '#ffcc00',
        fillOpacity: 0.4,
        weight: 4,
        lineJoin: 'round',
        lineCap: 'round'
      }
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
        
        // Calculate area in hectares
        try {
          const area = turf.area(geojson);
          const areaHectares = area / 10000; // Convert square meters to hectares
          
          // Add area to properties
          if (!geojson.properties) {
            geojson.properties = {};
          }
          geojson.properties.area_hectares = Number(areaHectares.toFixed(2));
          
          console.log('Polygon Created:', geojson);
        } catch (error) {
          console.error('Error calculating area:', error);
        }
        
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
          
          // Calculate area in hectares
          try {
            const area = turf.area(geojson);
            const areaHectares = area / 10000; // Convert square meters to hectares
            
            // Add area to properties
            if (!geojson.properties) {
              geojson.properties = {};
            }
            geojson.properties.area_hectares = Number(areaHectares.toFixed(2));
            
            console.log('Polygon Edited:', geojson);
          } catch (error) {
            console.error('Error calculating area:', error);
          }
          
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

const defaultCenter: [number, number] = [39.8283, -98.5795]; // Center of US

const FarmMapEditor: React.FC<FarmMapEditorProps> = ({
    center,
    zoom,
    boundary,
    setBoundary = () => {}, // Default no-op function for readOnly mode
    detectedBoundaries = [], // Default to empty array
    onBoundarySelect,
    setMapInstance, // Accept the map instance setter
    editableBoundaryKey,
    hideAttribution = false, // Default to showing attribution
    readOnly = false, // Default to editable
    allowToggleEdit = false // Default to not allow toggling edit mode
  }) => {

  const mapRef = useRef<Map>(null); // Ref for the map instance
  const [editMode, setEditMode] = useState(false); // Track editing mode state for profile page

  // Toggle edit mode for boundary
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

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
    color: "#0066ff", // Brighter blue
    weight: 3, // Thinner lines for more natural appearance
    opacity: 0.9,
    fillOpacity: 0.2,
    fillColor: "#0066ff",
    // Smooth rendering options
    lineJoin: 'round' as const,
    lineCap: 'round' as const,
    interactive: true
  };
  
  // Style for detected boundaries on hover (interactive effect)
  const detectedHoverStyle = {
    color: "#ff4500", // Orange-red
    weight: 4, 
    opacity: 1,
    fillOpacity: 0.35,
    fillColor: "#ff4500",
    // Smooth rendering options
    lineJoin: 'round' as const,
    lineCap: 'round' as const
  };

  // Style for readonly boundaries
  const readOnlyStyle = {
    color: "#38a169", // Green
    weight: 4,
    opacity: 0.8,
    fillOpacity: 0.3,
    fillColor: "#38a169"
  };

  // Click handler for detected boundaries
  const onDetectedClick = useCallback((feature: PolygonGeoJsonFeature) => {
    console.log('Detected boundary clicked:', feature);
    if (onBoundarySelect) {
      onBoundarySelect(feature);
    }
  }, [onBoundarySelect]);

  // Process GeoJSON to ensure coordinates are valid and improve display
  const preprocessBoundary = (feature: PolygonGeoJsonFeature): PolygonGeoJsonFeature => {
    // Clone to avoid mutating the original
    const processedFeature = JSON.parse(JSON.stringify(feature));
    
    try {
      // Ensure all coordinates are valid numbers to prevent rendering issues
      if (processedFeature.geometry && processedFeature.geometry.coordinates) {
        // Log some boundary details to help with debugging
        const coordsString = JSON.stringify(processedFeature.geometry.coordinates);
        console.log(`Boundary coordinates length: ${coordsString.length} characters`);
        console.log(`Boundary type: ${processedFeature.geometry.type}`);
        
        // For MultiPolygons, check each polygon's coordinates
        if (processedFeature.geometry.type === 'MultiPolygon') {
          processedFeature.geometry.coordinates.forEach((polygon: any, i: number) => {
            console.log(`Polygon ${i} has ${polygon.length} coordinate rings`);
          });
        }
        
        // For Polygons, check the coordinate rings
        if (processedFeature.geometry.type === 'Polygon') {
          console.log(`Polygon has ${processedFeature.geometry.coordinates.length} coordinate rings`);
          console.log(`Exterior ring has ${processedFeature.geometry.coordinates[0]?.length || 0} points`);
        }
      }
    } catch (error) {
      console.error("Error preprocessing boundary:", error);
    }
    
    return processedFeature;
  };

  useEffect(() => {
    console.log('FarmMapEditor initializing with props:', {
      center,
      zoom,
      boundary: !!boundary,
      detectedBoundaries: detectedBoundaries ? detectedBoundaries.length : 0,
      editableBoundaryKey
    });
    
    // Check for valid center coordinates to avoid map rendering issues
    if (!center || (Array.isArray(center) && (isNaN(center[0]) || isNaN(center[1])))) {
      console.warn('Invalid center coordinates, using default:', defaultCenter);
    }
  }, [center, zoom, boundary, detectedBoundaries, editableBoundaryKey]);

  // Add new method to directly apply smoothing to GeoJSON layers
  const smoothGeoJSONLayer = (layer: L.GeoJSON) => {
    layer.setStyle({
      lineJoin: 'round' as const,
      lineCap: 'round' as const,
    });
    
    // Apply to all sublayers if it's a feature collection
    layer.eachLayer((sublayer: any) => {
      if (sublayer.setStyle) {
        sublayer.setStyle({
          lineJoin: 'round' as const,
          lineCap: 'round' as const,
        });
      }
    });
    
    return layer;
  };

  return (
    <div className={classes.mapContainer}>
      <MapContainer
        ref={mapRef} // Assign ref
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        attributionControl={false} // We'll manage attribution ourselves
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={22} // Increase max zoom level to get highest resolution possible
          tileSize={512} 
          zoomOffset={-1}
          detectRetina={true} // Enable high-DPI/retina display support
          maxNativeZoom={19} // Maximum zoom level the tile server supports
          attribution={hideAttribution ? '' : '© Esri'}
        />
        
        {/* For read-only mode, just show the boundary as a GeoJSON */}
        {(readOnly && !editMode) && boundary ? (
          <GeoJSON data={boundary} style={readOnlyStyle} />
        ) : (
          <>
            {/* Geoman Controls and Editable Layer (in edit mode) */}
            <GeomanIntegration 
               boundary={boundary} 
               setBoundary={setBoundary} 
               editableBoundaryKey={editableBoundaryKey} 
               detectedBoundaries={detectedBoundaries} // Pass detected boundaries down
            />

            {/* Display Detected Boundaries (if any and boundary not yet selected) */}
            {!boundary && detectedBoundaries.map((feat, index) => {
              // Process each feature to get smooth boundaries
              const smoothedFeature = preprocessBoundary(feat);
              return (
                <GeoJSON
                  key={`detected-${index}`}
                  data={smoothedFeature}
                  style={detectedStyle}
                  eventHandlers={{
                    click: () => onDetectedClick(feat), // Use original feature for selection
                    mouseover: (e) => {
                      const layer = e.target;
                      layer.setStyle(detectedHoverStyle);
                      layer.bringToFront();
                      
                      // Add a tooltip if not already present
                      if (!layer._tooltip) {
                        layer.bindTooltip("Click to select this farm boundary", {
                          sticky: true,
                          direction: 'top',
                          className: 'leaflet-tooltip-select'
                        }).openTooltip();
                      }
                    },
                    mouseout: (e) => {
                      const layer = e.target;
                      layer.setStyle(detectedStyle);
                      if (layer._tooltip) {
                        layer.closeTooltip();
                      }
                    },
                    // Add an event handler when the layer is added to the map
                    add: (e) => {
                      const layer = e.target;
                      // Apply styling without smoothFactor
                      if (layer.setStyle) {
                        layer.setStyle({
                          lineJoin: 'round' as const,
                          lineCap: 'round' as const
                        });
                      }
                    }
                  }}
                />
              );
            })}
          </>
        )}
      </MapContainer>

      {/* Add edit toggle button for profile page */}
      {allowToggleEdit && boundary && (
        <div className={classes.editMode}>
          <Tooltip label={editMode ? "Stop editing" : "Edit farm boundary"}>
            <ActionIcon 
              variant={editMode ? "filled" : "light"} 
              color={editMode ? "red" : "blue"} 
              onClick={toggleEditMode}
              size="lg"
            >
              <IconPencil size={18} />
            </ActionIcon>
          </Tooltip>
        </div>
      )}

      {/* Add boundary info at bottom left */}
      {boundary && !hideAttribution && (
        <div className={classes.boundaryLabel}>
          <Badge color="blue" variant="light">
            {editMode ? "Editing boundary" : "Farm boundary"}
          </Badge>
        </div>
      )}

      {/* Custom attribution position */}
      {!hideAttribution && (
        <div className="leaflet-control-attribution leaflet-control">
          © Esri
        </div>
      )}
    </div>
  );
};

export default FarmMapEditor; 