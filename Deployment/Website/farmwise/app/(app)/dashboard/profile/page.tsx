'use client';

import { useState } from 'react';
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
  Box, // Import Box for map container styling
  Grid, // Import Grid
  Card,  // Import Card
  SimpleGrid, // For potential future use or simpler sections
  FileInput, // Import FileInput
  Textarea, // Import Textarea
  Select,    // Import Select
  Switch,    // Import Switch
  NumberInput, // Import NumberInput
  Badge,     // Import Badge
  Tooltip,   // Import Tooltip
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconMail, IconBuildingWarehouse, IconPhone, IconSettings, IconPhoto, IconNote, IconRoad, IconBolt, IconDropletFilled, IconTexture, IconInfoCircle } from '@tabler/icons-react';
// Dynamically import the map component to avoid SSR issues with Leaflet
import dynamic from 'next/dynamic'; 
import type { LatLngExpression } from 'leaflet';
import type { Feature } from 'geojson'; // Import GeoJSON Feature type

// Placeholder boundary data (replace with actual fetched GeoJSON)
// Example Polygon Coordinates (around a fictional area)
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

// Placeholder center and zoom (replace with calculation based on boundary or user setting)
const placeholderCenter: LatLngExpression = [40.7128, -74.0050]; // Centered near the polygon
const placeholderZoom: number = 15;

// --- Dynamically import the Map Editor ---
// This prevents Leaflet from trying to run on the server where 'window' is not defined.
const FarmMapEditor = dynamic(
  () => import('@/components/Onboarding/FarmMapEditor'),
  { ssr: false, // Disable server-side rendering for this component
    loading: () => <Text>Loading map...</Text> // Optional loading indicator
  } 
);

