'use client';

import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Button,
  Group,
  Stack,
  Card,
  Badge,
  Tabs,
  Grid,
  Select,
  Box,
  Alert,
  ThemeIcon,
  List
} from '@mantine/core';
import { 
  IconPlant2,
  IconSun,
  IconCloud,
  IconLeaf,
  IconArrowRight,
  IconAlertCircle,
  IconRotate
} from '@tabler/icons-react';

// Mock data for seasons and crops
const seasons = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' }
];

// Sample recommended crops by season
const seasonalCrops = {
  spring: [
    {
      name: 'Wheat',
      confidence: 95,
      reasons: [
        'Optimal planting time for spring wheat',
        'Good resistance to late frost',
        'High market demand expected'
      ],
      growthPeriod: '90-120 days',
      waterNeeds: 'Moderate',
      profitPotential: 'High'
    },
    {
      name: 'Peas',
      confidence: 88,
      reasons: [
        'Excellent nitrogen fixation for soil',
        'Short growing season',
        'Low maintenance crop'
      ],
      growthPeriod: '60-70 days',
      waterNeeds: 'Low to Moderate',
      profitPotential: 'Medium'
    }
  ],
  summer: [
    {
      name: 'Corn',
      confidence: 92,
      reasons: [
        'Peak growing season for corn',
        'Optimal temperature range',
        'Strong market prices'
      ],
      growthPeriod: '120-150 days',
      waterNeeds: 'High',
      profitPotential: 'High'
    },
    {
      name: 'Soybeans',
      confidence: 90,
      reasons: [
        'Ideal planting conditions',
        'Good rotation crop after wheat',
        'Strong export demand'
      ],
      growthPeriod: '100-120 days',
      waterNeeds: 'Moderate',
      profitPotential: 'High'
    }
  ],
  fall: [
    {
      name: 'Winter Wheat',
      confidence: 94,
      reasons: [
        'Perfect timing for winter wheat',
        'Good soil moisture conditions',
        'Extended growing season'
      ],
      growthPeriod: '180-270 days',
      waterNeeds: 'Low to Moderate',
      profitPotential: 'High'
    },
    {
      name: 'Cover Crops',
      confidence: 96,
      reasons: [
        'Soil protection during winter',
        'Improves soil structure',
        'Prevents nutrient leaching'
      ],
      growthPeriod: 'Variable',
      waterNeeds: 'Low',
      profitPotential: 'Indirect'
    }
  ],
  winter: [
    {
      name: 'Greenhouse Vegetables',
      confidence: 85,
      reasons: [
        'Protected environment',
        'High market value in winter',
        'Continuous income stream'
      ],
      growthPeriod: 'Variable',
      waterNeeds: 'Controlled',
      profitPotential: 'High'
    }
  ]
};

export default function SeasonalPlanningPage() {
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('recommendations');

  const seasonalRecommendations = selectedSeason ? seasonalCrops[selectedSeason as keyof typeof seasonalCrops] : [];

  const getCurrentSeason = (): string => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };

  React.useEffect(() => {
    if (!selectedSeason) {
      setSelectedSeason(getCurrentSeason());
    }
  }, []);

  return (
    <Container size="xl" py="lg">
      <Group justify="space-between" align="center" mb="xl">
        <Title order={3}>
          <Group gap="xs">
            <IconRotate size={24} stroke={1.5} />
            <Text>Seasonal Planning</Text>
          </Group>
        </Title>
      </Group>

      <Paper withBorder p="md" radius="md" mb="xl">
        <Stack>
          <Group>
            <Select
              label="Select Season"
              placeholder="Choose a season for crop recommendations"
              data={seasons}
              value={selectedSeason}
              onChange={setSelectedSeason}
              style={{ minWidth: 200 }}
            />
          </Group>
          
          <Alert icon={<IconAlertCircle size="1rem" />} color="blue">
            Recommendations are based on seasonal patterns, weather forecasts, and crop rotation best practices.
          </Alert>
        </Stack>
      </Paper>

      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="md" radius="md" mb="xl">
            <Title order={4} mb="md">Recommended Crops for {selectedSeason ? selectedSeason.charAt(0).toUpperCase() + selectedSeason.slice(1) : 'Current Season'}</Title>
            {seasonalRecommendations.map((crop, index) => (
              <Card key={index} withBorder shadow="sm" radius="md" mb="md">
                <Group position="apart" mb="xs">
                  <Text fw={500} size="lg">{crop.name}</Text>
                  <Badge 
                    color={crop.confidence >= 90 ? 'green' : 'blue'} 
                    variant="light"
                    size="lg"
                  >
                    {crop.confidence}% Match
                  </Badge>
                </Group>

                <Text size="sm" c="dimmed" mb="md">Why plant this crop?</Text>
                <List size="sm" spacing="xs" mb="md">
                  {crop.reasons.map((reason, idx) => (
                    <List.Item key={idx}>{reason}</List.Item>
                  ))}
                </List>

                <Grid>
                  <Grid.Col span={4}>
                    <Text size="sm" fw={500}>Growth Period:</Text>
                    <Text size="sm" c="dimmed">{crop.growthPeriod}</Text>
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Text size="sm" fw={500}>Water Needs:</Text>
                    <Text size="sm" c="dimmed">{crop.waterNeeds}</Text>
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Text size="sm" fw={500}>Profit Potential:</Text>
                    <Text size="sm" c="dimmed">{crop.profitPotential}</Text>
                  </Grid.Col>
                </Grid>

                <Group mt="md">
                  <Button variant="light" color="blue" fullWidth 
                    component="a" href="/dashboard/planning/calendar">
                    View Calendar
                  </Button>
                  <Button variant="light" color="green" fullWidth
                    component="a" href="/dashboard/crop-health">
                    Health Monitoring
                  </Button>
                </Group>
              </Card>
            ))}
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder shadow="sm" radius="md">
            <Title order={4} mb="md">Seasonal Overview</Title>
            <Stack spacing="md">
              <Group>
                <ThemeIcon color="green" size="lg" variant="light">
                  <IconSun size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="sm" fw={500}>Growing Conditions</Text>
                  <Text size="xs" c="dimmed">Optimal temperature and daylight</Text>
                </Box>
              </Group>

              <Group>
                <ThemeIcon color="blue" size="lg" variant="light">
                  <IconCloud size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="sm" fw={500}>Weather Forecast</Text>
                  <Text size="xs" c="dimmed">3-month precipitation outlook</Text>
                </Box>
              </Group>

              <Group>
                <ThemeIcon color="grape" size="lg" variant="light">
                  <IconLeaf size={20} />
                </ThemeIcon>
                <Box>
                  <Text size="sm" fw={500}>Rotation Benefits</Text>
                  <Text size="xs" c="dimmed">Improved soil health and yields</Text>
                </Box>
              </Group>
            </Stack>

            <Button 
              variant="light" 
              color="blue" 
              fullWidth 
              mt="xl"
              component="a"
              href="/dashboard/weather"
            >
              View Detailed Forecast
            </Button>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
