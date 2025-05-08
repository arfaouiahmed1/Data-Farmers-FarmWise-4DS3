'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Paper,
  Title,
  Text,
  Container,
  Button,
  Stack,
  Box,
  Stepper,
  Group,
  TextInput,
  Center,
  useMantineTheme,
  Loader,
  Notification,
  Textarea,
  SegmentedControl,
  Select,
  NumberInput,
  Switch,
  SimpleGrid,
  Card,
  Divider,
  Tooltip,
} from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconCheck, 
  IconMapPin, 
  IconUser, 
  IconSettings, 
  IconTarget, 
  IconX, 
  IconInfoCircle, 
  IconBook,
  IconTexture
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import classes from './OnboardingPage.module.css';
import { LatLngExpression, Map as LeafletMap } from 'leaflet';
import html2canvas from 'html2canvas';
import * as GeoJSON from 'geojson'; // Import base GeoJSON types

// --- Dynamically import FarmMapEditor only on client-side ---
const FarmMapEditor = dynamic(
  () => import('@/components/Onboarding/FarmMapEditor'),
  { ssr: false } // This is the key!
);

// Animation for step content transitions
const stepVariant = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: -30,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
};

// Default Map Center (e.g., somewhere central) - Used as fallback
const defaultCenter = {
  lat: 39.8283, // Center of US approx.
  lng: -98.5795
};
const defaultCenterLeaflet: LatLngExpression = [defaultCenter.lat, defaultCenter.lng];

// Define Logo Colors (replace theme colors or use directly)
const logoLightGreen = '#77c146';
const logoDarkGreen = '#4f852c';
// const logoYellow = '#ffcc00'; // Keep in mind for accents if needed

// Map Container Style - Reduced height slightly
const containerStyle = {
  width: '100%',
  height: '360px', // Slightly reduced from 400px
  minHeight: '300px', // Ensure a minimum height
  borderRadius: 'var(--mantine-radius-md)',
};

// --- Types ---
interface FarmProperties {
  id?: number;
  area_hectares?: number;
  size_category?: string;
  message?: string;
  // Add other properties if needed
}

// Use the imported GeoJSON Feature type and add our properties
type PolygonGeoJsonFeature = GeoJSON.Feature<
  GeoJSON.Polygon | GeoJSON.MultiPolygon,
  FarmProperties // Add FarmProperties here
>;

// Type alias for the feature type used within FarmMapEditor
type FarmEditorPolygonGeoJsonFeature = GeoJSON.Feature<
    GeoJSON.Polygon | GeoJSON.MultiPolygon
>;

