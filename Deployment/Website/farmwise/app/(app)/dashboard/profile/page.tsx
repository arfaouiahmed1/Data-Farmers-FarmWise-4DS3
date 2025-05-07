'use client';

import { useState, useEffect } from 'react';
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
import { IconUser, IconMail, IconBuildingWarehouse, IconPhone, IconSettings, IconPhoto, IconNote, IconRoad, IconBolt, IconDropletFilled, IconTexture, IconInfoCircle, IconAlertCircle } from '@tabler/icons-react';
import dynamic from 'next/dynamic'; 
import type { LatLngExpression } from 'leaflet';
import type { Feature } from 'geojson';
import authService from '../../../api/auth';

// Define the interface for farmer_data to fix TypeScript errors
interface FarmerData {
  id: number;
  farming_experience_years: number;
  specialization: string | null;
  certification: string | null;
  equipment_owned: string | null;
  preferred_crops: string | null;
  farms: {
    id: number;
    name: string;
    address: string | null;
    // Add other farm fields as needed
  }[];
}

// Extend the UserProfile interface to include farmer_data
interface ExtendedUserProfile extends UserProfile {
  farmer_data?: FarmerData;
}

// Extend the UserData interface to use the ExtendedUserProfile
interface ExtendedUserData extends Omit<UserData, 'profile'> {
  profile: ExtendedUserProfile;
}

// Placeholder boundary data (replace with actual fetched GeoJSON)
const placeholderFarmBoundary: Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-74.0060, 40.7128], // NYC approx
        [-74.0050, 40.7138],
        [-74.0040, 40.7128],
        [-74.0050, 40.7118],
        [-74.0060, 40.7128] 
      ]
    ]
  }
};

// Placeholder center and zoom
const placeholderCenter: LatLngExpression = [40.7128, -74.0050]; 
const placeholderZoom: number = 15;

