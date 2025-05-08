import React, { useState, useEffect, useMemo, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, Card, Text, Group, Button, Stack, Badge, Loader, Center, ActionIcon } from '@mantine/core';
import { IconMapPin, IconPhone, IconWorld, IconClock, IconNavigation, IconStar } from '@tabler/icons-react';

// Add CSS for marker animations - MOVED THIS INSIDE THE COMPONENT BELOW

// Fix Leaflet's default icon issue with inline SVG icons instead of image files
// This avoids the need for static image files in the public directory
const createMarkerIcon = (color: string = '#2A81CB', className: string = '') => L.divIcon({
  className: `custom-div-icon ${className}`,
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="25px" height="41px">
    <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 17.25 12 24C16.531 17.25 20 11.8 20 7.602C20 3.403 16.199 0 12 0ZM12 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
  </svg>`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const DefaultIcon = createMarkerIcon();

// Lab icon for the map
const labIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5cb85c" width="32px" height="32px">
    <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 17.25 12 24C16.531 17.25 20 11.8 20 7.602C20 3.403 16.199 0 12 0ZM12 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
    <circle cx="12" cy="8" r="4" fill="white" />
    <path d="M11 5h2v6h-2z M11 12h2v2h-2z" fill="#5cb85c" />
  </svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Selected lab icon with different color
const selectedLabIcon = L.divIcon({
  className: 'custom-div-icon marker-selected',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4a934a" width="36px" height="36px">
    <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 17.25 12 24C16.531 17.25 20 11.8 20 7.602C20 3.403 16.199 0 12 0ZM12 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
    <circle cx="12" cy="8" r="4" fill="white" />
    <path d="M11 5h2v6h-2z M11 12h2v2h-2z" fill="#4a934a" />
  </svg>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// User location icon
const userIcon = L.divIcon({
  className: 'custom-div-icon user-marker',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32px" height="48px">
    <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 17.25 12 24C16.531 17.25 20 11.8 20 7.602C20 3.403 16.199 0 12 0Z" fill="#4285F4" />
    <circle cx="12" cy="8" r="5" fill="white" />
    <circle cx="12" cy="8" r="3" fill="#4285F4" />
  </svg>`,
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

// Apply custom icon to all markers
L.Marker.prototype.options.icon = DefaultIcon;

// Types for lab results
interface Lab {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  website: string | null;
  description: string;
  hours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance?: number; // Optional distance from user
}

// Component to recenter the map when coordinates change
function MapRecenter({ coords, zoom }: { coords: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, zoom || map.getZoom());
  }, [coords, map, zoom]);
  return null;
}

// Component to update map view when selected lab changes
function UpdateMapView({ selectedLab }: { selectedLab: Lab | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedLab) {
      map.setView(
        [selectedLab.coordinates.lat, selectedLab.coordinates.lng],
        15, // Zoom level
        { animate: true, duration: 1 } // Animation options
      );
    }
  }, [selectedLab, map]);
  return null;
}

// Props for the SoilTestingLabsMap component
interface SoilTestingLabsMapProps {
  userLocation: { lat: number; lng: number } | null;
  onLabSelect?: (lab: Lab) => void;
}

// Calculate distance between two coordinates in kilometers using Haversine formula
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

