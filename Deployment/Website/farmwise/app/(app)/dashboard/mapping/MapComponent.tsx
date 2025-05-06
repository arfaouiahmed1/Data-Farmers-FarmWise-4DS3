'use client';

import React from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, Popup, LayersControl, FeatureGroup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "leaflet-defaulticon-compatibility"; // Fix default icon issues
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

// Mock Data for field boundaries (Replace with data fetched from backend)
// Coordinates should be in [latitude, longitude] format
interface FieldData {
  id: string;
  name: string;
  area: number; // Example: hectares
  crop?: string; // Current or planned crop
  soilType?: string; // Example overlay data
  coordinates: LatLngExpression[];
  color: string;
}

const mockFields: FieldData[] = [
  {
    id: 'field-a',
    name: 'Field A',
    area: 15.5,
    crop: 'Corn',
    soilType: 'Loam',
    coordinates: [
      [37.778, -121.425],
      [37.782, -121.425],
      [37.782, -121.418],
      [37.778, -121.418],
    ],
    color: 'blue'
  },
  {
    id: 'field-b',
    name: 'Field B',
    area: 22.0,
    crop: 'Soybeans',
    soilType: 'Clay Loam',
    coordinates: [
      [37.774, -121.425],
      [37.777, -121.425],
      [37.777, -121.418],
      [37.774, -121.418],
    ],
    color: 'green'
  },
   {
    id: 'field-c',
    name: 'Field C (Irrigated)',
    area: 18.2,
    crop: 'Wheat',
    soilType: 'Sandy Loam',
    coordinates: [
      [37.778, -121.417],
      [37.782, -121.417],
      [37.782, -121.410],
      [37.778, -121.410],
    ],
    color: 'orange'
  },
];

const MapComponent: React.FC = () => {
  // Center the map initially - calculate based on field data or use a default
  const initialCenter: LatLngExpression = [37.778, -121.418]; // Example center
  const initialZoom = 15;

  return (
    <MapContainer center={initialCenter} zoom={initialZoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
      <LayersControl position="topright">
        {/* Base Layers */}
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite View">
           <TileLayer
             url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
             attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
           />
         </LayersControl.BaseLayer>

        {/* Overlays */}
         <LayersControl.Overlay checked name="Field Boundaries">
             <FeatureGroup>
               {mockFields.map((field) => (
                 <Polygon key={field.id} positions={field.coordinates} pathOptions={{ color: field.color, fillColor: field.color, fillOpacity: 0.4 }}>
                   <Tooltip>{field.name}</Tooltip>
                   <Popup>
                     <strong>{field.name}</strong><br />
                     Area: {field.area} ha<br />
                     Crop: {field.crop || 'N/A'}<br />
                     Soil: {field.soilType || 'N/A'}
                     {/* Add more info or actions here */}
                   </Popup>
                 </Polygon>
               ))}
            </FeatureGroup>
          </LayersControl.Overlay>

         <LayersControl.Overlay name="Soil Types (Example)">
           {/* Placeholder for a potential soil type layer - would need actual data/logic */}
           <FeatureGroup>
              {/* Example: Could map field.soilType to different colored polygons or markers */}
              {mockFields.map((field) => (
                 field.soilType &&
                 <Polygon
                    key={`${field.id}-soil`}
                    positions={field.coordinates}
                    pathOptions={{ color: '#A0522D', weight: 1, fillOpacity: 0.1 }} // Example brown color
                 >
                   <Tooltip>Soil: {field.soilType}</Tooltip>
                 </Polygon>
              ))}
           </FeatureGroup>
         </LayersControl.Overlay>

         {/* Add more overlay layers here (e.g., Irrigation Zones, Sensor Data) */}

       </LayersControl>
    </MapContainer>
  );
};

export default MapComponent; 