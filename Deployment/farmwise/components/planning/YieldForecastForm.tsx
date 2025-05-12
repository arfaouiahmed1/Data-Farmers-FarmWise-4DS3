'use client';

import React from 'react';
import {
  Paper,
  Title,
  Text,
  Group,
  Select,
  NumberInput,
  Box,
  Button,
  Stack,
  ThemeIcon,
  Grid,
  Stepper,
} from '@mantine/core';
import { 
  IconPlant2, 
  IconDroplet, 
  IconTemperature, 
  IconChartLine,
  IconSeeding,
  IconSun,
  IconWind,
  IconCalendar
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

// Crop options
const crops = [
  { value: 'corn', label: 'Corn' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'barley', label: 'Barley' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'soybeans', label: 'Soybeans' },
  { value: 'sunflower', label: 'Sunflower' },
  { value: 'potatoes', label: 'Potatoes' },
  { value: 'tomatoes', label: 'Tomatoes' },
];

// Irrigation methods
const irrigationMethods = [
  { value: 'drip', label: 'Drip Irrigation' },
  { value: 'sprinkler', label: 'Sprinkler System' },
  { value: 'flood', label: 'Flood Irrigation' },
  { value: 'furrow', label: 'Furrow Irrigation' },
  { value: 'none', label: 'No Irrigation' },
];

// Fertilizer types
const fertilizerTypes = [
  { value: 'urea', label: 'Urea' },
  { value: 'dap', label: 'DAP' },
  { value: 'npk', label: 'NPK' },
  { value: 'organic', label: 'Organic' },
  { value: 'other', label: 'Other' },
];

// Seasons
const seasons = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'autumn', label: 'Autumn' },
  { value: 'winter', label: 'Winter' },
];

interface YieldForecastFormProps {
  onSuccess: (result: any, params: any) => void;
}

