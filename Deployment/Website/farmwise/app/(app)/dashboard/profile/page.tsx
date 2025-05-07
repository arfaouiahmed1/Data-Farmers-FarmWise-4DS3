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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconMail, IconBuildingWarehouse, IconPhone, IconSettings, IconPhoto, IconNote, IconRoad, IconBolt, IconDropletFilled, IconTexture, IconInfoCircle, IconAlertCircle, IconMapPin, IconGps } from '@tabler/icons-react';
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
    loading: () => <Text>Loading map...</Text>
  } 
);

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<ExtendedUserData | null>(null);
  const [farmBoundary, setFarmBoundary] = useState<Feature<Polygon | MultiPolygon> | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([0, 0]);
  const [mapZoom, setMapZoom] = useState(15);
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
              }
            } catch (err) {
              console.error('Error calculating map center:', err);
              // Fall back to a default center if needed
            }
          }
          
          // Initialize form with user data
          form.setValues({
            name: `${extendedUser.first_name || ''} ${extendedUser.last_name || ''}`,
            email: extendedUser.email || '',
            farmName: extendedUser.profile?.farmer_data?.farms?.[0]?.name || '',
            phone: extendedUser.profile?.phone_number || '',
            bio: extendedUser.profile?.bio || '',
            address: extendedUser.profile?.address || '',
            waterAccess: false, // These would come from farm data
            roadAccess: false,
            electricityAccess: false,
            storageCapacity: 0,
            soilType: '',
          });
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
      address: '',
      waterAccess: false,
      roadAccess: false,
      electricityAccess: false,
      storageCapacity: 0,
      soilType: '',
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
          address: values.address,
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
        setUserData(updatedUser as ExtendedUserData);
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
    // Reset form to current user data
    if (userData) {
      form.setValues({
        name: `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        farmName: userData.profile?.farmer_data?.farms?.[0]?.name || '',
        phone: userData.profile?.phone_number || '',
        bio: userData.profile?.bio || '',
        address: userData.profile?.address || '',
        waterAccess: false,
        roadAccess: false,
        electricityAccess: false,
        storageCapacity: 0,
        soilType: '',
      });
    }
    setIsEditing(false);
  };

  const getUserInitials = () => {
    if (!userData) return '';
    
    const first = userData.first_name?.charAt(0) || '';
    const last = userData.last_name?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  return (
    <Stack gap="lg" pos="relative">
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
      
      {error && (
        <Alert color="red" title="Error" icon={<IconAlertCircle />}>
          {error}
        </Alert>
      )}
      
      <Group justify="space-between">
        <Title order={1}>Profile</Title>
        {!isEditing && (
          <Button 
            onClick={handleEditClick}
            leftSection={<IconSettings size={18}/>}
          >
            Edit Profile
          </Button>
        )}
      </Group>

      <Stack>
        {!isEditing ? (
          // VIEW MODE
          <Stack gap="xl">
            <Paper withBorder p="md" radius="md">
              <Stack>
                <Group wrap="nowrap" justify="space-between">
                  <Group>
                    <Avatar size="xl" color="blue" radius="xl">{getUserInitials()}</Avatar>
                    <div>
                      <Text size="xl" fw={500}>{userData?.first_name} {userData?.last_name}</Text>
                      <Group gap={5}>
                        <IconMail size={14} />
                        <Text size="sm" c="dimmed">{userData?.email}</Text>
                      </Group>
                      {userData?.profile?.phone_number && (
                        <Group gap={5}>
                          <IconPhone size={14} />
                          <Text size="sm" c="dimmed">{userData?.profile?.phone_number}</Text>
                        </Group>
                      )}
                    </div>
                  </Group>
                </Group>

                {userData?.profile?.bio && (
                  <>
                    <Divider my="xs" />
                    <Text size="sm">{userData.profile.bio}</Text>
                  </>
                )}
              </Stack>
            </Paper>

            {/* Farm Information */}
            <Paper withBorder p="md" radius="md">
              <Title order={3} mb="md">Farm Information</Title>
              
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Stack gap="md">
                    <Group wrap="nowrap" align="flex-start">
                      <IconBuildingWarehouse size={20} />
                      <div>
                        <Text fw={500}>Farm Name</Text>
                        <Text>{userData?.profile?.farmer_data?.farms?.[0]?.name || 'No farm registered'}</Text>
                      </div>
                    </Group>
                    
                    {userData?.profile?.address && (
                      <Group wrap="nowrap" align="flex-start">
                        <IconRoad size={20} />
                        <div>
                          <Text fw={500}>Address</Text>
                          <Text>{userData.profile.address}</Text>
                        </div>
                      </Group>
                    )}
                    
                    {userData?.profile?.farmer_data?.farms?.[0]?.size_hectares && (
                      <Group wrap="nowrap" align="flex-start">
                        <IconInfoCircle size={20} />
                        <div>
                          <Text fw={500}>Farm Size</Text>
                          <Text>{userData.profile.farmer_data.farms[0].size_hectares} hectares</Text>
                        </div>
                      </Group>
                    )}
                  </Stack>
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Box h={300} style={{ overflow: 'hidden', borderRadius: 'var(--mantine-radius-md)' }}>
                    {farmBoundary ? (
                      <FarmMapEditor
                        boundary={farmBoundary}
                        center={mapCenter}
                        zoom={mapZoom}
                        readOnly={true}
                        hideAttribution={false}
                      />
                    ) : (
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px', textAlign: 'center' }}>
                        <Text c="dimmed">No farm boundary data available</Text>
                      </Box>
                    )}
                  </Box>
                </Grid.Col>
              </Grid>
              
              {/* Soil Information */}
              {userData?.profile?.farmer_data?.farms?.[0] && (
                <>
                  <Title order={4} mt="xl" mb="md">Soil Information</Title>
                  <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                    <Card p="xs" withBorder radius="md" style={{ backgroundColor: 'rgba(97, 97, 97, 0.05)' }}>
                      <Text fw={500}>Nitrogen (N)</Text>
                      <Text size="lg">
                        {userData.profile.farmer_data.farms[0].soil_nitrogen ?
                          `${userData.profile.farmer_data.farms[0].soil_nitrogen} ppm` :
                          'Not recorded'}
                      </Text>
                    </Card>
                    
                    <Card p="xs" withBorder radius="md" style={{ backgroundColor: 'rgba(97, 97, 97, 0.05)' }}>
                      <Text fw={500}>Phosphorus (P)</Text>
                      <Text size="lg">
                        {userData.profile.farmer_data.farms[0].soil_phosphorus ?
                          `${userData.profile.farmer_data.farms[0].soil_phosphorus} ppm` :
                          'Not recorded'}
                      </Text>
                    </Card>
                    
                    <Card p="xs" withBorder radius="md" style={{ backgroundColor: 'rgba(97, 97, 97, 0.05)' }}>
                      <Text fw={500}>Potassium (K)</Text>
                      <Text size="lg">
                        {userData.profile.farmer_data.farms[0].soil_potassium ?
                          `${userData.profile.farmer_data.farms[0].soil_potassium} ppm` :
                          'Not recorded'}
                      </Text>
                    </Card>
                    
                    <Card p="xs" withBorder radius="md" style={{ backgroundColor: 'rgba(97, 97, 97, 0.05)' }}>
                      <Text fw={500}>pH Level</Text>
                      <Text size="lg">
                        {userData.profile.farmer_data.farms[0].soil_ph ?
                          userData.profile.farmer_data.farms[0].soil_ph :
                          'Not recorded'}
                      </Text>
                    </Card>
                  </SimpleGrid>
                </>
              )}
              
              {/* Farm utilities */}
              <SimpleGrid cols={{ base: 3, sm: 3 }} spacing="md" mt="lg">
                <Card p="xs" withBorder radius="md" style={{ backgroundColor: 'rgba(0, 150, 255, 0.08)' }}>
                  <Group mb={6} justify="apart">
                    <Group gap={6}>
                      <IconDropletFilled size={18} color="#0096ff" />
                      <Text fw={500}>Water:</Text>
                    </Group>
                  </Group>
                  <Text fw={500} c="blue.5" size="md">
                    {farmUISettings.waterAccess ? 'Available' : 'Not Available'}
                  </Text>
                </Card>
                
                <Card p="xs" withBorder radius="md" style={{ backgroundColor: 'rgba(97, 97, 97, 0.08)' }}>
                  <Group mb={6} justify="apart">
                    <Group gap={6}>
                      <IconRoad size={18} color={farmUISettings.roadAccess ? '#616161' : 'gray'} />
                      <Text fw={500}>Road:</Text>
                    </Group>
                  </Group>
                  <Text fw={500} c={farmUISettings.roadAccess ? 'gray.7' : 'gray.6'} size="md">
                    {farmUISettings.roadAccess ? 'Available' : 'Not Available'}
                  </Text>
                </Card>
                
                <Card p="xs" withBorder radius="md" style={{ backgroundColor: 'rgba(255, 193, 7, 0.08)' }}>
                  <Group mb={6} justify="apart">
                    <Group gap={6}>
                      <IconBolt size={18} color={farmUISettings.electricityAccess ? '#ffc107' : 'gray'} />
                      <Text fw={500}>Power:</Text>
                    </Group>
                  </Group>
                  <Text fw={500} c={farmUISettings.electricityAccess ? 'yellow.5' : 'gray.6'} size="md">
                    {farmUISettings.electricityAccess ? 'Available' : 'Not Available'}
                  </Text>
                </Card>
              </SimpleGrid>
            </Paper>
          </Stack>
        ) : (
          // EDIT MODE
          <form onSubmit={form.onSubmit(handleProfileSubmit)}>
            <Stack>
              <Paper withBorder p="md" radius="md">
                <Title order={3} mb="md">Personal Information</Title>
                
                <Grid>
                  <Grid.Col span={{ base: 12, md: 3 }}>
                    <Stack align="center" gap="sm">
                      <Avatar size={120} color="blue" radius={120}>{getUserInitials()}</Avatar>
                      <FileInput
                        label="Profile Image"
                        placeholder="Upload new image"
                        accept="image/png,image/jpeg"
                        value={profileImageFile}
                        onChange={setProfileImageFile}
                        style={{ maxWidth: 200 }}
                        clearable
                      />
                    </Stack>
                  </Grid.Col>
                  
                  <Grid.Col span={{ base: 12, md: 9 }}>
                    <Stack>
                      <TextInput
                        label="Full Name"
                        placeholder="Your name"
                        leftSection={<IconUser size={16} />}
                        {...form.getInputProps('name')}
                      />
                      
                      <TextInput
                        label="Email"
                        placeholder="your.email@example.com"
                        leftSection={<IconMail size={16} />}
                        {...form.getInputProps('email')}
                      />
                      
                      <TextInput
                        label="Phone Number"
                        placeholder="+1 (555) 123-4567"
                        leftSection={<IconPhone size={16} />}
                        {...form.getInputProps('phone')}
                      />
                      
                      <Textarea
                        label="Bio"
                        placeholder="Tell us about yourself"
                        minRows={3}
                        {...form.getInputProps('bio')}
                      />
                      
                      <TextInput
                        label="Address"
                        placeholder="Your address"
                        leftSection={<IconRoad size={16} />}
                        {...form.getInputProps('address')}
                      />
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Paper>
              
              <Paper withBorder p="md" radius="md">
                <Title order={3} mb="md">Farm Details</Title>
                
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Farm Name"
                      placeholder="Farm name"
                      leftSection={<IconBuildingWarehouse size={16} />}
                      {...form.getInputProps('farmName')}
                    />
                  </Grid.Col>
                </Grid>
                
                {/* Add farm boundary editing map */}
                <Title order={4} mt="lg" mb="sm">Farm Boundary</Title>
                <Box h={400} style={{ position: 'relative', borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
                  {farmBoundary ? (
                    <FarmMapEditor
                      boundary={farmBoundary}
                      setBoundary={handleBoundaryChange}
                      center={mapCenter}
                      zoom={mapZoom}
                      readOnly={false}
                      allowToggleEdit={true}
                      hideAttribution={false}
                      editableBoundaryKey={Date.now()} // Force remount when editing
                    />
                  ) : (
                    <Box style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      height: '100%', 
                      padding: '20px', 
                      textAlign: 'center',
                      backgroundColor: 'var(--mantine-color-gray-1)'
                    }}>
                      <IconMapPin size={48} color="var(--mantine-color-gray-5)" />
                      <Text size="lg" mt="md" c="dimmed">No farm boundary set</Text>
                      <Text size="sm" mt="xs" c="dimmed">Click to draw your farm boundary</Text>
                      <Button 
                        leftSection={<IconGps size={16} />} 
                        mt="md"
                        variant="light"
                        onClick={() => {
                          // Create an empty boundary to activate the editor
                          handleBoundaryChange({
                            type: "Feature",
                            properties: {},
                            geometry: {
                              type: "Polygon",
                              coordinates: [[
                                [mapCenter[1] - 0.01, mapCenter[0] - 0.01],
                                [mapCenter[1] + 0.01, mapCenter[0] - 0.01],
                                [mapCenter[1] + 0.01, mapCenter[0] + 0.01],
                                [mapCenter[1] - 0.01, mapCenter[0] + 0.01],
                                [mapCenter[1] - 0.01, mapCenter[0] - 0.01]
                              ]]
                            }
                          })
                        }}
                      >
                        Create Farm Boundary
                      </Button>
                    </Box>
                  )}
                </Box>
                
                <Title order={4} mt="lg" mb="sm">Infrastructure</Title>
                
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Switch
                      label="Water Access"
                      {...form.getInputProps('waterAccess', { type: 'checkbox' })}
                    />
                  </Grid.Col>
                  
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Switch
                      label="Road Access"
                      {...form.getInputProps('roadAccess', { type: 'checkbox' })}
                    />
                  </Grid.Col>
                  
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Switch
                      label="Electricity Access"
                      {...form.getInputProps('electricityAccess', { type: 'checkbox' })}
                    />
                  </Grid.Col>
                  
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <NumberInput
                      label="Storage Capacity (sq units)"
                      placeholder="0"
                      min={0}
                      {...form.getInputProps('storageCapacity')}
                    />
                  </Grid.Col>
                  
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      label="Soil Type"
                      placeholder="Select soil type"
                      data={[
                        { value: 'Clay', label: 'Clay' },
                        { value: 'Sandy', label: 'Sandy' },
                        { value: 'Loamy', label: 'Loamy' },
                        { value: 'Silty', label: 'Silty' },
                        { value: 'Peaty', label: 'Peaty' },
                        { value: 'Chalky', label: 'Chalky' },
                      ]}
                      {...form.getInputProps('soilType')}
                    />
                  </Grid.Col>
                </Grid>
              </Paper>
              
              <Group justify="flex-end" mt="xl">
                <Button variant="default" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button type="submit" color="blue">
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Stack>
    </Stack>
  );
}