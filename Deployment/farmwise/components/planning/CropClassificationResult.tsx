'use client';

import React from 'react';
import {
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Grid,
  Card,
  ThemeIcon,
  RingProgress,
  Stack,
  Button,
  Alert,
  List,
  Box,
} from '@mantine/core';
import { 
  IconPlant2, 
  IconTemperature, 
  IconDroplet, 
  IconMoonStars,
  IconSun, 
  IconAlertCircle,
  IconChartBar,
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconMapPin
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface CropRecommendation {
  name: string;
  description?: string;
}

interface CropClassificationResultProps {
  result: {
    id: number;
    recommended_crop: CropRecommendation;
    confidence_score: number;
    soil_n: number;
    soil_p: number;
    soil_k: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
    area: number;
    fertilizer_amount: number;
    pesticide_amount: number;
    irrigation: string;
    fertilizer_type: string;
    planting_season: string;
    growing_season: string;
    harvest_season: string;
    created_at?: string;
    governorate?: string;
    district?: string;
  };
}

export function CropClassificationResult({ result }: CropClassificationResultProps) {
  const router = useRouter();

  const statusColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 75) return 'blue';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  return (
    <Stack gap="lg">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between" mb="xl">
          <Stack gap="xs">
            <Title order={3}>{result.recommended_crop.name}</Title>
            <Text c="dimmed" size="sm">
              Analysis performed on {new Date(result.created_at || new Date()).toLocaleDateString()}
            </Text>
            {(result.governorate || result.district) && (
              <Group>
                <ThemeIcon color="gray" variant="light" size="sm">
                  <IconMapPin size={14} />
                </ThemeIcon>
                <Text size="sm" c="dimmed">
                  {[result.district, result.governorate].filter(Boolean).join(', ')}
                </Text>
              </Group>
            )}
          </Stack>
          
          <RingProgress
            size={120}
            thickness={12}
            roundCaps
            sections={[{ value: result.confidence_score, color: statusColor(result.confidence_score) }]}
            label={
              <Box ta="center">
                <ThemeIcon size="xl" radius="xl" color={statusColor(result.confidence_score)} variant="light">
                  <IconCheck size={22} />
                </ThemeIcon>
                <Text ta="center" size="xs" mt={5}>
                  {result.confidence_score}% Match
                </Text>
              </Box>
            }
          />
        </Group>

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder>
              <Title order={5} mb="md">Environmental Conditions</Title>
              <Stack gap="md">
                <Group>
                  <ThemeIcon color="blue" variant="light">
                    <IconTemperature size={16} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" fw={500}>Temperature</Text>
                    <Text size="sm">{result.temperature}°C</Text>
                  </div>
                </Group>
                <Group>
                  <ThemeIcon color="cyan" variant="light">
                    <IconDroplet size={16} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" fw={500}>Humidity & Rainfall</Text>
                    <Text size="sm">{result.humidity}% humidity, {result.rainfall}mm rainfall</Text>
                  </div>
                </Group>
                <Group>
                  <ThemeIcon color="orange" variant="light">
                    <IconSun size={16} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" fw={500}>Seasonal Pattern</Text>
                    <Text size="sm" tt="capitalize">
                      Planting: {result.planting_season}, Growing: {result.growing_season}, Harvest: {result.harvest_season}
                    </Text>
                  </div>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder>
              <Title order={5} mb="md">Soil Analysis</Title>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Nitrogen (N)</Text>
                  <Badge>{result.soil_n} kg/ha</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Phosphorus (P)</Text>
                  <Badge>{result.soil_p} kg/ha</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Potassium (K)</Text>
                  <Badge>{result.soil_k} kg/ha</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" fw={500}>pH Level</Text>
                  <Badge>{result.ph}</Badge>
                </Group>
              </Stack>
            </Card>

            <Card withBorder mt="md">
              <Title order={5} mb="md">Agricultural Practices</Title>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Irrigation Method</Text>
                  <Badge variant="light">{result.irrigation}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Fertilizer Type</Text>
                  <Badge variant="light">{result.fertilizer_type}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Field Area</Text>
                  <Badge>{result.area} ha</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Fertilizer Amount</Text>
                  <Badge>{result.fertilizer_amount} kg</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" fw={500}>Pesticide Amount</Text>
                  <Badge>{result.pesticide_amount} kg</Badge>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        <Group justify="center" mt="xl">
          <Button
            variant="light"
            color="green"
            leftSection={<IconCalendar size={16} />}
            onClick={() => router.push('/dashboard/planning/calendar')}
          >
            Add to Planting Calendar
          </Button>
          <Button
            variant="light"
            color="blue"
            leftSection={<IconPlant2 size={16} />}
            onClick={() => router.push('/dashboard/planning/rotation')}
          >
            Add to Crop Rotation
          </Button>
        </Group>
      </Paper>
    </Stack>
  );
}
