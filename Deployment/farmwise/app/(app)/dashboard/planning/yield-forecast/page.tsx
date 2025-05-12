'use client';

import React from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Group, 
  Paper, 
  Box,
  Stepper,
  Button
} from '@mantine/core';
import { IconChartBar } from '@tabler/icons-react';
import { YieldForecastForm } from '@/components/planning/YieldForecastForm';
import { YieldForecastResult } from '@/components/planning/YieldForecastResult';

export default function YieldForecastPage() {
  const [active, setActive] = React.useState(0);
  const [prediction, setPrediction] = React.useState<any>(null);
  const [parameters, setParameters] = React.useState<any>(null);
  
  const nextStep = () => setActive((current) => (current < 2 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleSuccess = (result: any, params: any) => {
    setPrediction(result);
    setParameters(params);
    nextStep();
  };
  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>
          <Group gap="xs">
            <IconChartBar size={30} stroke={1.5} />
            <Text>Yield Forecast</Text>
          </Group>
        </Title>
      </Group>

      <Paper withBorder shadow="md" p="xl" radius="md">
        <Stepper active={active} onStepClick={setActive}>
          <Stepper.Step
            label="Input Parameters"
            description="Enter crop and field data"
          >
            <Box mt="xl">
              <YieldForecastForm 
                onSuccess={(result, params) => handleSuccess(result, params)}
              />
            </Box>
          </Stepper.Step>

          <Stepper.Step
            label="Results"
            description="View forecast results"
          >
            <Box mt="xl">
              {prediction && parameters && (
                <YieldForecastResult 
                  result={prediction} 
                  parameters={parameters}
                />
              )}
              <Group justify="flex-start" mt="xl">
                <Button variant="default" onClick={prevStep}>
                  Back to Parameters
                </Button>
                <Button onClick={() => {
                  setPrediction(null);
                  setParameters(null);
                  setActive(0);
                }}>
                  New Forecast
                </Button>
              </Group>
            </Box>
          </Stepper.Step>
        </Stepper>
      </Paper>
    </Container>
  );
}