// Mock user data - replace with actual data fetching
const initialUserData = {
  name: 'John Doe',
  email: 'john.doe@farmwise.com',
  role: 'Farm Manager',
  farmName: 'Green Acres Farm',
  avatarInitial: 'JD',
  phone: '123-456-7890', // Added phone number
  bio: 'Experienced farm manager focused on sustainable agriculture.', // Added Bio
  waterAccess: true,
  roadAccess: true,
  electricityAccess: false,
  storageCapacity: 500, // Example: square meters or units
  soilType: '', // Example: Empty soil type for placeholder test
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(initialUserData);
  // Add state for boundary - eventually fetched
  const [farmBoundary] = useState(placeholderFarmBoundary); 
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const form = useForm({
    initialValues: {
      name: userData.name,
      farmName: userData.farmName,
      phone: userData.phone, 
      bio: userData.bio,
      waterAccess: userData.waterAccess,
      roadAccess: userData.roadAccess,
      electricityAccess: userData.electricityAccess,
      storageCapacity: userData.storageCapacity,
      soilType: userData.soilType,
    },

    validate: {
      name: (value) => (value.trim().length < 2 ? 'Name must have at least 2 letters' : null),
      farmName: (value) => (value.trim().length < 3 ? 'Farm name must have at least 3 letters' : null),
      phone: (value) => (/^\+?[\d\s\-()]*$/.test(value ?? '') ? null : 'Invalid phone number'), 
      bio: (value) => (value && value.length > 200 ? 'Bio should not exceed 200 characters' : null),
      storageCapacity: (value) => (value != null && value < 0 ? 'Capacity cannot be negative' : null),
    },
  });

  const handleEditToggle = () => {
    if (isEditing) {
      form.reset();
      setProfileImageFile(null); // Clear selected file on cancel
    }
    setIsEditing(!isEditing);
  };

  const handleProfileSubmit = (values: typeof form.values) => {
    console.log('Updating profile:', values);
    console.log('Selected profile image:', profileImageFile);
    // --- TODO: Add API call logic here --- 
    // 1. Upload profileImageFile if it exists
    // 2. Update user profile data with `values` and the new image URL (if uploaded)
    // --- End TODO ---
    
    // Update local state (assuming success for now)
    setUserData((prev) => ({ ...prev, ...values })); 
    // If image upload was successful, you might update avatarInitial or add an avatarUrl field
    
    setIsEditing(false);
    setProfileImageFile(null); // Clear file state after submission
    // Add success notification
  };

  // Dummy function for setBoundary - map is view-only here
  const handleBoundaryChange = () => {
    console.log("Profile Map: Boundary change attempt ignored (view-only).");
  };

  return (
    <Stack gap="lg">
      <Title order={2}>My Profile</Title>

      <Grid gutter="lg">
        {/* Profile Details Column - now spans full width */}
        <Grid.Col span={12}> 
          <Card withBorder shadow="sm" p="lg" radius="md" style={{ height: '100%' }}>
            <Group justify="space-between" mb="md">
              <Title order={4}>Profile Information</Title>
              {!isEditing && (
                <Button variant="outline" size="xs" onClick={handleEditToggle}>Edit Profile</Button>
              )}
            </Group>
            
            <Group wrap="nowrap" align="flex-start" gap="lg">
              <Avatar color="green" radius="xl" size="xl">{userData.avatarInitial}</Avatar>
              <Box style={{ flexGrow: 1 }}> {/* Use Box for flex grow */} 
                {!isEditing ? (
                  <Stack gap="md">
                    {/* Basic User Info */}
                    <Stack gap={4}>
                      <Title order={3}>{userData.name}</Title>
                      <Text c="dimmed">{userData.role}</Text>
                    </Stack>

                    <Divider my="sm" />

                    {/* Farm Map Display */}
                    <Title order={5} mb={5}>Farm Location & Boundary</Title>
                    <Box style={{ height: '250px', width: '100%', position: 'relative', zIndex: 1, borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden' }}> 
                      {farmBoundary ? (
                        <FarmMapEditor
                          center={placeholderCenter}
                          zoom={placeholderZoom}
                          boundary={farmBoundary}
                          setBoundary={handleBoundaryChange} // Keep dummy handler for now
                          hideAttribution={true}
                          setMapInstance={(mapInstance) => {
                            // Prevent map controls from going over navbar
                            if (mapInstance) {
                              const mapContainer = mapInstance.getContainer();
                              if (mapContainer) {
                                mapContainer.style.zIndex = '10'; 
                              }
                            }
                          }}
                        />
                      ) : (
                        <Paper withBorder p="md" radius="md" style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <Text c="dimmed">No farm boundary data available.</Text>
                        </Paper>
                      )}
                    </Box>

                    <Divider my="sm" />
                    
                    {/* Contact & Farm Details */}
                    <Stack gap="sm">
                      <Title order={5} mb={-5}>Contact & Farm</Title>
                      <Group gap="xs">
                        <IconMail size={16} />
                        <Text size="sm">{userData.email}</Text>
                      </Group>
                      <Group gap="xs">
                        <IconPhone size={16} />
                        <Text size="sm">{userData.phone || 'Not provided'}</Text>
                      </Group>
                      <Group gap="xs">
                        <IconBuildingWarehouse size={16} />
                        <Text size="sm">{userData.farmName}</Text>
                      </Group>
                      <Group gap="xs" align="flex-start">
                        <Tooltip label="Bio/Description">
                          <IconNote size={16} style={{ marginTop: 4 }} />
                        </Tooltip>
                        <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{userData.bio || 'No bio provided.'}</Text>
                      </Group>
                    </Stack>

                    <Divider my="sm" />

                    {/* Farm Infrastructure */}
                    <Stack gap="sm">
                      <Title order={5} mb={0}>Farm Infrastructure</Title>
                      
                      <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'rgba(33, 33, 33, 0.03)' }}>
                        <Title order={6} mb="sm">Resources & Access</Title>
                        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                          {/* Infrastructure cards ... */}
                          <Card p="xs" withBorder radius="md" style={{ backgroundColor: 'rgba(33, 150, 243, 0.08)' }}>
                            <Group mb={6} justify="apart">
                              <Group gap={6}>
                                <IconDropletFilled size={18} color={userData.waterAccess ? '#2196f3' : 'gray'} />
                                <Text fw={500}>Water:</Text>
                              </Group>
                            </Group>
                            <Text fw={500} c={userData.waterAccess ? 'blue.5' : 'gray.6'} size="md">
                              {userData.waterAccess ? 'Available' : 'Not Available'}
                            </Text>
                          </Card>
                          
                          <Card p="xs" withBorder radius="md" style={{ backgroundColor: 'rgba(97, 97, 97, 0.08)' }}>
                            <Group mb={6} justify="apart">
                              <Group gap={6}>
                                <IconRoad size={18} color={userData.roadAccess ? '#616161' : 'gray'} />
                                <Text fw={500}>Road:</Text>
                              </Group>
                            </Group>
                            <Text fw={500} c={userData.roadAccess ? 'gray.7' : 'gray.6'} size="md">
                              {userData.roadAccess ? 'Available' : 'Not Available'}
                            </Text>
                          </Card>
                          
                          <Card p="xs" withBorder radius="md" style={{ backgroundColor: 'rgba(255, 193, 7, 0.08)' }}>
                            <Group mb={6} justify="apart">
                              <Group gap={6}>
                                <IconBolt size={18} color={userData.electricityAccess ? '#ffc107' : 'gray'} />
                                <Text fw={500}>Power:</Text>
                              </Group>
                            </Group>
                            <Text fw={500} c={userData.electricityAccess ? 'yellow.5' : 'gray.6'} size="md">
                              {userData.electricityAccess ? 'Available' : 'Not Available'}
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
                              {userData.storageCapacity != null ? `${userData.storageCapacity} sq units` : 'Not Specified'}
                            </Text>
                          </Card>
                          
                          <Card p="xs" withBorder radius="md" style={{ backgroundColor: 'rgba(97, 97, 97, 0.05)' }}>
                            <Group gap={6} mb={6}>
                              <IconTexture size={18} />
                              <Text fw={500}>Soil Type:</Text>
                            </Group>
                            <Text size="md" fw={500} c={userData.soilType ? 'dark' : 'gray.6'}>
                              {userData.soilType || 'Not Specified'}
                            </Text>
                          </Card>
                        </SimpleGrid>
                      </Paper>
                      
                      {/* Recent Activities */}
                      <Divider my="sm" label="Recent Activities" labelPosition="center" />
                      <Card withBorder p="xs" radius="md">
                         {/* Activity items ... */}
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
                           {/* Equipment items ... */}
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
                           {/* Note content ... */}
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
                  </Stack>
                ) : (
                  // --- EDIT FORM ---
                  <form onSubmit={form.onSubmit(handleProfileSubmit)}>
                    <Stack>
                       {/* Form fields remain the same */}
                      <Group wrap="nowrap" align="flex-start" gap="lg">
                        <Box style={{ flexGrow: 1 }}> 
                          <FileInput
                            label="Profile Picture"
                            placeholder="Click to upload image"
                            leftSection={<IconPhoto size={16} />}
                            accept="image/png,image/jpeg" // Specify accepted types
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
                        label="Phone Number"
                        placeholder="Your contact number"
                        leftSection={<IconPhone size={16} />}
                        {...form.getInputProps('phone')}
                      />
                      <Textarea
                        label="Bio / Description"
                        placeholder="Tell us a bit about yourself or your farm (max 200 chars)"
                        leftSection={<IconNote size={16} />}
                        autosize
                        minRows={2}
                        maxRows={4}
                        {...form.getInputProps('bio')}
                      />

                      {/* Map remains view-only in edit mode for now */}
                       <Divider my="sm" />
                       <Title order={5} mb={5}>Farm Location</Title>
                       <Box style={{ height: '200px', width: '100%', position: 'relative', zIndex: 1, borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden' }}> 
                         {farmBoundary ? (
                           <FarmMapEditor
                             center={placeholderCenter}
                             zoom={placeholderZoom}
                             boundary={farmBoundary}
                             setBoundary={handleBoundaryChange}
                             hideAttribution={true}
                             setMapInstance={(mapInstance) => {
                                if (mapInstance) {
                                   const mapContainer = mapInstance.getContainer();
                                   if (mapContainer) mapContainer.style.zIndex = '10'; 
                                }
                             }}
                           />
                         ) : (
                           <Paper withBorder p="md" radius="md" style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                             <Text c="dimmed">No boundary data.</Text>
                           </Paper>
                         )}
                       </Box>
                       <Text size="xs" c="dimmed">Farm boundary can be edited in the Mapping section.</Text>


                       <Divider my="sm" />
                       <Title order={5} mb={0}>Farm Infrastructure</Title>

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
                      
                      <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={handleEditToggle}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                      </Group>
                    </Stack>
                  </form>
                )}
              </Box>
            </Group>
          </Card>
        </Grid.Col>

        {/* Right Column Removed */}
       
      </Grid>
    </Stack>
  );
}