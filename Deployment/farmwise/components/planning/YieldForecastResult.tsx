'use client';

import React from 'react';
import {
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Card,
  ThemeIcon,
  RingProgress,
  Stack,
  Grid,
  Box,
  SimpleGrid,
} from '@mantine/core';
import {
  IconSun,
  IconCloudRain,
  IconSeeding,
  IconPlant2,
  IconInfoCircle,
  IconArrowUp,
  IconArrowDown,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface YieldForecastResultProps {
  result: {
    yield: number;
    confidenceScore: number;
    units: string;
    historicalComparison: {
      previousYield: number;
      percentChange: number;
    };
  };
  parameters: {
    crop: string;
    soilMoisture: number;
    fertilizerRate: number;
    pestPressure: number;
  };
}

export function YieldForecastResult({ result, parameters }: YieldForecastResultProps) {
  const router = useRouter();

  const getYieldComparisonText = () => {
    if (!result.historicalComparison) return null;

    const { percentChange } = result.historicalComparison;
    
    if (percentChange > 0) {
      return (
        <Group gap="xs">
          <IconArrowUp color="var(--mantine-color-green-6)" size="1rem" />
          <Text c="green.7" fw={500}>{percentChange}% increase from last year</Text>
        </Group>
      );
    } else {
      return (
        <Group gap="xs">
          <IconArrowDown color="var(--mantine-color-red-6)" size="1rem" />
          <Text c="red.7" fw={500}>{Math.abs(Number(percentChange))}% decrease from last year</Text>
        </Group>
      );
    }
  };

  return (
    <Stack gap="lg">
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Card withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">Predicted Yield</Text>
              <Tooltip label="Based on selected parameters and historical data">
                <ThemeIcon radius="xl" size="sm" variant="light" color="gray">
                  <IconInfoCircle size="1rem" />
                </ThemeIcon>
              </Tooltip>
            </Group>
            <Group justify="space-between" align="flex-end">
              <div>
                <Text size="xl" fw={700} style={{ lineHeight: 1 }}>
                  {result.yield}
                </Text>
                <Text size="sm" c="dimmed">{result.units}</Text>
              </div>
              {getYieldComparisonText()}
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Card withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">Confidence Score</Text>
              <Tooltip label="Higher score means more reliable prediction">
                <ThemeIcon radius="xl" size="sm" variant="light" color="gray">
                  <IconInfoCircle size="1rem" />
                </ThemeIcon>
              </Tooltip>
            </Group>
            <RingProgress
              sections={[
                { value: result.confidenceScore, color: result.confidenceScore > 85 ? 'green' : 'blue' },
              ]}
              label={
                <Text ta="center" size="xl" fw={700}>
                  {result.confidenceScore}%
                </Text>
              }
              size={120}
              thickness={12}
            />
          </Card>
        </Grid.Col>
      </Grid>

      <Card withBorder>
        <Title order={5} mb="md">Key Influencing Factors</Title>
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
            <ThemeIcon 
              color={parameters.soilMoisture > 30 && parameters.soilMoisture < 70 ? "green" : "yellow"} 
              variant="light" 
              size="lg" 
              radius="md"
            >
              <IconCloudRain size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Soil Moisture</Text>
              <Text fw={500}>{parameters.soilMoisture > 30 && parameters.soilMoisture < 70 ? "Optimal" : "Suboptimal"}</Text>
            </div>
          </Group>
          
          <Group>
            <ThemeIcon 
              color={Number(parameters.fertilizerRate) > 100 ? "green" : "yellow"} 
              variant="light" 
              size="lg" 
              radius="md"
            >
              <IconSeeding size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Nutrition</Text>
              <Text fw={500}>{Number(parameters.fertilizerRate) > 100 ? "Well Fertilized" : "Needs Attention"}</Text>
            </div>
          </Group>
          
          <Group>
            <ThemeIcon 
              color={parameters.pestPressure < 40 ? "green" : "orange"} 
              variant="light" 
              size="lg" 
              radius="md"
            >
              <IconPlant2 size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Plant Health</Text>
              <Text fw={500}>{parameters.pestPressure < 40 ? "Good" : "Fair"}</Text>
            </div>
          </Group>
        </SimpleGrid>
      </Card>
    </Stack>
  );
}
