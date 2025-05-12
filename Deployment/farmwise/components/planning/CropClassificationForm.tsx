'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import {
  TextInput,
  NumberInput,
  Select,
  Button,
  Group,
  Stack,
  Paper,
  Grid,
  Title,
  Text,
  ThemeIcon,
  Box,
  Loader,
  Alert,
  Badge,
  Card,
  Tooltip,
  ActionIcon,
  Stepper,
  rem,
  Center,
  Container,
  List,
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { 
  IconPlant2, 
  IconDroplet, 
  IconTemperature, 
  IconMoonStars, 
  IconAlertCircle, 
  IconLock, 
  IconInfoCircle,
  IconEdit,
  IconArrowRight,
  IconArrowLeft,
  IconBuildingWarehouse,
  IconSoil,
  IconCloudRain,
  IconPlant,
  IconCalendarStats,
  IconChevronRight,
  IconChevronLeft,
  IconLeaf,
  IconCircleCheck,
  IconMapPin,
  IconSun
} from '@tabler/icons-react';
import { authPost, getUserFarms, getFarmDetails } from '../../app/utils/api';

const seasonOptions = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'autumn', label: 'Autumn' },
  { value: 'winter', label: 'Winter' },
];

const irrigationOptions = [
  { value: 'Drip', label: 'Drip Irrigation' },
  { value: 'Sprinkler', label: 'Sprinkler System' },
  { value: 'Flood', label: 'Flood Irrigation' },
  { value: 'Furrow', label: 'Furrow Irrigation' },
  { value: 'None', label: 'No Irrigation' },
];

const fertilizerOptions = [
  { value: 'Urea', label: 'Urea' },
  { value: 'DAP', label: 'DAP' },
  { value: 'NPK', label: 'NPK' },
  { value: 'Organic', label: 'Organic' },
  { value: 'Other', label: 'Other' },
];

const governorateOptions = [
  { value: 'Ariana', label: 'Ariana' },
  { value: 'Beja', label: 'Beja' },
  { value: 'Ben Arous', label: 'Ben Arous' },
  { value: 'Bizerte', label: 'Bizerte' },
  { value: 'Gabes', label: 'Gabes' },
  { value: 'Gafsa', label: 'Gafsa' },
  { value: 'Jendouba', label: 'Jendouba' },
  { value: 'Kairouan', label: 'Kairouan' },
  { value: 'Kasserine', label: 'Kasserine' },
  { value: 'Kebili', label: 'Kebili' },
  { value: 'Kef', label: 'Kef' },
  { value: 'Mahdia', label: 'Mahdia' },
  { value: 'Manouba', label: 'Manouba' },
  { value: 'Medenine', label: 'Medenine' },
  { value: 'Monastir', label: 'Monastir' },
  { value: 'Nabeul', label: 'Nabeul' },
  { value: 'Sfax', label: 'Sfax' },
  { value: 'Sidi Bouzid', label: 'Sidi Bouzid' },
  { value: 'Siliana', label: 'Siliana' },
  { value: 'Sousse', label: 'Sousse' },
  { value: 'Tataouine', label: 'Tataouine' },
  { value: 'Tozeur', label: 'Tozeur' },
  { value: 'Tunis', label: 'Tunis' },
  { value: 'Zaghouan', label: 'Zaghouan' },
];

interface SelectFieldOption {
  value: string;
  label: string;
}

interface FormFieldBase {
  label: string;
  key: string;
  description: string;
  isReadOnly?: boolean;
}

interface TextFieldData extends FormFieldBase {
  fieldType: 'text';
}

interface NumberFieldData extends FormFieldBase {
  fieldType: 'number';
  unit?: string;
  min?: number;
  max?: number;
}

interface SelectFieldData extends FormFieldBase {
  fieldType: 'select';
  options: SelectFieldOption[];
}

type FormFieldData = NumberFieldData | SelectFieldData | TextFieldData;

interface FormSection {
  title: string;
  icon: React.ReactNode;
  color: string;
  fields: FormFieldData[];
}

interface CropClassificationFormProps {
  farmId?: number;
  onSuccess: (data: any) => void;
}

