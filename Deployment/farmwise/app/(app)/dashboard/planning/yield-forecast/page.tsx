'use client';
import React, { useState, useEffect } from 'react';
import {
  Title,
  Text,
  Container,
  Paper,
  Button,
  Group,
  SimpleGrid,
  Card,
  Badge,
  rem,
  Grid,
  ThemeIcon,
  Select,
  NumberInput,
  Box,
  Tabs,
  RingProgress,
  Slider,
  useMantineTheme,
  LoadingOverlay,
  Tooltip
} from '@mantine/core';
import { 
  IconPlant2,
  IconChartBar, 
  IconSun, 
  IconCloudRain,
  IconArrowUp,
  IconArrowDown,
  IconChartLine,
  IconSeeding,
  IconInfoCircle,
  IconAdjustments
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

// Mock data for fields
const fields = [
  { value: 'field-a', label: 'Field A (North)' },
  { value: 'field-b', label: 'Field B (South)' },
  { value: 'field-c', label: 'Field C (East)' },
  { value: 'field-d', label: 'Field D (West)' },
];

// Mock data for crops
const crops = [
  { value: 'corn', label: 'Corn' },
  { value: 'soybeans', label: 'Soybeans' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'sorghum', label: 'Sorghum' },
];

// Mock historical yield data
const historicalYields = {
  'field-a': {
    'corn': [
      { year: 2020, yield: 180 },
      { year: 2021, yield: 175 },
      { year: 2022, yield: 190 },
      { year: 2023, yield: 185 },
    ],
    'soybeans': [
      { year: 2020, yield: 55 },
      { year: 2021, yield: 58 },
      { year: 2022, yield: 54 },
      { year: 2023, yield: 60 },
    ],
  },
  'field-b': {
    'wheat': [
      { year: 2020, yield: 75 },
      { year: 2021, yield: 80 },
      { year: 2022, yield: 78 },
      { year: 2023, yield: 82 },
    ],
  }
};

export default function YieldForecastPage() {
  const theme = useMantineTheme();
  const router = useRouter();
  
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [soilMoisture, setSoilMoisture] = useState<number>(50);
  const [fertilizerRate, setFertilizerRate] = useState<number | string>(150);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  
  // Additional parameters
  const [plantingDate, setPlantingDate] = useState<string | null>(null);
  const [seedRate, setSeedRate] = useState<number | string>(32000);
  const [pestPressure, setPestPressure] = useState<number>(25);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  // Mock planting dates options
  const plantingDates = [
    { value: 'early-april', label: 'Early April' },
    { value: 'late-april', label: 'Late April' },
    { value: 'early-may', label: 'Early May' },
    { value: 'late-may', label: 'Late May' },
  ];

  // Update historical data when field and crop selection changes
  useEffect(() => {
    if (selectedField && selectedCrop && 
        historicalYields[selectedField] && 
        historicalYields[selectedField][selectedCrop]) {
      setHistoricalData(historicalYields[selectedField][selectedCrop]);
    } else {
      setHistoricalData([]);
    }
  }, [selectedField, selectedCrop]);

  // Function to generate prediction
  const generatePrediction = () => {
    if (!selectedField || !selectedCrop) {
      notifications.show({
        title: 'Missing Information',
        message: 'Please select both a field and crop type',
        color: 'red',
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call to ML model
    setTimeout(() => {
      // This would be replaced with actual API call to backend
      const baseYield = selectedCrop === 'corn' ? 185 : 
                         selectedCrop === 'soybeans' ? 58 : 
                         selectedCrop === 'wheat' ? 80 : 150;
      
      // Calculate adjustments based on inputs
      const moistureAdjustment = (soilMoisture - 50) * 0.4;
      const fertilizerAdjustment = (Number(fertilizerRate) - 150) * 0.1;
      const seedRateAdjustment = (Number(seedRate) - 32000) * 0.0001;
      const pestAdjustment = -pestPressure * 0.1;
      
      // Calculate final prediction
      const calculatedYield = baseYield + moistureAdjustment + fertilizerAdjustment + seedRateAdjustment + pestAdjustment;
      setPrediction(Math.round(calculatedYield * 10) / 10);
      
      // Set confidence score
      setConfidenceScore(Math.floor(85 + Math.random() * 10));
      
      setLoading(false);
    }, 1500);
  };

  const getYieldComparisonText = () => {
    if (!prediction || historicalData.length === 0) return null;
    
    const latestYield = historicalData[historicalData.length - 1].yield;
    const difference = prediction - latestYield;
    const percentChange = ((difference / latestYield) * 100).toFixed(1);
    
    if (difference > 0) {
      return (
        <Group gap="xs">
          <IconArrowUp color={theme.colors.green[6]} size="1rem" />
          <Text c="green.7" fw={500}>{percentChange}% increase from last year</Text>
        </Group>
      );
    } else {
      return (
        <Group gap="xs">
          <IconArrowDown color={theme.colors.red[6]} size="1rem" />
          <Text c="red.7" fw={500}>{Math.abs(Number(percentChange))}% decrease from last year</Text>
        </Group>
      );
    }
  };

  return (
    <Container fluid>
      <Group justify="space-between" mb="lg">
        <Title order={2} fw={700}>
          <Group gap="xs">
            <IconChartLine size={28} stroke={1.5} />
            <Text>Yield Forecast</Text>
          </Group>
        </Title>
      </Group>

      <Grid gutter="md">
        {/* Input parameters section */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder p="md" radius="md">
            <Text fw={700} size="lg" mb="md">Forecast Parameters</Text>
            
            <LoadingOverlay visible={loading} zIndex={1000} />
            
            <Group mb="md">
              <Select
                label="Select Field"
                placeholder="Choose field"
                data={fields}
                value={selectedField}
                onChange={setSelectedField}
                style={{ flex: 1 }}
                searchable
              />
              
              <Select
                label="Select Crop"
                placeholder="Choose crop"
                data={crops}
                value={selectedCrop}
                onChange={setSelectedCrop}
                style={{ flex: 1 }}
                searchable
              />
            </Group>
            
            <Box mb="md">
              <Group position="apart" mb={5}>
                <Text size="sm">Soil Moisture</Text>
                <Badge>{soilMoisture}%</Badge>
              </Group>
              <Slider
                marks={[
                  { value: 0, label: 'Dry' },
                  { value: 50, label: 'Optimal' },
                  { value: 100, label: 'Wet' },
                ]}
                value={soilMoisture}
                onChange={setSoilMoisture}
                size="sm"
              />
            </Box>
            
            <NumberInput
              label="Fertilizer Application Rate (lbs/acre)"
              value={fertilizerRate}
              onChange={setFertilizerRate}
              min={0}
              max={500}
              mb="md"
            />
            
            {showAdvanced && (
              <>
                <Select
                  label="Planting Date"
                  placeholder="Select date range"
                  data={plantingDates}
                  value={plantingDate}
                  onChange={setPlantingDate}
                  mb="md"
                />
                
                <NumberInput
                  label="Seed Rate (seeds/acre)"
                  value={seedRate}
                  onChange={setSeedRate}
                  min={10000}
                  max={50000}
                  step={1000}
                  mb="md"
                />
                
                <Box mb="md">
                  <Group position="apart" mb={5}>
                    <Text size="sm">Expected Pest/Disease Pressure</Text>
                    <Badge>{pestPressure}%</Badge>
                  </Group>
                  <Slider
                    marks={[
                      { value: 0, label: 'None' },
                      { value: 50, label: 'Moderate' },
                      { value: 100, label: 'Severe' },
                    ]}
                    value={pestPressure}
                    onChange={setPestPressure}
                    size="sm"
                  />
                </Box>
              </>
            )}
            
            <Group mt="xl">
              <Button 
                onClick={generatePrediction} 
                leftSection={<IconChartLine size="1rem" />}
                color="blue"
                loading={loading}
              >
                Generate Forecast
              </Button>
              
              <Button 
                variant="subtle"
                leftSection={<IconAdjustments size="1rem" />}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Hide Advanced' : 'Show Advanced Options'}
              </Button>
            </Group>
          </Paper>
        </Grid.Col>
        
        {/* Results section */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper withBorder p="md" radius="md" h="100%">
            <Text fw={700} size="lg" mb="md">Forecast Results</Text>
            
            {prediction ? (
              <>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
                  <Card withBorder p="md" radius="md">
                    <Group position="apart" mb="xs">
                      <Text size="sm" c="dimmed">Predicted Yield</Text>
                      <Tooltip label="Based on selected parameters and historical data">
                        <ThemeIcon radius="xl" size="sm" variant="light" color="gray">
                          <IconInfoCircle size="1rem" />
                        </ThemeIcon>
                      </Tooltip>
                    </Group>
                    <Group position="apart" align="flex-end">
                      <div>
                        <Text size="xl" fw={700} style={{ lineHeight: 1 }}>
                          {prediction}
                        </Text>
                        <Text size="sm" c="dimmed">{selectedCrop === 'corn' || selectedCrop === 'sorghum' ? 'bushels/acre' : 'units/acre'}</Text>
                      </div>
                      {getYieldComparisonText()}
                    </Group>
                  </Card>
                  
                  <Card withBorder p="md" radius="md">
                    <Group position="apart" mb="xs">
                      <Text size="sm" c="dimmed">Confidence Score</Text>
                      <Tooltip label="Higher score means more reliable prediction">
                        <ThemeIcon radius="xl" size="sm" variant="light" color="gray">
                          <IconInfoCircle size="1rem" />
                        </ThemeIcon>
                      </Tooltip>
                    </Group>
                    
                    <RingProgress
                      sections={[
                        { value: confidenceScore || 0, color: confidenceScore && confidenceScore > 85 ? 'green' : 'blue' },
                      ]}
                      label={
                        <Text ta="center" size="xl" fw={700}>
                          {confidenceScore}%
                        </Text>
                      }
                      size={120}
                      thickness={12}
                    />
                  </Card>
                </SimpleGrid>
                
                <Card withBorder p="lg" radius="md">
                  <Text fw={500} mb="md">Key Influencing Factors</Text>
                  
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <Group>
                      <ThemeIcon color="blue" variant="light" size="lg" radius="md">
                        <IconSun size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size="xs" c="dimmed">Weather Conditions</Text>
                        <Text fw={500}>Favorable</Text>
                      </div>
                    </Group>
                    
                    <Group>
                      <ThemeIcon color={soilMoisture > 30 && soilMoisture < 70 ? "green" : "yellow"} variant="light" size="lg" radius="md">
                        <IconCloudRain size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size="xs" c="dimmed">Soil Moisture</Text>
                        <Text fw={500}>{soilMoisture > 30 && soilMoisture < 70 ? "Optimal" : "Suboptimal"}</Text>
                      </div>
                    </Group>
                    
                    <Group>
                      <ThemeIcon color={Number(fertilizerRate) > 100 ? "green" : "yellow"} variant="light" size="lg" radius="md">
                        <IconSeeding size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size="xs" c="dimmed">Nutrition</Text>
                        <Text fw={500}>{Number(fertilizerRate) > 100 ? "Well Fertilized" : "Needs Attention"}</Text>
                      </div>
                    </Group>
                    
                    <Group>
                      <ThemeIcon color={pestPressure < 40 ? "green" : "orange"} variant="light" size="lg" radius="md">
                        <IconPlant2 size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size="xs" c="dimmed">Plant Health</Text>
                        <Text fw={500}>{pestPressure < 40 ? "Good" : "Fair"}</Text>
                      </div>
                    </Group>
                  </SimpleGrid>
                </Card>
              </>
            ) : (
              <Box style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                height: '80%' 
              }}>
                <IconChartBar size={48} stroke={1} color={theme.colors.gray[4]} />
                <Text c="dimmed" mt="md" ta="center">
                  Select parameters and generate a forecast to see yield predictions
                </Text>
              </Box>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
} 