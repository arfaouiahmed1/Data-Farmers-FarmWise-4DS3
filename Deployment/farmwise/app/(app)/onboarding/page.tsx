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
} from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCheck, IconMapPin, IconUser, IconSettings, IconTarget, IconX, IconInfoCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import classes from './OnboardingPage.module.css';
import { LatLngExpression, Map as LeafletMap } from 'leaflet';
import html2canvas from 'html2canvas';

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

// Map Container Style
const containerStyle = {
  width: '100%',
  height: '400px', // Adjust height as needed
  borderRadius: 'var(--mantine-radius-md)',
};

// Define types for GeoJSON Features
type PolygonGeoJsonFeature = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;

export default function OnboardingPage() {
  const [active, setActive] = useState(0);
  const [farmName, setFarmName] = useState('');
  const [farmBoundary, setFarmBoundary] = useState<PolygonGeoJsonFeature | null>(null);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(defaultCenterLeaflet); // <-- Add state for map center
  const [isLocating, setIsLocating] = useState(true); // <-- Add state for locating status
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedBoundaries, setDetectedBoundaries] = useState<PolygonGeoJsonFeature[]>([]);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [editableBoundaryKey, setEditableBoundaryKey] = useState<number>(0);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const theme = useMantineTheme();

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
    if (active === 2 && !farmBoundary) {
      console.warn("Please draw your farm boundary on the map.");
      return;
    }
    setActive((current) => (current < 3 ? current + 1 : current));
  };
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleFinish = () => {
    console.log('Onboarding finished. Data:', {
      farmName,
      boundary: farmBoundary
    });
    // TODO: Send onboarding data (including farmBoundary GeoJSON) to the backend API
    router.push('/Dashboard');
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
        setDetectedBoundaries(detectedFeatures);
      }

    } catch (error) {
      console.error("Farm detection error:", error);
      setDetectionError(error instanceof Error ? error.message : "An unknown error occurred during detection.");
    } finally {
      setIsDetecting(false);
    }
  }, [mapInstance]);

  const handleBoundarySelect = useCallback((selectedFeature: PolygonGeoJsonFeature) => {
    console.log("Selected boundary:", selectedFeature);
    setFarmBoundary(selectedFeature);
    setDetectedBoundaries([]);
    setDetectionError(null);
    setEditableBoundaryKey(prev => prev + 1);
  }, []);

  const steps = [
    {
      label: 'Welcome',
      description: 'Introduction',
      icon: <IconUser size={18} />,
      content: (
          <>
            <Title order={2} ta="center" c={theme.white}>Welcome to FarmWise!</Title>
            <Text size="lg" ta="center" mt="md" mb="xl" c="gray.3">
              We're excited to help you manage your farm more effectively. Let's get started by setting up your profile.
            </Text>
            <Center>
               <Text size="sm" c="gray.5">Click "Next step" to continue.</Text>
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
            <TextInput
              label="Farm Name"
              placeholder="Enter your farm's name"
              value={farmName}
              onChange={(event) => setFarmName(event.currentTarget.value)}
              required
              styles={(theme) => ({
                 label: { color: theme.white },
              })}
            />
            <TextInput
              label="Farm Type"
              placeholder="e.g., Dairy, Crop, Livestock"
              styles={(theme) => ({
                 label: { color: theme.white },
              })}
            />
          </Stack>
      ),
    },
    {
      label: 'Location',
      description: 'Define your farm area',
      icon: <IconMapPin size={18} />,
      content: (
        () => {
          console.log('Rendering Location Step Content, mapInstance:', mapInstance, 'isMapReady:', isMapReady);
          return (
            <Stack>
              <Group justify="space-between" align="center">
                <Stack gap="xs">
                  <Text size="md" c="gray.3">
                    Outline your farm area.
                  </Text>
                  <Text size="xs" c="gray.5">
                    Use the drawing tools (rectangle or polygon) on the left to draw a rough boundary around your farm. Then click "Detect Farms".
                  </Text>
                </Stack>
                <Button 
                  leftSection={<IconTarget size={16}/>} 
                  onClick={handleDetectFarms} 
                  loading={isDetecting}
                  disabled={!mapInstance || !mapContainerRef.current || isDetecting}
                  variant="outline"
                  color={logoLightGreen}
                >
                  Detect Farms
                </Button>
              </Group>

              <Box 
                ref={mapContainerRef}
                style={{ ...containerStyle, position: 'relative' }}
                className={classes.mapContainer}
              >
                {(isDetecting || isLocating) && ( // Show loader while detecting OR locating
                  <Center style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
                    <Loader color={logoLightGreen} size="xl" />
                     <Text c="white" ml="sm">{isLocating ? 'Getting your location...' : 'Detecting farms...'}</Text> {/* Indicate status */}
                  </Center>
                )}
                 {!isLocating && ( // Render map only after location attempt
                    <FarmMapEditor
                      center={mapCenter} // <-- Use state variable for center
                      zoom={10} // Initial zoom, might want to adjust after locating
                      boundary={farmBoundary}
                      setBoundary={setFarmBoundary}
                      detectedBoundaries={detectedBoundaries}
                      onBoundarySelect={handleBoundarySelect}
                      setMapInstance={handleSetMapInstance}
                      editableBoundaryKey={editableBoundaryKey}
                    />
                 )}
              </Box>

              {detectionError && (
                <Notification icon={<IconX size="1.1rem" />} color="red" withCloseButton={false} mt="sm">
                  {detectionError}
                </Notification>
              )}
              {!isDetecting && detectedBoundaries.length > 0 && !farmBoundary && (
                <Notification icon={<IconInfoCircle size="1.1rem" />} color="blue" withCloseButton={false} mt="sm">
                  {detectedBoundaries.length} potential farm boundary(ies) detected. Click one to select and edit it.
                </Notification>
              )}
              {farmBoundary && (
                <Text ta="center" mt="sm" size="xs" c="green.5">
                  Farm boundary selected. You can refine it using the tools on the left, or click "Next Step".
                </Text>
              )}
            </Stack>
          );
        }
      ),
    },
    {
      label: 'Confirmation',
      description: 'Review and finish',
      icon: <IconCheck size={18} />,
      content: (
          <>
           <Title order={3} ta="center" c={theme.white}>Ready to Go!</Title>
           <Text size="lg" ta="center" mt="md" mb="xl" c="gray.3">
              You're all set. Review your information (optional display below) and click "Finish Setup" to proceed to your dashboard.
           </Text>
          </>
      ),
    },
  ];

  return (
    <Box className={classes.wrapper} style={{ position: 'relative', zIndex: 0 }}>

      <div className={`${classes.bgShape} ${classes.bgShape1}`}></div>
      <div className={`${classes.bgShape} ${classes.bgShape2}`}></div>
      <div className={`${classes.bgShape} ${classes.bgLine}`}></div>

      <Container size="md" my={40} w="100%">
        <Paper 
          withBorder 
          shadow="md" 
          p={30} 
          radius="md" 
          mt={30} 
          className={classes.paper}
        >
          <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false} color={logoDarkGreen} styles={(theme) => ({
             stepLabel: { color: theme.white },
             stepDescription: { color: theme.colors.gray[5] },
             stepIcon: { borderColor: theme.colors.gray[6] },
             separator: { backgroundColor: theme.colors.gray[6] },
          })}>
            {steps.map((step, index) => (
              <Stepper.Step
                key={step.label}
                label={step.label}
                description={step.description}
                icon={step.icon}
                completedIcon={<IconCheck size={18} />}
              />
            ))}
          </Stepper>

          <Box mt="xl" miw={300}> 
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={stepVariant}
              >
                {/* --- Call content if it's a function, otherwise render directly --- */}
                {typeof steps[active].content === 'function' ? steps[active].content() : steps[active].content}
              </motion.div>
            </AnimatePresence>
          </Box>

          <Group justify="space-between" mt="xl">
            <Button variant="outline" color="gray.5" onClick={prevStep} disabled={active === 0}>
              Back
            </Button>
            {active < steps.length - 1 && (
              <Button
                onClick={nextStep}
                variant="gradient"
                gradient={{ from: logoLightGreen, to: logoDarkGreen }}
                styles={{ label: { color: theme.white } }}
                disabled={active === 2 && !farmBoundary}
              >
                Next step
              </Button>
            )}
             {active === steps.length - 1 && (
              <Button
                onClick={handleFinish}
                variant="gradient"
                gradient={{ from: logoLightGreen, to: logoDarkGreen }}
                styles={{ label: { color: theme.white } }}
              >
                Finish Setup
              </Button>
            )}
          </Group>
        </Paper>
      </Container>
    </Box>
  );
}