export function CropClassificationForm({ farmId: initialFarmId, onSuccess }: CropClassificationFormProps) {
  const router = useRouter();
  const [farms, setFarms] = useState<{ value: string, label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(initialFarmId || null);
  const [farmDetails, setFarmDetails] = useState<any | null>(null);
  const sections: FormSection[] = [
    {
      title: 'Agricultural Practices',
      icon: <IconPlant2 size={20} />,
      color: 'green',
      fields: [
        {
          fieldType: 'select',
          label: 'Irrigation Method',
          key: 'irrigation',
          options: irrigationOptions,
          description: 'Type of irrigation used',
        },
        {
          fieldType: 'select',
          label: 'Fertilizer Type',
          key: 'fertilizer_type',
          options: fertilizerOptions,
          description: 'Type of fertilizer used',
        },
        {
          fieldType: 'number',
          label: 'Fertilizer Amount',
          key: 'fertilizer_amount',
          unit: 'kg',
          description: 'Amount of fertilizer applied',
        },
        {
          fieldType: 'number',
          label: 'Pesticide Amount',
          key: 'pesticide_amount',
          unit: 'kg',
          description: 'Amount of pesticide used',
        },
        {
          fieldType: 'select',
          label: 'Governorate',
          key: 'governorate',
          options: governorateOptions,
          description: 'Farm governorate location',
          isReadOnly: true,
        },
        {
          fieldType: 'text',
          label: 'District',
          key: 'district',
          description: 'Farm district (optional)',
        },
      ],
    },
    {
      title: 'Seasonal Planning',
      icon: <IconMoonStars size={20} />,
      color: 'grape',
      fields: [
        {
          fieldType: 'select',
          label: 'Planting Season',
          key: 'planting_season',
          options: seasonOptions,
          description: 'Season for planting',
        },
        {
          fieldType: 'select',
          label: 'Growing Season',
          key: 'growing_season',
          options: seasonOptions,
          description: 'Main growing season',
        },
        {
          fieldType: 'select',
          label: 'Harvest Season',
          key: 'harvest_season',
          options: seasonOptions,
          description: 'Expected harvest season',
        },
      ],
    },
  ];

  // Function to extract governorate from address string
  const extractGovernorateFromAddress = (address: string): string | null => {
    if (!address) return null;
    
    // List of all governorates to check in the address
    const allGovernorates = governorateOptions.map(option => option.value);
    
    // Check if any governorate name is directly in the address
    for (const governorate of allGovernorates) {
      if (address.includes(governorate)) {
        return governorate;
      }
    }
    
    // If no direct match, try to parse from comma-separated parts
    // Typically governorate might be the 4th part: "Street, Area, District, Governorate, Postal, Country"
    const addressParts = address.split(',').map(part => part.trim());
    
    // Try to match any part with governorates (checking 3rd, 4th parts first as they're most likely)
    for (const index of [3, 2, 4, 1, 0, 5]) {
      if (addressParts[index]) {
        const part = addressParts[index];
        for (const governorate of allGovernorates) {
          if (part.includes(governorate)) {
            return governorate;
          }
        }
      }
    }
    
    // Default to Tunis if nothing found
    return 'Tunis';
  };

  useEffect(() => {
    async function fetchFarms() {
      try {
        setLoading(true);
        const userFarms = await getUserFarms();
        console.log('User farms:', userFarms);
        
        if (userFarms && userFarms.length > 0) {
          const formattedFarms = userFarms.map(farm => ({
            value: farm.id.toString(),
            label: farm.name
          }));
          
          setFarms(formattedFarms);            // Determine which farm ID to use
          let selectedId: number | null = null;
          
          if (initialFarmId) {
            // Check if initialFarmId exists in the available farms
            if (formattedFarms.some(farm => parseInt(farm.value) === initialFarmId)) {
              selectedId = initialFarmId;
            } else {
              console.log(`Farm with ID ${initialFarmId} not found, using first available farm instead`);
              selectedId = formattedFarms.length > 0 ? parseInt(formattedFarms[0].value) : null;
            }
          } else if (formattedFarms.length > 0) {
            selectedId = parseInt(formattedFarms[0].value);
          }
          
          if (selectedId) {
            setSelectedFarmId(selectedId);
            
            // Get the farm name for the notification
            const farmName = formattedFarms.find(farm => parseInt(farm.value) === selectedId)?.label || 'Unknown';
            
            // Show notification for selected farm
            notifications.show({
              title: 'Farm Selected',
              message: `Automatically selected farm: ${farmName}`,
              color: 'teal',
            });
            
            // Fetch detailed farm data including soil information
            const details = await getFarmDetails(selectedId);
            console.log('Fetched farm details:', details);
            if (details) {
              setFarmDetails(details);
              
              // Pre-fill soil data in the form if available
              if (details.soil_nitrogen) {
                console.log('Setting nitrogen value:', details.soil_nitrogen);
                form.setFieldValue('soil_n', parseFloat(details.soil_nitrogen));
              }
              if (details.soil_phosphorus) {
                console.log('Setting phosphorus value:', details.soil_phosphorus);
                form.setFieldValue('soil_p', parseFloat(details.soil_phosphorus));
              }
              if (details.soil_potassium) {
                console.log('Setting potassium value:', details.soil_potassium);
                form.setFieldValue('soil_k', parseFloat(details.soil_potassium));
              }
              if (details.soil_ph) {
                console.log('Setting pH value:', details.soil_ph);
                form.setFieldValue('ph', parseFloat(details.soil_ph));
              }
              
              // Set farm area from farm size hectares
              if (details.size_hectares) {
                console.log('Setting area value:', details.size_hectares);
                form.setFieldValue('area', parseFloat(details.size_hectares));
              }
              
              // Set governorate from farm details if available
              if (details.location && details.location.governorate) {
                console.log('Setting governorate value:', details.location.governorate);
                form.setFieldValue('governorate', details.location.governorate);
              } 
              // Try to extract from address if location.governorate is not available
              else if (details.address) {
                const extractedGovernorate = extractGovernorateFromAddress(details.address);
                if (extractedGovernorate) {
                  console.log('Setting governorate value extracted from address:', extractedGovernorate);
                  form.setFieldValue('governorate', extractedGovernorate);
                }
              } 
              // If no address directly in farm details, check farm_address
              else if (details.farm_address) {
                const extractedGovernorate = extractGovernorateFromAddress(details.farm_address);
                if (extractedGovernorate) {
                  console.log('Setting governorate value extracted from farm_address:', extractedGovernorate);
                  form.setFieldValue('governorate', extractedGovernorate);
                }
              }

              // Get latest weather data from weather_records if available
              try {
                // Check if we have weather data in the farm details
                if (details.weather_records && details.weather_records.length > 0) {
                  const latestWeather = details.weather_records[0]; // Assuming sorted by date
                  console.log('Latest weather data:', latestWeather);
                  
                  // Set temperature (average of min and max)
                  if (latestWeather.temperature_min && latestWeather.temperature_max) {
                    const avgTemp = (parseFloat(latestWeather.temperature_min) + parseFloat(latestWeather.temperature_max)) / 2;
                    console.log('Setting temperature value:', avgTemp);
                    form.setFieldValue('temperature', avgTemp);
                  }
                  
                  // Set humidity
                  if (latestWeather.humidity) {
                    console.log('Setting humidity value:', latestWeather.humidity);
                    form.setFieldValue('humidity', parseFloat(latestWeather.humidity));
                  }
                  
                  // Set rainfall/precipitation
                  if (latestWeather.precipitation) {
                    console.log('Setting rainfall value:', latestWeather.precipitation);
                    form.setFieldValue('rainfall', parseFloat(latestWeather.precipitation));
                  }
                  
                  // Check for annual rainfall in forecast_data
                  if (latestWeather.forecast_data && latestWeather.forecast_data.annual_rainfall) {
                    console.log('Setting annual rainfall value:', latestWeather.forecast_data.annual_rainfall);
                    form.setFieldValue('annual_rainfall', parseFloat(latestWeather.forecast_data.annual_rainfall));
                  }
                } else {
                  console.log('No weather data available for this farm');
                }
              } catch (weatherErr) {
                console.error('Error setting weather data:', weatherErr);
              }
            }
          }
          
          setError(null);
        } else {
          setError('No farms found. Please create a farm first.');
        }
      } catch (err) {
        console.error('Error fetching farms:', err);
        setError('Failed to load farms. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchFarms();
  }, [initialFarmId]);
  
  const form = useForm({
    initialValues: {
      farm: selectedFarmId || 0,
      soil_n: 0,
      soil_p: 0,
      soil_k: 0,
      temperature: 25,
      humidity: 60,
      ph: 7,
      rainfall: 0,
      annual_rainfall: 0,
      area: 0,
      fertilizer_amount: 0,
      pesticide_amount: 0,
      governorate: 'Tunis',
      district: '',
      irrigation: 'None',
      fertilizer_type: 'Urea',
      planting_season: 'spring',
      growing_season: 'summer',
      harvest_season: 'autumn',
    },
    validate: {
      farm: (value) => (!value ? 'Farm is required' : null),
      soil_n: (value) => (value >= 0 ? null : 'Nitrogen must be non-negative'),
      soil_p: (value) => (value >= 0 ? null : 'Phosphorus must be non-negative'),
      soil_k: (value) => (value >= 0 ? null : 'Potassium must be non-negative'),
      temperature: (value) => (value >= -20 && value <= 50 ? null : 'Temperature must be between -20°C and 50°C'),
      humidity: (value) => (value >= 0 && value <= 100 ? null : 'Humidity must be between 0% and 100%'),
      ph: (value) => (value >= 0 && value <= 14 ? null : 'pH must be between 0 and 14'),
      rainfall: (value) => (value >= 0 ? null : 'Rainfall must be non-negative'),
      annual_rainfall: (value) => (value >= 0 ? null : 'Annual rainfall must be non-negative'),
      area: (value) => (value > 0 ? null : 'Area must be greater than 0'),
      fertilizer_amount: (value) => (value >= 0 ? null : 'Fertilizer amount must be non-negative'),
      pesticide_amount: (value) => (value >= 0 ? null : 'Pesticide amount must be non-negative'),
      governorate: (value) => (value ? null : 'Governorate is required'),
    },
  });

  useEffect(() => {
    if (selectedFarmId) {
      form.setFieldValue('farm', selectedFarmId);
    }
  }, [selectedFarmId]);  const handleSubmit = async (values: typeof form.values) => {
    try {
      // Make sure soil values are included from farm details if available
      if (farmDetails) {
        // Include soil data
        if (farmDetails.soil_nitrogen) values.soil_n = parseFloat(farmDetails.soil_nitrogen);
        if (farmDetails.soil_phosphorus) values.soil_p = parseFloat(farmDetails.soil_phosphorus);
        if (farmDetails.soil_potassium) values.soil_k = parseFloat(farmDetails.soil_potassium);
        if (farmDetails.soil_ph) values.ph = parseFloat(farmDetails.soil_ph);
        
        // Include area from farm size
        if (farmDetails.size_hectares) values.area = parseFloat(farmDetails.size_hectares);
      }
      
      // Include weather data
      // Note: These values are already set in the form through useEffect
      
      console.log('Submitting form with values:', values);
      
      // Use the local API route which will forward to Django backend
      const response = await authPost('planning/crop-classification', values);
      
      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to submit classification';
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.farm) {
            errorMessage = `Farm error: ${errorData.farm}`;
          }
          console.error('Error response:', errorData);
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Success response:', data);
      
      // Django backend returns the full object so it's ready to be passed to the results component
      onSuccess(data);
      
    } catch (error: any) {
      console.error('Form submission error:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to submit classification. Please try again.',
        color: 'red',
      });
    }
  };

  if (loading) {
    return (
      <Box p="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Loader size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        icon={<IconAlertCircle size={16} />} 
        title="Error" 
        color="red"
        mb="lg"
      >
        {error}
      </Alert>
    );
  }

  // Find the selected farm name
  const selectedFarmName = farms.find(farm => farm.value === selectedFarmId?.toString())?.label || 'Your farm';

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="xl">        {/* Hidden inputs for form submission */}
        <input type="hidden" {...form.getInputProps('farm')} />
        <input type="hidden" {...form.getInputProps('soil_n')} />
        <input type="hidden" {...form.getInputProps('soil_p')} />
        <input type="hidden" {...form.getInputProps('soil_k')} />
        <input type="hidden" {...form.getInputProps('ph')} />
        <input type="hidden" {...form.getInputProps('governorate')} />
          {/* Display selected farm information */}
        <Box mb="md">
          <Group align="center">
            <ThemeIcon size="lg" color="teal" variant="light">
              <IconPlant2 size={20} />
            </ThemeIcon>
            <Title order={4}>Farm Information</Title>
          </Group>
          <Text mt="xs" size="sm" c="dimmed">
            Running soil analysis for:
          </Text>
          <Badge size="lg" color="teal" variant="filled" mt="xs">
            {selectedFarmName}
          </Badge>
        </Box>
        
        {/* Soil Analysis Panel */}
        <Card withBorder shadow="sm" p="md" mb="lg">
          <Group justify="space-between" mb="sm">
            <Group>
              <ThemeIcon size="lg" color="blue" variant="light">
                <IconDroplet size={20} />
              </ThemeIcon>
              <Title order={4}>Soil Analysis</Title>
            </Group>            <Tooltip 
              label="These values are managed in your farm profile" 
              position="left"
              multiline
              w={200}
            >
              <ActionIcon variant="subtle" color="gray">
                <IconInfoCircle size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>          <Card withBorder p="md" radius="md" bg="rgba(56, 182, 255, 0.08)" mb="md">
            <Box mb="sm">
              <Text size="sm" fw={600} c="blue.7" mb={4}>
                <IconLock size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                Soil data from your farm profile
              </Text>
              <Text size="sm" mb="sm" c="dimmed" lh={1.5}>
                These values are automatically pulled from your farm profile settings. 
                Accurate soil data helps provide better crop recommendations for your specific conditions.
              </Text>
            </Box>
            
            <Box
              style={{
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(56, 182, 255, 0.1) 0%, rgba(0, 128, 0, 0.1) 100%)',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '10px',
                marginBottom: '16px',
                border: '1px dashed var(--mantine-color-blue-5)',
              }}
            >
              <Text size="sm" fw={500} lh={1.5}>
                Need to update your soil analysis? 
                <br />Recent soil tests ensure the most accurate crop recommendations.
              </Text>
            </Box>
            
            <Group mt="md">
              <Button 
                variant="light" 
                color="blue" 
                leftSection={<IconEdit size={16} />}
                rightSection={<IconArrowRight size={16} />}
                onClick={() => router.push('/dashboard/farms')}
                style={{
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                Update farm soil data
              </Button>
            </Group>
          </Card>
            <Grid>
            <Grid.Col span={{ base: 6, md: 3 }}>              <Card withBorder p="xs" radius="md" bg="white" style={{ minHeight: '80px' }}>
                <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb={2}>Nitrogen (N)</Text>
                <Group gap="xs" align="baseline">
                  <Text size="xl" fw={700} c={farmDetails?.soil_nitrogen ? 'blue.7' : 'gray.5'}>
                    {farmDetails?.soil_nitrogen || 'N/A'}
                  </Text>
                  <Text size="xs" c="dimmed" fw={600}>kg/ha</Text>
                </Group>
                <Box mt={5} style={{ height: '3px', width: '40%', background: 'var(--mantine-color-blue-5)', borderRadius: '2px' }}></Box>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 3 }}>
              <Card withBorder p="xs" radius="md" bg="white" style={{ minHeight: '80px' }}>
                <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb={2}>Phosphorus (P)</Text>
                <Group gap="xs" align="baseline">
                  <Text size="xl" fw={700} c={farmDetails?.soil_phosphorus ? 'blue.7' : 'gray.5'}>
                    {farmDetails?.soil_phosphorus || 'N/A'}
                  </Text>
                  <Text size="xs" c="dimmed" fw={600}>kg/ha</Text>
                </Group>
                <Box mt={5} style={{ height: '3px', width: '40%', background: 'var(--mantine-color-indigo-5)', borderRadius: '2px' }}></Box>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 3 }}>
              <Card withBorder p="xs" radius="md" bg="white" style={{ minHeight: '80px' }}>
                <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb={2}>Potassium (K)</Text>
                <Group gap="xs" align="baseline">
                  <Text size="xl" fw={700} c={farmDetails?.soil_potassium ? 'teal.7' : 'gray.5'}>
                    {farmDetails?.soil_potassium || 'N/A'}
                  </Text>
                  <Text size="xs" c="dimmed" fw={600}>kg/ha</Text>
                </Group>
                <Box mt={5} style={{ height: '3px', width: '40%', background: 'var(--mantine-color-teal-5)', borderRadius: '2px' }}></Box>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 3 }}>
              <Card withBorder p="xs" radius="md" bg="white" style={{ minHeight: '80px' }}>
                <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb={2}>pH Level</Text>
                <Group gap="xs" align="baseline">
                  <Text size="xl" fw={700} c={farmDetails?.soil_ph ? 'grape.7' : 'gray.5'}>
                    {farmDetails?.soil_ph || 'N/A'}
                  </Text>
                </Group>
                <Box mt={5} style={{ height: '3px', width: '40%', background: 'var(--mantine-color-grape-5)', borderRadius: '2px' }}></Box>
              </Card>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Environmental Data Panel */}
        <Card withBorder shadow="sm" p="md" mb="lg">
          <Group justify="space-between" mb="sm">
            <Group>
              <ThemeIcon size="lg" color="orange" variant="light">
                <IconTemperature size={20} />
              </ThemeIcon>
              <Title order={4}>Environmental Data</Title>
            </Group>
            <Tooltip 
              label="These values are automatically retrieved from your farm record and weather data" 
              position="left"
              multiline
              w={200}
            >
              <ActionIcon variant="subtle" color="gray">
                <IconInfoCircle size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
          
          <Card withBorder p="md" radius="md" bg="rgba(255, 165, 56, 0.08)" mb="md">
            <Box mb="sm">
              <Text size="sm" fw={600} c="orange.7" mb={4}>
                <IconLock size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                Environmental data from farm records
              </Text>
              <Text size="sm" mb="sm" c="dimmed" lh={1.5}>
                These values are automatically pulled from your farm profile and weather data. 
                Accurate environmental data helps provide better crop recommendations.
              </Text>
            </Box>
          </Card>
          
          <Grid>
            <Grid.Col span={{ base: 6, md: 3 }}>
              <Card withBorder p="xs" radius="md" bg="white" style={{ minHeight: '80px' }}>
                <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb={2}>Temperature</Text>
                <Group gap="xs" align="baseline">
                  <Text size="xl" fw={700} c={farmDetails?.weather_records?.[0]?.temperature_min && farmDetails?.weather_records?.[0]?.temperature_max ? 'orange.7' : 'gray.5'}>
                    {farmDetails?.weather_records?.[0]?.temperature_min && farmDetails?.weather_records?.[0]?.temperature_max
                      ? ((parseFloat(farmDetails.weather_records[0].temperature_min) + parseFloat(farmDetails.weather_records[0].temperature_max)) / 2).toFixed(1)
                      : 'N/A'}
                  </Text>
                  <Text size="xs" c="dimmed" fw={600}>°C</Text>
                </Group>
                <Box mt={5} style={{ height: '3px', width: '40%', background: 'var(--mantine-color-orange-5)', borderRadius: '2px' }}></Box>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={{ base: 6, md: 3 }}>
              <Card withBorder p="xs" radius="md" bg="white" style={{ minHeight: '80px' }}>
                <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb={2}>Humidity</Text>
                <Group gap="xs" align="baseline">
                  <Text size="xl" fw={700} c={farmDetails?.weather_records?.[0]?.humidity ? 'blue.7' : 'gray.5'}>
                    {farmDetails?.weather_records?.[0]?.humidity || 'N/A'}
                  </Text>
                  <Text size="xs" c="dimmed" fw={600}>%</Text>
                </Group>
                <Box mt={5} style={{ height: '3px', width: '40%', background: 'var(--mantine-color-blue-5)', borderRadius: '2px' }}></Box>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={{ base: 6, md: 3 }}>
              <Card withBorder p="xs" radius="md" bg="white" style={{ minHeight: '80px' }}>
                <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb={2}>Annual Rainfall</Text>
                <Group gap="xs" align="baseline">
                  <Text size="xl" fw={700} c={farmDetails?.weather_records?.[0]?.forecast_data?.annual_rainfall ? 'cyan.7' : 'gray.5'}>
                    {farmDetails?.weather_records?.[0]?.forecast_data?.annual_rainfall ? `${farmDetails.weather_records[0].forecast_data.annual_rainfall} mm` : 'N/A'}
                  </Text>
                  <Text size="xs" c="dimmed" fw={600}>mm</Text>
                </Group>
                <Box mt={5} style={{ height: '3px', width: '40%', background: 'var(--mantine-color-cyan-5)', borderRadius: '2px' }}></Box>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={{ base: 6, md: 3 }}>
              <Card withBorder p="xs" radius="md" bg="white" style={{ minHeight: '80px' }}>
                <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb={2}>Area</Text>
                <Group gap="xs" align="baseline">
                  <Text size="xl" fw={700} c={farmDetails?.size_hectares ? 'green.7' : 'gray.5'}>
                    {farmDetails?.size_hectares || 'N/A'}
                  </Text>
                  <Text size="xs" c="dimmed" fw={600}>ha</Text>
                </Group>
                <Box mt={5} style={{ height: '3px', width: '40%', background: 'var(--mantine-color-green-5)', borderRadius: '2px' }}></Box>
              </Card>
            </Grid.Col>
          </Grid>
        </Card>

        {sections.map((section, idx) => (
          <Box key={idx}>
            <Group align="center" mb="md">
              <ThemeIcon size="lg" color={section.color} variant="light">
                {section.icon}
              </ThemeIcon>
              <Title order={4}>{section.title}</Title>
            </Group>

            {section.title === 'Agricultural Practices' && (
              <Card withBorder p="md" radius="md" bg={`rgba(76, 175, 80, 0.08)`} mb="md">
                <Box mb="sm">
                  <Text size="sm" fw={600} c="green.7" mb={4}>
                    <IconLock size={16} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                    Location data from your farm profile
                  </Text>
                  <Text size="sm" mb="sm" c="dimmed" lh={1.5}>
                    Your farm's governorate is automatically pulled from your farm profile.
                  </Text>
                </Box>
                
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder p="xs" radius="md" bg="white" style={{ minHeight: '80px' }}>
                      <Text size="xs" fw={500} c="dimmed" tt="uppercase" mb={2}>Governorate</Text>
                      <Group gap="xs" align="baseline">
                        <Text size="xl" fw={700} c={form.values.governorate ? 'green.7' : 'gray.5'}>
                          {form.values.governorate || 'N/A'}
                        </Text>
                      </Group>
                      {form.values.governorate && !farmDetails?.location?.governorate && (
                        <Text size="xs" fs="italic" c="dimmed" mt={2}>
                          Detected from farm address
                        </Text>
                      )}
                      <Box mt={5} style={{ height: '3px', width: '40%', background: 'var(--mantine-color-green-5)', borderRadius: '2px' }}></Box>
                    </Card>
                  </Grid.Col>
                </Grid>
              </Card>
            )}

            <Grid>
              {section.fields.filter(field => !field.isReadOnly).map((field) => (
                <Grid.Col key={field.key} span={{ base: 12, sm: 6, md: section.title === 'Seasonal Planning' ? 4 : 6 }}>
                  {field.fieldType === 'select' ? (
                    <Select
                      label={field.label}
                      description={field.description}
                      placeholder={`Select ${field.label.toLowerCase()}`}
                      data={field.options}
                      {...form.getInputProps(field.key)}
                    />
                  ) : field.fieldType === 'text' ? (
                    <TextInput
                      label={field.label}
                      description={field.description}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      {...form.getInputProps(field.key)}
                    />
                  ) : (
                    <NumberInput
                      label={field.label}
                      description={field.description}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      min={field.min ?? 0}
                      max={field.max}
                      step={0.1}
                      rightSection={field.unit && <Text size="sm" c="dimmed">{field.unit}</Text>}
                      {...form.getInputProps(field.key)}
                    />
                  )}
                </Grid.Col>
              ))}
            </Grid>
          </Box>
        ))}

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" leftSection={<IconPlant2 size={16} />}>
            Analyze Crop Suitability
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