const SoilTestingLabsMap: React.FC<SoilTestingLabsMapProps> = ({ userLocation, onLabSelect }) => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  
  const mapCenter = userLocation ? [userLocation.lat, userLocation.lng] as [number, number] : [36.8366, 10.2420] as [number, number]; // Default to Tunis
  
  // Add CSS for marker animations - MOVED HERE FROM OUTSIDE THE COMPONENT
  useEffect(() => {
    // Add marker animation styles to document head
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.2); opacity: 1; }
        100% { transform: scale(1); opacity: 0.7; }
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      .marker-selected {
        animation: pulse 1.5s infinite;
      }
      
      .user-marker {
        animation: bounce 2s ease-in-out infinite;
        transform-origin: bottom center;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Fetch nearby labs when user location changes
  useEffect(() => {
    const fetchLabs = async () => {
      if (!userLocation) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/nearby-places?lat=${userLocation.lat}&lng=${userLocation.lng}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch nearby labs');
        }
        
        const data = await response.json();
        
        if (data.results && Array.isArray(data.results)) {
          // Calculate distance for each lab and sort by distance
          const labsWithDistance = data.results.map((lab: Lab) => {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              lab.coordinates.lat,
              lab.coordinates.lng
            );
            return { ...lab, distance };
          });
          
          // Sort labs by distance (closest first)
          const sortedLabs = labsWithDistance.sort((a: Lab, b: Lab) => 
            (a.distance || 0) - (b.distance || 0)
          );
          
          setLabs(sortedLabs);
          
          // Auto-select the closest lab
          if (sortedLabs.length > 0) {
            setSelectedLab(sortedLabs[0]);
            if (onLabSelect) {
              onLabSelect(sortedLabs[0]);
            }
          }
        } else {
          setLabs([]);
        }
      } catch (err) {
        console.error('Error fetching labs:', err);
        setError('Failed to load nearby soil testing labs. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLabs();
  }, [userLocation, onLabSelect]);
  
  // Handle lab selection
  const handleLabSelect = (lab: Lab) => {
    setSelectedLab(lab);
    
    // Programmatically pan and zoom to the selected lab
    if (mapRef.current) {
      mapRef.current.setView(
        [lab.coordinates.lat, lab.coordinates.lng],
        15, // Zoom level
        { animate: true, duration: 1 } // Animation options
      );
    }
    
    if (onLabSelect) {
      onLabSelect(lab);
    }
  };
  
  // Generate Google Maps directions URL
  const getGoogleMapsDirectionsUrl = (lab: Lab) => {
    if (!userLocation) return '';
    
    return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lab.coordinates.lat},${lab.coordinates.lng}&travelmode=driving`;
  };
  
  // Sorted labs by distance (closest first)
  const sortedLabs = useMemo(() => {
    return [...labs].sort((a: Lab, b: Lab) => 
      (a.distance || 0) - (b.distance || 0)
    );
  }, [labs]);
  
  // Get closest lab
  const closestLab = useMemo(() => {
    return sortedLabs.length > 0 ? sortedLabs[0] : null;
  }, [sortedLabs]);
  
  // Function to handle when the map is ready/loaded
  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    
    // Add event listener for map movement
    map.on('moveend', () => {
      // You can add custom behavior here when the map stops moving
      console.log('Map moved to:', map.getCenter());
    });
  };
  
  if (isLoading) {
    return (
      <Box style={{ height: '400px', position: 'relative' }}>
        <Center style={{ height: '100%' }}>
          <Stack align="center">
            <Loader size="md" />
            <Text size="sm" c="dimmed">Loading nearby soil testing labs...</Text>
          </Stack>
        </Center>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box style={{ height: '400px', position: 'relative' }}>
        <Center style={{ height: '100%' }}>
          <Text c="red">{error}</Text>
        </Center>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box style={{ height: '400px', marginBottom: '1rem', position: 'relative' }}>
        <MapContainer 
          center={mapCenter}
          zoom={12} 
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
          scrollWheelZoom={true}
          ref={(mapInstance) => {
            if (mapInstance) {
              handleMapReady(mapInstance);
            }
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {userLocation && (
            <Marker 
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
            >
              <Popup>
                <Text fw={600}>Your Location</Text>
              </Popup>
            </Marker>
          )}
          
          {labs.map(lab => (
            <Marker 
              key={lab.id}
              position={[lab.coordinates.lat, lab.coordinates.lng]}
              icon={selectedLab?.id === lab.id ? selectedLabIcon : labIcon}
              eventHandlers={{
                click: () => handleLabSelect(lab)
              }}
            >
              <Popup>
                <Text fw={600}>{lab.name}</Text>
                <Text size="sm">{lab.description}</Text>
                {lab.distance !== undefined && (
                  <Text size="sm" mt={5} c="blue" fw={500}>
                    {lab.distance.toFixed(1)} km away
                  </Text>
                )}
                <Group gap="xs" mt="xs">
                  <Button 
                    variant="subtle" 
                    size="xs" 
                    onClick={() => handleLabSelect(lab)}
                    leftSection={<IconStar size={14} />}
                  >
                    Details
                  </Button>
                  <Button 
                    component="a"
                    href={getGoogleMapsDirectionsUrl(lab)}
                    target="_blank"
                    variant="filled" 
                    color="blue"
                    size="xs"
                    leftSection={<IconNavigation size={14} />}
                  >
                    Navigate
                  </Button>
                </Group>
              </Popup>
            </Marker>
          ))}
          
          <MapRecenter coords={mapCenter} />
          <UpdateMapView selectedLab={selectedLab} />
        </MapContainer>

        {/* Closest lab highlight overlay */}
        {closestLab && (
          <Box 
            style={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              zIndex: 1000
            }}
          >
            <Group gap="xs">
              <IconMapPin size={16} color="green" />
              <Text size="sm" fw={600}>Closest Lab: {closestLab.distance?.toFixed(1)} km</Text>
            </Group>
          </Box>
        )}
      </Box>
      
      {/* Lab details card */}
      {selectedLab && (
        <Card withBorder p="md" radius="md">
          <Card.Section withBorder p="sm" bg="rgba(66, 133, 244, 0.08)">
            <Group gap="sm" align="center">
              <IconMapPin size={18} />
              <Text fw={700}>{selectedLab.name}</Text>
              {selectedLab.distance !== undefined && (
                <Badge color="green" variant="light" size="sm">
                  {selectedLab.distance.toFixed(1)} km away
                </Badge>
              )}
              {closestLab?.id === selectedLab.id && (
                <Badge color="blue">Closest</Badge>
              )}
            </Group>
          </Card.Section>
          
          <Stack gap="xs" mt="md">
            <Text>{selectedLab.description}</Text>
            
            <Group gap="xs">
              <IconClock size={16} color="gray" />
              <Text size="sm">{selectedLab.hours}</Text>
            </Group>
            
            <Group gap="xs">
              <IconPhone size={16} color="gray" />
              <Text size="sm">{selectedLab.phone}</Text>
            </Group>
            
            {selectedLab.website && (
              <Group gap="xs">
                <IconWorld size={16} color="gray" />
                <Text 
                  size="sm" 
                  component="a" 
                  href={selectedLab.website} 
                  target="_blank"
                  c="blue"
                >
                  Visit Website
                </Text>
              </Group>
            )}
            
            <Group mt="xs">
              <Badge color="green">{selectedLab.type}</Badge>
              <Button 
                component="a" 
                href={getGoogleMapsDirectionsUrl(selectedLab)}
                target="_blank"
                variant="filled"
                color="blue"
                size="sm"
                ml="auto"
                leftSection={<IconNavigation size={16} />}
              >
                Navigate with Google Maps
              </Button>
            </Group>
          </Stack>
        </Card>
      )}
      
      {/* Mini lab list showing all options */}
      {labs.length > 1 && (
        <Box mt="md">
          <Text fw={600} mb="xs">All nearby soil testing labs ({labs.length})</Text>
          <Stack gap="xs">
            {sortedLabs.map(lab => (
              <Card 
                key={lab.id}
                withBorder 
                p="xs"
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedLab?.id === lab.id ? 'rgba(92, 184, 92, 0.1)' : undefined,
                  borderColor: selectedLab?.id === lab.id ? 'rgba(92, 184, 92, 0.5)' : undefined
                }}
                onClick={() => handleLabSelect(lab)}
              >
                <Group justify="apart" align="center" gap="xs">
                  <Box>
                    <Group align="center" gap="xs">
                      <Text fw={600} size="sm">{lab.name}</Text>
                      {lab.distance !== undefined && (
                        <Badge size="sm" variant="light">
                          {lab.distance.toFixed(1)} km
                        </Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {lab.description}
                    </Text>
                  </Box>
                  <ActionIcon 
                    component="a"
                    href={getGoogleMapsDirectionsUrl(lab)}
                    target="_blank"
                    variant="subtle" 
                    color="blue"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconNavigation size={16} />
                  </ActionIcon>
                </Group>
              </Card>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default SoilTestingLabsMap; 