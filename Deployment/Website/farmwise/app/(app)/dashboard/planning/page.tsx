'use client';
import React, { useState } from 'react';
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
  Anchor,
  Box,
  Tabs,
  RingProgress,
  Stack,
  useMantineTheme,
  Image,
  List
} from '@mantine/core';
import { 
  IconCalendarStats, 
  IconRotate, 
  IconPlant2, 
  IconChartBar, 
  IconSun, 
  IconCloudRain,
  IconPlus,
  IconArrowRight,
  IconLeaf,
  IconSeeding
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock data for upcoming events
const upcomingEvents = [
  { id: 1, title: 'Plant Corn - Field A', date: '2024-06-10', type: 'planting', status: 'scheduled' },
  { id: 2, title: 'Fertilize Wheat - Field B', date: '2024-06-12', type: 'fertilization', status: 'pending' },
  { id: 3, title: 'Harvest Soybeans - Field C', date: '2024-06-15', type: 'harvesting', status: 'scheduled' },
];

// Mock data for recommended crops
const recommendedCrops = [
  { 
    id: 1, 
    name: 'Winter Wheat', 
    field: 'Field A', 
    confidence: 92, 
    reasons: ['Soil conditions optimal', 'Previous crop compatibility', 'Market forecast positive'],
    image: '/images/crops/wheat.jpg'
  },
  { 
    id: 2, 
    name: 'Soybeans', 
    field: 'Field B', 
    confidence: 87, 
    reasons: ['Nitrogen fixation benefit', 'Rotation sequence optimal', 'Disease pressure low'],
    image: '/images/crops/soybeans.jpg'
  },
  { 
    id: 3, 
    name: 'Cover Crop - Clover', 
    field: 'Field C', 
    confidence: 94, 
    reasons: ['Soil health improvement', 'Erosion control needed', 'Nitrogen fixation'],
    image: '/images/crops/clover.jpg'
  },
];

// Mock data for rotation health
const rotationHealth = [
  { field: 'Field A', score: 85, status: 'good' },
  { field: 'Field B', score: 92, status: 'excellent' },
  { field: 'Field C', score: 68, status: 'needs attention' },
  { field: 'Field D', score: 78, status: 'good' },
];

export default function PlanningPage() {
  const theme = useMantineTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Helper function to get color based on status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'scheduled': return 'blue';
      case 'pending': return 'yellow';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  // Helper function to get color based on event type
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'planting': return 'green';
      case 'harvesting': return 'orange';
      case 'fertilization': return 'violet';
      case 'irrigation': return 'blue';
      case 'scouting': return 'cyan';
      default: return 'gray';
    }
  };

  // Helper function to get color based on rotation health status
  const getHealthColor = (status: string) => {
    switch(status) {
      case 'excellent': return theme.colors.green[6];
      case 'good': return theme.colors.blue[6];
      case 'needs attention': return theme.colors.yellow[6];
      case 'poor': return theme.colors.red[6];
      default: return theme.colors.gray[6];
    }
  };

  return (
    <Container fluid>
      <Group justify="space-between" mb="lg">
        <Title order={2} fw={700}>
          <Group gap="xs">
            <IconCalendarStats size={28} stroke={1.5} />
            <Text>Farm Planning Hub</Text>
          </Group>
        </Title>
      </Group>

      <Tabs value={activeTab} onChange={(value) => value && setActiveTab(value)} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconChartBar size="0.8rem" />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="recommendations" leftSection={<IconLeaf size="0.8rem" />}>
            Crop Recommendations
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <Grid gutter="md">
            {/* Main planning navigation cards */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Card shadow="sm" padding="lg" radius="md" withBorder component={Link} href="/dashboard/planning/calendar" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Group justify="space-between" mb="md">
                    <ThemeIcon size="xl" radius="md" color="blue" variant="light">
                      <IconCalendarStats size={28} stroke={1.5} />
                    </ThemeIcon>
                    <Badge color="blue" variant="light">Enhanced</Badge>
                  </Group>
                  <Text fw={500} size="lg" mb="xs">Farm Calendar</Text>
                  <Text size="sm" c="dimmed" mb="md">
                    Plan and visualize all farm activities with our enhanced calendar. Track planting, harvesting, and maintenance schedules.
                  </Text>
                  <Button variant="light" color="blue" fullWidth mt="md" rightSection={<IconArrowRight size={16} />}>
                    Open Calendar
                  </Button>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder component={Link} href="/dashboard/planning/rotation" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Group justify="space-between" mb="md">
                    <ThemeIcon size="xl" radius="md" color="green" variant="light">
                      <IconRotate size={28} stroke={1.5} />
                    </ThemeIcon>
                    <Badge color="green" variant="light">Redesigned</Badge>
                  </Group>
                  <Text fw={500} size="lg" mb="xs">Crop Rotation</Text>
                  <Text size="sm" c="dimmed" mb="md">
                    Optimize your crop rotation strategy to improve soil health, reduce pests, and increase yields over time.
                  </Text>
                  <Button variant="light" color="green" fullWidth mt="md" rightSection={<IconArrowRight size={16} />}>
                    Manage Rotations
                  </Button>
                </Card>
              </SimpleGrid>

              {/* Weather and soil conditions card */}
              <Paper withBorder p="md" radius="md" mt="md">
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>Environmental Conditions</Text>
                  <Anchor size="sm" href="/dashboard/weather">View Details</Anchor>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                  <Card p="sm" withBorder radius="md">
                    <Group>
                      <ThemeIcon color="cyan" variant="light" size="lg" radius="md">
                        <IconSun size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size="xs" c="dimmed">Current Weather</Text>
                        <Text fw={500}>Sunny, 75°F</Text>
                      </div>
                    </Group>
                  </Card>
                  <Card p="sm" withBorder radius="md">
                    <Group>
                      <ThemeIcon color="blue" variant="light" size="lg" radius="md">
                        <IconCloudRain size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size="xs" c="dimmed">Precipitation Forecast</Text>
                        <Text fw={500}>0.5" in next 7 days</Text>
                      </div>
                    </Group>
                  </Card>
                  <Card p="sm" withBorder radius="md">
                    <Group>
                      <ThemeIcon color="orange" variant="light" size="lg" radius="md">
                        <IconSeeding size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size="xs" c="dimmed">Soil Temperature</Text>
                        <Text fw={500}>62°F at 4" depth</Text>
                      </div>
                    </Group>
                  </Card>
                </SimpleGrid>
              </Paper>
            </Grid.Col>

            {/* Sidebar with upcoming events */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Text fw={500}>Upcoming Events</Text>
                  <Button 
                    variant="light" 
                    size="xs"
                    leftSection={<IconPlus size={14} />}
                    onClick={() => router.push('/dashboard/planning/calendar')}
                  >
                    Add
                  </Button>
                </Group>
                <Stack gap="sm">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} withBorder padding="sm" radius="sm">
                      <Group justify="space-between" wrap="nowrap">
                        <div>
                          <Text size="sm" fw={500}>{event.title}</Text>
                          <Text size="xs" c="dimmed">{new Date(event.date).toLocaleDateString()}</Text>
                        </div>
                        <Group gap="xs">
                          <Badge color={getTypeColor(event.type)} variant="light" size="sm">
                            {event.type}
                          </Badge>
                          <Badge color={getStatusColor(event.status)} size="sm">
                            {event.status}
                          </Badge>
                        </Group>
                      </Group>
                    </Card>
                  ))}
                </Stack>
                <Button variant="default" fullWidth mt="md" onClick={() => router.push('/dashboard/planning/calendar')}>
                  View All Events
                </Button>
              </Card>

              {/* Rotation Health Card */}
              <Card shadow="sm" padding="lg" radius="md" withBorder mt="md">
                <Group justify="space-between" mb="md">
                  <Text fw={500}>Rotation Health</Text>
                  <Anchor size="sm" href="/dashboard/planning/rotation">Details</Anchor>
                </Group>
                <Stack gap="sm">
                  {rotationHealth.map((field) => (
                    <Group key={field.field} justify="space-between">
                      <Text size="sm">{field.field}</Text>
                      <Group gap="xs">
                        <RingProgress
                          size={30}
                          thickness={3}
                          roundCaps
                          sections={[{ value: field.score, color: getHealthColor(field.status) }]}
                          label={
                            <Text size="xs" ta="center">
                              {field.score}%
                            </Text>
                          }
                        />
                        <Badge 
                          color={field.status === 'excellent' ? 'green' : 
                                field.status === 'good' ? 'blue' : 
                                field.status === 'needs attention' ? 'yellow' : 'red'} 
                          size="sm"
                        >
                          {field.status}
                        </Badge>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="recommendations">
          <Paper withBorder p="md" radius="md" mb="lg">
            <Text fw={500} size="lg" mb="xs">AI-Powered Crop Recommendations</Text>
            <Text size="sm" c="dimmed" mb="md">
              Based on your soil conditions, weather patterns, and historical data, our AI recommends the following crops for optimal yield.
            </Text>
            
            <SimpleGrid cols={{ base: 1, sm: recommendedCrops.length }} spacing="md">
              {recommendedCrops.map((crop) => (
                <Card key={crop.id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section>
                    <Box style={{ height: 140, position: 'relative', overflow: 'hidden' }}>
                      <Image
                        src={crop.image}
                        alt={crop.name}
                        height={140}
                        style={{ objectFit: 'cover', width: '100%' }}
                      />
                      <Box 
                        style={{ 
                          position: 'absolute', 
                          top: 10, 
                          right: 10, 
                          background: 'rgba(0,0,0,0.6)', 
                          borderRadius: '50%',
                          width: 40,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Text c="white" fw={700} ta="center">{crop.confidence}%</Text>
                      </Box>
                    </Box>
                  </Card.Section>
                  
                  <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>{crop.name}</Text>
                    <Badge color="green">{crop.field}</Badge>
                  </Group>
                  
                  <Text size="sm" c="dimmed" mb="md">Recommendation reasons:</Text>
                  <List size="sm">
                    {crop.reasons.map((reason, index) => (
                      <List.Item key={index}>{reason}</List.Item>
                    ))}
                  </List>
                  
                  <Button variant="light" color="green" fullWidth mt="md">
                    View Details
                  </Button>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