export function YieldForecastForm({ onSuccess }: YieldForecastFormProps) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  // Crop Selection
  const [selectedCrop, setSelectedCrop] = React.useState<string | null>(null);
  
  // Soil Parameters
  const [nitrogenLevel, setNitrogenLevel] = React.useState<number>(0);
  const [phosphorusLevel, setPhosphorusLevel] = React.useState<number>(0);
  const [potassiumLevel, setPotassiumLevel] = React.useState<number>(0);
  const [soilPH, setSoilPH] = React.useState<number>(7);

  // Environmental Conditions
  const [temperature, setTemperature] = React.useState<number>(25);
  const [humidity, setHumidity] = React.useState<number>(60);
  const [rainfall, setRainfall] = React.useState<number>(0);
  const [maxTemp, setMaxTemp] = React.useState<number>(30);
  const [minTemp, setMinTemp] = React.useState<number>(15);
  const [windSpeed, setWindSpeed] = React.useState<number>(0);

  // Agricultural Practices
  const [area, setArea] = React.useState<number>(0);
  const [fertilizerAmount, setFertilizerAmount] = React.useState<number>(0);
  const [pesticideAmount, setPesticideAmount] = React.useState<number>(0);
  const [irrigationMethod, setIrrigationMethod] = React.useState<string | null>(null);
  const [fertilizerType, setFertilizerType] = React.useState<string | null>(null);
  
  // Seasons
  const [plantingSeason, setPlantingSeason] = React.useState<string | null>(null);
  const [growingSeason, setGrowingSeason] = React.useState<string | null>(null);
  const [harvestSeason, setHarvestSeason] = React.useState<string | null>(null);
  // Handlers for number inputs
  const handleNumberInput = (setter: React.Dispatch<React.SetStateAction<number>>) => 
    (value: string | number) => setter(typeof value === 'string' ? parseFloat(value) || 0 : value);

  const nextStep = () => {
    if (activeStep < 4) {
      setActiveStep((current) => current + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep((current) => current - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCrop) {
      notifications.show({
        title: 'Missing Information',
        message: 'Please select a crop type',
        color: 'red',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/planning/yield-forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crop: selectedCrop,
          soil_n: Number(nitrogenLevel),
          soil_p: Number(phosphorusLevel),
          soil_k: Number(potassiumLevel),
          temperature: Number(temperature),
          humidity: Number(humidity),
          ph: Number(soilPH),
          rainfall: Number(rainfall),
          area: Number(area),
          fertilizer_amount: Number(fertilizerAmount),
          pesticide_amount: Number(pesticideAmount),
          irrigation: irrigationMethod,
          fertilizer_type: fertilizerType,
          planting_season: plantingSeason,
          growing_season: growingSeason,
          harvest_season: harvestSeason,
          max_temp: Number(maxTemp),
          min_temp: Number(minTemp),
          wind_speed: Number(windSpeed),
        }),
      });

      const data = await response.json();
      if (data.success) {
        onSuccess(data.prediction, {
          crop: selectedCrop,
          soil_n: nitrogenLevel,
          soil_p: phosphorusLevel,
          soil_k: potassiumLevel,
          temperature,
          humidity,
          ph: soilPH,
          rainfall,
          area,
          fertilizer_amount: fertilizerAmount,
          pesticide_amount: pesticideAmount,
          irrigation: irrigationMethod,
          fertilizer_type: fertilizerType,
          planting_season: plantingSeason,
          growing_season: growingSeason,
          harvest_season: harvestSeason,
        });
      } else {
        throw new Error('Failed to generate prediction');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to generate prediction. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Stepper active={activeStep} onStepClick={setActiveStep} mb="xl">
        <Stepper.Step
          label="Crop Selection"
          description="Select crop type"
          icon={<IconPlant2 size="1.1rem" />}
        >
          <Box mt="md">
            <Select
              label="Select Crop"
              placeholder="Choose a crop"
              data={crops}
              value={selectedCrop}
              onChange={setSelectedCrop}
              searchable
              required
            />
          </Box>
        </Stepper.Step>

        <Stepper.Step
          label="Soil Parameters"
          description="Soil composition and pH"
          icon={<IconDroplet size="1.1rem" />}
        >
          <Stack mt="md">            <NumberInput
              label="Nitrogen (N) Level"
              description="Amount in kg/ha"
              value={nitrogenLevel}
              onChange={handleNumberInput(setNitrogenLevel)}
              min={0}
              required
            />
            <NumberInput
              label="Phosphorus (P) Level"
              description="Amount in kg/ha"
              value={phosphorusLevel}
              onChange={handleNumberInput(setPhosphorusLevel)}
              min={0}
              required
            />
            <NumberInput
              label="Potassium (K) Level"
              description="Amount in kg/ha"
              value={potassiumLevel}
              onChange={handleNumberInput(setPotassiumLevel)}
              min={0}
              required
            />            <NumberInput
              label="Soil pH"
              value={soilPH}
              onChange={handleNumberInput(setSoilPH)}
              min={0}
              max={14}
              step={0.1}
              decimalScale={1}
              required
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step
          label="Environmental Conditions"
          description="Weather and climate data"
          icon={<IconSun size="1.1rem" />}
        >          <Stack mt="md">
            <NumberInput
              label="Temperature"
              description="Average temperature in °C"
              value={temperature}
              onChange={handleNumberInput(setTemperature)}
              min={-20}
              max={50}
              required
            />
            <NumberInput
              label="Maximum Temperature"
              description="Maximum temperature in °C"
              value={maxTemp}
              onChange={handleNumberInput(setMaxTemp)}
              min={-20}
              max={50}
              required
            />
            <NumberInput
              label="Minimum Temperature"
              description="Minimum temperature in °C"
              value={minTemp}
              onChange={handleNumberInput(setMinTemp)}
              min={-20}
              max={50}
              required
            />
            <NumberInput
              label="Humidity"
              description="Relative humidity in %"
              value={humidity}
              onChange={handleNumberInput(setHumidity)}
              min={0}
              max={100}
              required
            />
            <NumberInput
              label="Rainfall"
              description="Amount in mm"
              value={rainfall}
              onChange={handleNumberInput(setRainfall)}
              min={0}
              required
            />
            <NumberInput
              label="Wind Speed"
              description="Speed in m/s"
              value={windSpeed}
              onChange={handleNumberInput(setWindSpeed)}
              min={0}
              required
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step
          label="Agricultural Practices"
          description="Farming methods and inputs"
          icon={<IconSeeding size="1.1rem" />}
        >
          <Stack mt="md">            <NumberInput
              label="Area"
              description="Field size in hectares"
              value={area}
              onChange={handleNumberInput(setArea)}
              min={0}
              required
            />
            <Select
              label="Irrigation Method"
              placeholder="Choose irrigation method"
              data={irrigationMethods}
              value={irrigationMethod}
              onChange={setIrrigationMethod}
              required
            />
            <Select
              label="Fertilizer Type"
              placeholder="Choose fertilizer type"
              data={fertilizerTypes}
              value={fertilizerType}
              onChange={setFertilizerType}
              required
            />
            <NumberInput
              label="Fertilizer Amount"
              description="Amount in kg"
              value={fertilizerAmount}
              onChange={handleNumberInput(setFertilizerAmount)}
              min={0}
              required
            />
            <NumberInput
              label="Pesticide Amount"
              description="Amount in kg"
              value={pesticideAmount}
              onChange={handleNumberInput(setPesticideAmount)}
              min={0}
              required
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step
          label="Seasonal Planning"
          description="Growing seasons"
          icon={<IconCalendar size="1.1rem" />}
        >
          <Stack mt="md">
            <Select
              label="Planting Season"
              placeholder="Choose planting season"
              data={seasons}
              value={plantingSeason}
              onChange={setPlantingSeason}
              required
            />
            <Select
              label="Growing Season"
              placeholder="Choose growing season"
              data={seasons}
              value={growingSeason}
              onChange={setGrowingSeason}
              required
            />
            <Select
              label="Harvest Season"
              placeholder="Choose harvest season"
              data={seasons}
              value={harvestSeason}
              onChange={setHarvestSeason}
              required
            />
          </Stack>
        </Stepper.Step>
      </Stepper>

      <Group justify="flex-end" mt="xl">
        {activeStep > 0 && (
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
        )}
        {activeStep < 4 ? (
          <Button onClick={nextStep}>Next</Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            loading={loading}
            leftSection={<IconChartLine size="1rem" />}
            color="blue"
          >
            Generate Forecast
          </Button>
        )}
      </Group>
    </Box>
  );
}
