'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Title, 
  Paper, 
  Group, 
  Avatar, 
  Text, 
  TextInput, 
  Button, 
  Stack, 
  Divider,
  Box,
  Grid,
  Card,
  SimpleGrid,
  FileInput,
  Textarea,
  Select,
  Switch,
  NumberInput,
  Badge,
  Tooltip,
  LoadingOverlay,
  Alert,
  Container,
  ThemeIcon,
  RingProgress,
  List,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconUser, IconMail, IconBuildingWarehouse, IconPhone, IconSettings, IconPhoto, IconNote, IconRoad, 
  IconBolt, IconDropletFilled, IconTexture, IconInfoCircle, IconAlertCircle, IconMapPin, IconGps, 
  IconCalendar, IconRulerMeasure, IconBuildingFortress, IconPencil, IconX, IconDeviceFloppy, IconError404,
  IconTextCaption, // For Farm Description
  IconTestPipe,   // For Soil Nutrients
  IconFlask2,     // Alternative for Soil pH
  IconLicense,    // For Certifications
  IconTractor,    // For Equipment Owned
  IconPlant2,     // For Preferred Crops
  IconTimeline,   // For Farming Experience
  IconTargetArrow // For Specialization
} from '@tabler/icons-react';
import dynamic from 'next/dynamic'; 
import type { LatLngExpression } from 'leaflet';
import type { Feature, Polygon, MultiPolygon } from 'geojson';
import authService, { UserData } from '../../../api/auth';

// Define interfaces to extend the base UserData type from auth.ts
interface FarmData {
  id: number;
  name: string;
  address: string | null;
  description: string | null;
  size_hectares: number | null;
  soil_nitrogen: number | null;
  soil_phosphorus: number | null;
  soil_potassium: number | null;
  soil_ph: number | null;
  boundary_geojson: any | null;
  soil_type: string | null;
  irrigation_type: string | null;
  farming_method: string | null;
  has_water_access: boolean;
  has_road_access: boolean;
  has_electricity: boolean;
  storage_capacity: number | null;
  year_established: number | null;
  created_at: string;
  updated_at: string;
}

interface FarmerData {
  id: number;
  farming_experience_years: number;
  specialization: string | null;
  certification: string | null;
  equipment_owned: string | null;
  preferred_crops: string | null;
  farms: FarmData[];
}

// Extend UserData with farmer_data property which may be present at runtime
interface ExtendedUserData extends UserData {
  profile: UserData['profile'] & {
    farmer_data?: FarmerData;
  };
}

// Add a type for UI-specific farm settings that aren't in the API
interface FarmUISettings {
  waterAccess: boolean;
  roadAccess: boolean;
  electricityAccess: boolean;
  storageCapacity: number;
  soilType: string;
}