export default function OnboardingPage() {
  const [active, setActive] = useState(0);
  const [farmName, setFarmName] = useState('');
  const [soilType, setSoilType] = useState(''); // Change farmType to soilType
  const [farmAddress, setFarmAddress] = useState(''); // State for farm address
  const [farmerExperience, setFarmerExperience] = useState<'new' | 'experienced' | '' >(''); // State for farmer experience
  const [irrigationType, setIrrigationType] = useState('');
  const [farmingMethod, setFarmingMethod] = useState('');
  // Soil nutrient data states
  const [soilNitrogen, setSoilNitrogen] = useState<number | ''>('');
  const [soilPhosphorus, setSoilPhosphorus] = useState<number | ''>('');
  const [soilPotassium, setSoilPotassium] = useState<number | ''>('');
  const [soilPh, setSoilPh] = useState<number | ''>('');
  const [hasNutrientData, setHasNutrientData] = useState(false);
  // Infrastructure and accessibility
  const [hasWaterAccess, setHasWaterAccess] = useState(false);
  const [hasRoadAccess, setHasRoadAccess] = useState(false);
  const [hasElectricity, setHasElectricity] = useState(false);
  const [storageCapacity, setStorageCapacity] = useState<number | ''>('');
  const [yearEstablished, setYearEstablished] = useState<number | ''>('');
  // Update state type to use the new PolygonGeoJsonFeature type
  const [farmBoundary, setFarmBoundary] = useState<PolygonGeoJsonFeature | null>(null);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(defaultCenterLeaflet);
  const [isLocating, setIsLocating] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  // Update state type to use the new PolygonGeoJsonFeature type
  const [detectedBoundaries, setDetectedBoundaries] = useState<PolygonGeoJsonFeature[]>([]);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [editableBoundaryKey, setEditableBoundaryKey] = useState<number>(0);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const theme = useMantineTheme();
  const [isLabFinderOpen, setIsLabFinderOpen] = useState(false);
  const [labResults, setLabResults] = useState<{name: string, address: string, distance: string, phone?: string}[]>([]);
  const [isLoadingLabs, setIsLoadingLabs] = useState(false);

  // --- Callback to receive map instance from child ---
  const handleSetMapInstance = useCallback((map: LeafletMap | null) => {
    console.log('OnboardingPage: handleSetMapInstance called with:', map);
    setMapInstance(map);
    setIsMapReady(!!map);
  }, []); // Empty dependency array, the function itself doesn't change

  // --- Effect to get user location ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('User location found:', latitude, longitude);
          setMapCenter([latitude, longitude]);
          setIsLocating(false);
        },
        (error) => {
          console.warn(`Geolocation error: ${error.message}. Using default center.`);
          // Keep the default center if location fails
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true, // Try for better accuracy
          timeout: 10000,         // Don't wait forever
          maximumAge: 0           // Force fresh location
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser. Using default center.');
      // Keep the default center if geolocation is not supported
      setIsLocating(false);
    }
  }, []); // Run only once on mount

  const nextStep = () => {
    // Validation can be added here per step if needed
    // e.g., if (active === 1 && !farmName) return;
    if (active === 4 && !farmBoundary) { // Adjusted index for location step
      console.warn("Please select or draw your farm boundary on the map.");
      return;
    }
    setActive((current) => (current < 6 ? current + 1 : current)); // Updated max step index to 6
  };
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  // Function to get current location and update address field
  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Try to get a human-readable address using reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const data = await response.json();
            
            if (data && data.display_name) {
              setFarmAddress(data.display_name);
            } else {
              // If reverse geocoding fails, use coordinates
              setFarmAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
            }
            
            // Update map center
            setMapCenter([latitude, longitude]);
          } catch (error) {
            console.error('Error getting address from coordinates:', error);
            // Fallback to just coordinates
            setFarmAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.warn(`Geolocation error: ${error.message}`);
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser.');
      setIsLocating(false);
    }
  };

  const handleFinish = async () => {
    console.log('Onboarding finished. Data:', {
      farmName,
      soilType,
      farmAddress,
      farmerExperience,
      irrigationType,
      farmingMethod,
      boundary: farmBoundary
    });

    try {
      // Get the token and backend URL from environment variables
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        router.push('/login');
        return;
      }
      
      // Extract the area if available in the boundary properties
      let sizeHectares = null;
      if (farmBoundary?.properties?.area_hectares) {
        sizeHectares = farmBoundary.properties.area_hectares;
      }
      
      // First create the farm from onboarding data
      const farmResponse = await fetch(`${backendUrl}/core/add-farm-from-onboarding/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          farm_name: farmName,
          farm_address: farmAddress,
          boundary: farmBoundary,
          size_hectares: sizeHectares,
          soil_type: soilType,
          irrigation_type: irrigationType,
          farming_method: farmingMethod,
          // Add soil nutrient data if provided
          soil_nitrogen: hasNutrientData ? soilNitrogen : null,
          soil_phosphorus: hasNutrientData ? soilPhosphorus : null,
          soil_potassium: hasNutrientData ? soilPotassium : null,
          soil_ph: hasNutrientData ? soilPh : null,
          // Infrastructure data
          has_water_access: hasWaterAccess,
          has_road_access: hasRoadAccess,
          has_electricity: hasElectricity,
          storage_capacity: storageCapacity || null,
          year_established: yearEstablished || null
        })
      });
      
      if (!farmResponse.ok) {
        // Try to get the detailed error message from the response
        let errorMessage = 'Failed to create farm';
        try {
          const errorData = await farmResponse.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (typeof errorData === 'object') {
            // If error is an object with validation errors
            errorMessage = JSON.stringify(errorData);
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        console.error(`Farm creation error (${farmResponse.status}):`, errorMessage);
        throw new Error(errorMessage);
      }
      
      // Refresh user data in local storage to update onboarding status
      await fetch(`${backendUrl}/core/profile/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`
        }
      }).then(res => res.json())
        .then(userData => {
          localStorage.setItem('user', JSON.stringify(userData));
        });

      // Navigate to Dashboard after finish
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Uncomment this to show an error notification instead of navigating away
      // setDetectionError(error instanceof Error ? error.message : "Failed to create farm");
      
      // Still navigate to dashboard even if there's an error completing onboarding
      router.push('/dashboard');
    }
  };

  const handleDetectFarms = useCallback(async () => {
    if (!mapInstance || !mapContainerRef.current) {
      console.error("Map instance or container not ready for detection.");
      setDetectionError("Map not ready. Please wait a moment and try again.");
      return;
    }

    setIsDetecting(true);
    setDetectionError(null);
    setDetectedBoundaries([]);
    setFarmBoundary(null);
    setEditableBoundaryKey(prev => prev + 1);

    try {
      const bounds = mapInstance.getBounds();
      const mapElement = mapContainerRef.current;

      const canvas = await html2canvas(mapElement, {
           useCORS: true,
           logging: false,
           scale: 2
      });
      const imageDataUrl = canvas.toDataURL('image/png');

      const payload = {
        image_base64: imageDataUrl,
        bounds: {
          north_east: bounds.getNorthEast(),
          south_west: bounds.getSouthWest(),
        },
      };

      // --- Call Backend API --- 
      // Use the correct backend URL (ideally from environment variable)
      const backendUrl = 'http://127.0.0.1:8000'; // Django backend address
      const response = await fetch(`${backendUrl}/api/detect-farm-boundaries/`, { 
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response.' }));
        throw new Error(`Detection failed: ${response.statusText} - ${errorData?.message || 'Unknown error'}`);
      }

      const detectedFeatures: PolygonGeoJsonFeature[] = await response.json();
      
      if (!Array.isArray(detectedFeatures)) {
          console.error('Invalid response format from detection API:', detectedFeatures);
          throw new Error('Received invalid data from the server.');
      }

      console.log("Detected boundaries:", detectedFeatures);
      if (detectedFeatures.length === 0) {
          setDetectionError("No farms detected in the current view. Try adjusting the map or draw manually.");
      } else {
        // Ensure properties exist (or assign default)
        const featuresWithDefaults: PolygonGeoJsonFeature[] = detectedFeatures.map(f => ({
          ...f,
          geometry: f.geometry, // Ensure geometry is carried over
          properties: f.properties || {}
        }));
        setDetectedBoundaries(featuresWithDefaults);
        // --- Automatically select if only one boundary is detected --- 
        if (featuresWithDefaults.length === 1) {
           // Pass the feature *with* properties to handleBoundarySelect
           handleBoundarySelect(featuresWithDefaults[0]);
        }
      }

    } catch (error) {
      console.error("Farm detection error:", error);
      setDetectionError(error instanceof Error ? error.message : "An unknown error occurred during detection.");
    } finally {
      setIsDetecting(false);
    }
  }, [mapInstance]);

  // --- Modify handleBoundarySelect to accept the correct types --- 
  const handleBoundarySelect = useCallback((selectedFeature: FarmEditorPolygonGeoJsonFeature | PolygonGeoJsonFeature) => {
    console.log("Selected boundary (raw):", selectedFeature);
    
    // Cast to our enhanced type here, assuming detection provides the properties.
    const featureWithProps = selectedFeature as PolygonGeoJsonFeature;
    const featureWithDefaults = {
        ...featureWithProps, 
        properties: featureWithProps.properties || {}
    };
    
    console.log("Setting farm boundary with defaults:", featureWithDefaults);
    setFarmBoundary(featureWithDefaults);
    setDetectedBoundaries([]); // Clear detected list once one is selected
    setDetectionError(null); // Clear any previous errors
    setEditableBoundaryKey(prev => prev + 1); // Force re-render of map editor with new boundary
  }, []); // Empty dependency array is correct here

  // --- Wrapper function to handle setting boundary from map editor --- 
  const handleSetBoundaryFromMap = useCallback((boundaryFromMap: FarmEditorPolygonGeoJsonFeature | null) => {
      console.log("Boundary update from map:", boundaryFromMap);
      if (boundaryFromMap) {
          // Cast the basic feature from the map to our enhanced type.
          // Initialize with empty properties; size info comes from detection API, not drawing.
          const featureForState: PolygonGeoJsonFeature = {
              ...boundaryFromMap,
              type: "Feature", // Ensure type is explicitly set
              properties: (boundaryFromMap.properties || {}) as FarmProperties // Cast existing properties if any
          };
          setFarmBoundary(featureForState);
      } else {
          setFarmBoundary(null);
      }
  }, []); // No dependencies needed

  // --- Function to generate size message ---
  const getSizeMessage = (properties: FarmProperties | undefined | null): React.ReactNode => {
    if (!properties?.area_hectares || !properties?.size_category) {
      return null;
    }
    const { area_hectares, size_category } = properties;
    let message = ``;
    let advice = ``;
    // Customize messages based on category
    switch (size_category.split(' (')[0]) { // Get base category name
        case 'Hobby Farm':
            message = `Your farm area is approximately ${area_hectares} hectares, classified as a Hobby Farm.`
            advice = "Perfect for specialized crops or personal use."
            break;
        case 'Standard Cultivation':
            message = `Your farm covers about ${area_hectares} hectares. That's a Standard Cultivation size.`
            advice = "Well-suited for common crop rotations or livestock."
            break;
        case 'Large Estate':
             message = `With roughly ${area_hectares} hectares, your farm is considered a Large Estate.`
             advice = "Ideal for large-scale farming operations."
             break;
        case 'Major Operation':
             message = `Covering ${area_hectares} hectares, this is a Major Operation.`
             advice = "Requires significant resources and planning for optimal management."
             break;
        default:
            message = `Detected farm area is ${area_hectares} hectares.`
            advice = "Farm size category could not be determined."
    }

    return (
        <Notification
            icon={<IconInfoCircle size="1.2rem" />}
            color="teal"
            title="Farm Size Information"
            mt="md"
            withCloseButton={false}
        >
            <Text size="sm">{message}</Text>
            <Text size="xs" c="dimmed">{advice}</Text>
        </Notification>
    );

  };

  // Function to estimate soil nutrients based on soil type
  const estimateSoilNutrients = useCallback(() => {
    if (!soilType) return;
    
    // Default estimates based on soil type
    const estimates: {[key: string]: {n: number, p: number, k: number, ph: number}} = {
      'Clay': { n: 45, p: 35, k: 180, ph: 6.5 },
      'Sandy': { n: 25, p: 20, k: 120, ph: 6.0 },
      'Loamy': { n: 60, p: 40, k: 200, ph: 6.8 },
      'Silty': { n: 50, p: 30, k: 170, ph: 6.4 },
      'Peaty': { n: 70, p: 25, k: 150, ph: 5.5 },
      'Chalky': { n: 35, p: 30, k: 160, ph: 7.8 }
    };
    
    // Set estimated values with small random variations for realism
    const randomVariation = () => (Math.random() * 0.2 + 0.9); // 90-110% of base value
    
    if (estimates[soilType]) {
      const est = estimates[soilType];
      setSoilNitrogen(Math.round(est.n * randomVariation()));
      setSoilPhosphorus(Math.round(est.p * randomVariation()));
      setSoilPotassium(Math.round(est.k * randomVariation()));
      setSoilPh(Number((est.ph * randomVariation()).toFixed(1)));
    }
  }, [soilType]);
  
  // Find nearby soil testing labs
  const findNearbyLabs = useCallback(async () => {
    setIsLabFinderOpen(true);
    setIsLoadingLabs(true);
    
    try {
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Mock API results (in real app, this would be a call to a real API like Google Places)
            setTimeout(() => {
              const mockResults = [
                {
                  name: "AgriSoil Testing Lab",
                  address: "123 Farm Rd, Agricity",
                  distance: "5.2 miles",
                  phone: "555-123-4567"
                },
                {
                  name: "County Extension Office",
                  address: "456 Government St, Agricity",
                  distance: "6.8 miles",
                  phone: "555-987-6543"
                },
                {
                  name: "State Agricultural Services",
                  address: "789 Research Dr, Croptown",
                  distance: "12.3 miles"
                },
                {
                  name: "University Ag Department",
                  address: "1000 University Ave, College Park",
                  distance: "15.7 miles",
                  phone: "555-789-0123"
                }
              ];
              
              setLabResults(mockResults);
              setIsLoadingLabs(false);
            }, 1500);
          },
          (error) => {
            console.warn(`Geolocation error: ${error.message}`);
            setIsLoadingLabs(false);
            
            // Provide fallback results if location access fails
            setLabResults([
              {
                name: "AgriSoil Testing Lab",
                address: "123 Farm Rd, Agricity",
                distance: "Unknown distance",
                phone: "555-123-4567"
              },
              {
                name: "County Extension Office",
                address: "456 Government St, Agricity",
                distance: "Unknown distance",
                phone: "555-987-6543"
              }
            ]);
          }
        );
      } else {
        console.warn('Geolocation is not supported by this browser.');
        setIsLoadingLabs(false);
        setLabResults([
          {
            name: "AgriSoil Testing Lab",
            address: "123 Farm Rd, Agricity",
            distance: "Unknown distance",
            phone: "555-123-4567"
          }
        ]);
      }
    } catch (error) {
      console.error('Error finding labs:', error);
      setIsLoadingLabs(false);
    }
  }, []);

  const steps = [
    {
      label: 'Welcome',
      description: 'Introduction',
      icon: <IconUser size={18} />,
      content: (
          <>
            <Title order={2} ta="center" c={theme.white}>Welcome to FarmWise!</Title>
            <Text size="lg" ta="center" mt="md" mb="lg" c="gray.3">
               🌱 Let's cultivate success together!
            </Text>
            <Text size="md" ta="center" mt="md" mb="xl" c="gray.4">
              FarmWise is designed to be your digital partner in managing your farm efficiently.
              This short setup will help us tailor the experience to your needs.
              We'll ask a few questions about your farm and its location.
            </Text>
            <Center>
               <Text size="sm" c="gray.5">Click "Next step" to begin.</Text>
            </Center>
          </>
      ),
    },
    {
      label: 'Farm Details',
      description: 'Basic information',
      icon: <IconSettings size={18} />,
      content: (
          <Stack>
            <Title order={3} ta="center" c={theme.white} mb="md">About Your Farm</Title>
            <TextInput
              label="Farm Name"
              placeholder="Enter your farm's name (e.g., Sunny Meadows Farm)"
              value={farmName}
              onChange={(event) => setFarmName(event.currentTarget.value)}
              required
              styles={{ label: { color: theme.white } }}
            />
            <Select
              label="Soil Type"
              placeholder="Select your farm's soil type"
              value={soilType}
              onChange={(value) => value !== null && setSoilType(value)}
              data={[
                { value: 'Clay', label: 'Clay' },
                { value: 'Sandy', label: 'Sandy' },
                { value: 'Loamy', label: 'Loamy' },
                { value: 'Silty', label: 'Silty' },
                { value: 'Peaty', label: 'Peaty' },
                { value: 'Chalky', label: 'Chalky' },
              ]}
              styles={{ label: { color: theme.white } }}
            />
            <Group align="flex-end">
               <Textarea
                  label="Farm Address or General Location"
                  placeholder="e.g., 123 Farm Road, Rural County, ST or nearby landmark"
                  value={farmAddress}
                  onChange={(event) => setFarmAddress(event.currentTarget.value)}
                  autosize
                  minRows={2}
                  styles={{ 
                    label: { color: theme.white },
                    root: { flexGrow: 1 }
                  }}
               />
               <Button 
                leftSection={isLocating ? <Loader size="xs" /> : <IconMapPin size={16} />}
                onClick={handleGetLocation}
                disabled={isLocating}
                variant="light"
                mt={2}
               >
                 {isLocating ? 'Getting...' : 'Get Location'}
               </Button>
             </Group>
             
             <Select
               label="Irrigation Type"
               placeholder="Select irrigation system type"
               value={irrigationType}
               onChange={(value) => value !== null && setIrrigationType(value)}
               data={[
                 { value: 'Drip', label: 'Drip Irrigation' },
                 { value: 'Sprinkler', label: 'Sprinkler System' },
                 { value: 'Flood', label: 'Flood Irrigation' },
                 { value: 'Furrow', label: 'Furrow Irrigation' },
                 { value: 'None', label: 'No Irrigation' },
               ]}
               styles={{ label: { color: theme.white } }}
             />
             
             <Select
               label="Farming Method"
               placeholder="Select your farming approach"
               value={farmingMethod}
               onChange={(value) => value !== null && setFarmingMethod(value)}
               data={[
                 { value: 'Organic', label: 'Organic Farming' },
                 { value: 'Conventional', label: 'Conventional Farming' },
                 { value: 'Mixed', label: 'Mixed Methods' },
                 { value: 'Permaculture', label: 'Permaculture' },
                 { value: 'Hydroponic', label: 'Hydroponic' },
               ]}
               styles={{ label: { color: theme.white } }}
             />
             
             <Text size="xs" c="dimmed" mt="xs">This helps personalize weather and regional information.</Text>
          </Stack>
      ),
    },
    {
       label: 'Your Experience', // New Step
       description: 'Tell us about you',
       icon: <IconBook size={18} />, // Example Icon
       content: (
         <Stack>
           <Title order={3} ta="center" c={theme.white} mb="md">Your Farming Background</Title>
           <Text size="sm" ta="center" c="gray.4" mb="lg">
             Knowing your experience level helps us provide the most relevant tips and features.
           </Text>
           {/* Using SegmentedControl for a compact choice */}
           <SegmentedControl
              fullWidth
              value={farmerExperience}
              onChange={(value) => setFarmerExperience(value as 'new' | 'experienced')}
              data={[
                { label: 'New Farmer / Just Starting', value: 'new' },
                { label: 'Experienced Farmer', value: 'experienced' },
              ]}
              color={logoDarkGreen} // Use theme color
              styles={(_theme) => ({
                  root: { backgroundColor: _theme.colors.dark[6] },
                  label: { color: _theme.white },
                  // Adjust indicator color if needed
              })}
           />
           {/* Alternative using Radio Group:
            <Radio.Group
                name="farmerExperience"
                label="Select your experience level:"
                value={farmerExperience}
                onChange={setFarmerExperience}
                styles={{ label: { color: theme.white } }}
            >
                <Group mt="xs">
                    <Radio value="new" label="New Farmer / Just Starting" color={logoDarkGreen} styles={{ label: { color: theme.white } }} />
                    <Radio value="experienced" label="Experienced Farmer" color={logoDarkGreen} styles={{ label: { color: theme.white } }}/>
                </Group>
            </Radio.Group>
           */}
         </Stack>
       ),
    },
    {
      label: 'Soil & Infrastructure',
      description: 'More farm details',
      icon: <IconTexture size={18} />,
      content: (
        <Stack>
          <Title order={3} ta="center" c={theme.white} mb="md">Soil & Farm Infrastructure</Title>
          
          {/* Soil nutrient information toggle */}
          <Switch 
            label="I have soil nutrient information" 
            checked={hasNutrientData}
            onChange={(event) => setHasNutrientData(event.currentTarget.checked)}
            color={logoDarkGreen}
            styles={{ label: { color: theme.white } }}
          />
          
          {hasNutrientData && (
            <Stack gap="xs" mt="sm">
              <Group justify="space-between" align="center">
                <Text size="sm" c="gray.4">
                  Enter your soil nutrient information if available.
                </Text>
                <Button 
                  variant="subtle" 
                  color="teal" 
                  onClick={estimateSoilNutrients} 
                  size="sm"
                  leftSection={<IconInfoCircle size="1rem" />}
                >
                  Estimate from soil type
                </Button>
              </Group>
              <SimpleGrid cols={{base: 1, sm: 2}} spacing="xs">
                <NumberInput
                  label="Soil Nitrogen (N) in PPM"
                  placeholder="e.g., 45"
                  min={0}
                  max={500}
                  value={soilNitrogen}
                  onChange={(value) => {
                    if (value === '') {
                      setSoilNitrogen('');
                    } else if (typeof value === 'number') {
                      setSoilNitrogen(value);
                    } else {
                      setSoilNitrogen(Number(value));
                    }
                  }}
                  styles={{ label: { color: theme.white } }}
                />
                <NumberInput
                  label="Soil Phosphorus (P) in PPM"
                  placeholder="e.g., 30"
                  min={0}
                  max={500}
                  value={soilPhosphorus}
                  onChange={(value) => {
                    if (value === '') {
                      setSoilPhosphorus('');
                    } else if (typeof value === 'number') {
                      setSoilPhosphorus(value);
                    } else {
                      setSoilPhosphorus(Number(value));
                    }
                  }}
                  styles={{ label: { color: theme.white } }}
                />
                <NumberInput
                  label="Soil Potassium (K) in PPM"
                  placeholder="e.g., 150"
                  min={0}
                  max={1000}
                  value={soilPotassium}
                  onChange={(value) => {
                    if (value === '') {
                      setSoilPotassium('');
                    } else if (typeof value === 'number') {
                      setSoilPotassium(value);
                    } else {
                      setSoilPotassium(Number(value));
                    }
                  }}
                  styles={{ label: { color: theme.white } }}
                />
                <NumberInput
                  label="Soil pH"
                  placeholder="e.g., 6.5"
                  decimalScale={1}
                  min={0}
                  max={14}
                  step={0.1}
                  value={soilPh}
                  onChange={(value) => {
                    if (value === '') {
                      setSoilPh('');
                    } else if (typeof value === 'number') {
                      setSoilPh(value);
                    } else {
                      setSoilPh(Number(value));
                    }
                  }}
                  styles={{ label: { color: theme.white } }}
                />
              </SimpleGrid>
              <Text size="xs" c="dimmed" mt="xs" component="div">
                <Tooltip label="Soil testing kits are available from agricultural suppliers or you can send samples to a lab for analysis.">
                  <Box style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <IconInfoCircle size="0.9rem" style={{ marginRight: 5 }} />
                    Not sure about your soil values? Hover for info.
                  </Box>
                </Tooltip>
              </Text>
            </Stack>
          )}
          
          {!hasNutrientData && (
            <Card withBorder p="md" radius="md" bg="dark.7" mt="sm">
              <Stack gap="xs">
                <Text size="sm" c="gray.3" mb="xs">
                  Don't have soil nutrient information? You can get your soil tested at a lab near you.
                </Text>
                
                <Button 
                  variant="outline" 
                  color="teal" 
                  onClick={findNearbyLabs}
                  leftSection={<IconMapPin size="1rem" />}
                  fullWidth
                >
                  Find Soil Testing Labs Near Me
                </Button>
                
                {isLabFinderOpen && (
                  <>
                    {isLoadingLabs ? (
                      <Center p="xl">
                        <Stack align="center">
                          <Loader size="sm" />
                          <Text size="sm" c="gray.4">Finding labs near your location...</Text>
                        </Stack>
                      </Center>
                    ) : (
                      <>
                        <Text size="sm" fw={500} c="teal.4" mt="sm">Nearby Soil Testing Facilities:</Text>
                        <SimpleGrid cols={1} spacing="xs">
                          {labResults.map((lab, index) => (
                            <Card key={index} withBorder p="xs" radius="sm" bg="dark.6">
                              <Group justify="space-between" wrap="nowrap">
                                <div>
                                  <Text size="sm" fw={500} c="gray.2">{lab.name}</Text>
                                  <Text size="xs" c="gray.5">{lab.address}</Text>
                                  {lab.phone && <Text size="xs" c="blue.4">{lab.phone}</Text>}
                                </div>
                                <Text size="xs" c="teal" fw={600}>{lab.distance}</Text>
                              </Group>
                            </Card>
                          ))}
                        </SimpleGrid>
                        <Text size="xs" mt="xs" c="dimmed">
                          Note: After getting your soil tested, you can add the results in your farm profile later.
                        </Text>
                      </>
                    )}
                  </>
                )}
              </Stack>
            </Card>
          )}
          
          <Divider my="md" />
          
          <Text size="sm" c="gray.4" mb="sm">
            Farm Infrastructure & Accessibility
          </Text>
          
          <SimpleGrid cols={{base: 1, sm: 3}} spacing="sm">
            <Switch 
              label="Water Access" 
              description="Farm has direct water access"
              checked={hasWaterAccess}
              onChange={(event) => setHasWaterAccess(event.currentTarget.checked)}
              color={logoDarkGreen}
              styles={{ label: { color: theme.white }, description: { color: 'gray.5' } }}
            />
            <Switch 
              label="Road Access" 
              description="Farm has road access"
              checked={hasRoadAccess}
              onChange={(event) => setHasRoadAccess(event.currentTarget.checked)}
              color={logoDarkGreen}
              styles={{ label: { color: theme.white }, description: { color: 'gray.5' } }}
            />
            <Switch 
              label="Electricity" 
              description="Farm has electrical power"
              checked={hasElectricity}
              onChange={(event) => setHasElectricity(event.currentTarget.checked)}
              color={logoDarkGreen}
              styles={{ label: { color: theme.white }, description: { color: 'gray.5' } }}
            />
          </SimpleGrid>
          
          <SimpleGrid cols={{base: 1, sm: 2}} spacing="sm" mt="md">
            <NumberInput
              label="Storage Capacity (sq. meters)"
              placeholder="e.g., 500"
              min={0}
              value={storageCapacity}
              onChange={(value) => {
                if (value === '') {
                  setStorageCapacity('');
                } else if (typeof value === 'number') {
                  setStorageCapacity(value);
                } else {
                  setStorageCapacity(Number(value));
                }
              }}
              styles={{ label: { color: theme.white } }}
            />
            <NumberInput
              label="Year Established"
              placeholder="e.g., 2020"
              min={1900}
              max={new Date().getFullYear()}
              value={yearEstablished}
              onChange={(value) => {
                if (value === '') {
                  setYearEstablished('');
                } else if (typeof value === 'number') {
                  setYearEstablished(value);
                } else {
                  setYearEstablished(Number(value));
                }
              }}
              styles={{ label: { color: theme.white } }}
            />
          </SimpleGrid>
        </Stack>
      ),
    },
    {
      label: 'Location',
      description: 'Define your farm area',
      icon: <IconMapPin size={18} />,
      content: (
        <Stack gap="xs">
          <Title order={3} ta="center" c={theme.white} mb="xs">
              Define Your Farm Area
          </Title>
          <Text size="sm" ta="center" c="gray.4" mb="sm">
             Use the map tools to draw your farm boundary, or click "Detect Farms" for an automatic attempt.
          </Text>

          <Button
              leftSection={isDetecting ? <Loader size="xs" /> : <IconTarget size={16} />}
              onClick={handleDetectFarms}
              disabled={isDetecting || isLocating || !isMapReady}
              variant="gradient"
              gradient={{ from: logoLightGreen, to: logoDarkGreen, deg: 90 }}
           >
              {isDetecting ? 'Detecting...' : 'Detect Farms'}
          </Button>

          <Box mt="xs">
             {detectionError && (
                 <Notification icon={<IconX size="1.1rem" />} color="red" title="Detection Error" withCloseButton={false} mb="xs">
                    {detectionError}
                 </Notification>
             )}

             {detectedBoundaries.length > 1 && (
                  <Notification icon={<IconInfoCircle size="1.1rem" />} color="blue" title="Multiple Farms Detected" withCloseButton={false} mb="xs">
                     We found {detectedBoundaries.length} potential boundaries. Please click one on the map to select it.
                  </Notification>
             )}

             {farmBoundary && getSizeMessage(farmBoundary.properties)}
           </Box>

          <Box ref={mapContainerRef} style={{ ...containerStyle, position: 'relative' }}>
            {isLocating && (
              <Center style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 }}>
                 <Loader />
                 <Text ml="sm" c="white">Getting your location...</Text>
              </Center>
            )}
            {!isLocating && (
              <FarmMapEditor
                center={mapCenter}
                zoom={15}
                boundary={farmBoundary}
                setBoundary={handleSetBoundaryFromMap}
                detectedBoundaries={detectedBoundaries}
                onBoundarySelect={handleBoundarySelect}
                setMapInstance={handleSetMapInstance}
              />
            )}
          </Box>

          {farmBoundary && (
             <Text size="sm" ta="center" c="teal.3" mt="xs">
                Farm boundary selected. You can refine it using the map tools, or click "Next Step".
             </Text>
          )}
        </Stack>
      ),
    },
    {
      label: 'Confirmation',
      description: 'Review and finish',
      icon: <IconCheck size={18} />,
      content: (
          <>
           <Title order={3} ta="center" c={theme.white}>Ready to Go!</Title>
           <Text size="lg" ta="center" mt="md" mb="lg" c="gray.3">
              You're all set. Review your farm information below and click "Finish Setup" to proceed to your dashboard.
           </Text>
           
           <Paper withBorder p="md" radius="md" bg="dark.6">
             <Stack gap="xs">
               <Group justify="space-between">
                 <Text fw={500} c="gray.3">Farm Name:</Text>
                 <Text c="gray.1">{farmName || 'Not specified'}</Text>
               </Group>
               
               <Group justify="space-between">
                 <Text fw={500} c="gray.3">Soil Type:</Text>
                 <Text c="gray.1">{soilType || 'Not specified'}</Text>
               </Group>
               
               <Group justify="space-between">
                 <Text fw={500} c="gray.3">Location:</Text>
                 <Text c="gray.1" style={{ maxWidth: '300px', textAlign: 'right' }}>{farmAddress || 'Not specified'}</Text>
               </Group>
               
               <Group justify="space-between">
                 <Text fw={500} c="gray.3">Irrigation:</Text>
                 <Text c="gray.1">{
                   irrigationType ? 
                   irrigationType === 'None' ? 'No Irrigation' :
                   {'Drip': 'Drip Irrigation', 'Sprinkler': 'Sprinkler System', 'Flood': 'Flood Irrigation', 'Furrow': 'Furrow Irrigation'}[irrigationType] 
                   : 'Not specified'
                 }</Text>
               </Group>
               
               <Group justify="space-between">
                 <Text fw={500} c="gray.3">Farming Method:</Text>
                 <Text c="gray.1">{
                   farmingMethod ?
                   {'Organic': 'Organic Farming', 'Conventional': 'Conventional Farming', 'Mixed': 'Mixed Methods', 'Permaculture': 'Permaculture', 'Hydroponic': 'Hydroponic'}[farmingMethod]
                   : 'Not specified'
                 }</Text>
               </Group>
               
               <Group justify="space-between">
                 <Text fw={500} c="gray.3">Experience Level:</Text>
                 <Text c="gray.1">{farmerExperience === 'new' ? 'New Farmer' : farmerExperience === 'experienced' ? 'Experienced Farmer' : 'Not specified'}</Text>
               </Group>
               
               {hasNutrientData && (
                 <Group justify="space-between">
                   <Text fw={500} c="gray.3">Soil Nutrients:</Text>
                   <Text c="gray.1">
                     N:{soilNitrogen || '?'} P:{soilPhosphorus || '?'} K:{soilPotassium || '?'} pH:{soilPh || '?'}
                   </Text>
                 </Group>
               )}
               
               <Group justify="space-between">
                 <Text fw={500} c="gray.3">Infrastructure:</Text>
                 <Text c="gray.1">
                   {[
                     hasWaterAccess ? 'Water' : null,
                     hasRoadAccess ? 'Road' : null,
                     hasElectricity ? 'Electricity' : null
                   ].filter(Boolean).join(', ') || 'None specified'}
                 </Text>
               </Group>
               
               <Group justify="space-between">
                 <Text fw={500} c="gray.3">Boundary Defined:</Text>
                 <Text c="gray.1">{farmBoundary ? 'Yes' : 'No'}</Text>
               </Group>
             </Stack>
           </Paper>
           
           <Text size="sm" ta="center" mt="lg" c="blue.4">
             You can always update these details later in your profile settings.
           </Text>
          </>
      ),
    },
  ];

  return (
    <div className={classes.wrapper}>
      {/* Background shapes */}
       <div className={`${classes.bgShape} ${classes.bgShape1}`}></div>
       <div className={`${classes.bgShape} ${classes.bgShape2}`}></div>
       <div className={`${classes.bgShape} ${classes.bgLine}`}></div>

       <Container size="md" style={{ width: '100%' }}>
          <Paper
             withBorder
             shadow="md"
             p="xl"
             radius="md"
             className={classes.paper} // Ensure dark background style is applied
             style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                marginBottom: 'var(--mantine-spacing-xl)' // Add some space at the bottom
             }}
          >
            <Stepper
                 active={active}
                 onStepClick={setActive}
                 color={logoDarkGreen} // Use logo color for stepper
                 mb="lg"
                 styles={{ stepBody: { display: 'none' }, separator: { marginLeft: 4, marginRight: 4 } }}
            >
              {steps.map((step, index) => (
                <Stepper.Step
                  key={step.label}
                  label={step.label}
                  icon={step.icon}
                  completedIcon={<IconCheck size={18} />}
                />
              ))}
            </Stepper>

            {/* --- Main Content Area (No longer explicitly scrolling) --- */} 
             <Box >
                 <AnimatePresence mode="wait">
                      <motion.div
                           key={active}
                           variants={stepVariant}
                           initial="hidden"
                           animate="visible"
                           exit="exit"
                           style={{ minHeight: '300px' }} // Optional: Ensure content div has some min height
                      >
                      {steps[active].content}
                      </motion.div>
                 </AnimatePresence>
             </Box>

            {/* --- Button Group --- */} 
            <Group justify="space-between" mt="xl" style={{ flexShrink: 0 }}>
              <Button variant="default" onClick={prevStep} disabled={active === 0}>
                Back
              </Button>
              {active === 5 ? (
                <Button
                   onClick={handleFinish}
                   variant="gradient"
                   gradient={{ from: logoLightGreen, to: logoDarkGreen, deg: 90 }}
                >
                  Finish Setup
                </Button>
              ) : (
                <Button
                   onClick={nextStep}
                   disabled={(active === 4 && !farmBoundary && detectedBoundaries.length === 0) || (active === 3 && !farmerExperience) || (active === 2 && !farmName)}
                   variant="gradient"
                   gradient={{ from: logoLightGreen, to: logoDarkGreen, deg: 90 }}
                 >
                  Next step
                </Button>
              )}
            </Group>
          </Paper>
       </Container>
    </div>
  );
}