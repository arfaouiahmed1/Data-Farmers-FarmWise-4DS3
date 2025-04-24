'use client';
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L, { Layer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoJsonObject } from 'geojson';

// Define interface for Feature properties
interface FieldProperties {
    name?: string;
    ndvi?: number;
    evi?: number;
}

// --- Helper Functions (Copied from original page) ---
const calculateHealthScore = (ndvi: number | undefined, evi: number | undefined): number => {
    if (ndvi === undefined || evi === undefined) return 0;
    // Simple NDVI normalization (assuming NDVI range -1 to 1)
    const normNdvi = Math.max(0, Math.min(1, (ndvi + 1) / 2));
    // Simple EVI normalization (assuming common EVI range, adjust if needed)
    const normEvi = Math.max(0, Math.min(1, evi));
    // Weighted average, adjust weights as needed
    return 0.6 * normNdvi + 0.4 * normEvi;
};

const getColor = (score: number): string => {
  return score > 0.7 ? '#4CAF50' : // Green (Healthy)
         score > 0.4 ? '#FFEB3B' : // Yellow (Moderate)
                       '#F44336'; // Red (Stressed)
};

const styleFeature = (feature: GeoJSON.Feature<GeoJSON.Geometry, FieldProperties> | undefined) => {
  if (!feature || !feature.properties) {
    return {
        fillColor: '#CCCCCC', // Default grey if no properties
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.5,
      };
  }
  const { ndvi, evi } = feature.properties;
  const score = calculateHealthScore(ndvi, evi);
  return {
    fillColor: getColor(score),
    weight: 2,
    opacity: 1,
    color: 'white', // Outline color
    dashArray: '3',
    fillOpacity: 0.7,
  };
};

const onEachFeature = (feature: GeoJSON.Feature<GeoJSON.Geometry, FieldProperties>, layer: Layer) => {
    if (feature.properties) {
        const { name, ndvi, evi } = feature.properties;
        const score = calculateHealthScore(ndvi, evi);
        const popupContent = `
            <b>${name || 'Unnamed Field'}</b><br/>
            NDVI: ${ndvi !== undefined ? ndvi.toFixed(2) : 'N/A'}<br/>
            EVI: ${evi !== undefined ? evi.toFixed(2) : 'N/A'}<br/>
            Health Score: ${score.toFixed(2)}
        `;
        layer.bindPopup(popupContent);

        // Add tooltip for hover effect
        layer.bindTooltip(name || 'Unnamed Field', { sticky: true });
    }
};

// Component to fit map bounds to GeoJSON data
interface FitBoundsProps {
    geoJsonData: GeoJsonObject | null;
}
const FitBounds: React.FC<FitBoundsProps> = ({ geoJsonData }) => {
    const map = useMap();
    useEffect(() => {
        if (map && geoJsonData) {
            let bounds: L.LatLngBounds | null = null;
            try {
                if (geoJsonData.type === 'FeatureCollection') {
                    // Explicitly cast after check
                    const featureCollection = geoJsonData as GeoJSON.FeatureCollection;
                    if (featureCollection.features.length > 0) {
                        const geoJsonLayer = L.geoJSON(featureCollection);
                        bounds = geoJsonLayer.getBounds();
                    } else {
                        console.warn("GeoJSON FeatureCollection is empty, cannot fit bounds.");
                    }
                } else if (geoJsonData.type === 'Feature') {
                    const geoJsonLayer = L.geoJSON(geoJsonData);
                    bounds = geoJsonLayer.getBounds();
                } else {
                    // Handle other potential GeoJSON types like GeometryCollection etc. if needed
                     console.warn("Unsupported GeoJSON type for fitting bounds:", geoJsonData.type);
                }

                // Check if bounds are valid and fit the map
                if (bounds && bounds.isValid()) {
                    map.fitBounds(bounds.pad(0.1));
                } else if (bounds) { // bounds exist but are not valid
                    console.warn("Calculated bounds are invalid for GeoJSON data.");
                    map.setView([40.7, -74.0], 5); // Fallback view
                } else { // No bounds calculated (e.g., empty collection or unsupported type)
                     map.setView([40.7, -74.0], 5); // Fallback view
                }

            } catch (error) {
                 console.error("Error processing GeoJSON data for bounds:", error);
                 map.setView([40.7, -74.0], 5); // Fallback on error
            }
        }
    }, [map, geoJsonData]);
    return null;
};


// Main Map Component Props
interface CropHealthMapProps {
    geoJsonData: GeoJSON.FeatureCollection<GeoJSON.Polygon, FieldProperties> | null;
}

// Main Map Component
const CropHealthMap: React.FC<CropHealthMapProps> = ({ geoJsonData }) => {
    // Default center and zoom if data is not available initially
    const defaultCenter: L.LatLngExpression = [40.7128, -74.0060]; // Example: New York City
    const defaultZoom = 5;

    return (
        <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            style={{ height: '400px', width: '100%', borderRadius: 'var(--mantine-radius-md)' }}
            scrollWheelZoom={false} // Prevent zooming with scroll wheel
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Using CartoDB Voyager
            />
            {geoJsonData && (
                <GeoJSON
                    key={JSON.stringify(geoJsonData)} // Force re-render if data changes
                    data={geoJsonData}
                    style={styleFeature}
                    onEachFeature={onEachFeature}
                />
            )}
             {/* Only render FitBounds if geoJsonData exists */}
            {geoJsonData && <FitBounds geoJsonData={geoJsonData} />}
        </MapContainer>
    );
};

export default CropHealthMap; 