// Dynamically import the Map Editor
const FarmMapEditor = dynamic(
  () => import('@/components/Onboarding/FarmMapEditor'),
  { ssr: false, 
    loading: () => <Group justify="center" mt="md"><Text c="dimmed">🗺️ Loading map editor...</Text></Group>
  } 
);

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<ExtendedUserData | null>(null);
  const [farmBoundary, setFarmBoundary] = useState<Feature<Polygon | MultiPolygon> | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([20, 0]);
  const [mapZoom, setMapZoom] = useState(5);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [farmUISettings, setFarmUISettings] = useState<FarmUISettings>({
    waterAccess: false,
    roadAccess: false,
    electricityAccess: false,
    storageCapacity: 0,
    soilType: ''
  });

  // Add a state variable to track when farm boundary changes
  const [boundaryChanged, setBoundaryChanged] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [missingInfoMessages, setMissingInfoMessages] = useState<string[]>([]);
  
  const calculateProfileCompletion = (currentValues: typeof form.values, currentFarmBoundary: Feature<Polygon | MultiPolygon> | null, currentUserData: ExtendedUserData | null) => {
    const fieldsToTrack = [
      // User Profile
      { key: 'name', label: 'Full Name', category: 'User Profile' },
      { key: 'phone', label: 'Phone Number', category: 'User Profile' },
      { key: 'bio', label: 'Short Bio', category: 'User Profile' },
      { key: 'profileImage', label: 'Profile Picture', category: 'User Profile', customCheck: () => !!(profileImageFile || currentUserData?.profile?.profile_image) },
      // Farm Info
      { key: 'farmName', label: 'Farm Name', category: 'Farm Information' },
      { key: 'farmAddress', label: 'Farm Address', category: 'Farm Information' },
      { key: 'farmDescription', label: 'Farm Description', category: 'Farm Information' },
      { key: 'sizeHectares', label: 'Farm Size', category: 'Farm Information' },
      { key: 'yearEstablished', label: 'Year Established', category: 'Farm Information' },
      { key: 'soilType', label: 'Soil Type', category: 'Farm Information' },
      { key: 'irrigationType', label: 'Irrigation Type', category: 'Farm Information' },
      { key: 'farmingMethod', label: 'Farming Method', category: 'Farm Information' },
      { key: 'farmBoundary', label: 'Farm Boundary', category: 'Farm Map', customCheck: () => !!currentFarmBoundary },
      // Soil Composition
      { key: 'soilNitrogen', label: 'Soil Nitrogen', category: 'Soil Composition' },
      { key: 'soilPhosphorus', label: 'Soil Phosphorus', category: 'Soil Composition' },
      { key: 'soilPotassium', label: 'Soil Potassium', category: 'Soil Composition' },
      { key: 'soilPh', label: 'Soil pH', category: 'Soil Composition' },
      // Farmer Specifics
      { key: 'farmingExperienceYears', label: 'Farming Experience', category: 'Farmer Specifics' },
      { key: 'specialization', label: 'Specialization', category: 'Farmer Specifics' },
      { key: 'certification', label: 'Certifications', category: 'Farmer Specifics' },
    ];

    let filledFields = 0;
    const newMissingMessages: string[] = [];

    fieldsToTrack.forEach(field => {
      let isFilled = false;
      if (field.customCheck) {
        isFilled = field.customCheck();
      } else {
        const value = currentValues[field.key as keyof typeof form.values];
        isFilled = value !== null && value !== undefined && String(value).trim() !== '';
      }

      if (isFilled) {
        filledFields++;
      } else {
        // Add to missing messages, maybe prioritize or limit how many are shown
        if (newMissingMessages.length < 3) { // Show up to 3 specific missing fields
          newMissingMessages.push(`${field.label} (in ${field.category})`);
        }
      }
    });

    const percentage = Math.round((filledFields / fieldsToTrack.length) * 100);
    setCompletionPercentage(percentage);

    if (percentage < 100 && newMissingMessages.length === 0 && filledFields > 0) {
      // If not 100% but specific messages are full, add a generic one
      newMissingMessages.push("Several optional details are missing. Consider completing them for a richer profile!")
    } else if (percentage < 100 && filledFields === 0){
      newMissingMessages.push("Your profile is currently empty. Please fill in your details.")
    } else if (percentage === 100){
      newMissingMessages.push("Profile complete! Well done. 🎉");
    }
    setMissingInfoMessages(newMissingMessages);
  };
  
  // Function to handle boundary changes from the map editor
  const handleBoundaryChange = useCallback((newBoundary: Feature<Polygon | MultiPolygon> | null) => {
    setFarmBoundary(newBoundary);
    setBoundaryChanged(true);
  }, []);

  // Fetch user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First try to get from localStorage
        let user = authService.getCurrentUser();
        
        // If we need fresh data or no cached data exists, fetch from API
        if (!user || !user.profile) {
          try {
            await authService.refreshUserData();
            user = authService.getCurrentUser();
          } catch (apiError) {
            console.error('API Error:', apiError);
            // Continue with whatever user data we have, don't throw
          }
        }
        
        if (user) {
          // Cast the user to our extended type that includes farmer_data
          const extendedUser = user as ExtendedUserData;
          setUserData(extendedUser);
          
          // Get farm boundary from user data if available
          const farm = extendedUser.profile?.farmer_data?.farms?.[0];
          if (farm && farm.boundary_geojson) {
            setFarmBoundary(farm.boundary_geojson);
            
            // Try to extract center coordinates from the boundary for the map
            try {
              if (farm.boundary_geojson.geometry?.coordinates?.[0]?.length > 0) {
                // For Polygon, coordinates are in format [longitude, latitude]
                // We need to calculate the center of all points
                const coords = farm.boundary_geojson.geometry.coordinates[0];
                const longitudes = coords.map((coord: number[]) => coord[0]);
                const latitudes = coords.map((coord: number[]) => coord[1]);
                
                const avgLat = latitudes.reduce((a: number, b: number) => a + b, 0) / latitudes.length;
                const avgLng = longitudes.reduce((a: number, b: number) => a + b, 0) / longitudes.length;
                
                setMapCenter([avgLat, avgLng]);
                setMapZoom(16);
              } else {
                // If no coordinates, set a generic default or keep previous if meaningful
                setMapCenter([20,0]); // A more global default
                setMapZoom(5);
              }
            } catch (err) {
              console.error('Error calculating map center:', err);
              setMapCenter([20,0]); // Fallback if error
              setMapZoom(5);
            }
          } else {
             // No boundary, set a wider view
            setMapCenter([20,0]);
            setMapZoom(5);
          }
          
          // Initialize form with user data
          form.setValues({
            name: `${extendedUser.first_name || ''} ${extendedUser.last_name || ''}`,
            email: extendedUser.email || '',
            farmName: farm?.name || '',
            phone: extendedUser.profile?.phone_number || '',
            bio: extendedUser.profile?.bio || '',
            farmAddress: farm?.address || extendedUser.profile?.address || '',
            farmDescription: farm?.description || '',
            sizeHectares: farm?.size_hectares !== null ? farm?.size_hectares : undefined,
            waterAccess: farm?.has_water_access || false,
            roadAccess: farm?.has_road_access || false,
            electricityAccess: farm?.has_electricity || false,
            storageCapacity: farm?.storage_capacity !== null ? farm?.storage_capacity : undefined,
            soilType: farm?.soil_type || '',
            irrigationType: farm?.irrigation_type || '',
            farmingMethod: farm?.farming_method || '',
            yearEstablished: farm?.year_established?.toString() || '',
            soilNitrogen: farm?.soil_nitrogen !== null ? farm?.soil_nitrogen : undefined,
            soilPhosphorus: farm?.soil_phosphorus !== null ? farm?.soil_phosphorus : undefined,
            soilPotassium: farm?.soil_potassium !== null ? farm?.soil_potassium : undefined,
            soilPh: farm?.soil_ph !== null ? farm?.soil_ph : undefined,
            farmingExperienceYears: extendedUser.profile?.farmer_data?.farming_experience_years !== null ? extendedUser.profile?.farmer_data?.farming_experience_years : undefined,
            specialization: extendedUser.profile?.farmer_data?.specialization || '',
            certification: extendedUser.profile?.farmer_data?.certification || '',
            equipmentOwned: extendedUser.profile?.farmer_data?.equipment_owned || '',
            preferredCrops: extendedUser.profile?.farmer_data?.preferred_crops || '',
          });
          // Calculate completion after form is set with user data
          calculateProfileCompletion(form.values, farm?.boundary_geojson || null, extendedUser);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your profile data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      farmName: '',
      phone: '',
      bio: '',
      farmAddress: '',
      farmDescription: '',
      sizeHectares: undefined as number | undefined,
      waterAccess: false,
      roadAccess: false,
      electricityAccess: false,
      storageCapacity: undefined as number | undefined,
      soilType: '',
      irrigationType: '',
      farmingMethod: '',
      yearEstablished: '',
      soilNitrogen: undefined as number | undefined,
      soilPhosphorus: undefined as number | undefined,
      soilPotassium: undefined as number | undefined,
      soilPh: undefined as number | undefined,
      farmingExperienceYears: undefined as number | undefined,
      specialization: '',
      certification: '',
      equipmentOwned: '',
      preferredCrops: '',
    },
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleProfileSubmit = async (values: typeof form.values) => {
    try {
      setIsLoading(true);
      
      // Split name into first and last name
      const nameParts = values.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      // Prepare data for API
      const profileData = {
        first_name: firstName,
        last_name: lastName,
        email: values.email,
        profile: {
          phone_number: values.phone,
          bio: values.bio,
          farmer_data: {
            farming_experience_years: values.farmingExperienceYears !== undefined && values.farmingExperienceYears !== null ? parseInt(String(values.farmingExperienceYears)) : null,
            specialization: values.specialization,
            certification: values.certification,
            equipment_owned: values.equipmentOwned,
            preferred_crops: values.preferredCrops,
            ...(userData?.profile?.farmer_data?.id && { id: userData.profile.farmer_data.id })
          }
        }
      };
      
      // Make API request to update profile
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/core/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profileData),
      });
      
      // Handle profile image if provided
      if (profileImageFile) {
        const formData = new FormData();
        formData.append('profile_image', profileImageFile);
        
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/core/profile/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Token ${localStorage.getItem('token')}`,
          },
          body: formData,
        });
      }
      
      // Update farm data if farm exists
      if (userData?.profile?.farmer_data?.farms?.[0]?.id) {
        const farmId = userData.profile.farmer_data.farms[0].id;
        const farmPatchData: any = {
          name: values.farmName,
          address: values.farmAddress,
          description: values.farmDescription,
          size_hectares: values.sizeHectares !== undefined && values.sizeHectares !== null ? parseFloat(String(values.sizeHectares)) : null,
          has_water_access: values.waterAccess,
          has_road_access: values.roadAccess,
          has_electricity: values.electricityAccess,
          storage_capacity: values.storageCapacity !== undefined && values.storageCapacity !== null ? parseFloat(String(values.storageCapacity)) : null,
          soil_type: values.soilType,
          irrigation_type: values.irrigationType,
          farming_method: values.farmingMethod,
          year_established: values.yearEstablished ? parseInt(values.yearEstablished) : null,
          soil_nitrogen: values.soilNitrogen !== undefined && values.soilNitrogen !== null ? parseFloat(String(values.soilNitrogen)) : null,
          soil_phosphorus: values.soilPhosphorus !== undefined && values.soilPhosphorus !== null ? parseFloat(String(values.soilPhosphorus)) : null,
          soil_potassium: values.soilPotassium !== undefined && values.soilPotassium !== null ? parseFloat(String(values.soilPotassium)) : null,
          soil_ph: values.soilPh !== undefined && values.soilPh !== null ? parseFloat(String(values.soilPh)) : null,
        };
        
        // Remove undefined properties to avoid sending them in PATCH
        Object.keys(farmPatchData).forEach(key => farmPatchData[key] === undefined && delete farmPatchData[key]);
        
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/core/farms/${farmId}/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(farmPatchData),
          });
        } catch (farmError) {
          console.error('Error updating farm data:', farmError);
          // Continue with profile update even if farm update fails
        }
      }
      
      // Save farm boundary if it changed
      if (boundaryChanged && userData?.profile?.farmer_data?.farms?.[0]?.id) {
        const farmId = userData.profile.farmer_data.farms[0].id;
        
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/core/farms/${farmId}/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              boundary_geojson: farmBoundary
            }),
          });
          
          // Reset the change flag
          setBoundaryChanged(false);
        } catch (boundaryError) {
          console.error('Error updating farm boundary:', boundaryError);
          // Continue with profile update even if boundary update fails
        }
      }
      
      // Refresh user data
      await authService.refreshUserData();
      const updatedUser = authService.getCurrentUser();
      if (updatedUser) {
        // Cast to our extended type
        const extendedUpdatedUser = updatedUser as ExtendedUserData;
        setUserData(extendedUpdatedUser);
        // Recalculate completion with potentially new form values and updated user data
        const currentFarm = extendedUpdatedUser.profile?.farmer_data?.farms?.[0];
        const boundary = currentFarm?.boundary_geojson || farmBoundary; // Use newly saved boundary if available
        calculateProfileCompletion(form.values, boundary, extendedUpdatedUser);
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Potentially reset form to original userData if changes were made but not saved
    if (userData) {
      const farm = userData.profile?.farmer_data?.farms?.[0];
      form.setValues({
        name: `${userData.first_name || ''} ${userData.last_name || ''}`,
        email: userData.email || '',
        farmName: farm?.name || '',
        phone: userData.profile?.phone_number || '',
        bio: userData.profile?.bio || '',
        farmAddress: farm?.address || userData.profile?.address || '',
        farmDescription: farm?.description || '',
        sizeHectares: farm?.size_hectares !== null ? farm?.size_hectares : undefined,
        waterAccess: farm?.has_water_access || false,
        roadAccess: farm?.has_road_access || false,
        electricityAccess: farm?.has_electricity || false,
        storageCapacity: farm?.storage_capacity !== null ? farm?.storage_capacity : undefined,
        soilType: farm?.soil_type || '',
        irrigationType: farm?.irrigation_type || '',
        farmingMethod: farm?.farming_method || '',
        yearEstablished: farm?.year_established?.toString() || '',
        soilNitrogen: farm?.soil_nitrogen !== null ? farm?.soil_nitrogen : undefined,
        soilPhosphorus: farm?.soil_phosphorus !== null ? farm?.soil_phosphorus : undefined,
        soilPotassium: farm?.soil_potassium !== null ? farm?.soil_potassium : undefined,
        soilPh: farm?.soil_ph !== null ? farm?.soil_ph : undefined,
        farmingExperienceYears: userData.profile?.farmer_data?.farming_experience_years !== null ? userData.profile?.farmer_data?.farming_experience_years : undefined,
        specialization: userData.profile?.farmer_data?.specialization || '',
        certification: userData.profile?.farmer_data?.certification || '',
        equipmentOwned: userData.profile?.farmer_data?.equipment_owned || '',
        preferredCrops: userData.profile?.farmer_data?.preferred_crops || '',
      });
      if (farm && farm.boundary_geojson) {
        setFarmBoundary(farm.boundary_geojson); // Reset boundary if it was changed in edit mode
      }
      setProfileImageFile(null); // Clear any staged profile image
      setBoundaryChanged(false); // Reset boundary changed flag
      calculateProfileCompletion(form.values, farm?.boundary_geojson || null, userData); // Recalculate on cancel
    }
  };

  const getUserInitials = () => {
    if (!userData) return '';
    
    const first = userData.first_name?.charAt(0) || '';
    const last = userData.last_name?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  return (
    <Container fluid p="lg">
      <LoadingOverlay visible={isLoading} overlayProps={{ radius: "sm", blur: 2 }} />
      
      <Group justify="space-between" mb="xl">
        <Title order={2}>🧑‍🌾 User Profile & Farm Dashboard</Title>
        {!isEditing && (
          <Button leftSection={<IconPencil size={16} />} onClick={handleEditClick} variant="light">
            Edit Profile
          </Button>
        )}
      </Group>

      {missingInfoMessages.length > 0 && (
        <Alert 
          icon={false}
          title={completionPercentage === 100 ? "Profile Status" : "Profile Incomplete"} 
          color={completionPercentage === 100 ? "teal" : "orange"} 
          withCloseButton 
          onClose={() => setMissingInfoMessages([])} 
          mb="lg"
          radius="md"
        >
          <Group wrap="nowrap">
            <Box style={{ flexGrow: 1 }}>
              {missingInfoMessages.length === 1 ? missingInfoMessages[0] :
                <List size="sm">
                  {missingInfoMessages.map((msg, index) => <List.Item key={index} icon={<IconInfoCircle size={16} />}>{msg}</List.Item>)}
                </List>
              }
                      </Box>
            <RingProgress
              size={100}
              thickness={10}
              roundCaps
              label={
                <Text c={completionPercentage > 80 ? "teal" : completionPercentage > 50 ? "yellow" : "red"} fw={700} ta="center" size="md">
                  {completionPercentage}%
                      </Text>
              }
              sections={[
                { value: completionPercentage, color: completionPercentage > 80 ? 'teal' : completionPercentage > 50 ? 'yellow' : 'red' },
              ]}
              rootColor="gray.2"
            />
          </Group>
        </Alert>
              )}
              
      {error && (
        <Alert 
          icon={<IconAlertCircle size="1.2rem" />} 
          title="Error" 
          color="red" 
          withCloseButton 
          onClose={() => setError(null)} 
          mb="lg"
          radius="md"
        >
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleProfileSubmit)}>
        <Grid gutter="xl">
          {/* User Profile Section */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
              <Group justify="center" mb="md">
                <Avatar
                  src={profileImageFile ? URL.createObjectURL(profileImageFile) : userData?.profile?.profile_image}
                  alt={userData?.first_name || 'User Avatar'}
                  size={120}
                  radius="50%"
                >
                  {getUserInitials()}
                </Avatar>
              </Group>
              {isEditing && (
                      <FileInput
                  label="Change Profile Picture"
                        placeholder="Upload new image"
                  leftSection={<IconPhoto size={16} />}
                        onChange={setProfileImageFile}
                  mb="md"
                  accept="image/png,image/jpeg"
                />
              )}
                      <TextInput
                        label="Full Name"
                placeholder="Your full name"
                        leftSection={<IconUser size={16} />}
                        {...form.getInputProps('name')}
                readOnly={!isEditing}
                mb="sm"
                      />
                      <TextInput
                label="Email Address"
                placeholder="your@email.com"
                        leftSection={<IconMail size={16} />}
                        {...form.getInputProps('email')}
                readOnly={!isEditing}
                mb="sm"
                      />
                      <TextInput
                        label="Phone Number"
                placeholder="Your phone number"
                        leftSection={<IconPhone size={16} />}
                        {...form.getInputProps('phone')}
                readOnly={!isEditing}
                mb="sm"
                      />
                      <Textarea
                label="Short Bio"
                placeholder="Tell us a bit about yourself"
                leftSection={<IconNote size={16} />}
                        {...form.getInputProps('bio')}
                readOnly={!isEditing}
                autosize
                minRows={2}
                mb="sm"
                      />
            </Card>
                  </Grid.Col>

          {/* Farm Details Section */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
              <Title order={3} mb="lg">🚜 Farm Information</Title>
              <SimpleGrid cols={1} spacing="md">
                    <TextInput
                      label="Farm Name"
                  placeholder="Name of your farm"
                      leftSection={<IconBuildingWarehouse size={16} />}
                      {...form.getInputProps('farmName')}
                  readOnly={!isEditing}
                />
                <TextInput
                  label="Farm Address"
                  placeholder="Full address of your farm"
                  leftSection={<IconMapPin size={16} />}
                  {...form.getInputProps('farmAddress')}
                  readOnly={!isEditing}
                />
                <Textarea
                  label="Farm Description"
                  placeholder="Brief description of your farm, its main activities, etc."
                  leftSection={<IconTextCaption size={16} />}
                  {...form.getInputProps('farmDescription')}
                  readOnly={!isEditing}
                  minRows={2}
                  autosize
                />
                <NumberInput
                  label="Farm Size (Hectares)"
                  placeholder="e.g., 15.5"
                  leftSection={<IconRulerMeasure size={16} />}
                  min={0}
                  decimalScale={2}
                  step={0.1}
                  {...form.getInputProps('sizeHectares')}
                  readOnly={!isEditing}
                />
                <NumberInput
                  label="Year Established"
                  placeholder="e.g., 2005"
                  leftSection={<IconCalendar size={16} />}
                  {...form.getInputProps('yearEstablished')}
                  readOnly={!isEditing}
                  min={1800}
                  max={new Date().getFullYear()}
                />
              </SimpleGrid>
                
              <Title order={4} mt="xl" mb="md">🌾 Farm Infrastructure & Access</Title>
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="md">
                {isEditing ? (
                    <Switch
                      label="Water Access"
                    checked={form.values.waterAccess}
                    onChange={(event) => form.setFieldValue('waterAccess', event.currentTarget.checked)}
                    thumbIcon={form.values.waterAccess ? <IconDropletFilled size={12} /> : <IconX size={12} />}
                    color="teal"
                  />
                ) : (
                  <Paper p="xs" withBorder radius="sm">
                    <Group>
                      <ThemeIcon variant="light" size="lg" color={userData?.profile?.farmer_data?.farms?.[0]?.has_water_access ? 'teal' : 'gray'}>
                        <IconDropletFilled size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" fw={500}>Water Access</Text>
                        <Badge color={userData?.profile?.farmer_data?.farms?.[0]?.has_water_access ? 'teal' : 'gray'}>
                          {userData?.profile?.farmer_data?.farms?.[0]?.has_water_access ? 'Available' : 'Not Available'}
                        </Badge>
                      </div>
                    </Group>
                  </Paper>
                )}
                {isEditing ? (
                    <Switch
                      label="Road Access"
                    checked={form.values.roadAccess}
                    onChange={(event) => form.setFieldValue('roadAccess', event.currentTarget.checked)}
                    thumbIcon={form.values.roadAccess ? <IconRoad size={12} /> : <IconX size={12} />}
                    color="blue"
                  />
                ) : (
                  <Paper p="xs" withBorder radius="sm">
                    <Group>
                      <ThemeIcon variant="light" size="lg" color={userData?.profile?.farmer_data?.farms?.[0]?.has_road_access ? 'blue' : 'gray'}>
                        <IconRoad size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" fw={500}>Road Access</Text>
                        <Badge color={userData?.profile?.farmer_data?.farms?.[0]?.has_road_access ? 'blue' : 'gray'}>
                          {userData?.profile?.farmer_data?.farms?.[0]?.has_road_access ? 'Available' : 'Not Available'}
                        </Badge>
                      </div>
                    </Group>
                  </Paper>
                )}
                {isEditing ? (
                    <Switch
                      label="Electricity Access"
                    checked={form.values.electricityAccess}
                    onChange={(event) => form.setFieldValue('electricityAccess', event.currentTarget.checked)}
                    thumbIcon={form.values.electricityAccess ? <IconBolt size={12} /> : <IconX size={12} />}
                    color="yellow"
                  />
                ) : (
                  <Paper p="xs" withBorder radius="sm">
                    <Group>
                      <ThemeIcon variant="light" size="lg" color={userData?.profile?.farmer_data?.farms?.[0]?.has_electricity ? 'yellow' : 'gray'}>
                        <IconBolt size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" fw={500}>Electricity</Text>
                        <Badge color={userData?.profile?.farmer_data?.farms?.[0]?.has_electricity ? 'yellow' : 'gray'}>
                          {userData?.profile?.farmer_data?.farms?.[0]?.has_electricity ? 'Available' : 'Not Available'}
                        </Badge>
                      </div>
                    </Group>
                  </Paper>
                )}
              </SimpleGrid>
            </Card>
                  </Grid.Col>
                  
          {/* New Farmer Details Section */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
              <Title order={3} mb="lg">👨‍🌾 Farmer Specifics</Title>
              <SimpleGrid cols={1} spacing="md">
                    <NumberInput
                  label="Farming Experience (Years)"
                  placeholder="e.g., 10"
                  leftSection={<IconTimeline size={16} />}
                      min={0}
                  {...form.getInputProps('farmingExperienceYears')}
                  readOnly={!isEditing}
                />
                <TextInput
                  label="Specialization"
                  placeholder="e.g., Dairy, Organic Vegetables"
                  leftSection={<IconTargetArrow size={16} />}
                  {...form.getInputProps('specialization')}
                  readOnly={!isEditing}
                />
                <TextInput
                  label="Certifications"
                  placeholder="e.g., Organic Certified, GlobalG.A.P."
                  leftSection={<IconLicense size={16} />}
                  {...form.getInputProps('certification')}
                  readOnly={!isEditing}
                />
                <Textarea
                  label="Equipment Owned"
                  placeholder="List key equipment, e.g., Tractor, Combine Harvester"
                  leftSection={<IconTractor size={16} />}
                  {...form.getInputProps('equipmentOwned')}
                  readOnly={!isEditing}
                  minRows={2}
                  autosize
                />
                <Textarea
                  label="Preferred Crops / Livestock"
                  placeholder="e.g., Corn, Soybeans, Cattle"
                  leftSection={<IconPlant2 size={16} />}
                  {...form.getInputProps('preferredCrops')}
                  readOnly={!isEditing}
                  minRows={2}
                  autosize
                />
              </SimpleGrid>
            </Card>
                  </Grid.Col>

          {/* Farm Map Section */}
          <Grid.Col span={12}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">🗺️ Farm Boundary Map</Title>
              <Text c="dimmed" size="sm" mb="md">
                {isEditing ? "Click on the map to define or update your farm's boundary. You can draw a polygon to mark your area." : "Current farm boundary is displayed below. Click 'Edit Profile' to update."}
              </Text>
              <Box style={{ height: '400px', width: '100%', borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden' }}>
                <FarmMapEditor
                  boundary={farmBoundary}
                  setBoundary={handleBoundaryChange}
                  center={mapCenter}
                  zoom={mapZoom}
                  readOnly={!isEditing}
                />
              </Box>
              {isEditing && boundaryChanged && (
                <Text c="blue" size="sm" mt="sm">
                  <IconInfoCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Farm boundary has been modified. Remember to save your changes.
                </Text>
              )}
            </Card>
                  </Grid.Col>
                </Grid>
              
        {isEditing && (
          <Group justify="flex-end" mt="xl" p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)', position: 'sticky', bottom: 0, background: 'var(--mantine-color-body)', zIndex: 10 }}>
            <Button variant="default" onClick={handleCancelEdit} leftSection={<IconX size={16}/>}>
                  Cancel
                </Button>
            <Button type="submit" loading={isLoading} leftSection={<IconDeviceFloppy size={16}/>}>
                  Save Changes
                </Button>
              </Group>
        )}
      </form>
    </Container>
  );
}