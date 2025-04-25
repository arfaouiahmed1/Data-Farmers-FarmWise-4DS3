'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  SimpleGrid,
  Group,
  List,
  ThemeIcon,
  Box,
  useMantineTheme,
  Button,
  Stack,
  Alert,
} from '@mantine/core';
import {
  IconMap2,
  IconMapPin,
  IconPlant,
  IconRulerMeasure,
  IconInfoCircle,
} from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import L, { LatLngExpression, Layer } from 'leaflet';

// IMPORTANT: CSS Imports should remain global (layout.tsx or globals.css)
// import 'leaflet/dist/leaflet.css';
// import 'leaflet-draw/dist/leaflet.draw.css';

// --- Dynamic Import for the Map Component --- 
const MapComponent = dynamic(
  () => import('../../../../components/Mapping/MapComponent'), // Corrected path
  { 
    ssr: false, // Disable server-side rendering
    loading: () => <p>Loading map...</p> // Optional loading indicator
  }
);

// Mock Field Data Structure (keeping similar structure for now)
// In a real app, this would likely be GeoJSON
interface FarmField {
  id: string;
  name: string;
  crop: string;
  area: number; // hectares
  geoJson?: GeoJSON.Feature<GeoJSON.Polygon>; // Store actual geometry
  color: string;
}

// Convert simple boundary to GeoJSON Polygon coordinates
const createPolygonCoords = (boundary: { lat: number; lng: number }[]) => {
    if (!boundary || boundary.length < 3) return [];
    const coords = boundary.map(p => [p.lng, p.lat]); // GeoJSON is Lng, Lat
    coords.push([boundary[0].lng, boundary[0].lat]); // Close the loop
    return [coords]; // GeoJSON Polygon format requires array of linear rings
};

const mockFieldsData: FarmField[] = [
  {
    id: 'field-a',
    name: 'Field A (North)',
    crop: 'Corn',
    area: 15.5,
    geoJson: {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: createPolygonCoords([{ lat: 47.17, lng: 19.5 }, { lat: 47.17, lng: 19.52 }, { lat: 47.18, lng: 19.52 }, { lat: 47.18, lng: 19.5 }])}
    },
    color: 'blue',
  },
  {
    id: 'field-b',
    name: 'Field B (West)',
    crop: 'Soybeans',
    area: 22.0,
     geoJson: {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: createPolygonCoords([{ lat: 47.16, lng: 19.48 }, { lat: 47.16, lng: 19.50 }, { lat: 47.165, lng: 19.50 }, { lat: 47.165, lng: 19.48 }])}
    },
    color: 'green',
  },
];

// Calculate center (very basic)
const calculateCenter = (fields: FarmField[]): LatLngExpression => {
    if (fields.length === 0 || !fields[0].geoJson) return [47.17, 19.5]; // Default
    const firstCoords = fields[0].geoJson.geometry.coordinates[0];
    if (firstCoords.length === 0) return [47.17, 19.5];
    // Average first polygon's first point (super basic centering)
    return [firstCoords[0][1], firstCoords[0][0]]; // Lat, Lng for Leaflet
};

export default function MappingPage() {
  const theme = useMantineTheme();
  const [fields, setFields] = useState<FarmField[]>(mockFieldsData);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  // --- Event Handlers (to be passed to MapComponent) ---
  const handleFieldUpdate = (updatedFields: FarmField[]) => {
    setFields(updatedFields);
  };

  const handleSelectionChange = (newSelectedId: string | null) => {
    setSelectedFieldId(newSelectedId);
  };
  
  // Fix for icons still needs to run client-side, can be moved to MapComponent
//   useEffect(() => {
//         // @ts-ignore
//         delete L.Icon.Default.prototype._getIconUrl;
//         L.Icon.Default.mergeOptions({...});
//    }, []);

  return (
    <Container fluid>
      <Title order={2} mb="lg">
        <IconMap2 size={28} style={{ marginRight: '8px', verticalAlign: 'bottom' }} />
        Field Mapping
      </Title>
      <Text c="dimmed" mb="xl">
        Visualize and manage your farm fields using the interactive map.
      </Text>
       <Alert title="Leaflet Integration" color="blue" icon={<IconInfoCircle/>} mb="lg">
         This map uses Leaflet.js. Ensure you have imported the Leaflet CSS files ('leaflet/dist/leaflet.css' and 'leaflet-draw/dist/leaflet.draw.css') in your global styles or layout.
         The drawing tools allow you to add, edit, and delete field boundaries.
       </Alert>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {/* Map Visualization Area using Dynamic Component */} 
        <Paper withBorder radius="md" shadow="sm" p={0} style={{ gridColumn: '1 / span 2', overflow: 'hidden', height: '600px' }}>
            <MapComponent 
                fields={fields} 
                selectedFieldId={selectedFieldId}
                onFieldUpdate={handleFieldUpdate} 
                onSelectionChange={handleSelectionChange} 
            />
        </Paper>

        {/* Field List & Details Panel */} 
        <Paper withBorder radius="md" shadow="sm" p="md">
            <Title order={4} mb="md">Field Details</Title>
            {selectedField ? (
                <Stack>
                     <Title order={5}>{selectedField.name}</Title>
                     <List spacing="xs" size="sm">
                        <List.Item icon={<ThemeIcon color="green" size={16} radius="xl"><IconPlant size={10} /></ThemeIcon>}>
                           Crop: <strong>{selectedField.crop || 'N/A'}</strong>
                        </List.Item>
                        <List.Item icon={<ThemeIcon color="blue" size={16} radius="xl"><IconRulerMeasure size={10} /></ThemeIcon>}>
                           Area: <strong>{selectedField.area > 0 ? selectedField.area.toFixed(1) + ' ha' : 'Needs calculation'}</strong>
                        </List.Item>
                         <List.Item icon={<ThemeIcon color="gray" size={16} radius="xl"><IconMapPin size={10} /></ThemeIcon>}>
                           Geometry: {selectedField.geoJson ? 'Polygon' : 'Not defined'}
                        </List.Item>
                     </List>
                     <Button 
                        size="xs" 
                        variant="outline" 
                        onClick={() => setSelectedFieldId(null)}
                        mt="sm"
                     >
                        Clear Selection
                     </Button>
                      {/* Add Edit/More Actions (e.g., assigning crop) Here */}
                </Stack>
            ) : (
                <Stack>
                 <Text size="sm" c="dimmed">Click on a field on the map or use the draw tools.</Text>
                 <Title order={5} mt="lg">All Fields ({fields.length})</Title>
                 <List spacing="xs" size="sm">
                    {fields.map(field => (
                         <List.Item key={field.id} onClick={() => setSelectedFieldId(field.id)} style={{ cursor: 'pointer' }}>
                             <Group gap="xs">
                                <Box w={10} h={10} bg={field.color ? `${field.color}.5` : 'gray.5'} style={{ borderRadius: '2px' }}/>
                                {field.name}
                             </Group>
                        </List.Item>
                    ))}
                 </List>
                 <Text size="xs" c="dimmed" mt="lg">Note: Area calculation for drawn fields is not implemented.</Text>
                </Stack>
            )}
        </Paper>
      </SimpleGrid>
    </Container>
  );
}