// Dynamically import the Map Editor
const FarmMapEditor = dynamic(
  () => import('@/components/Onboarding/FarmMapEditor'),
  { ssr: false, 
    loading: () => <Text>Loading map...</Text>
  } 
);

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [farmBoundary] = useState(placeholderFarmBoundary); 
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          setUserData(user);
          // Initialize form with user data
          form.setValues({
            name: `${user.first_name || ''} ${user.last_name || ''}`,
            email: user.email || '',
            farmName: user.profile?.farmer_data?.farms?.[0]?.name || '',
            phone: user.profile?.phone_number || '',
            bio: user.profile?.bio || '',
            address: user.profile?.address || '',
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
      
      // Refresh user data in localStorage
      await authService.refreshUserData();
      const updatedUser = authService.getCurrentUser();
      setUserData(updatedUser);
      
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
                  </Stack>
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Box h={200} style={{ overflow: 'hidden', borderRadius: 'var(--mantine-radius-md)', backgroundColor: 'var(--mantine-color-gray-1)' }}>
                    {farmBoundary && (
                      <FarmMapEditor
                        boundary={farmBoundary}
                        center={placeholderCenter}
                        zoom={placeholderZoom}
                        readOnly={true}
                      />
                    )}
                  </Box>
                </Grid.Col>
              </Grid>
              
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
                    {userData?.waterAccess ? 'Available' : 'Not Available'}
                  </Text>
                </Card>
                
                <Card p="xs" withBorder radius="md" style={{ backgroundColor: 'rgba(97, 97, 97, 0.08)' }}>
                  <Group mb={6} justify="apart">
                    <Group gap={6}>
                      <IconRoad size={18} color={userData?.roadAccess ? '#616161' : 'gray'} />
                      <Text fw={500}>Road:</Text>
                    </Group>
                  </Group>
                  <Text fw={500} c={userData?.roadAccess ? 'gray.7' : 'gray.6'} size="md">
                    {userData?.roadAccess ? 'Available' : 'Not Available'}
                  </Text>
                </Card>
                
                <Card p="xs" withBorder radius="md" style={{ backgroundColor: 'rgba(255, 193, 7, 0.08)' }}>
                  <Group mb={6} justify="apart">
                    <Group gap={6}>
                      <IconBolt size={18} color={userData?.electricityAccess ? '#ffc107' : 'gray'} />
                      <Text fw={500}>Power:</Text>
                    </Group>
                  </Group>
                  <Text fw={500} c={userData?.electricityAccess ? 'yellow.5' : 'gray.6'} size="md">
                    {userData?.electricityAccess ? 'Available' : 'Not Available'}
                  </Text>
                </Card>
              </SimpleGrid>
              
              {/* Storage and Soil Type */}
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md">
                <Card p="xs" withBorder radius="md" style={{ backgroundColor: 'rgba(97, 97, 97, 0.05)' }}>
                  <Group gap={6} mb={6}>
                    <IconBuildingWarehouse size={18} />
                    <Text fw={500}>Storage:</Text>
                  </Group>
                  <Text size="md" fw={500}>
                    {userData?.storageCapacity != null ? `${userData.storageCapacity} sq units` : 'Not Specified'}
                  </Text>
                </Card>
                
                <Card p="xs" withBorder radius="md" style={{ backgroundColor: 'rgba(97, 97, 97, 0.05)' }}>
                  <Group gap={6} mb={6}>
                    <IconTexture size={18} />
                    <Text fw={500}>Soil Type:</Text>
                  </Group>
                  <Text size="md" fw={500} c={userData?.soilType ? 'dark' : 'gray.6'}>
                    {userData?.soilType || 'Not Specified'}
                  </Text>
                </Card>
              </SimpleGrid>
            </Paper>
            
            {/* Recent Activities */}
            <Divider my="sm" label="Recent Activities" labelPosition="center" />
            <Card withBorder p="xs" radius="md">
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Group gap="xs">
                    <Badge size="sm" color="green">Planting</Badge>
                    <Text size="sm" fw={500}>Corn Field 3</Text>
                  </Group>
                  <Text size="xs" c="dimmed">Yesterday</Text>
                </Group>
                <Group justify="space-between" align="center">
                  <Group gap="xs">
                    <Badge size="sm" color="blue">Irrigation</Badge>
                    <Text size="sm" fw={500}>North Fields</Text>
                  </Group>
                  <Text size="xs" c="dimmed">2 days ago</Text>
                </Group>
                <Group justify="space-between" align="center">
                  <Group gap="xs">
                    <Badge size="sm" color="orange">Equipment</Badge>
                    <Text size="sm" fw={500}>Tractor Maintenance</Text>
                  </Group>
                  <Text size="xs" c="dimmed">Last week</Text>
                </Group>
              </Stack>
            </Card>
            
            {/* Farm Equipment & Field Notes */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt={10}>
              {/* Equipment */}
              <Card withBorder p="xs" radius="md">
                <Group gap="xs" mb={5}>
                  <IconSettings size={16} />
                  <Text fw={600} size="sm">Farm Equipment</Text>
                </Group>
                <Stack gap={5}>
                  <Group justify="space-between">
                    <Text size="xs">Tractors</Text>
                    <Text size="xs" fw={500}>2</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs">Harvesters</Text>
                    <Text size="xs" fw={500}>1</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="xs">Irrigation Systems</Text>
                    <Text size="xs" fw={500}>3</Text>
                  </Group>
                </Stack>
              </Card>
              
              {/* Field Notes */}
              <Card withBorder p="xs" radius="md">
                <Group gap="xs" mb={5}>
                  <IconNote size={16} />
                  <Text fw={600} size="sm">Field Notes</Text>
                </Group>
                <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                  "Western field shows signs of nutrient deficiency. Consider soil test in the next week."
                </Text>
                <Text size="xs" mt={5} c="dimmed" ta="right">- Added 3 days ago</Text>
              </Card>
            </SimpleGrid>
          </Stack>
        ) : (
          // EDIT FORM
          <form onSubmit={form.onSubmit(handleProfileSubmit)}>
            <Stack>
              <Group wrap="nowrap" align="flex-start" gap="lg">
                <Box style={{ flexGrow: 1 }}>
                  <FileInput
                    label="Profile Picture"
                    placeholder="Click to upload image"
                    leftSection={<IconPhoto size={16} />}
                    accept="image/png,image/jpeg"
                    value={profileImageFile}
                    onChange={setProfileImageFile}
                    clearable
                  />
                  <Text size="xs" c="dimmed" mt={3}>Max file size: 5MB. Formats: JPG, PNG.</Text>
                </Box>
              </Group>
              
              <Divider my="sm" />
              
              <TextInput
                label="Full Name"
                placeholder="Your full name"
                leftSection={<IconUser size={16} />}
                required
                {...form.getInputProps('name')}
              />
              <TextInput
                label="Farm Name"
                placeholder="Your farm's name"
                leftSection={<IconBuildingWarehouse size={16} />}
                required
                {...form.getInputProps('farmName')}
              />
              <TextInput
                label="Email"
                placeholder="Your email address"
                leftSection={<IconMail size={16} />}
                required
                {...form.getInputProps('email')}
              />
              <TextInput
                label="Phone"
                placeholder="Your phone number"
                leftSection={<IconPhone size={16} />}
                {...form.getInputProps('phone')}
              />
              <Textarea
                label="Bio"
                placeholder="Tell us about yourself and your farm"
                minRows={3}
                {...form.getInputProps('bio')}
              />
              <Textarea
                label="Address"
                placeholder="Your farm's address"
                minRows={2}
                {...form.getInputProps('address')}
              />
              
              <Divider my="sm" label="Farm Utilities" labelPosition="center" />
              
              <Group grow>
                <Switch
                  label="Water Access Available"
                  {...form.getInputProps('waterAccess', { type: 'checkbox' })}
                />
                <Switch
                  label="Road Access Available"
                  {...form.getInputProps('roadAccess', { type: 'checkbox' })}
                />
                <Switch
                  label="Electricity Available"
                  {...form.getInputProps('electricityAccess', { type: 'checkbox' })}
                />
              </Group>
              <Group grow>
                <NumberInput
                  label="Storage Capacity (sq units)"
                  placeholder="e.g., 500"
                  leftSection={<IconBuildingWarehouse size={16} />}
                  min={0}
                  allowDecimal={false}
                  {...form.getInputProps('storageCapacity')}
                />
                <Select
                  label="Dominant Soil Type"
                  placeholder="Select soil type (Optional)"
                  leftSection={<IconTexture size={16} />}
                  data={[
                    { value: 'clay', label: 'Clay' },
                    { value: 'sandy_clay', label: 'Sandy Clay' },
                    { value: 'silty_clay', label: 'Silty Clay' },
                    { value: 'clay_loam', label: 'Clay Loam' },
                    { value: 'sandy_clay_loam', label: 'Sandy Clay Loam' },
                    { value: 'silty_clay_loam', label: 'Silty Clay Loam' },
                    { value: 'loam', label: 'Loam' },
                    { value: 'sandy_loam', label: 'Sandy Loam' },
                    { value: 'silt_loam', label: 'Silt Loam' },
                    { value: 'sand', label: 'Sand' },
                    { value: 'loamy_sand', label: 'Loamy Sand' },
                    { value: 'silt', label: 'Silt' },
                    { value: 'peat', label: 'Peat' },
                    { value: 'chalky', label: 'Chalky' },
                  ]}
                  clearable
                  searchable
                  {...form.getInputProps('soilType')}
                />
              </Group>
              
              <Divider my="lg" />
              
              <Group justify="flex-end" mt="md">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button type="submit">
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