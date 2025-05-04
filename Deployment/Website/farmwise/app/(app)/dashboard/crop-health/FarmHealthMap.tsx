'use client';
import React, { useEffect, useRef, Dispatch, SetStateAction, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip as LeafletTooltip, useMap, GeoJSON } from 'react-leaflet';
import L, { LatLngExpression, Layer, FeatureGroup } from 'leaflet';
import { Box, Slider, Group, ActionIcon, Text, Stack, Tooltip, Switch } from '@mantine/core';
import { IconPlayerPlay, IconPlayerPause, IconArrowsMaximize, IconArrowRight, IconMap } from '@tabler/icons-react';
import 'leaflet/dist/leaflet.css'; // Ensure Leaflet CSS is imported

// --- Interfaces (matching page.tsx) ---
interface Farm {
  id: string;
  name: string;
  location: string;
  area: number; // in hectares
  cropType: string;
  coordinates: number[][]; // GeoJSON-like coordinates [lng, lat]
}

interface ModisData {
  ndvi: { dates: string[]; regions: Record<string, number[]> };
  evi: { dates: string[]; regions: Record<string, number[]> };
}

interface FarmHealthMapProps {
  farmData: Farm[];
  selectedFarm: Farm | null;
  setSelectedFarm: (farm: Farm | null) => void;
  modisData: ModisData;
  timelineIndex: number;
  setTimelineIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  mapView: '2d' | '3d'; // Kept for potential future styling/library switch
  getFarmHealthIndices: (farm: Farm, index: number) => { ndvi: number, evi: number };
  calculateHealthScore: (ndvi: number, evi: number) => number;
  getHealthColor: (score: number) => string;
  getHealthStatus: (score: number) => string;
  setTimeView: Dispatch<SetStateAction<'latest' | 'historical'>>; // Accept original type from parent
}

// --- Placeholder GeoJSON for Tunisian Regions ---
// IMPORTANT: Replace coordinates with actual GeoJSON polygon data for each region
const tunisiaRegionsGeoJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "Béja" }, geometry: { type: "Polygon", coordinates: [[[9.0, 37.0], [9.5, 37.0], [9.5, 36.6], [9.0, 36.6], [9.0, 37.0]]] } }, // Rough Example Box
    { type: "Feature", properties: { name: "Jendouba" }, geometry: { type: "Polygon", coordinates: [[[8.7, 36.6], [9.1, 36.6], [9.1, 36.3], [8.7, 36.3], [8.7, 36.6]]] } }, // Rough Example Box
    { type: "Feature", properties: { name: "Siliana" }, geometry: { type: "Polygon", coordinates: [[[9.3, 36.2], [9.6, 36.2], [9.6, 35.9], [9.3, 35.9], [9.3, 36.2]]] } }, // Rough Example Box
    { type: "Feature", properties: { name: "Le Kef" }, geometry: { type: "Polygon", coordinates: [[[8.5, 36.3], [9.0, 36.3], [9.0, 35.8], [8.5, 35.8], [8.5, 36.3]]] } }, // Rough Example Box
    { type: "Feature", properties: { name: "Kairouan" }, geometry: { type: "Polygon", coordinates: [[[9.8, 35.8], [10.3, 35.8], [10.3, 35.4], [9.8, 35.4], [9.8, 35.8]]] } }, // Rough Example Box
    { type: "Feature", properties: { name: "Sidi Bouzid" }, geometry: { type: "Polygon", coordinates: [[[9.2, 35.4], [9.8, 35.4], [9.8, 34.9], [9.2, 34.9], [9.2, 35.4]]] } }, // Rough Example Box
    // --- Add other regions from modisData if needed, with CORRECT coordinates ---
  ]
};

// Helper to convert stored coords [lng, lat] to Leaflet LatLng [lat, lng]
const convertCoordinates = (coords: number[][]): L.LatLngExpression[] => {
  return coords.map(coord => [coord[1], coord[0]] as L.LatLngExpression);
};

// --- Map Components ---

// Component to handle map centering and zooming dynamically
const ChangeView: React.FC<{ center: L.LatLngExpression; zoom: number; polygon?: L.LatLngExpression[] }> = ({ center, zoom, polygon }) => {
  const map = useMap();
  useEffect(() => {
    if (polygon && polygon.length > 0) {
      try {
        const bounds = L.latLngBounds(polygon);
        if (bounds.isValid()) {
          map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 14 }); // Zoom in closer, add padding
        }
      } catch (error) {
        console.error("Error creating bounds:", error, polygon);
        map.flyTo(center, zoom); // Fallback
      }
    } else {
      map.flyTo(center, zoom);
    }
  }, [center, zoom, polygon, map]);
  return null;
};

