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
  rem,
  ActionIcon,
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
  IconTexture,
  IconSeeding,
  IconWaterpolo,
  IconSun,
  IconWind,
  IconBulb,
  IconPhone,
  IconTractor,
  IconArrowBack,
  IconArrowRight,
  IconPlant2,
  IconChevronRight,
  IconAlertCircle,
  IconStar,
  IconAlertTriangle,
  IconMapSearch,
  IconPencil,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import classes from './OnboardingPage.module.css';
import { LatLngExpression, Map as LeafletMap } from 'leaflet';
import html2canvas from 'html2canvas';
import * as GeoJSON from 'geojson'; // Import base GeoJSON types
import { notifications } from '@mantine/notifications';
import authService from '@/app/api/auth'; 

// --- Dynamically import FarmMapEditor only on client-side ---
const FarmMapEditor = dynamic(
  () => import('@/components/Onboarding/FarmMapEditor'),
  { ssr: false } // This is the key!
);

// Import SoilTestingLabsMap with dynamic loading (required for Leaflet)
const SoilTestingLabsMap = dynamic(
  () => import('@/components/Onboarding/SoilTestingLabsMap'), 
  { ssr: false }
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
  height: '360px',
  minHeight: '300px',
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

// Add this below the existing state declarations
  // Default values for different soil types
  type SoilTypeKey = 'Clay' | 'Sandy' | 'Loamy' | 'Silty' | 'Peaty' | 'Chalky';
  
  interface SoilValues {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph: number;
  }
  
  const soilTypeDefaults: Record<SoilTypeKey, SoilValues> = {
    'Clay': { nitrogen: 15, phosphorus: 8, potassium: 12, ph: 6.5 },
    'Sandy': { nitrogen: 8, phosphorus: 5, potassium: 6, ph: 5.8 },
    'Loamy': { nitrogen: 20, phosphorus: 12, potassium: 15, ph: 6.8 },
    'Silty': { nitrogen: 18, phosphorus: 10, potassium: 11, ph: 6.2 },
    'Peaty': { nitrogen: 25, phosphorus: 7, potassium: 8, ph: 5.0 },
    'Chalky': { nitrogen: 10, phosphorus: 9, potassium: 14, ph: 7.5 },
  };

export default function OnboardingPage() {
  const theme = useMantineTheme();
  const router = useRouter();
  const [active, setActive] = useState(0);
  
  // Farm data states
  const [farmName, setFarmName] = useState('');
  const [soilType, setSoilType] = useState(''); 
  const [farmAddress, setFarmAddress] = useState('');
  const [farmerExperience, setFarmerExperience] = useState<'new' | 'experienced' | '' >('');
  const [irrigationType, setIrrigationType] = useState('');
  const [farmingMethod, setFarmingMethod] = useState('');
  
  // Soil nutrient data states
  const [soilNitrogen, setSoilNitrogen] = useState<number | ''>('');
  const [soilPhosphorus, setSoilPhosphorus] = useState<number | ''>('');
  const [soilPotassium, setSoilPotassium] = useState<number | ''>('');
  const [soilPh, setSoilPh] = useState<number | ''>('');
  const [hasNutrientData, setHasNutrientData] = useState(false);
  
  // Validation states
  const [nitrogenError, setNitrogenError] = useState<string | null>(null);
  const [phosphorusError, setPhosphorusError] = useState<string | null>(null);
  const [potassiumError, setPotassiumError] = useState<string | null>(null);
  const [phError, setPhError] = useState<string | null>(null);
  
  // Infrastructure and accessibility
  const [hasWaterAccess, setHasWaterAccess] = useState(false);
  const [hasRoadAccess, setHasRoadAccess] = useState(false);
  const [hasElectricity, setHasElectricity] = useState(false);
  const [storageCapacity, setStorageCapacity] = useState<number | ''>('');
  const [yearEstablished, setYearEstablished] = useState<number | ''>('');
  
  // Map and location data
  const [farmBoundary, setFarmBoundary] = useState<PolygonGeoJsonFeature | null>(null);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(defaultCenterLeaflet);
  const [isLocating, setIsLocating] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedBoundaries, setDetectedBoundaries] = useState<PolygonGeoJsonFeature[]>([]);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [editableBoundaryKey, setEditableBoundaryKey] = useState<number>(0);
  const [isMapReady, setIsMapReady] = useState(false);
  
  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Add these new states for nearby labs
  const [showLabsSection, setShowLabsSection] = useState(false);
  const [nearbyLabs, setNearbyLabs] = useState<any[]>([]);
  const [isLoadingLabs, setIsLoadingLabs] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Add these state variables to track which fields have been touched/interacted with
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Function to mark a field as touched when the user interacts with it
  const markFieldTouched = (fieldName: string) => {
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  // CORRECTED Function to highlight empty fields with visual indicators when a step fails validation
  const highlightEmptyFields = (step: number) => { // 'step' here is the 'active' stepper index
    switch(step) {
      case 0: // UI Step 1: Farm Details
        if (!farmName.trim()) markFieldTouched('farmName');
        // farmAddress is optional
        if (!farmerExperience) markFieldTouched('farmerExperience');
        break;
      case 1: // UI Step 2: Soil Type & Nutrients
        if (!soilType) markFieldTouched('soilType');
        if (hasNutrientData) {
          if (soilNitrogen === '') markFieldTouched('soilNitrogen');
          if (soilPhosphorus === '') markFieldTouched('soilPhosphorus');
          if (soilPotassium === '') markFieldTouched('soilPotassium');
          if (soilPh === '') markFieldTouched('soilPh');
        }
        break;
      case 2: // UI Step 3: Farm Practices
        if (!irrigationType) markFieldTouched('irrigationType');
        if (!farmingMethod) markFieldTouched('farmingMethod');
        break;
      case 3: // UI Step 4: Location
        if (!farmBoundary) markFieldTouched('farmBoundary');
        break;
      case 4: // UI Step 5: Additional Info (all optional)
        break;
    }
  };

  // --- Callback to receive map instance from child ---
  const handleSetMapInstance = useCallback((map: LeafletMap | null) => {
    console.log('OnboardingPage: handleSetMapInstance called with:', map);
    setMapInstance(map);
    setIsMapReady(!!map);
  }, []);

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
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser. Using default center.');
      setIsLocating(false);
    }
  }, []);

  // Navigation functions
  const nextStep = async () => { // nextStep now handles progression for steps 0-4
    const validation = validateCurrentStep(active);
    if (!validation.valid) {
      highlightEmptyFields(active);
      notifications.show({
        title: 'Wait a moment!',
        message: validation.message,
        color: 'orange',
        icon: <IconAlertTriangle />,
      });
      return;
    }

    if (active < 5) { // Changed from active < 4 to allow step 4 to advance to step 5
      setActive(active + 1);
    }
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
              setFarmAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
            }
            
            setMapCenter([latitude, longitude]);
          } catch (error) {
            console.error('Error getting address from coordinates:', error);
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

  // Function to estimate nutrient values based on soil type
  const estimateNutrientValues = () => {
    if (soilType && soilTypeDefaults[soilType as SoilTypeKey]) {
      const defaults = soilTypeDefaults[soilType as SoilTypeKey];
      setSoilNitrogen(defaults.nitrogen);
      setSoilPhosphorus(defaults.phosphorus);
      setSoilPotassium(defaults.potassium);
      setSoilPh(defaults.ph);
      setHasNutrientData(true);
      
      notifications.show({
        title: 'Values Estimated',
        message: `Estimated values for ${soilType} soil have been applied`,
        color: 'green',
      });
    }
  };

  // Function to validate nutrient values
  const validateNutrientValues = () => {
    let isValid = true;
    
    // Validate N, P, K values if they are provided
    if (soilNitrogen !== '') {
      if (soilNitrogen < 0) {
        setNitrogenError("Nitrogen can't be negative. Plants need positive vibes!");
        isValid = false;
      } else if (soilNitrogen > 500) {
        setNitrogenError("Whoa! That's super high nitrogen. Are you farming on a fertilizer pile?");
        isValid = false;
      } else {
        setNitrogenError(null);
      }
    }
    
    if (soilPhosphorus !== '') {
      if (soilPhosphorus < 0) {
        setPhosphorusError("Negative phosphorus? Your plants would be very confused!");
        isValid = false;
      } else if (soilPhosphorus > 300) {
        setPhosphorusError("That phosphorus level is through the roof! Let's keep it realistic.");
        isValid = false;
      } else {
        setPhosphorusError(null);
      }
    }
    
    if (soilPotassium !== '') {
      if (soilPotassium < 0) {
        setPotassiumError("Potassium can't be negative. What would your plants eat?");
        isValid = false;
      } else if (soilPotassium > 400) {
        setPotassiumError("That's banana-level potassium! A bit too high for soil.");
        isValid = false;
      } else {
        setPotassiumError(null);
      }
    }
    
    // pH validation is critical - must be between 0 and 14
    if (soilPh !== '') {
      if (soilPh < 0) {
        setPhError("pH below 0? That's not soil, that's science fiction!");
        isValid = false;
      } else if (soilPh > 14) {
        setPhError("pH can't exceed 14 - that's beyond the pH scale entirely!");
        isValid = false;
      } else {
        setPhError(null);
      }
    }
    
    return isValid;
  };

  // Function to validate a single value with min/max
  const validateValue = (value: number | '', min: number, max: number, setError: (error: string | null) => void, lowErrorMsg: string, highErrorMsg: string): boolean => {
    if (value === '') return true;
    
    if (value < min) {
      setError(lowErrorMsg);
      return false;
    } else if (value > max) {
      setError(highErrorMsg);
      return false;
    } else {
      setError(null);
      return true;
    }
  };

  // Handle nutrient input change with validation
  const handleNitrogenChange = (val: string | number) => {
    const newVal = typeof val === 'string' ? (val === '' ? '' : parseFloat(val)) : val;
    setSoilNitrogen(newVal as number | '');
    validateValue(
      newVal as number | '', 
      0, 
      500, 
      setNitrogenError,
      "Nitrogen can't be negative. Plants need positive vibes!",
      "Whoa! That's super high nitrogen. Are you farming on a fertilizer pile?"
    );
  };

  const handlePhosphorusChange = (val: string | number) => {
    const newVal = typeof val === 'string' ? (val === '' ? '' : parseFloat(val)) : val;
    setSoilPhosphorus(newVal as number | '');
    validateValue(
      newVal as number | '', 
      0, 
      300, 
      setPhosphorusError,
      "Negative phosphorus? Your plants would be very confused!",
      "That phosphorus level is through the roof! Let's keep it realistic."
    );
  };

  const handlePotassiumChange = (val: string | number) => {
    const newVal = typeof val === 'string' ? (val === '' ? '' : parseFloat(val)) : val;
    setSoilPotassium(newVal as number | '');
    validateValue(
      newVal as number | '', 
      0, 
      400, 
      setPotassiumError,
      "Potassium can't be negative. What would your plants eat?",
      "That's banana-level potassium! A bit too high for soil."
    );
  };

  const handlePhChange = (val: string | number) => {
    const newVal = typeof val === 'string' ? (val === '' ? '' : parseFloat(val)) : val;
    setSoilPh(newVal as number | '');
    validateValue(
      newVal as number | '', 
      0, 
      14, 
      setPhError,
      "pH below 0? That's not soil, that's science fiction!",
      "pH can't exceed 14 - that's beyond the pH scale entirely!"
    );
  };

  // Add this function after the validateNutrientValues function --- THIS IS THE TARGET FOR REPLACEMENT
  // CORRECTED validateCurrentStep function
  const validateCurrentStep = (step: number): {valid: boolean, message: string | null} => {
    // 'step' parameter is the 'active' stepper index (0-4 for content steps)
    switch(step) {
      case 0: // Corresponds to UI Step 1: Farm Details
        if (!farmName.trim()) {
          return { valid: false, message: "Hmm, your farm needs a name! What shall we call your green paradise?" };
        }
        // Farm Address is optional, so no validation here for emptiness
        if (!farmerExperience) {
          return { valid: false, message: "Are you new to farming or a seasoned pro? We'd love to know your experience level!" };
        }
        return { valid: true, message: null };
        
      case 1: // Corresponds to UI Step 2: Soil Type & Nutrients
        if (!soilType) {
          return { valid: false, message: "What kind of soil do you have? Your plants are curious about their growing medium!" };
        }
        if (hasNutrientData) {
          const nutrientsValid = validateNutrientValues(); // validateNutrientValues already sets field-specific errors
          if (!nutrientsValid) {
              return { valid: false, message: "Those nutrient numbers seem a bit off. Let's get them right for happy plants!" };
          }
        }
        return { valid: true, message: null };
        
      case 2: // Corresponds to UI Step 3: Farm Practices
        if (!irrigationType) {
          return { valid: false, message: "How do you water your plants? They're thirsty for this information!" };
        }
        if (!farmingMethod) {
          return { valid: false, message: "What's your farming style? Organic, conventional, or something else entirely?" };
        }
        return { valid: true, message: null };
  
      case 3: // Corresponds to UI Step 4: Location (Map & Boundary)
        if (!farmBoundary) {
          return { valid: false, message: "Oops! Your farm needs boundaries. Let's draw where your crops will grow!" };
        }
        return { valid: true, message: null };
  
      case 4: // Corresponds to UI Step 5: Additional Info (Optional fields)
        return { valid: true, message: null };
        
      default:
        return { valid: true, message: null }; 
    }
  };

  // Function to handle final submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    setNitrogenError(null);
    setPhosphorusError(null);
    setPotassiumError(null);
    setPhError(null);
    
    // Validate all required fields
    for (let step = 0; step <= 4; step++) {
      const validation = validateCurrentStep(step);
      if (!validation.valid) {
        setActive(step);
        setIsSubmitting(false);
        highlightEmptyFields(step); // Make sure all required fields are highlighted
        notifications.show({
          title: 'Please Complete All Steps',
          message: validation.message || 'A piece of information is missing or incorrect. Please check the highlighted fields.',
          color: 'red',
          icon: <IconAlertCircle />,
        });
        return;
      }
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // First, set the current view to success/completion
      setActive(5);
      
      // Show a submission notification
      notifications.show({
        id: 'submit-progress',
        title: 'Creating Your Farm',
        message: 'Setting up your farm and preparing your dashboard...',
        color: 'blue',
        loading: true,
        autoClose: false,
      });
      
      // Send the form data to the backend
      const response = await fetch('/core/farm/onboarding/', { // Changed URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Token ${token}` : '',
        },
        body: JSON.stringify({
          farm_name: farmName.trim(),
          farm_address: farmAddress.trim(),
          soil_type: soilType,
          irrigation_type: irrigationType,
          farming_method: farmingMethod,
          farmer_experience: farmerExperience,
          soil_nitrogen: soilNitrogen || null,
          soil_phosphorus: soilPhosphorus || null,
          soil_potassium: soilPotassium || null,
          soil_ph: soilPh || null,
          has_water_access: hasWaterAccess,
          has_road_access: hasRoadAccess,
          has_electricity: hasElectricity,
          storage_capacity: storageCapacity || null,
          year_established: yearEstablished || null,
          // Backend expects boundary, so we use that as primary field name
          boundary: farmBoundary,
        }),
      });
      
      // Close the submission notification
      notifications.hide('submit-progress');
      
      const contentType = response.headers.get("content-type");
      let responseData: any; // Declare responseData here with explicit type any
      if (contentType && contentType.indexOf("application/json") !== -1) {
        responseData = await response.json(); // Parse JSON for all responses
      }

      if (!response.ok) {
        // Handle error response
        if (responseData) {
          // Handle validation errors and field-specific errors
          if (responseData.error === 'Validation failed' && responseData.details && Array.isArray(responseData.details)) {
            responseData.details.forEach((error: string) => {
              const errorLower = error.toLowerCase();
              if (errorLower.includes('nitrogen')) { setNitrogenError(error); setActive(1); }
              else if (errorLower.includes('phosphorus')) { setPhosphorusError(error); setActive(1); }
              else if (errorLower.includes('potassium')) { setPotassiumError(error); setActive(1); }
              else if (errorLower.includes('ph')) { setPhError(error); setActive(1); }
              else if (errorLower.includes('farm name') || errorLower.includes('farm_name')) { setActive(0); markFieldTouched('farmName'); }
              else if (errorLower.includes('boundary') || errorLower.includes('map')) { setActive(3); markFieldTouched('farmBoundary'); }
              else if (errorLower.includes('soil type') || errorLower.includes('soil_type')) { setActive(1); markFieldTouched('soilType'); }
              else if (errorLower.includes('irrigation') || errorLower.includes('irrigation_type')) { setActive(2); markFieldTouched('irrigationType'); }
              else if (errorLower.includes('farming method') || errorLower.includes('farming_method')) { setActive(2); markFieldTouched('farmingMethod'); }
              else if (errorLower.includes('experience') || errorLower.includes('farmer_experience')) { setActive(0); markFieldTouched('farmerExperience'); }
            });
            
            if (responseData.details.length > 0) {
              notifications.show({
                title: 'Oops! We Need More Information',
                message: responseData.details[0],
                color: 'orange',
                icon: <IconAlertTriangle />,
              });
            }
          } else {
            // Handle other JSON errors
            setSubmitError(responseData.error || 'An unexpected error occurred during submission. Please try again.');
            notifications.show({
              title: 'Error Creating Farm',
              message: responseData.error || 'An unexpected error occurred. Please try again.',
              color: 'red',
              icon: <IconAlertCircle />,
            });
          }
        } else {
          const errorText = await response.text();
          console.error("Server returned non-JSON error:", errorText.substring(0, 500));
          setSubmitError('The server returned an unexpected response. Please try again. If the problem persists, the server might be experiencing issues.');
          notifications.show({
            title: 'Server Error',
            message: 'The server returned an unexpected response. Please try again.',
            color: 'red',
            icon: <IconAlertCircle />,
          });
        }
        setIsSubmitting(false);
        return; 
      }
      
      // Success! Show notification and navigate
      notifications.show({
        title: 'Farm Setup Complete!',
        message: 'Your farm is ready for planting success. Let\'s grow together!',
        color: 'green',
        icon: <IconPlant2 />,
      });
      
      // Add a delay before navigation to ensure notification is seen
      setTimeout(() => {
        // Clear any cached user data to force a fresh fetch 
        localStorage.removeItem('user');
        
        // Use window.location for a full page navigation instead of router.push
        // Redirect to dashboard with farm_id if available
        if (responseData && responseData.farm_id) {
          window.location.href = `/dashboard?farm_id=${responseData.farm_id}`;
        } else {
          window.location.href = '/dashboard'; // Fallback to dashboard without ID
        }
      }, 1500);
      
    } catch (error) {
      // Close the submission notification if it's still showing
      notifications.hide('submit-progress');
      
      console.error('Error submitting onboarding data:', error);
      setSubmitError(error instanceof Error ? error.message : 'A critical error occurred. Please try again or contact support.');
      
      notifications.show({
        title: 'Connection Error',
        message: 'Could not connect to the server. Please check your internet connection and try again.',
        color: 'red',
        icon: <IconAlertCircle />,
      });
      
      setIsSubmitting(false);
      // Stay on the success step but allow retry
    }
  };

  // Get size category message
  const getSizeMessage = (properties: FarmProperties | undefined | null): React.ReactNode => {
    if (!properties || properties.area_hectares === undefined) {
      return <Text>Unknown size</Text>;
    }
    
    const area = properties.area_hectares;
    let sizeCategory: string;
    let color: string;
    
    if (area < 10) {
      sizeCategory = 'Small';
      color = theme.colors.blue[6];
    } else if (area < 50) {
      sizeCategory = 'Medium';
      color = theme.colors.indigo[6];
    } else {
      sizeCategory = 'Large';
      color = theme.colors.violet[6];
    }
    
    return (
      <Group>
        <Text fw={500} size="sm">Farm Size:</Text>
        <Text span c={color} fw={700}>{sizeCategory}</Text>
        <Text span>({area.toFixed(2)} hectares)</Text>
      </Group>
    );
  };

  // Function to manually trigger farm boundary detection
  const detectFarmBoundaries = async () => {
    if (!isMapReady || !mapInstance) {
      console.error('Map is not ready for boundary detection');
      setDetectionError('Map is not ready. Please try again in a moment.');
      return;
    }
    
    setIsDetecting(true);
    setDetectionError(null);
    
    // Important: Don't pre-clear the detected boundaries - we'll set them after results come in
    // Also, don't clear the current boundary until we have new ones to show
    
    try {
      // Get the map's bounds to include in the API request
      const bounds = mapInstance.getBounds();
      const mapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };
      
      // Show notification to indicate processing is happening
      notifications.show({
        title: 'Processing',
        message: 'Taking a snapshot of your map view to detect farm boundaries...',
        color: 'blue',
        loading: true,
        autoClose: false,
        id: 'boundary-detection'
      });
      
      // Get a snapshot of the map as a data URL
      if (mapContainerRef.current) {
        try {
          const canvas = await html2canvas(mapContainerRef.current, {
            useCORS: true,
            logging: false,
            scale: 3, // Increase from 2 to 3 for higher resolution
            backgroundColor: null,
            allowTaint: true,
            imageTimeout: 15000, // Increase timeout for larger images
            ignoreElements: (element) => {
              // Ignore attribution and controls to focus on the map imagery
              return element.classList.contains('leaflet-control') || 
                     element.classList.contains('leaflet-top') ||
                     element.classList.contains('leaflet-bottom');
            }
          });
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Higher quality JPEG
          
          notifications.update({
            id: 'boundary-detection',
            title: 'Analyzing',
            message: 'Analyzing satellite imagery for potential farm boundaries...',
            color: 'blue',
            loading: true,
          });
          
          // Submit to the API route
          console.log('Sending boundary detection request to API...');
          const response = await fetch('/api/detect-farm-boundaries/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image_data: dataUrl,
              map_bounds: mapBounds,
              preserve_detail: true // Add parameter to keep original shape detail
            }),
          });
          
          // Hide the loading notification
          notifications.hide('boundary-detection');
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API error response:', errorData);
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Process the response data
          if (Array.isArray(data)) {
            console.log(`Received ${data.length} boundaries from detection API`);
            
            if (data.length === 0) {
              setDetectionError('No farm boundaries detected. Try adjusting the map view or draw manually.');
              notifications.show({
                title: 'No Boundaries Found',
                message: 'Try zooming in more or adjusting your map view to focus on your farm area.',
                color: 'yellow',
                icon: <IconAlertTriangle size={16} />,
              });
              setIsDetecting(false);
              return;
            }
            
            // Process each boundary to ensure properties exist and calculate area
            const processedBoundaries = data.map((boundary: any, index: number) => {
              // Ensure properties object exists
              if (!boundary.properties) {
                boundary.properties = {};
              }
              
              try {
                // Calculate area if not already provided
                if (!boundary.properties.area_hectares && boundary.geometry) {
                  const polygonGeoJson = {
                    type: 'Feature',
                    properties: {},
                    geometry: boundary.geometry
                  };
                  
                  // Use Turf.js area calculation (handled in back-end or will be calculated when selected)
                  boundary.properties.area_hectares = boundary.properties.area_hectares || 0;
                }
                
                // Add ID for reference
                boundary.properties.id = index + 1;
                
              } catch (error) {
                console.error('Error processing boundary:', error);
              }
              
              return boundary as PolygonGeoJsonFeature;
            });
            
            // Now clear the current boundary before showing selection options
            setFarmBoundary(null);
            
            // Reset edit boundary key to force map refresh
            setEditableBoundaryKey(prev => prev + 1);
            
            // Set detected boundaries
            setDetectedBoundaries(processedBoundaries);
            
            // If boundaries were found
            if (processedBoundaries.length > 0) {
              console.log(`Prepared ${processedBoundaries.length} boundaries for display`);
              
              // If only one boundary was found, select it automatically
              if (processedBoundaries.length === 1) {
                setFarmBoundary(processedBoundaries[0]);
                notifications.show({
                  title: 'Success',
                  message: 'Farm boundary detected and automatically selected',
                  color: 'green',
                  icon: <IconCheck size={16} />,
                });
              } else {
                // Show a notification instructing the user to select a boundary
                notifications.show({
                  title: 'Multiple Boundaries Found',
                  message: `${processedBoundaries.length} farm boundaries detected. Please click on one to select it.`,
                  color: 'blue',
                  icon: <IconInfoCircle size={16} />,
                  autoClose: 5000,
                });
              }
            } else {
              setDetectionError('No farm boundaries detected. Try adjusting the map view or draw manually.');
            }
          } else {
            console.error('Invalid response format from boundary detection:', data);
            setDetectionError('Invalid response format from the server.');
          }
        } catch (canvasError) {
          console.error('Error creating canvas for map snapshot:', canvasError);
          throw new Error('Failed to capture map image. Please try again.');
        }
      } else {
        setDetectionError('Map container not ready. Please try again.');
      }
    } catch (error) {
      console.error('Error detecting farm boundaries:', error);
      setDetectionError(error instanceof Error ? error.message : 'An unknown error occurred');
      
      // Hide the loading notification in case of error
      notifications.hide('boundary-detection');
      
      // Show error notification
      notifications.show({
        title: 'Detection Failed',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setIsDetecting(false);
    }
  };

  // Handle boundary selection from the map
  const handleBoundarySelect = (selectedFeature: any) => {
    console.log("Selected boundary:", selectedFeature);
    
    // Cast to our type and ensure the selected feature has properties
    const featureWithProps: PolygonGeoJsonFeature = {
      ...selectedFeature,
      type: "Feature",
      properties: {
        ...(selectedFeature.properties || {}),
        id: selectedFeature.properties?.id || Date.now(),
        area_hectares: selectedFeature.properties?.area_hectares || 0
      }
    };
    
    // Set as the selected farm boundary
    setFarmBoundary(featureWithProps);
    
    // Immediately clear detected boundaries to hide other options
    setDetectedBoundaries([]);
    
    // Force map refresh to ensure proper rendering
    setEditableBoundaryKey(prev => prev + 1);
    
    // Show success notification
    notifications.show({
      title: 'Farm Selected',
      message: 'Your farm boundary has been set. You can edit it if needed.',
      color: 'green',
      icon: <IconCheck size={16} />,
    });
    
    // Reset any error state
    setDetectionError(null);
  };

  // Update the handleSoilTypeSelect function to always estimate values if no detailed data
  const handleSoilTypeSelect = (type: SoilTypeKey) => {
    setSoilType(type);
    
    // If user doesn't have detailed soil data, automatically apply estimates
    if (!hasNutrientData) {
      if (soilTypeDefaults[type]) {
        const defaults = soilTypeDefaults[type];
        setSoilNitrogen(defaults.nitrogen);
        setSoilPhosphorus(defaults.phosphorus);
        setSoilPotassium(defaults.potassium);
        setSoilPh(defaults.ph);
        
        notifications.show({
          title: 'Values Estimated',
          message: `Default values for ${type} soil have been applied`,
          color: 'green',
        });
      }
    }
  };
  
  // Add a function to find nearby soil testing labs
  const findNearbyLabs = async () => {
    setIsLoadingLabs(true);
    setShowLabsSection(true);
    
    try {
      // Get user's location if not already available
      if (!userLocation) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ lat: latitude, lng: longitude });
              await fetchLabsData(latitude, longitude);
            },
            (error) => {
              console.error('Error getting location:', error);
              notifications.show({
                title: 'Location Error',
                message: 'Unable to get your location. Please enter your location manually.',
                color: 'red',
              });
              setIsLoadingLabs(false);
            }
          );
        } else {
          notifications.show({
            title: 'Geolocation Not Supported',
            message: 'Your browser does not support geolocation',
            color: 'red',
          });
          setIsLoadingLabs(false);
        }
      } else {
        await fetchLabsData(userLocation.lat, userLocation.lng);
      }
    } catch (error) {
      console.error('Error finding labs:', error);
      setIsLoadingLabs(false);
      notifications.show({
        title: 'Error',
        message: 'Failed to find nearby soil testing labs',
        color: 'red',
      });
    }
  };
  
  // Function to fetch labs data using coordinates
  const fetchLabsData = async (latitude: number, longitude: number) => {
    try {
      // Use Google Places API via our backend proxy to avoid exposing API keys
      const response = await fetch(`/api/nearby-places?lat=${latitude}&lng=${longitude}&type=laboratory&keyword=soil+testing`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch labs data');
      }
      
      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        setNearbyLabs(data.results.slice(0, 5)); // Limit to 5 results
      } else {
        setNearbyLabs([]);
      }
    } catch (error) {
      console.error('Error fetching labs data:', error);
      setNearbyLabs([]);
    } finally {
      setIsLoadingLabs(false);
    }
  };

  // Fix to use the updated location step in the AnimatePresence section
  const activeStepContent = () => {
    switch (active) {
      case 0:
        return (
          <Stack>
            <Title order={3} className={classes.sectionTitle}>Let's Set Up Your Farm</Title>
            <Text className={classes.sectionDescription}>
              Start by telling us about your farm and your farming experience. This information helps us tailor recommendations specifically for you.
            </Text>
            
            <Box className={classes.fieldGroup}>
              <TextInput
                label="Farm Name"
                placeholder="Enter your farm name"
                value={farmName}
                onChange={(e) => {
                  setFarmName(e.currentTarget.value);
                  markFieldTouched('farmName');
                }}
                required
                size="md"
                error={touchedFields.farmName && !farmName.trim() ? "Your farm is waiting for its name!" : null}
                withAsterisk
              />
            </Box>
            
            <Box className={classes.fieldGroup}>
              <Text fw={500} mb="xs" className={classes.fieldLabel}>Farming Experience <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span></Text>
              <SegmentedControl
                value={farmerExperience}
                onChange={(value) => {
                  setFarmerExperience(value as 'new' | 'experienced' | '');
                  markFieldTouched('farmerExperience');
                }}
                data={[
                  { value: 'new', label: 'New to Farming' },
                  { value: 'experienced', label: 'Experienced Farmer' }
                ]}
                fullWidth
              />
              {touchedFields.farmerExperience && !farmerExperience && (
                <Text size="sm" color="red" mt="xs">Please select your farming experience</Text>
              )}
            </Box>
            
            <Box className={classes.fieldGroup}>
              <Textarea
                label="Farm Address"
                placeholder="Enter your farm address (optional)"
                value={farmAddress}
                onChange={(e) => {
                  setFarmAddress(e.currentTarget.value);
                  markFieldTouched('farmAddress');
                }}
                minRows={2}
                size="md"
                error={touchedFields.farmAddress && !farmAddress.trim() ? "Your crops need to know where they'll grow!" : null}
                withAsterisk
                rightSection={
                  <ActionIcon 
                    onClick={handleGetLocation} 
                    loading={isLocating}
                    variant="subtle"
                    color="blue"
                    size="lg"
                  >
                    <IconMapPin size={18} />
                  </ActionIcon>
                }
              />
              <Text size="xs" mt={5} c="dimmed" className={classes.helpText}>
                Click the location icon to use your current location
              </Text>
            </Box>
            
            <Box className={classes.infoCard}>
              <Group gap="xs">
                <IconInfoCircle size={24} color={theme.colors.blue[6]} />
                <Text fw={500}>Why is this information important?</Text>
              </Group>
              <Text size="sm" mt="xs">
                Your farm details help us personalize your experience. We'll use this information to provide tailored recommendations for crop selection, resource management, and optimal farming practices.
              </Text>
            </Box>
          </Stack>
        );
      case 1:
        return (
          <Stack>
            <Title order={3} className={classes.sectionTitle}>What's Your Soil Like?</Title>
            <Text className={classes.sectionDescription}>
              Soil type is one of the most important factors in determining what crops will thrive on your farm. Select the predominant soil type in your fields.
            </Text>
            
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
              {[
                { 
                  value: 'Clay', 
                  label: 'Clay', 
                  emoji: '🧱', 
                  icon: <IconTexture size={32} />, 
                  description: 'Heavy, sticky when wet, forms hard clumps when dry',
                  color: '#b25d40', // Reddish-brown clay color
                  textColor: 'white'
                },
                { 
                  value: 'Sandy', 
                  label: 'Sandy', 
                  emoji: '🏝️', 
                  icon: <IconTexture size={32} />, 
                  description: 'Gritty, loose, drains quickly, warms up fast',
                  color: '#e6c388', // Sandy beige color
                  textColor: '#333'
                },
                { 
                  value: 'Loamy', 
                  label: 'Loamy', 
                  emoji: '🌱', 
                  icon: <IconTexture size={32} />, 
                  description: 'Perfect balance, crumbly, retains moisture but drains well',
                  color: '#7d5d3b', // Rich loam brown
                  textColor: 'white'
                },
                { 
                  value: 'Silty', 
                  label: 'Silty', 
                  emoji: '💨', 
                  icon: <IconTexture size={32} />, 
                  description: 'Smooth like flour when dry, slippery when wet',
                  color: '#c2b280', // Silt tan color
                  textColor: '#333'
                },
                { 
                  value: 'Peaty', 
                  label: 'Peaty', 
                  emoji: '🌿', 
                  icon: <IconTexture size={32} />, 
                  description: 'Dark, spongy, high in organic matter',
                  color: '#4f3b22', // Dark peaty brown
                  textColor: 'white'
                },
                { 
                  value: 'Chalky', 
                  label: 'Chalky', 
                  emoji: '⚪', 
                  icon: <IconTexture size={32} />, 
                  description: 'Alkaline, stony, free-draining, often shallow',
                  color: '#e6e6e6', // Chalk white
                  textColor: '#333'
                },
              ].map((item) => (
                <Card 
                  key={item.value} 
                  withBorder
                  padding="lg"
                  radius="xl"
                  className={`${classes.card} ${soilType === item.value ? classes.cardHighlight : ''}`}
                  onClick={() => handleSoilTypeSelect(item.value as SoilTypeKey)}
                  style={{
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    transform: soilType === item.value ? 'translateY(-8px)' : 'none',
                    boxShadow: soilType === item.value 
                      ? `0 8px 20px rgba(0, 0, 0, 0.15), 0 0 0 3px ${item.color}40` 
                      : '0 2px 4px rgba(0, 0, 0, 0.05)',
                    border: soilType === item.value 
                      ? `2px solid ${item.color}` 
                      : '1px solid var(--mantine-color-gray-3)'
                  }}
                >
                  {soilType === item.value && (
                    <div style={{
                      position: 'absolute',
                      top: -12,
                      right: -12,
                      backgroundColor: item.color,
                      color: item.textColor,
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      border: '2px solid white'
                    }}>
                      <IconCheck size={18} />
                    </div>
                  )}
                  
                  <Card.Section p="md" style={{ 
                    backgroundColor: soilType === item.value ? `${item.color}25` : 'var(--mantine-color-gray-0)',
                    borderTopLeftRadius: 'calc(var(--mantine-radius-xl) - 2px)', 
                    borderTopRightRadius: 'calc(var(--mantine-radius-xl) - 2px)',
                    borderBottom: soilType === item.value ? `2px dashed ${item.color}40` : '1px solid var(--mantine-color-gray-2)'
                  }}>
                    <Center>
                      <div className={classes.soilTypeIcon} style={{
                        backgroundColor: soilType === item.value ? `${item.color}30` : `${item.color}20`,
                        boxShadow: soilType === item.value ? `0 0 0 4px ${item.color}30` : 'none',
                        position: 'relative'
                      }}>
                        <div style={{ 
                          fontSize: '32px',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}>
                          {item.emoji}
                        </div>
                      </div>
                    </Center>
                  </Card.Section>
                  
                  <Stack mt="md" gap="xs">
                    <Text fw={700} ta="center" style={{ 
                      color: soilType === item.value ? item.color : 'inherit',
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      {item.label}
                    </Text>
                    <Text size="sm" c="dimmed" ta="center" 
                      style={{
                        lineHeight: 1.4,
                        padding: '0 8px'
                      }}
                    >{item.description}</Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
            {touchedFields.soilType && !soilType && (
              <Text size="sm" color="red" mt="xs" ta="center">
                What's beneath your farm? Pick a soil type to let your plants know their growing medium!
              </Text>
            )}
            
            <Box mt="lg">
              <Group justify="apart" align="center">
                <Switch
                  label="I have detailed soil test results"
                  checked={hasNutrientData}
                  onChange={(e) => {
                    const newValue = e.currentTarget.checked;
                    setHasNutrientData(newValue);
                    
                    // If toggling off and we have a soil type selected, apply estimates
                    if (!newValue && soilType && soilTypeDefaults[soilType as SoilTypeKey]) {
                      const defaults = soilTypeDefaults[soilType as SoilTypeKey];
                      setSoilNitrogen(defaults.nitrogen);
                      setSoilPhosphorus(defaults.phosphorus);
                      setSoilPotassium(defaults.potassium);
                      setSoilPh(defaults.ph);
                    }
                  }}
                  size="md"
                />
                {!hasNutrientData && (
                  <Button 
                    variant="light" 
                    color="blue" 
                    leftSection={<IconMapPin size={16} />}
                    onClick={findNearbyLabs}
                    className={classes.estimateButton}
                    loading={isLoadingLabs}
                  >
                    Find Soil Testing Labs
                  </Button>
                )}
              </Group>
              
              {!hasNutrientData && showLabsSection && (
                <Card withBorder mt="md" p="md" radius="md">
                  <Card.Section withBorder p="sm" bg="rgba(66, 133, 244, 0.08)">
                    <Group>
                      <IconInfoCircle size={20} color={theme.colors.blue[6]} />
                      <Text fw={600}>Why Test Your Soil?</Text>
                    </Group>
                    <Text size="sm" mt="xs">
                      Professional soil testing provides accurate nutrient levels and helps determine the exact amendments your soil needs for optimal crop growth.
                    </Text>
                  </Card.Section>
                  
                  {isLoadingLabs ? (
                    <Center py="xl">
                      <Stack align="center">
                        <Loader size="md" />
                        <Text size="sm" c="dimmed">Finding soil testing labs near you...</Text>
                      </Stack>
                    </Center>
                  ) : (
                    <>
                      <Text fw={500} mt="md" mb="sm">Soil Testing Labs Near You</Text>
                      <SoilTestingLabsMap 
                        userLocation={userLocation}
                        onLabSelect={(lab) => {
                          notifications.show({
                            title: 'Lab Selected',
                            message: `${lab.name} is ${lab.distance?.toFixed(1)} km away`,
                            color: 'green',
                          });
                        }}
                      />
                      <Group justify="apart" mt="md">
                        <Button 
                          fullWidth 
                          variant="outline" 
                          color="gray" 
                          onClick={() => setShowLabsSection(false)}
                        >
                          Close
                        </Button>
                      </Group>
                    </>
                  )}
                </Card>
              )}
              
              {hasNutrientData && (
                <Stack mt="md" gap="sm">
                  <Group justify="apart">
                    <Text size="sm" fw={500}>Enter your soil nutrient values</Text>
                    {soilType && (
                      <Button 
                        variant="subtle" 
                        color="blue" 
                        size="sm"
                        leftSection={<IconBulb size={16} />}
                        onClick={estimateNutrientValues}
                        className={classes.estimateButton}
                      >
                        Estimate for {soilType} Soil
                      </Button>
                    )}
                  </Group>
                  <SimpleGrid cols={{ base: 1, xs: 2 }}>
                    <NumberInput
                      label="Nitrogen (N)"
                      placeholder="PPM"
                      value={soilNitrogen}
                      onChange={(val) => {
                        handleNitrogenChange(val);
                        markFieldTouched('soilNitrogen');
                      }}
                      min={0}
                      max={500}
                      rightSection={<Text c="dimmed" size="xs">PPM</Text>}
                      className={classes.nutrientInput}
                      error={nitrogenError || (touchedFields.soilNitrogen && soilNitrogen === '' && hasNutrientData ? 
                        "Plants need nitrogen to grow green and strong!" : null)}
                      withAsterisk={hasNutrientData}
                    />
                    <NumberInput
                      label="Phosphorus (P)"
                      placeholder="PPM"
                      value={soilPhosphorus}
                      onChange={(val) => {
                        handlePhosphorusChange(val);
                        markFieldTouched('soilPhosphorus');
                      }}
                      min={0}
                      max={300}
                      rightSection={<Text c="dimmed" size="xs">PPM</Text>}
                      className={classes.nutrientInput}
                      error={phosphorusError || (touchedFields.soilPhosphorus && soilPhosphorus === '' && hasNutrientData ? 
                        "Phosphorus helps your plants flower and fruit!" : null)}
                      withAsterisk={hasNutrientData}
                    />
                    <NumberInput
                      label="Potassium (K)"
                      placeholder="PPM"
                      value={soilPotassium}
                      onChange={(val) => {
                        handlePotassiumChange(val);
                        markFieldTouched('soilPotassium');
                      }}
                      min={0}
                      max={400}
                      rightSection={<Text c="dimmed" size="xs">PPM</Text>}
                      className={classes.nutrientInput}
                      error={potassiumError || (touchedFields.soilPotassium && soilPotassium === '' && hasNutrientData ? 
                        "Potassium strengthens your plants' immune systems!" : null)}
                      withAsterisk={hasNutrientData}
                    />
                    <NumberInput
                      label="Soil pH"
                      placeholder="0-14"
                      value={soilPh}
                      onChange={(val) => {
                        handlePhChange(val);
                        markFieldTouched('soilPh');
                      }}
                      min={0}
                      max={14}
                      step={0.1}
                      rightSection={<Text c="dimmed" size="xs">pH</Text>}
                      className={classes.nutrientInput}
                      error={phError || (touchedFields.soilPh && soilPh === '' && hasNutrientData ? 
                        "pH determines what nutrients your plants can access!" : null)}
                      withAsterisk={hasNutrientData}
                    />
                  </SimpleGrid>
                  <Text size="xs" c="dimmed" mt="xs">
                    PPM = Parts Per Million, a common measure for soil nutrients
                  </Text>
                </Stack>
              )}
              
              {!hasNutrientData && soilType && (
                <Card withBorder mt="md" p="sm" radius="md" bg="rgba(92, 184, 92, 0.05)">
                  <Group>
                    <IconInfoCircle size={20} color={theme.colors.green[6]} />
                    <div>
                      <Text fw={500}>Using Estimated Values</Text>
                      <Text size="sm" c="dimmed">
                        We're using typical values for {soilType} soil. For more accurate recommendations, consider professional soil testing.
                      </Text>
                    </div>
                  </Group>
                  
                  <SimpleGrid cols={{ base: 2, xs: 4 }} mt="md">
                    <div>
                      <Text size="xs" c="dimmed">Nitrogen</Text>
                      <Text fw={600}>{soilTypeDefaults[soilType as SoilTypeKey].nitrogen} PPM</Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">Phosphorus</Text>
                      <Text fw={600}>{soilTypeDefaults[soilType as SoilTypeKey].phosphorus} PPM</Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">Potassium</Text>
                      <Text fw={600}>{soilTypeDefaults[soilType as SoilTypeKey].potassium} PPM</Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed">pH</Text>
                      <Text fw={600}>{soilTypeDefaults[soilType as SoilTypeKey].ph}</Text>
                    </div>
                  </SimpleGrid>
                </Card>
              )}
            </Box>
          </Stack>
        );
      case 2:
        return (
          <Stack>
            <Title order={3} className={classes.sectionTitle}>How Do You Farm?</Title>
            <Text className={classes.sectionDescription}>
              Tell us about your farming methods and infrastructure to help us provide targeted recommendations.
            </Text>
            
            <Box className={classes.fieldGroup}>
              <Text fw={500} mb="xs" className={classes.fieldLabel}>Irrigation Type <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span></Text>
              <Select
                data={[
                  { value: 'Drip', label: 'Drip Irrigation' },
                  { value: 'Sprinkler', label: 'Sprinkler System' },
                  { value: 'Flood', label: 'Flood Irrigation' },
                  { value: 'Furrow', label: 'Furrow Irrigation' },
                  { value: 'None', label: 'No Irrigation' }
                ]}
                placeholder="Select irrigation type"
                value={irrigationType}
                onChange={(value) => {
                  setIrrigationType(value || '');
                  markFieldTouched('irrigationType');
                }}
                size="md"
                leftSection={<IconWaterpolo size={18} />}
                error={touchedFields.irrigationType && !irrigationType ? "How will your crops get water? They're thirsty!" : null}
                withAsterisk
              />
            </Box>
            
            <Box className={classes.fieldGroup}>
              <Text fw={500} mb="xs" className={classes.fieldLabel}>Farming Method <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span></Text>
              <Select
                data={[
                  { value: 'Organic', label: 'Organic Farming' },
                  { value: 'Conventional', label: 'Conventional Farming' },
                  { value: 'Mixed', label: 'Mixed Methods' },
                  { value: 'Permaculture', label: 'Permaculture' },
                  { value: 'Hydroponic', label: 'Hydroponic' }
                ]}
                placeholder="Select farming method"
                value={farmingMethod}
                onChange={(value) => {
                  setFarmingMethod(value || '');
                  markFieldTouched('farmingMethod');
                }}
                size="md"
                leftSection={<IconPlant2 size={18} />}
                error={touchedFields.farmingMethod && !farmingMethod ? "What's your farming style? Your crops are curious!" : null}
                withAsterisk
              />
            </Box>
            
            <Divider my="md" label="Farm Infrastructure" labelPosition="center" />
            
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              <Card withBorder padding="md">
                <Group wrap="nowrap">
                  <ActionIcon 
                    variant="light" 
                    color="blue" 
                    size="lg" 
                    radius="xl"
                  >
                    <IconWaterpolo size={20} />
                  </ActionIcon>
                  <div>
                    <Text fw={500}>Water Access</Text>
                    <Switch 
                      checked={hasWaterAccess}
                      onChange={(e) => setHasWaterAccess(e.currentTarget.checked)}
                      size="md"
                      label={hasWaterAccess ? "Available" : "Unavailable"}
                      mt="xs"
                    />
                  </div>
                </Group>
              </Card>
              
              <Card withBorder padding="md">
                <Group wrap="nowrap">
                  <ActionIcon 
                    variant="light" 
                    color="orange" 
                    size="lg" 
                    radius="xl"
                  >
                    <IconTractor size={20} />
                  </ActionIcon>
                  <div>
                    <Text fw={500}>Road Access</Text>
                    <Switch 
                      checked={hasRoadAccess}
                      onChange={(e) => setHasRoadAccess(e.currentTarget.checked)}
                      size="md"
                      label={hasRoadAccess ? "Available" : "Unavailable"}
                      mt="xs"
                    />
                  </div>
                </Group>
              </Card>
              
              <Card withBorder padding="md">
                <Group wrap="nowrap">
                  <ActionIcon 
                    variant="light" 
                    color="yellow" 
                    size="lg" 
                    radius="xl"
                  >
                    <IconBulb size={20} />
                  </ActionIcon>
                  <div>
                    <Text fw={500}>Electricity</Text>
                    <Switch 
                      checked={hasElectricity}
                      onChange={(e) => setHasElectricity(e.currentTarget.checked)}
                      size="md"
                      label={hasElectricity ? "Available" : "Unavailable"}
                      mt="xs"
                    />
                  </div>
                </Group>
              </Card>
            </SimpleGrid>
          </Stack>
        );
      case 3:
        return (
          <Stack>
            <Title order={3} className={classes.sectionTitle}>Where Is Your Farm?</Title>
            <Text className={classes.sectionDescription}>
              Map your farm's boundaries to help us provide location-specific insights and calculate your farm's size.
            </Text>
            
            <Box className={classes.infoCard}>
              <Group gap="sm">
                <IconInfoCircle size={24} color={theme.colors.blue[6]} />
                <Text fw={500}>Map Your Farm</Text>
              </Group>
              <Text size="sm" mt="xs">
                There are two ways to define your farm boundary:
              </Text>
              <Stack gap="xs" mt="xs">
                <Group gap="xs">
                  <IconMapSearch size={16} color={theme.colors.green[6]} />
                  <Text size="sm"><b>Auto-detect:</b> Click "Detect Farm Boundary" to automatically identify farm boundaries visible on the map.</Text>
                </Group>
                <Group gap="xs">
                  <IconPencil size={16} color={theme.colors.green[6]} />
                  <Text size="sm"><b>Draw manually:</b> Use the drawing tools (polygon or rectangle) in the top-left corner of the map to outline your farm.</Text>
                </Group>
              </Stack>
            </Box>
            
            <Group justify="space-between" mb="md">
              <Button
                variant="filled"
                color="primary"
                leftSection={isDetecting ? <Loader size="xs" color="white" /> : <IconMapSearch size={16} />}
                onClick={() => {
                  markFieldTouched('farmBoundary');
                  notifications.show({
                    title: 'Starting Detection',
                    message: 'Preparing to detect farm boundaries...',
                    color: 'blue',
                    loading: true,
                    autoClose: 2000,
                  });
                  // Use setTimeout to allow the UI to update before the heavy processing begins
                  setTimeout(() => detectFarmBoundaries(), 500);
                }}
                loading={isDetecting}
                disabled={!isMapReady || isLocating}
                size="md"
                styles={{
                  root: {
                    backgroundColor: theme.colors.blue[7],
                    '&:hover': {
                      backgroundColor: theme.colors.blue[8],
                    }
                  }
                }}
              >
                {isDetecting ? 'Detecting...' : 'Detect Farm Boundary'}
              </Button>
              
              <Button
                variant="subtle"
                color="teal"
                leftSection={<IconMapPin size={16} />}
                onClick={handleGetLocation}
                loading={isLocating}
              >
                Use My Location
              </Button>
            </Group>
            
            {detectionError && (
              <Notification 
                icon={<IconX size={18} />} 
                color="red" 
                title="Detection Error" 
                withCloseButton 
                onClose={() => setDetectionError(null)}
                mb="md"
              >
                {detectionError}
              </Notification>
            )}
            
            <Box 
              className={classes.mapContainer} 
              ref={mapContainerRef} 
              style={{
                ...containerStyle,
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
                borderRadius: '8px'
              }}
            >
              {isLocating ? (
                <Center style={{ height: '100%', backgroundColor: theme.colors.gray[1] }}>
                  <Stack align="center">
                    <Loader size="md" />
                    <Text size="sm">Finding your location...</Text>
                  </Stack>
                </Center>
              ) : (
                <FarmMapEditor
                  center={mapCenter}
                  zoom={14}
                  boundary={farmBoundary}
                  setBoundary={(boundary: any) => {
                    setFarmBoundary(boundary);
                    markFieldTouched('farmBoundary');
                  }}
                  detectedBoundaries={detectedBoundaries}
                  onBoundarySelect={(selectedFeature) => {
                    handleBoundarySelect(selectedFeature);
                    markFieldTouched('farmBoundary');
                  }}
                  setMapInstance={(map) => {
                    handleSetMapInstance(map);
                    // Add click event listener to the map to mark boundary field as touched
                    if (map) {
                      map.on('click', () => markFieldTouched('farmBoundary'));
                    }
                  }}
                  editableBoundaryKey={editableBoundaryKey}
                />
              )}
            </Box>
            
            {farmBoundary && (
              <Card withBorder p="md" radius="md" mt="md" shadow="sm">
                <Group justify="space-between" mb={4}>
                  <Text fw={700} size="lg" color="blue.7">Farm Boundary Selected</Text>
                  <ActionIcon 
                    color="red" 
                    variant="subtle"
                    onClick={() => {
                      setFarmBoundary(null);
                      setEditableBoundaryKey(prev => prev + 1);
                    }}
                  >
                    <IconX size={18} />
                  </ActionIcon>
                </Group>
                <Divider mb="sm" />
                <Group>
                  <Text fw={500} size="sm">Farm Size:</Text>
                  {farmBoundary.properties?.area_hectares !== undefined ? (
                    <>
                      <Text 
                        span 
                        fw={700} 
                        c={farmBoundary.properties.area_hectares < 10 ? theme.colors.blue[6] : 
                          farmBoundary.properties.area_hectares < 50 ? theme.colors.indigo[6] : theme.colors.violet[6]}
                      >
                        {farmBoundary.properties.area_hectares < 10 ? 'Small' : 
                         farmBoundary.properties.area_hectares < 50 ? 'Medium' : 'Large'}
                      </Text>
                      <Text span>({farmBoundary.properties.area_hectares.toFixed(2)} hectares)</Text>
                    </>
                  ) : (
                    <Text>Unknown size</Text>
                  )}
                </Group>
              </Card>
            )}
            
            {detectedBoundaries.length > 1 && (
              <Paper 
                withBorder 
                p="md" 
                radius="md" 
                mt="md" 
                bg="rgba(51, 136, 255, 0.1)"
                style={{
                  borderLeft: `4px solid ${theme.colors.blue[6]}`,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                  animation: 'pulse 2s infinite'
                }}
              >
                <style jsx>{`
                  @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(51, 136, 255, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(51, 136, 255, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(51, 136, 255, 0); }
                  }
                `}</style>
                <Group align="center" gap="sm">
                  <IconInfoCircle size={24} color={theme.colors.blue[6]} />
                  <div>
                    <Text fw={600}>Multiple Farms Detected</Text>
                    <Text size="sm">
                      We found {detectedBoundaries.length} potential farm boundaries in this area. 
                      Please click on the blue-outlined area on the map that matches your farm.
                    </Text>
                  </div>
                </Group>
              </Paper>
            )}
            {!farmBoundary && touchedFields.farmBoundary && (
              <Paper 
                withBorder 
                p="md" 
                radius="md" 
                mt="md" 
                bg="rgba(255, 76, 76, 0.1)"
                style={{
                  borderLeft: `4px solid ${theme.colors.red[6]}`,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                }}
              >
                <Group align="center" gap="sm">
                  <IconAlertCircle size={24} color={theme.colors.red[6]} />
                  <Box>
                    <Text fw={600}>Farm Boundary Missing</Text>
                    <Text size="sm">
                      Please draw or select your farm boundary on the map. This helps us accurately calculate your farm size and provide location-specific recommendations.
                    </Text>
                  </Box>
                </Group>
              </Paper>
            )}
          </Stack>
        );
      case 4:
        return (
          <Stack>
            <Title order={3} className={classes.sectionTitle}>Almost Done!</Title>
            <Text className={classes.sectionDescription}>
              Additional details help us create a more complete profile of your farm. These fields are optional but helpful.
            </Text>
            
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <NumberInput
                label="Storage Capacity"
                description="In square meters"
                placeholder="Optional"
                value={storageCapacity}
                onChange={(val) => setStorageCapacity(val as number | '')}
                min={0}
                hideControls
              />
              
              <NumberInput
                label="Year Established"
                description="When your farm started operations"
                placeholder="Optional"
                value={yearEstablished}
                onChange={(val) => setYearEstablished(val as number | '')}
                min={1900}
                max={new Date().getFullYear()}
                hideControls
              />
            </SimpleGrid>
            
            <Box className={classes.infoCard} mt="lg">
              <Group gap="sm">
                <IconInfoCircle size={24} color={theme.colors.green[6]} />
                <Text fw={500}>What happens next?</Text>
              </Group>
              <Text size="sm" mt="xs">
                After completing the onboarding process, you'll gain access to your personalized dashboard with:
              </Text>
              <Stack gap="xs" mt="md">
                {[
                  'Personalized crop recommendations based on your soil type',
                  'Weather forecasts specific to your farm location',
                  'Farm management tools tailored to your farming methods',
                  'Access to AI-powered crop health monitoring',
                  'Customized reports and insights'
                ].map((item, index) => (
                  <Group key={index} gap="xs">
                    <IconChevronRight size={16} color={theme.colors.green[6]} />
                    <Text size="sm">{item}</Text>
                  </Group>
                ))}
              </Stack>
            </Box>
          </Stack>
        );
      case 5:
        return (
          <div className={classes.successStep}>
            <div className={classes.successIcon}>
              <IconCheck size={80} stroke={1.5} />
            </div>
            
            <Title order={2} mb="md">Ready to Start Your Farming Journey</Title>
            
            <Text size="lg" c="dimmed" mb="xl" maw={600} mx="auto">
              Your farm profile has been set up with all the information you've provided. 
              You're now ready to use FarmWise to optimize your farming operations.
            </Text>
            
            <Stack gap="lg" maw={600} mx="auto">
              <Card withBorder p="lg" radius="md" shadow="sm">
                <Group gap="md" mb="md">
                  <ActionIcon color="green" variant="light" size="xl" radius="xl">
                    <IconSeeding size={30} />
                  </ActionIcon>
                  <div>
                    <Text fw={700} size="xl">{farmName || 'Your Farm'}</Text>
                    <Text size="sm" c="dimmed">{farmAddress || 'Address not specified'}</Text>
                  </div>
                </Group>
                
                <Divider my="sm" label="Farm Overview" labelPosition="center" />
                <SimpleGrid cols={2} spacing="md" verticalSpacing="sm">
                  <div>
                    <Text size="xs" c="dimmed">Farm Size</Text>
                    <Text fw={500}>
                      {farmBoundary?.properties?.area_hectares 
                        ? `${farmBoundary.properties.area_hectares.toFixed(2)} hectares` 
                        : 'Not specified'}
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Farmer Experience</Text>
                    <Text fw={500}>{farmerExperience ? (farmerExperience.charAt(0).toUpperCase() + farmerExperience.slice(1)) : 'Not specified'}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Soil Type</Text>
                    <Text fw={500}>{soilType || 'Not specified'}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Farming Method</Text>
                    <Text fw={500}>{farmingMethod || 'Not specified'}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Irrigation</Text>
                    <Text fw={500}>{irrigationType || 'Not specified'}</Text>
                  </div>
                  {yearEstablished && (
                    <div>
                      <Text size="xs" c="dimmed">Year Established</Text>
                      <Text fw={500}>{yearEstablished}</Text>
                    </div>
                  )}
                </SimpleGrid>

                {(hasNutrientData && (soilNitrogen || soilPhosphorus || soilPotassium || soilPh)) && (
                  <>
                    <Divider my="md" label="Soil Nutrients" labelPosition="center" />
                    <SimpleGrid cols={2} spacing="md" verticalSpacing="sm">
                      {soilNitrogen !== '' && <div><Text size="xs" c="dimmed">Nitrogen (N)</Text><Text fw={500}>{soilNitrogen} PPM</Text></div>}
                      {soilPhosphorus !== '' && <div><Text size="xs" c="dimmed">Phosphorus (P)</Text><Text fw={500}>{soilPhosphorus} PPM</Text></div>}
                      {soilPotassium !== '' && <div><Text size="xs" c="dimmed">Potassium (K)</Text><Text fw={500}>{soilPotassium} PPM</Text></div>}
                      {soilPh !== '' && <div><Text size="xs" c="dimmed">Soil pH</Text><Text fw={500}>{soilPh}</Text></div>}
                    </SimpleGrid>
                  </>
                )}
                
                <Divider my="md" label="Infrastructure" labelPosition="center" />
                <SimpleGrid cols={2} spacing="md" verticalSpacing="sm">
                  <div>
                    <Text size="xs" c="dimmed">Water Access</Text>
                    <Text fw={500}>{hasWaterAccess ? 'Available' : 'Unavailable'}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Road Access</Text>
                    <Text fw={500}>{hasRoadAccess ? 'Available' : 'Unavailable'}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Electricity</Text>
                    <Text fw={500}>{hasElectricity ? 'Available' : 'Unavailable'}</Text>
                  </div>
                  {storageCapacity && (
                     // This div was the likely cause of the linter error if it wasn't properly JSX
                     // Ensuring it is a standard div for JSX rendering:
                    <div> 
                      <Text size="xs" c="dimmed">Storage Capacity</Text>
                      <Text fw={500}>{storageCapacity} sq. meters</Text>
                    </div>
                  )}
                </SimpleGrid>
              </Card>
              
              {submitError && (
                <Notification
                  color="red"
                  title="Submission Error"
                  withCloseButton={false}
                  icon={<IconX size={18} />}
                  mt="lg"
                >
                  {submitError}
                  <Text size="sm" mt="xs">
                    Please review your information or try submitting again.
                  </Text>
                </Notification>
              )}

              {/* Ensure the Complete Setup button is here to allow retry if submitError occurred */}
              <Button 
                onClick={async () => {
                  try {
                    // Clear any cached user data
                    localStorage.removeItem('user');
                    // Navigate to dashboard
                    window.location.href = '/dashboard'; 
                  } catch (error) {
                    console.error('Error completing onboarding (from success screen button):', error); // Added context to log
                    // Navigate anyway
                    localStorage.removeItem('user'); // Ensure user cache is cleared on error too before navigation
                    window.location.href = '/dashboard'; 
                  }
                }}
                color="green"
                rightSection={<IconCheck size={16} />}
                mt="lg"
                fullWidth
              >
                Go to Dashboard
              </Button>

            </Stack>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.bgDecoration}>
        {/* Background hills */}
        <div className={classes.hills}>
          <div className={classes.hill1}></div>
          <div className={classes.hill2}></div>
        </div>
        
        {/* Clouds */}
        <div className={`${classes.cloud} ${classes.cloud1}`}></div>
        <div className={`${classes.cloud} ${classes.cloud2}`}></div>
        <div className={`${classes.cloud} ${classes.cloud3}`}></div>
        <div className={`${classes.cloud} ${classes.cloud4}`}></div>
        <div className={`${classes.cloud} ${classes.cloud5}`}></div>
        
        {/* Rain effect (will show occasionally based on animation) */}
        <div className={classes.rain}>
          <div className={`${classes.raindrop} ${classes.raindrop1}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop2}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop3}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop4}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop5}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop6}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop7}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop8}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop9}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop10}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop11}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop12}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop13}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop14}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop15}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop16}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop17}`}></div>
          <div className={`${classes.raindrop} ${classes.raindrop18}`}></div>
        </div>
        
        {/* Farm buildings */}
        <div className={classes.barn}>
          <div className={classes.barnRoof}></div>
          <div className={classes.barnDoor}></div>
          <div className={classes.barnWindow}></div>
        </div>
        
        <div className={classes.silo}>
          <div className={classes.siloCap}></div>
        </div>
        
        {/* Fence */}
        <div className={classes.fence}>
          <div className={classes.fencePost}></div>
          <div className={classes.fencePost}></div>
          <div className={classes.fencePost}></div>
          <div className={classes.fencePost}></div>
          <div className={classes.fencePost}></div>
          <div className={classes.fenceRail} style={{top: '5px'}}></div>
          <div className={classes.fenceRail} style={{bottom: '5px'}}></div>
        </div>
        
        {/* Basic crops */}
        <div className={`${classes.crop} ${classes.crop1}`}></div>
        <div className={`${classes.crop} ${classes.crop2}`}></div>
        <div className={`${classes.crop} ${classes.crop3}`}></div>
        <div className={`${classes.crop} ${classes.crop4}`}></div>
        <div className={`${classes.crop} ${classes.crop5}`}></div>
        <div className={`${classes.crop} ${classes.crop6}`}></div>
        <div className={`${classes.crop} ${classes.crop7}`}></div>
        <div className={`${classes.crop} ${classes.crop8}`}></div>
        <div className={`${classes.crop} ${classes.crop9}`}></div>
        <div className={`${classes.crop} ${classes.crop10}`}></div>
        <div className={`${classes.crop} ${classes.crop11}`}></div>
        <div className={`${classes.crop} ${classes.crop12}`}></div>
        <div className={`${classes.crop} ${classes.crop13}`}></div>
        <div className={`${classes.crop} ${classes.crop14}`}></div>
        
        {/* Tall crops (corn) */}
        <div className={`${classes.tallCrop} ${classes.tallCrop1}`}>
          <div className={`${classes.leaf} ${classes.leaf1}`}></div>
          <div className={`${classes.leaf} ${classes.leaf2}`}></div>
          <div className={`${classes.leaf} ${classes.leaf3}`}></div>
        </div>
        <div className={`${classes.tallCrop} ${classes.tallCrop2}`}>
          <div className={`${classes.leaf} ${classes.leaf1}`}></div>
          <div className={`${classes.leaf} ${classes.leaf2}`}></div>
          <div className={`${classes.leaf} ${classes.leaf3}`}></div>
        </div>
        <div className={`${classes.tallCrop} ${classes.tallCrop3}`}>
          <div className={`${classes.leaf} ${classes.leaf1}`}></div>
          <div className={`${classes.leaf} ${classes.leaf2}`}></div>
          <div className={`${classes.leaf} ${classes.leaf3}`}></div>
        </div>
        <div className={`${classes.tallCrop} ${classes.tallCrop4}`}>
          <div className={`${classes.leaf} ${classes.leaf1}`}></div>
          <div className={`${classes.leaf} ${classes.leaf2}`}></div>
          <div className={`${classes.leaf} ${classes.leaf3}`}></div>
        </div>
        <div className={`${classes.tallCrop} ${classes.tallCrop5}`}>
          <div className={`${classes.leaf} ${classes.leaf1}`}></div>
          <div className={`${classes.leaf} ${classes.leaf2}`}></div>
          <div className={`${classes.leaf} ${classes.leaf3}`}></div>
        </div>
        
        {/* Tractor */}
        <div className={classes.tractor}>
          <div className={classes.wheel1}></div>
          <div className={classes.wheel2}></div>
        </div>
        
        {/* Birds */}
        <div className={classes.bird}>
          <div className={`${classes.wing} ${classes.wing1}`}></div>
          <div className={`${classes.wing} ${classes.wing2}`}></div>
        </div>
        
        <div className={classes.bird2}>
          <div className={`${classes.wing} ${classes.wing1}`}></div>
          <div className={`${classes.wing} ${classes.wing2}`}></div>
        </div>
        
        {/* Butterfly */}
        <div className={classes.butterfly}>
          <div className={`${classes.butterflyWing} ${classes.butterflyWing1}`}></div>
          <div className={`${classes.butterflyWing} ${classes.butterflyWing2}`}></div>
        </div>
      </div>
      
      <Title className={classes.title}>Welcome to FarmWise</Title>
      <Text className={classes.subtitle}>
        Let's get your farm set up! Complete this onboarding process to customize your experience.
      </Text>
      
      <Paper className={classes.paper} withBorder p={0}>
        {/* Horizontal Stepper Implementation */}
        <div className={classes.stepperContainer}>
          <div className={classes.stepLine}></div>
          <div 
            className={classes.progressLine} 
            style={{ width: `${Math.min(100, (active / 5) * 100)}%` }}
          ></div>
          <div className={classes.stepperWrapper}>
            {/* Step 1: Farm Details */}
            <div className={classes.stepItem} onClick={() => active >= 0 && setActive(0)} style={{ cursor: active >= 0 ? 'pointer' : 'default' }}>
              <div className={`${classes.stepCircle} ${active === 0 ? classes.stepCircleActive : active > 0 ? classes.stepCircleCompleted : ''}`}>
                <IconSeeding 
                  size={active === 0 ? 28 : 24} 
                  color="white" 
                  className={`${classes.stepIcon} ${active === 0 ? classes.stepIconActive : active > 0 ? classes.stepIconCompleted : ''}`}
                />
              </div>
              <div className={`${classes.stepTitle} ${active === 0 ? classes.stepTitleActive : active > 0 ? classes.stepTitleCompleted : ''}`}>
                Farm Details
              </div>
              <div className={`${classes.stepDescription} ${active === 0 ? classes.stepDescriptionActive : ''}`}>Basic information</div>
            </div>

            {/* Step 2: Soil Type */}
            <div className={classes.stepItem} onClick={() => active >= 1 && setActive(1)} style={{ cursor: active >= 1 ? 'pointer' : 'default' }}>
              <div className={`${classes.stepCircle} ${active === 1 ? classes.stepCircleActive : active > 1 ? classes.stepCircleCompleted : ''}`}>
                <IconTexture 
                  size={active === 1 ? 28 : 24} 
                  color="white" 
                  className={`${classes.stepIcon} ${active === 1 ? classes.stepIconActive : active > 1 ? classes.stepIconCompleted : ''}`}
                />
              </div>
              <div className={`${classes.stepTitle} ${active === 1 ? classes.stepTitleActive : active > 1 ? classes.stepTitleCompleted : ''}`}>
                Soil Type
              </div>
              <div className={`${classes.stepDescription} ${active === 1 ? classes.stepDescriptionActive : ''}`}>Soil characteristics</div>
            </div>

            {/* Step 3: Farm Practices */}
            <div className={classes.stepItem} onClick={() => active >= 2 && setActive(2)} style={{ cursor: active >= 2 ? 'pointer' : 'default' }}>
              <div className={`${classes.stepCircle} ${active === 2 ? classes.stepCircleActive : active > 2 ? classes.stepCircleCompleted : ''}`}>
                <IconSettings 
                  size={active === 2 ? 28 : 24} 
                  color="white" 
                  className={`${classes.stepIcon} ${active === 2 ? classes.stepIconActive : active > 2 ? classes.stepIconCompleted : ''}`}
                />
              </div>
              <div className={`${classes.stepTitle} ${active === 2 ? classes.stepTitleActive : active > 2 ? classes.stepTitleCompleted : ''}`}>
                Farm Practices
              </div>
              <div className={`${classes.stepDescription} ${active === 2 ? classes.stepDescriptionActive : ''}`}>Farming methods</div>
            </div>

            {/* Step 4: Location */}
            <div className={classes.stepItem} onClick={() => active >= 3 && setActive(3)} style={{ cursor: active >= 3 ? 'pointer' : 'default' }}>
              <div className={`${classes.stepCircle} ${active === 3 ? classes.stepCircleActive : active > 3 ? classes.stepCircleCompleted : ''}`}>
                <IconMapPin 
                  size={active === 3 ? 28 : 24} 
                  color="white" 
                  className={`${classes.stepIcon} ${active === 3 ? classes.stepIconActive : active > 3 ? classes.stepIconCompleted : ''}`}
                />
              </div>
              <div className={`${classes.stepTitle} ${active === 3 ? classes.stepTitleActive : active > 3 ? classes.stepTitleCompleted : ''}`}>
                Location
              </div>
              <div className={`${classes.stepDescription} ${active === 3 ? classes.stepDescriptionActive : ''}`}>Farm boundaries</div>
            </div>

            {/* Step 5: Additional Info */}
            <div className={classes.stepItem} onClick={() => active >= 4 && setActive(4)} style={{ cursor: active >= 4 ? 'pointer' : 'default' }}>
              <div className={`${classes.stepCircle} ${active === 4 ? classes.stepCircleActive : active > 4 ? classes.stepCircleCompleted : ''}`}>
                <IconInfoCircle 
                  size={active === 4 ? 28 : 24} 
                  color="white" 
                  className={`${classes.stepIcon} ${active === 4 ? classes.stepIconActive : active > 4 ? classes.stepIconCompleted : ''}`}
                />
              </div>
              <div className={`${classes.stepTitle} ${active === 4 ? classes.stepTitleActive : active > 4 ? classes.stepTitleCompleted : ''}`}>
                Additional Info
              </div>
              <div className={`${classes.stepDescription} ${active === 4 ? classes.stepDescriptionActive : ''}`}>Optional details</div>
            </div>

            {/* Step 6: Complete */}
            <div className={classes.stepItem} onClick={() => active >= 5 && setActive(5)} style={{ cursor: active >= 5 ? 'pointer' : 'default' }}>
              <div className={`${classes.stepCircle} ${active === 5 ? classes.stepCircleActive : ''}`}>
                <IconCheck 
                  size={active === 5 ? 28 : 24} 
                  color="white" 
                  className={`${classes.stepIcon} ${active === 5 ? classes.stepIconActive : ''}`}
                />
              </div>
              <div className={`${classes.stepTitle} ${active === 5 ? classes.stepTitleActive : ''}`}>
                Complete
              </div>
              <div className={`${classes.stepDescription} ${active === 5 ? classes.stepDescriptionActive : ''}`}>Finish setup</div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={stepVariant}
            // Conditionally add a class to remove bottom padding/border if step 5 has its own full-width button
            className={`${classes.stepperContent} ${active === 5 ? classes.stepperContentLastStep : ''}`}
          >
            {activeStepContent()}
          </motion.div>
        </AnimatePresence>
        
        {/* Only render this main navigation group if not on the final summary step (active !== 5) */}
        {active < 5 && (
          <Group className={classes.buttonGroup} justify="space-between">
            {active > 0 && ( // Back button visible on steps 1-4
              <Button 
                variant="light" 
                onClick={prevStep}
                leftSection={<IconArrowBack size={16} />}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
            
            {active < 4 ? (
              // "Continue" button for steps 0-3
              <Button 
                onClick={nextStep}
                rightSection={<IconArrowRight size={16} />}
                ml={"auto"}
                disabled={isSubmitting}
              >
                Continue
              </Button>
            ) : (
              // "Complete Setup" button for step 4 (active === 4 here due to outer condition)
              <Button 
                onClick={handleSubmit} // Changed from nextStep to handleSubmit
                rightSection={<IconCheck size={16} />} // Changed icon
                ml="auto"
                disabled={isSubmitting}
                loading={isSubmitting} // Added loading state
              >
                Complete Setup // Changed text from Next
              </Button>
            )}
          </Group>
        )}
      </Paper>
    </div>
  );
}