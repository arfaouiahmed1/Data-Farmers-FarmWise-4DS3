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
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { IconPlant2, IconDroplet, IconTemperature, IconMoonStars, IconAlertCircle } from '@tabler/icons-react';
import { authPost, getUserFarms } from '../../app/utils/api';

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
  
  const sections: FormSection[] = [
    {
      title: 'Soil Analysis',
      icon: <IconDroplet size={20} />,
      color: 'blue',
      fields: [
        {
          fieldType: 'number',
          label: 'Nitrogen (N)',
          key: 'soil_n',
          unit: 'kg/ha',
          description: 'Nitrogen content in soil',
        },
        {
          fieldType: 'number',
          label: 'Phosphorus (P)',
          key: 'soil_p',
          unit: 'kg/ha',
          description: 'Phosphorus content in soil',
        },
        {
          fieldType: 'number',
          label: 'Potassium (K)',
          key: 'soil_k',
          unit: 'kg/ha',
          description: 'Potassium content in soil',
        },
        {
          fieldType: 'number',
          label: 'pH Level',
          key: 'ph',
          min: 0,
          max: 14,
          description: 'Soil pH level',
        },
      ],
    },
    {
      title: 'Environmental Conditions',
      icon: <IconTemperature size={20} />,
      color: 'orange',
      fields: [
        {
          fieldType: 'number',
          label: 'Temperature',
          key: 'temperature',
          unit: '°C',
          min: -20,
          max: 50,
          description: 'Average temperature',
        },
        {
          fieldType: 'number',
          label: 'Humidity',
          key: 'humidity',
          unit: '%',
          min: 0,
          max: 100,
          description: 'Relative humidity',
        },
        {
          fieldType: 'number',
          label: 'Rainfall',
          key: 'rainfall',
          unit: 'mm',
          description: 'Annual rainfall',
        },
        {
          fieldType: 'number',
          label: 'Area',
          key: 'area',
          unit: 'ha',
          description: 'Field area',
        },
      ],
    },
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
          
          setFarms(formattedFarms);
          
          if (!initialFarmId && formattedFarms.length > 0) {
            setSelectedFarmId(parseInt(formattedFarms[0].value));
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
  }, [selectedFarmId]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      console.log('Submitting form with values:', values);
      
      const response = await authPost('crop-classification', values);
      
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

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="xl">
        <Box>
          <Group align="center" mb="md">
            <ThemeIcon size="lg" color="teal" variant="light">
              <IconPlant2 size={20} />
            </ThemeIcon>
            <Title order={4}>Farm Selection</Title>
          </Group>

          <Select
            label="Select Farm"
            description="Choose the farm for crop classification"
            placeholder="Select a farm"
            data={farms}
            required
            {...form.getInputProps('farm')}
            onChange={(value) => {
              if (value) {
                setSelectedFarmId(parseInt(value));
                form.setFieldValue('farm', parseInt(value));
              }
            }}
          />
        </Box>

        {sections.map((section, idx) => (
          <Box key={idx}>
            <Group align="center" mb="md">
              <ThemeIcon size="lg" color={section.color} variant="light">
                {section.icon}
              </ThemeIcon>
              <Title order={4}>{section.title}</Title>
            </Group>

            <Grid>
              {section.fields.map((field) => (
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