// The main map component
const FarmHealthMap: React.FC<FarmHealthMapProps> = ({
  farmData,
  selectedFarm,
  setSelectedFarm,
  modisData,
  timelineIndex,
  setTimelineIndex,
  isPlaying,
  setIsPlaying,
  mapView, // Available for future use
  getFarmHealthIndices,
  calculateHealthScore,
  getHealthColor,
  getHealthStatus,
  setTimeView,
}) => {
  const mapRef = useRef<L.Map>(null);
  const [showHealthOverlay, setShowHealthOverlay] = useState(false);
  const [mapReady, setMapReady] = useState(false); // State to track map/pane readiness
  const center: L.LatLngExpression = [34.8869, 9.5375]; // Center of Tunisia
  const initialZoom = 7;

  // Effect to create custom map panes on mount
  useEffect(() => {
    if (mapRef.current) {
        const map = mapRef.current;
        // Create panes if they don't exist
        if (!map.getPane('regionalOverlayPane')) {
            map.createPane('regionalOverlayPane');
            const pane = map.getPane('regionalOverlayPane');
            if(pane) pane.style.zIndex = '450'; // Above tiles, below farms/tooltips
        }
        if (!map.getPane('farmPolygonsPane')) {
            map.createPane('farmPolygonsPane');
            const pane = map.getPane('farmPolygonsPane');
            if(pane) pane.style.zIndex = '500'; // Above regional overlay
        }
        // Panes are created (or already exist), set map ready
        setMapReady(true);
    }
  }, []); // Run only once on mount

  // --- Data Calculation Helpers ---
  const currentIndices = (farm: Farm) => getFarmHealthIndices(farm, timelineIndex);
  const currentScore = (farm: Farm) => {
    const { ndvi, evi } = currentIndices(farm);
    return calculateHealthScore(ndvi, evi);
  };
  const currentColor = (farm: Farm) => getHealthColor(currentScore(farm));
  const currentStatus = (farm: Farm) => getHealthStatus(currentScore(farm));

  // Function to get score for a specific region name at the current timeline index
  const getRegionScore = (regionName: string): number | null => {
    if (regionName in modisData.ndvi.regions && regionName in modisData.evi.regions) {
      const ndvi = modisData.ndvi.regions[regionName][timelineIndex];
      const evi = modisData.evi.regions[regionName][timelineIndex];
      if (ndvi !== undefined && evi !== undefined) {
        return calculateHealthScore(ndvi, evi);
      }
    }
    return null; // Return null if region or data for index is missing
  };

  // --- Event Handlers ---
  const handlePolygonClick = (farm: Farm) => {
    setSelectedFarm(farm);
    setTimeView('historical'); // Switch view on click
    // Zooming handled by ChangeView component reacting to selectedFarm change
  };

  const handleTimelineChange = (value: number) => {
    setTimelineIndex(value);
    setTimeView('historical');
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setTimeView('historical');
    setShowHealthOverlay(true);
  };

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(center, initialZoom);
    }
    setSelectedFarm(null); // Optionally clear selection on reset
    setTimeView('latest'); // Optionally switch back to latest view
  };

  const goToLatest = () => {
      setTimelineIndex(modisData.ndvi.dates.length - 1);
      setTimeView('historical'); // Still historical if we want to see the map colored
  };

  // --- Styling function for Regional Overlay ---
  const regionOverlayStyle = (feature: any): L.PathOptions => {
    const regionName = feature?.properties?.name;
    if (!regionName) return { weight: 0, fillOpacity: 0 }; // Hide if no name

    const score = getRegionScore(regionName);

    if (score !== null) {
      return {
        fillColor: getHealthColor(score),
        weight: 1,
        opacity: 0.5,
        color: 'white', // Border color
        dashArray: '3',
        fillOpacity: 0.5 // Semi-transparent fill
      };
    } else {
      // Style for regions with no data (optional)
      return { weight: 0.5, color: '#ccc', fillOpacity: 0.1 };
    }
  };

  // --- Render Logic ---
  const selectedFarmPolygon = selectedFarm ? convertCoordinates(selectedFarm.coordinates) : undefined;

  return (
    <Stack>
      {/* Map Container */}
      <Box style={{ height: '450px', width: '100%', borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden', border: '1px solid var(--mantine-color-gray-3)' }}>
        <MapContainer
          center={center}
          zoom={initialZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          {/* Base Map Tile Layer - Switched to Satellite */}
          <TileLayer
            attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            zIndex={1}
          />
          {/* Optional: Add labels layer on top of satellite */}
           <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
                zIndex={2}
                pane="overlayPane" // Use default overlay pane (z-index ~400)
           />

          {/* This component handles map view changes */}
          <ChangeView center={center} zoom={initialZoom} polygon={selectedFarmPolygon} />

          {/* --- Layers dependent on mapReady --- */} 
          {mapReady && (
            <>
              {/* Regional Health GeoJSON Overlay */}
              {showHealthOverlay && (
                <GeoJSON
                  key={`regions-${timelineIndex}`}
                  data={tunisiaRegionsGeoJSON as any}
                  style={regionOverlayStyle}
                  onEachFeature={(feature, layer) => {
                      // Optional: Add tooltips or popups to regions
                      const regionName = feature.properties.name;
                      const score = getRegionScore(regionName);
                      const status = score !== null ? getHealthStatus(score) : 'N/A';
                      layer.bindTooltip(`<b>${regionName}</b><br/>Status: ${status}<br/>Score: ${score !== null ? Math.round(score*100) : 'N/A'}`);
                  }}
                  pane="regionalOverlayPane" // Assign to custom pane
                />
              )}

              {/* Render Farm Polygons */}
              {farmData.map((farm) => {
                const polygonCoords = convertCoordinates(farm.coordinates);
                if (polygonCoords.length === 0) return null; // Skip if no valid coordinates

                const score = currentScore(farm);
                const color = currentColor(farm);
                const status = currentStatus(farm);
                const { ndvi, evi } = currentIndices(farm);

                return (
                  <Polygon
                    key={farm.id}
                    positions={polygonCoords}
                    pathOptions={{
                      color: selectedFarm?.id === farm.id ? '#0000FF' : color, // Highlight selected farm border
                      fillColor: color,
                      fillOpacity: 0.65,
                      weight: selectedFarm?.id === farm.id ? 4 : 2, // Thicker border for selected
                    }}
                    pane="farmPolygonsPane" // Assign to custom pane
                    eventHandlers={{
                      click: () => handlePolygonClick(farm),
                      mouseover: (e) => e.target.setStyle({ fillOpacity: 0.8, weight: 3 }),
                      mouseout: (e) => e.target.setStyle({ fillOpacity: 0.65, weight: selectedFarm?.id === farm.id ? 4 : 2 }),
                    }}
                  >
                    <LeafletTooltip >
                      <Text fw={700}>{farm.name}</Text>
                      <Text size="sm">Crop: {farm.cropType}</Text>
                      <Text size="sm">Status: <span style={{ color: color, fontWeight: 'bold' }}>{status}</span> ({Math.round(score * 100)})</Text>
                      <Text size="sm">NDVI: {ndvi.toFixed(3)} | EVI: {evi.toFixed(3)}</Text>
                      <Text size="xs" c="dimmed">Click to view details & history</Text>
                    </LeafletTooltip>
                  </Polygon>
                );
              })}
            </> 
          )}
          {/* --- End Layers dependent on mapReady --- */} 

        </MapContainer>
      </Box>

      {/* Timeline Controls */}
      <Box p="xs" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 'var(--mantine-radius-md)' }}>
        <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500} >Timeline: {modisData.ndvi.dates[timelineIndex]}</Text>
            <Switch
                checked={showHealthOverlay}
                onChange={(event) => setShowHealthOverlay(event.currentTarget.checked)}
                label="Show Health Overlay"
                size="sm"
                thumbIcon={showHealthOverlay ? <IconMap size="0.8rem" stroke={3} /> : null}
            />
        </Group>
        <Group>
          <Tooltip label={isPlaying ? 'Pause Animation' : 'Play Animation'}>
            <ActionIcon onClick={handlePlayPause} variant="default" size="lg">
              {isPlaying ? <IconPlayerPause size={18} /> : <IconPlayerPlay size={18} />}
            </ActionIcon>
          </Tooltip>
          <Slider
            style={{ flexGrow: 1 }}
            value={timelineIndex}
            onChange={handleTimelineChange}
            min={0}
            max={modisData.ndvi.dates.length - 1}
            step={1}
            label={(value) => modisData.ndvi.dates[value]}
            labelTransitionProps={{ transition: 'skew-down', duration: 150, timingFunction: 'linear' }}
            marks={modisData.ndvi.dates.map((date, index) => ({ value: index, label: index % 4 === 0 ? date.substring(5) : undefined }))} // Add labels for readability
          />
          <Tooltip label="Go to Latest Data">
             <ActionIcon variant="default" size="lg" onClick={goToLatest}>
                 <IconArrowRight size={18} />
             </ActionIcon>
          </Tooltip>
          <Tooltip label="Reset Map View">
            <ActionIcon variant="default" size="lg" onClick={resetView}>
                <IconArrowsMaximize size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Box>
    </Stack>
  );
};

export default FarmHealthMap; 