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
  Grid,
  ThemeIcon,
  Select,
  Box,
  Tabs,
  useMantineTheme,
  Timeline,
  List,
  ScrollArea,
  Tooltip,
  rem
} from '@mantine/core';
import { 
  IconCalendarStats, 
  IconSun, 
  IconCloud,
  IconSnowflake,
  IconLeaf,
  IconSeeding,
  IconScissors,
  IconPlant2,
  IconShovel,
  IconInfoCircle
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

// Define months for visualization
const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Define seasons (for visualization)
const seasons = [
  { name: 'Winter', months: [0, 1], icon: IconSnowflake, color: 'blue' },
  { name: 'Spring', months: [2, 3, 4], icon: IconLeaf, color: 'green' },
  { name: 'Summer', months: [5, 6, 7], icon: IconSun, color: 'yellow' },
  { name: 'Fall', months: [8, 9, 10], icon: IconCloud, color: 'orange' },
  { name: 'Winter', months: [11], icon: IconSnowflake, color: 'blue' }
];

// Crop data with planting and harvesting windows
const crops = [
  { 
    value: 'corn', 
    label: 'Corn',
    planting: { start: 3, end: 5 }, // April to June
    harvesting: { start: 8, end: 9 }, // September to October
    description: 'A staple grain crop that thrives in warm soil with full sun exposure.',
    growthDays: '60-100 days',
    seedDepth: '1-2 inches',
    rowSpacing: '30-36 inches',
    notes: 'Plant when soil temperatures reach 60°F. Requires consistent moisture during silking period.'
  },
  { 
    value: 'wheat', 
    label: 'Wheat',
    planting: { start: 8, end: 10 }, // September to November (winter wheat)
    harvesting: { start: 5, end: 6 }, // June to July
    description: 'A cereal grain that can be planted as winter or spring varieties.',
    growthDays: '180-240 days (winter), 90-120 days (spring)',
    seedDepth: '1-1.5 inches',
    rowSpacing: '6-7 inches',
    notes: 'Winter wheat is planted in fall and harvested early summer. Spring wheat is planted in spring and harvested late summer.'
  },
  { 
    value: 'soybeans', 
    label: 'Soybeans',
    planting: { start: 4, end: 5 }, // May to June
    harvesting: { start: 8, end: 10 }, // September to November
    description: 'A legume crop that fixes nitrogen in the soil and is harvested for its protein-rich beans.',
    growthDays: '80-120 days',
    seedDepth: '1-1.5 inches',
    rowSpacing: '15-30 inches',
    notes: 'Plant when soil temperatures reach 50-60°F. Benefits from inoculation with rhizobium bacteria.'
  },
  { 
    value: 'cotton', 
    label: 'Cotton',
    planting: { start: 3, end: 4 }, // April to May
    harvesting: { start: 7, end: 10 }, // August to November
    description: 'A fiber crop that requires a long, warm growing season.',
    growthDays: '150-180 days',
    seedDepth: '0.5-1.5 inches',
    rowSpacing: '30-40 inches',
    notes: 'Plant when soil temperatures reach 65°F. Requires consistent moisture during boll development.'
  },
  { 
    value: 'potatoes', 
    label: 'Potatoes',
    planting: { start: 2, end: 4 }, // March to May
    harvesting: { start: 6, end: 9 }, // July to October
    description: 'A tuberous crop that grows best in cool, well-drained soil.',
    growthDays: '90-120 days',
    seedDepth: '4-6 inches',
    rowSpacing: '30-36 inches',
    notes: 'Plant 2-3 weeks before last frost date. Hill soil around plants as they grow to prevent greening of tubers.'
  },
];

export default function CropCalendarPage() {
  const theme = useMantineTheme();
  const router = useRouter();
  
  const [selectedCrop, setSelectedCrop] = useState<string | null>('corn');
  const [cropDetails, setCropDetails] = useState<any>(crops[0]);
  const [activeTab, setActiveTab] = useState<string | null>('calendar');
  
  // Update crop details when selection changes
  useEffect(() => {
    if (selectedCrop) {
      const selected = crops.find(crop => crop.value === selectedCrop);
      if (selected) {
        setCropDetails(selected);
      }
    }
  }, [selectedCrop]);
  
  // Function to render the calendar visualization
  const renderCalendar = () => {
    if (!cropDetails) return null;
    
    // Use the base planting and harvesting windows
    const plantingWindow = cropDetails.planting;
    const harvestingWindow = cropDetails.harvesting;
    
    return (
      <Box mt="xl">
        <Text fw={500} mb="xs">Annual Growing Calendar</Text>
        <Paper withBorder p="xs" radius="md">
          <Box style={{ position: 'relative', height: '120px' }}>
            {/* Season backgrounds */}
            {seasons.map((season, i) => (
              <Box 
                key={`season-${i}`}
                style={{
                  position: 'absolute',
                  top: '0',
                  height: '100%',
                  left: `${season.months[0] * (100/12)}%`,
                  width: `${(season.months.length) * (100/12)}%`,
                  backgroundColor: theme.colors[season.color][1],
                  opacity: 0.4,
                  borderLeft: i > 0 ? `1px solid ${theme.colors.gray[3]}` : 'none',
                  borderRight: i < seasons.length - 1 ? `1px solid ${theme.colors.gray[3]}` : 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: '4px'
                }}
              >
                <ThemeIcon color={season.color} variant="light" size="sm" radius="xl">
                  <season.icon size={12} />
                </ThemeIcon>
              </Box>
            ))}
            
            {/* Month labels */}
            <Box style={{
              position: 'absolute',
              bottom: '0',
              width: '100%',
              display: 'flex',
              borderTop: `1px solid ${theme.colors.gray[3]}`
            }}>
              {months.map((month, i) => (
                <Box 
                  key={`month-${i}`}
                  style={{
                    width: `${100/12}%`,
                    textAlign: 'center',
                    padding: '4px 0',
                    borderRight: i < months.length - 1 ? `1px solid ${theme.colors.gray[2]}` : 'none',
                    fontSize: theme.fontSizes.xs
                  }}
                >
                  {month}
                </Box>
              ))}
            </Box>
            
            {/* Planting window */}
            <Box style={{
              position: 'absolute',
              top: '40px',
              height: '20px',
              left: `${plantingWindow.start * (100/12)}%`,
              width: `${(plantingWindow.end - plantingWindow.start + 1) * (100/12)}%`,
              backgroundColor: theme.colors.green[6],
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.white,
              fontSize: theme.fontSizes.xs,
              fontWeight: 500,
            }}>
              <IconSeeding size={12} style={{ marginRight: '4px' }}/>
              Planting
            </Box>
            
            {/* Growing period */}
            <Box style={{
              position: 'absolute',
              top: '65px',
              height: '4px',
              left: `${plantingWindow.end * (100/12)}%`,
              width: `${(harvestingWindow.start - plantingWindow.end) * (100/12)}%`,
              backgroundColor: theme.colors.blue[5],
              borderRadius: '2px',
            }} />
            
            {/* Harvesting window */}
            <Box style={{
              position: 'absolute',
              top: '70px',
              height: '20px',
              left: `${harvestingWindow.start * (100/12)}%`,
              width: `${(harvestingWindow.end - harvestingWindow.start + 1) * (100/12)}%`,
              backgroundColor: theme.colors.yellow[6],
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.black,
              fontSize: theme.fontSizes.xs,
              fontWeight: 500,
            }}>
              <IconScissors size={12} style={{ marginRight: '4px' }}/>
              Harvesting
            </Box>
          </Box>
        </Paper>
        
        <Text size="xs" c="dimmed" ta="center" mt={5}>
          Note: Calendar shows general windows for the selected crop. Weather conditions and local climate may affect optimal timing.
        </Text>
      </Box>
    );
  };
  
  // Function to render the timeline for detailed planning
  const renderTimeline = () => {
    if (!cropDetails) return null;
    
    // Sample timeline events for crop
    const timelineEvents = [
      {
        title: 'Soil Preparation',
        description: `Prepare soil 2-3 weeks before planting. Till to a depth of 8-10 inches and incorporate any necessary amendments based on soil test results.`,
        icon: IconShovel,
        when: 'Pre-planting'
      },
      {
        title: 'Planting',
        description: `Plant ${cropDetails.label} seeds at a depth of ${cropDetails.seedDepth} with row spacing of ${cropDetails.rowSpacing}.`,
        icon: IconSeeding,
        when: months[cropDetails.planting.start] + ' - ' + months[cropDetails.planting.end]
      },
      {
        title: 'Growing Season Care',
        description: 'Monitor for pests, diseases, and moisture levels throughout the growing season. Apply fertilizer as needed.',
        icon: IconPlant2,
        when: 'Growing Season'
      },
      {
        title: 'Harvesting',
        description: `Harvest when crops are mature. Expected growth period is ${cropDetails.growthDays}.`,
        icon: IconScissors,
        when: months[cropDetails.harvesting.start] + ' - ' + months[cropDetails.harvesting.end]
      }
    ];
    
    return (
      <Box mt="xl">
        <Text fw={500} mb="md">Growing Timeline</Text>
        <Paper p="md" radius="md" withBorder>
          <Timeline active={1} bulletSize={24} lineWidth={2}>
            {timelineEvents.map((event, index) => (
              <Timeline.Item 
                key={index} 
                bullet={<event.icon size={12} />} 
                title={event.title}
              >
                <Text size="sm" c="dimmed">{event.when}</Text>
                <Text size="sm" mt={4}>{event.description}</Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </Paper>
      </Box>
    );
  };
  
  // Render crop details section
  const renderCropDetails = () => {
    if (!cropDetails) return null;
    
    return (
      <Box mt="xl">
        <Text fw={500} mb="md">Crop Details</Text>
        <Paper p="md" radius="md" withBorder>
          <Text size="md" mb="xs" fw={500}>{cropDetails.label}</Text>
          <Text size="sm" mb="md">{cropDetails.description}</Text>
          
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs" mb="md">
            <Box>
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">Growth Period</Text>
              <Text size="sm">{cropDetails.growthDays}</Text>
            </Box>
            <Box>
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">Seed Depth</Text>
              <Text size="sm">{cropDetails.seedDepth}</Text>
            </Box>
            <Box>
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">Row Spacing</Text>
              <Text size="sm">{cropDetails.rowSpacing}</Text>
            </Box>
          </SimpleGrid>
          
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">Additional Notes</Text>
          <Text size="sm">{cropDetails.notes}</Text>
        </Paper>
      </Box>
    );
  };
  
  return (
    <Container fluid>
      <Paper p="xl" radius="md" mb="xl" style={{ backgroundColor: theme.colors.dark[7] }}>
        <Title order={2} mb="xs">Crop Calendar</Title>
        <Text>Plan your growing season with detailed planting and harvesting timelines for each crop.</Text>
      </Paper>
      
      <Grid>
        <Grid.Col span={12}>
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
              <Box>
                <Text fw={500} mb="xs">Select a Crop</Text>
                <Select
                  data={crops.map(crop => ({ value: crop.value, label: crop.label }))}
                  value={selectedCrop}
                  onChange={setSelectedCrop}
                  searchable
                  clearable={false}
                  style={{ width: '200px' }}
                />
              </Box>
              <Box>
                <Tabs value={activeTab} onChange={setActiveTab}>
                  <Tabs.List>
                    <Tabs.Tab value="calendar" leftSection={<IconCalendarStats size={14} />}>Calendar</Tabs.Tab>
                    <Tabs.Tab value="timeline" leftSection={<IconCalendarStats size={14} />}>Timeline</Tabs.Tab>
                    <Tabs.Tab value="details" leftSection={<IconInfoCircle size={14} />}>Details</Tabs.Tab>
                  </Tabs.List>
                </Tabs>
              </Box>
            </Group>
            
            {activeTab === 'calendar' && renderCalendar()}
            {activeTab === 'timeline' && renderTimeline()}
            {activeTab === 'details' && renderCropDetails()}
          </Paper>
        </Grid.Col>
      </Grid>
      
      <Paper withBorder p="md" radius="md" mt="xl">
        <Title order={4} mb="md">Upcoming Tasks</Title>
        <Timeline active={0} bulletSize={24} lineWidth={2}>
          <Timeline.Item 
            title="Corn Harvest" 
            bullet={<IconScissors size={12} />}
          >
            <Text size="sm" c="dimmed">September 15, 2023</Text>
            <Text size="sm">Harvest mature corn crop.</Text>
            <Badge mt="xs" color="red">High Priority</Badge>
          </Timeline.Item>
          <Timeline.Item 
            title="Soil Testing" 
            bullet={<IconShovel size={12} />}
          >
            <Text size="sm" c="dimmed">September 18, 2023</Text>
            <Text size="sm">Conduct post-harvest soil analysis to plan for next season.</Text>
            <Badge mt="xs" color="orange">Medium Priority</Badge>
          </Timeline.Item>
          <Timeline.Item 
            title="Irrigation Maintenance" 
            bullet={<IconCloud size={12} />}
          >
            <Text size="sm" c="dimmed">September 25, 2023</Text>
            <Text size="sm">Clean and prepare irrigation system for storage.</Text>
            <Badge mt="xs" color="blue">Low Priority</Badge>
          </Timeline.Item>
        </Timeline>
      </Paper>
    </Container>
  );
} 