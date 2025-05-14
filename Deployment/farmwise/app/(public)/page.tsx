'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Title,
  Text,
  Button,
  Container,
  Group,
  SimpleGrid,
  Card,
  ThemeIcon,
  rem,
  List,
  Divider,
  Paper,
  Stepper,
  Blockquote,
  Center,
  BackgroundImage,
  Overlay,
  Grid,
  RingProgress,
  Progress,
  Badge,
  Box,
  ScrollArea,
  Flex,
  ActionIcon,
  HoverCard,
  Stack,
  Table,
  Tabs,
  Tooltip,
} from '@mantine/core';
import Link from 'next/link';
import Image from 'next/image';
import {
  // General & Recommendation Icons
  IconChartInfographic, // Replaced - was general, now specific? keep for now
  IconPlant2, // Crop Rec, Fertilizer, Disease, Soil
  IconTractor, // Yield Prediction
  IconDroplet, // Irrigation, Water Resource Mgt
  IconSun, // Weather (keep for widget)
  IconTestPipe, // Fertilizer, Soil Health
  IconRulerMeasure, // Satellite Analysis (Size)
  IconBulb, // How it Works (Optimize)
  IconWorld, // Satellite Analysis (General)
  IconChartLine, // Yield Prediction, Analytics

  // Disease & Plant Health Icons
  IconScan, // General Disease Detection
  IconBug, // Disease Identification
  IconVaccine, // Treatment Rec, Fertilizer
  IconZoomScan, // Weed Detection
  IconDeviceMobile, // Disease Detection (Widget visual)
  IconLeaf, // Disease Detection (Widget visual)
  IconAlertTriangle, // Disease Alert (Widget visual)
  IconShieldCheck, // Treatment Success (Widget visual)

  // Satellite Icons
  IconSatellite, // General Satellite
  // IconRulerMeasure already included
  // IconWorld already included

  // Process & UI Icons
  IconUpload, // How it Works
  IconBrain, // How it Works (AI Analysis)
  IconReportAnalytics, // How it Works (Insights)
  IconCheck, // Pricing, Success
  IconMessages, // Contact / Testimonials?
  IconListDetails, // Feature details
  IconQuote, // Testimonials

  // Weather Widget Icons (Keep as is)
  IconCloudRain,
  IconTemperature,
  IconWind,
  IconDropletFilled,
  IconArrowUp,
  IconArrowDown,

  // Social & Footer Icons (Keep as is)
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandLinkedin,

  // New/Refined Feature Icons from README
  IconMoneybag, // Farmer Segmentation (Financial)
  IconUsersGroup, // Farmer Segmentation (General)
  IconMapSearch, // Land Use Classification
  IconTimeline, // Performance Tracking / Yield Prediction Trends
  IconGauge, // Resource Optimization (General)
  IconEyeglass, // Environmental Monitoring
  IconPlant, // Vegetation Index
  IconTargetArrow, // Pesticide Guidance

} from '@tabler/icons-react';
import { AreaChart, PieChart, BarChart, DonutChart, LineChart } from '@mantine/charts';
import { motion, AnimatePresence } from 'framer-motion';
import classes from './HomePage.module.css';
// Removed: import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';

// --- Animation Variants ---
const sectionVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.1 },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const featureItemVariant = (i: number) => ({
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.15, // Slightly adjusted delay
            duration: 0.7,
            ease: [0.215, 0.61, 0.355, 1] // Keep ease for nice effect
        }
    }
});


const widgetVariant = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.3 }
  }
};

// --- Data Definitions ---

// Hero Carousel Images
const heroImages = [
  { src: '/federico-respini-sYffw0LNr7s-unsplash.jpg', alt: 'Farm field landscape' },
  { src: '/gozha-net-xDrxJCdedcI-unsplash.jpg', alt: 'Close up of crops' },
  { src: '/markus-spiske-vrbZVyX2k4I-unsplash.jpg', alt: 'Tractor in field' },
  { src: '/megan-thomas-xMh_ww8HN_Q-unsplash.jpg', alt: 'Farmer inspecting plants' },
  { src: '/phuc-long-aqrIcYonB-o-unsplash.jpg', alt: 'Drone view of farm' },
];

// --- Widget Specific Data (Reinstated) ---
const cropSuitabilityData = [
  { crop: 'Corn', suitability: 92, color: 'yellow.6', notes: 'Excellent soil compatibility, ideal rainfall' },
  { crop: 'Wheat', suitability: 78, color: 'yellow.4', notes: 'Good soil conditions, moderate temperature' },
  { crop: 'Soybeans', suitability: 85, color: 'green.5', notes: 'Suitable pH levels, good drainage' },
  { crop: 'Tomatoes', suitability: 65, color: 'red.6', notes: 'Fair, requires irrigation supplementation' },
  { crop: 'Cotton', suitability: 32, color: 'gray.5', notes: 'Poor, climate not suitable' },
];

const yieldChartData = [ // Renamed from chartData to avoid conflict with Mantine Chart props
  { date: 'Mar 22', YieldEst: 2890, AvgYield: 2200 },
  { date: 'Mar 23', YieldEst: 2756, AvgYield: 2100 },
  { date: 'Mar 24', YieldEst: 3322, AvgYield: 2300 },
  { date: 'Mar 25', YieldEst: 3470, AvgYield: 2450 },
  { date: 'Mar 26', YieldEst: 3129, AvgYield: 2500 },
];

const resourceData = {
  water: {
    current: 1240, // m³/hectare
    recommended: 980,
    savings: 21,
    forecast: [
      { week: 'Week 1', amount: 220 },
      { week: 'Week 2', amount: 260 },
      { week: 'Week 3', amount: 240 },
      { week: 'Week 4', amount: 260 },
    ]
  },
  fertilizer: {
    current: 295, // kg/hectare
    recommended: 240,
    savings: 19,
    forecast: [
      { nutrient: 'Nitrogen', current: 150, recommended: 120 },
      { nutrient: 'Phosphorus', current: 80, recommended: 70 },
      { nutrient: 'Potassium', current: 65, recommended: 50 },
    ]
  }
};

const weatherForecastData = [
  { date: 'Today', temp: 24, precipitation: 10, condition: 'Partly Cloudy', icon: IconSun },
  { date: 'Tomorrow', temp: 22, precipitation: 60, condition: 'Rain Showers', icon: IconCloudRain },
  { date: 'Wed', temp: 25, precipitation: 5, condition: 'Sunny', icon: IconSun },
  { date: 'Thu', temp: 27, precipitation: 0, condition: 'Sunny', icon: IconSun },
  { date: 'Fri', temp: 26, precipitation: 30, condition: 'Scattered Showers', icon: IconCloudRain },
  { date: 'Sat', temp: 23, precipitation: 70, condition: 'Rain', icon: IconCloudRain },
  { date: 'Sun', temp: 22, precipitation: 40, condition: 'Scattered Showers', icon: IconCloudRain },
];

// --- Features Data (Derived from README) ---
interface FeatureDetail {
  icon: React.FC<any>;
  text: string;
}

interface Feature {
  id: string; // Unique ID for key prop and potentially for widget selection
  icon: React.FC<any>;
  title: string;
  description: string;
  details?: FeatureDetail[]; // Optional for features without sub-details
  color?: string; // Optional color for theme icon
  widgetComponent?: React.FC; // Optional associated interactive widget
}

// --- Detailed Widget Components (Re-implemented & Adapted) ---

// 1. Recommendation Widgets
  const CropSuitabilityWidget = () => (
    <motion.div
      key="crop-suitability"
      initial="hidden" animate="visible" exit="exit" variants={widgetVariant}
    >
      <Paper withBorder p="md" radius="md" shadow="sm" style={{ borderLeft: `3px solid var(--mantine-color-farmGreen-6)` }}>
        <Group justify="space-between" mb="md">
          <Text size="sm" fw={500} c="dimmed">Crop Suitability Analysis</Text>
          <Badge color="farmGreen" variant="light">AI Powered</Badge>
        </Group>
        <Box>
          {cropSuitabilityData.map((crop) => (
            <HoverCard key={crop.crop} width={280} shadow="md" withArrow openDelay={200} closeDelay={100}>
              <HoverCard.Target>
                <Box mb="md">
                  <Group justify="space-between" mb={5}>
                    <Text size="sm">{crop.crop}</Text>
                    <Text size="sm" fw={500} c={crop.suitability > 70 ? "farmGreen" : crop.suitability > 50 ? "yellow" : "red"}>
                      {crop.suitability}%
                    </Text>
                  </Group>
                  <Progress
                    value={crop.suitability} color={crop.color} size="md" radius="xl"
                    animated={true} striped={true}
                  />
                </Box>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text size="sm">{crop.notes}</Text>
              </HoverCard.Dropdown>
            </HoverCard>
          ))}
        </Box>
      </Paper>
    </motion.div>
  );

  const YieldEstimationWidget = () => (
    <motion.div
      key="yield-estimation"
      initial="hidden" animate="visible" exit="exit" variants={widgetVariant}
    >
      <Paper withBorder p="md" radius="md" shadow="sm" style={{ borderLeft: `3px solid var(--mantine-color-farmGreen-6)` }}>
        <Text size="sm" fw={500} c="dimmed" mb="md">Yield Estimation (kg/ha)</Text>
        <Box mb="md">
          <LineChart
            h={120} data={yieldChartData} dataKey="date" withYAxis yAxisProps={{ width: 30 }} gridAxis="y"
            series={[
              { name: 'YieldEst', color: 'farmGreen.6', label: 'Estimated Yield' },
              { name: 'AvgYield', color: 'blue.5', label: 'Avg. Regional Yield' },
            ]}
            curveType="monotone"
            tooltipProps={{
              content: ({ label, payload }) => (
                  <Paper px="md" py="sm" withBorder shadow="md">
                    <Text fw={500} mb={5}>{label}</Text>
                    {payload?.map((item: any) => (
                      <Text key={item.name} c={item.color} fz="sm">
                        {item.payload.label}: {item.value} kg/ha
                      </Text>
                    ))}
                  </Paper>
              )
            }}
          />
        </Box>
        <Group justify="space-between" mb="xs"> {/* Reduced margin */}
          <Stack gap={0}>
            <Text size="sm" c="dimmed">Projected Yield</Text>
            <Group gap="xs"> <Text size="xl" fw={700}>3,215</Text> <Text size="xs" c="dimmed">kg/ha</Text> </Group>
          </Stack>
          <Badge color="green" size="lg" variant="light" leftSection={<IconArrowUp size={14} />}> +18% vs Avg </Badge>
          </Group>
      </Paper>
    </motion.div>
  );

  const ResourceUsageWidget = () => (
    <motion.div
      key="resource-usage"
      initial="hidden" animate="visible" exit="exit" variants={widgetVariant}
    >
      <Paper withBorder p="md" radius="md" shadow="sm" style={{ borderLeft: `3px solid var(--mantine-color-cyan-6)` }}>
        <Tabs defaultValue="water" variant="pills" radius="md">
          <Tabs.List grow mb="md">
            <Tabs.Tab value="water" leftSection={<IconDroplet size={16} />}>Water</Tabs.Tab>
            <Tabs.Tab value="fertilizer" leftSection={<IconTestPipe size={16} />}>Fertilizer</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="water">
            <Group justify="space-between" mb="md">
              <Stack gap={0}> <Text size="sm" c="dimmed">Current Usage</Text> <Group gap="xs"> <Text size="lg" fw={600}>{resourceData.water.current}</Text> <Text size="xs" c="dimmed">m³/ha</Text> </Group> </Stack>
              <Stack gap={0} align="flex-end"> <Text size="sm" c="dimmed">Recommended</Text> <Group gap="xs"> <Text size="lg" fw={600} c="cyan">{resourceData.water.recommended}</Text> <Text size="xs" c="dimmed">m³/ha</Text> </Group> </Stack>
                </Group>
            <Text size="sm" fw={500} c="dimmed" mb="xs">Weekly Distribution (m³)</Text>
            <Box mb="md">
              <BarChart h={100} data={resourceData.water.forecast} dataKey="week" series={[{ name: 'amount', color: 'cyan.6' }]} barProps={{ radius: 4 }} tickLine="x" withYAxis={false} gridAxis="none" />
            </Box>
             <Group align="center" gap="xs">
                <ThemeIcon radius="xl" size="sm" color="blue" variant="light"> <IconBulb size={14} /> </ThemeIcon>
                <Text size="xs" c="dimmed">Potential savings: {resourceData.water.savings}% following optimized schedule.</Text>
              </Group>
          </Tabs.Panel>

          <Tabs.Panel value="fertilizer">
            <Group justify="space-between" mb="md">
              <Stack gap={0}> <Text size="sm" c="dimmed">Current Usage</Text> <Group gap="xs"> <Text size="lg" fw={600}>{resourceData.fertilizer.current}</Text> <Text size="xs" c="dimmed">kg/ha</Text> </Group> </Stack>
              <Stack gap={0} align="flex-end"> <Text size="sm" c="dimmed">Recommended</Text> <Group gap="xs"> <Text size="lg" fw={600} c="green">{resourceData.fertilizer.recommended}</Text> <Text size="xs" c="dimmed">kg/ha</Text> </Group> </Stack>
                </Group>
            <Text size="sm" fw={500} c="dimmed" mb="xs">Nutrient Breakdown (kg/ha)</Text>
            <Box mb="md">
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Nutrient</Table.Th>
                    <Table.Th ta="right">Current</Table.Th>
                    <Table.Th ta="right">Recommended</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {resourceData.fertilizer.forecast.map((item) => (
                    <Table.Tr key={item.nutrient}>
                      <Table.Td>{item.nutrient}</Table.Td>
                      <Table.Td ta="right">{item.current}</Table.Td>
                      <Table.Td ta="right">{item.recommended}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
             <Group align="center" gap="xs">
                 <ThemeIcon radius="xl" size="sm" color="green" variant="light"> <IconBulb size={14} /> </ThemeIcon>
                <Text size="xs" c="dimmed">Optimize application for {resourceData.fertilizer.savings}% reduction.</Text>
              </Group>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </motion.div>
  );

const WeatherForecastWidget = () => (
      <motion.div
      key="weather-forecast"
      initial="hidden" animate="visible" exit="exit" variants={widgetVariant}
    >
      <Paper withBorder p="md" radius="md" shadow="sm" style={{ borderLeft: `3px solid var(--mantine-color-blue-6)` }}>
        <Text size="sm" fw={500} c="dimmed" mb="md" ta="center">7-Day Weather Forecast</Text>
        <ScrollArea>
          <Group gap="md" wrap="nowrap" mb="md">
            {weatherForecastData.map((day, index) => (
              <motion.div
                key={day.date} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <Paper withBorder p="sm" radius="md" w={80} shadow="xs" style={{ textAlign: 'center', backgroundColor: index === 0 ? 'var(--mantine-color-body)' : undefined }}>
                  <Text size="xs" fw={500} mb={5}>{day.date}</Text>
                  <Center mb={5}> <day.icon size={24} style={{ color: day.condition.includes('Rain') ? 'var(--mantine-color-blue-5)' : day.condition.includes('Sunny') ? 'var(--mantine-color-yellow-5)' : 'var(--mantine-color-gray-5)' }} /> </Center>
                  <Text size="lg" fw={600} lh={1.1}>{day.temp}°</Text>
                  {/* <Text size="xs" c="dimmed" mb={5}>{day.condition}</Text> */}
                  <Group justify="center" gap={3} mt={3}> <IconDroplet size={12} color="var(--mantine-color-blue-5)" /> <Text size="xs" c="dimmed">{day.precipitation}%</Text> </Group>
                </Paper>
              </motion.div>
            ))}
            </Group>
        </ScrollArea>
         <Group align="center" gap="xs" mt="sm">
             <ThemeIcon radius="xl" size="sm" color="blue" variant="light"> <IconMessages size={14} /> </ThemeIcon>
             <Text size="xs" c="dimmed">Rain expected mid-week. Consider delaying fertilizer application.</Text>
          </Group>
      </Paper>
    </motion.div>
  );

// Combined Recommendation Widget with Tabs
const RecommendationWidget: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string | null>('suitability');

    const renderWidget = () => {
        switch (activeTab) {
            case 'suitability': return <CropSuitabilityWidget />;
            case 'yield': return <YieldEstimationWidget />;
            case 'resources': return <ResourceUsageWidget />;
            case 'weather': return <WeatherForecastWidget />;
            default: return null;
        }
    };

    return (
        <Stack gap="lg">
             <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md">
                <Tabs.List grow>
                    <Tabs.Tab value="suitability" leftSection={<IconPlant2 size={16} />}>Suitability</Tabs.Tab>
                    <Tabs.Tab value="yield" leftSection={<IconTractor size={16} />}>Yield</Tabs.Tab>
                    <Tabs.Tab value="resources" leftSection={<IconGauge size={16} />}>Resources</Tabs.Tab>
                    <Tabs.Tab value="weather" leftSection={<IconSun size={16} />}>Weather</Tabs.Tab>
                </Tabs.List>
            </Tabs>
            <AnimatePresence mode="wait">
                {renderWidget()}
            </AnimatePresence>
        </Stack>
    );
};

// 2. Plant Health Widgets
const DiseaseIdentificationWidget = () => (
            <motion.div
      key="disease-identification"
      initial="hidden" animate="visible" exit="exit" variants={widgetVariant}
    >
      <Paper withBorder p="md" radius="md" shadow="sm" style={{ borderLeft: `3px solid var(--mantine-color-red-6)` }}>
        <Group justify="space-between" mb="md">
          <Text size="sm" fw={500} c="dimmed">Disease Identification</Text>
          <Badge color="red" variant="light">AI Powered</Badge>
        </Group>
        <Box style={{ position: 'relative', height: rem(180), overflow: 'hidden' }}>
            {/* Simplified Simulation: Phone scanning a leaf */}
            <Center style={{ height: '100%' }}>
            <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    style={{ position: 'relative' }}
                 >
                    <IconDeviceMobile size={80} stroke={1} color="var(--mantine-color-gray-5)" />
            <motion.div
                        style={{ position: 'absolute', top: '25%', left: '25%', color: 'var(--mantine-color-farmGreen-5)' }}
                        animate={{ color: ['var(--mantine-color-farmGreen-5)', 'var(--mantine-color-yellow-6)', 'var(--mantine-color-red-7)', 'var(--mantine-color-farmGreen-5)']}}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear"}}
                    >
                        <IconLeaf size={40} />
                    </motion.div>
                     {/* Scanning Line */}
                  <motion.div
                        style={{ position: 'absolute', top: '20%', left: '25%', width: '50%', height: '2px', background: 'var(--mantine-color-cyan-4)', boxShadow: '0 0 4px var(--mantine-color-cyan-3)', opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0], y: ['0%', '50%', '50%', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                     />
            </motion.div>
            </Center>
             {/* Result Badge */}
            <motion.div
                style={{ position: 'absolute', bottom: rem(10), left: 0, right: 0, textAlign: 'center', opacity: 0}}
                animate={{ opacity: [0, 0, 1, 1, 0] }}
                transition={{ repeat: Infinity, duration: 5, delay: 1, times: [0, 0.4, 0.5, 0.9, 1] }}
            >
                 <Badge color="red" variant="filled" size="lg" leftSection={<IconAlertTriangle size={14}/>}>Late Blight Detected</Badge>
              </motion.div>
        </Box>
         <Group align="center" gap="xs" mt="sm">
            <ThemeIcon radius="xl" size="sm" color="red" variant="light"> <IconBug size={14} /> </ThemeIcon>
            <Text size="xs" c="dimmed">Identifies 50+ crop diseases from images.</Text>
        </Group>
      </Paper>
            </motion.div>
  );

const TreatmentRecommendationsWidget = () => (
            <motion.div
      key="treatment-recommendations"
      initial="hidden" animate="visible" exit="exit" variants={widgetVariant}
    >
      <Paper withBorder p="md" radius="md" shadow="sm" style={{ borderLeft: `3px solid var(--mantine-color-green-6)` }}>
        <Group justify="space-between" mb="md">
          <Text size="sm" fw={500} c="dimmed">Treatment Recommendations</Text>
           <Badge color="green" variant="light">Actionable Advice</Badge>
        </Group>
         <Stack gap="md">
            {/* Example Diagnosis */}
            <Paper withBorder p="sm" radius="sm" bg="var(--mantine-color-red-light)">
                <Group justify="space-between">
                    <Group gap="xs"> <ThemeIcon color="red" variant="light" radius="sm" size="lg"><IconBug size={18}/></ThemeIcon> <Text fw={500} size="sm">Diagnosis: Late Blight</Text> </Group>
                    <Text size="sm" c="red" fw={600}>Severity: High</Text>
                 </Group>
            </Paper>
             {/* Recommended Treatments */}
            <Box>
                 <Text size="sm" fw={500} mb="xs">Recommended Actions:</Text>
                <Paper withBorder p="sm" radius="sm" mb="xs" style={{ borderLeft: `3px solid var(--mantine-color-blue-6)`}}>
                     <Group justify="space-between">
                        <Group gap="xs"> <ThemeIcon color="blue" variant="light" size="md" radius="xl"><IconVaccine size={16} /></ThemeIcon> <Text fw={500}>Fungicide</Text> </Group>
                        <Badge color="blue" variant="filled" size="sm">Primary</Badge>
                    </Group>
                    <Text size="xs" ml={34} c="dimmed">Apply copper-based fungicide spray.</Text>
                </Paper>
                <Paper withBorder p="sm" radius="sm" style={{ borderLeft: `3px solid var(--mantine-color-orange-6)`}}>
                     <Group justify="space-between">
                        <Group gap="xs"> <ThemeIcon color="orange" variant="light" size="md" radius="xl"><IconPlant2 size={16} /></ThemeIcon> <Text fw={500}>Pruning/Removal</Text> </Group>
                         <Badge color="orange" variant="light" size="sm">Secondary</Badge>
                    </Group>
                    <Text size="xs" ml={34} c="dimmed">Remove and destroy heavily infected plants/leaves.</Text>
                 </Paper>
             </Box>
         </Stack>
      </Paper>
              </motion.div>
  );

const WeedDetectionWidget = () => (
              <motion.div
      key="weed-detection"
      initial="hidden" animate="visible" exit="exit" variants={widgetVariant}
    >
      <Paper withBorder p="md" radius="md" shadow="sm" style={{ borderLeft: `3px solid var(--mantine-color-yellow-6)` }}>
         <Group justify="space-between" mb="md">
          <Text size="sm" fw={500} c="dimmed">Weed Detection</Text>
          <Badge color="yellow" variant="light">AI Powered</Badge>
        </Group>
         <Box style={{ position: 'relative', height: rem(180), overflow: 'hidden' }}>
             {/* Simplified Field View */}
             <Box style={{ height: '100%', background: 'var(--mantine-color-green-1)', borderRadius: rem(4), padding: rem(10) }}>
                 {/* Crop Rows */}
                 {Array(5).fill(0).map((_, r) => (
                     <Group key={r} mb="xs" gap="sm" wrap="nowrap">
                         {/* Crops */}
                         {Array(6).fill(0).map((_, c) => <Box key={`c-${r}-${c}`} h={15} w={15} style={{ borderRadius: '50%', background: 'var(--mantine-color-farmGreen-6)' }} />)}
                         {/* Random Weeds */}
                         {Math.random() > 0.6 && (
                             <motion.div
                                key={`w-${r}`}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 + Math.random(), duration: 0.5 }}
                             >
                                 <Tooltip label="Weed Detected" withArrow position="top">
                                     <Box h={18} w={18} style={{ borderRadius: '3px', background: 'var(--mantine-color-yellow-7)', border: '1px solid var(--mantine-color-yellow-9)'}} />
                                 </Tooltip>
            </motion.div>
                         )}
                     </Group>
                 ))}
                 {/* Scanning Overlay */}
              <motion.div
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 180, 255, 0.1)', border: '1px dashed var(--mantine-color-cyan-5)', opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                />
             </Box>
         </Box>
         <Group align="center" gap="xs" mt="sm">
            <ThemeIcon radius="xl" size="sm" color="yellow" variant="light"> <IconZoomScan size={14} /> </ThemeIcon>
            <Text size="xs" c="dimmed">Identifies common weeds for targeted action.</Text>
        </Group>
      </Paper>
              </motion.div>
  );


// Combined Plant Health Widget with Tabs
const PlantHealthWidget: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string | null>('disease');

    const renderWidget = () => {
        switch (activeTab) {
            case 'disease': return <DiseaseIdentificationWidget />;
            case 'treatment': return <TreatmentRecommendationsWidget />;
            case 'weeds': return <WeedDetectionWidget />;
            default: return null;
        }
    };

    return (
        <Stack gap="lg">
            <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md">
                <Tabs.List grow>
                    <Tabs.Tab value="disease" leftSection={<IconBug size={16} />} color="red">Disease ID</Tabs.Tab>
                    <Tabs.Tab value="treatment" leftSection={<IconVaccine size={16} />} color="green">Treatment</Tabs.Tab>
                    <Tabs.Tab value="weeds" leftSection={<IconZoomScan size={16} />} color="yellow">Weed ID</Tabs.Tab>
                </Tabs.List>
            </Tabs>
             <AnimatePresence mode="wait">
                {renderWidget()}
            </AnimatePresence>
        </Stack>
    );
};

// 3. Satellite Widget (Using the previous detailed implementation)
const SatelliteWidget: React.FC = () => {
    // Renamed SatelliteFarmInsightsWidget to SatelliteWidget internally
    const [housePositions, setHousePositions] = useState<{ top: string; left: string }[] | null>(null);
    const [analysisComplete, setAnalysisComplete] = useState(false);

    useEffect(() => {
      const positions = Array(15).fill(0).map(() => ({ top: `${10 + Math.random() * 80}%`, left: `${10 + Math.random() * 80}%` }));
      setHousePositions(positions);
      const timer = setTimeout(() => setAnalysisComplete(true), 5000);
      return () => clearTimeout(timer);
    }, []);

    return (
              <motion.div
        key="satellite-insights" initial="hidden" animate="visible" exit="exit" variants={widgetVariant}
      >
        <Paper withBorder p="md" radius="md" shadow="sm" style={{ borderLeft: `3px solid var(--mantine-color-blue-6)` }}>
          <Group justify="space-between" mb="md">
            <Group gap="xs">
               <ThemeIcon size="sm" variant="light" color="blue"><IconSatellite size={16} /></ThemeIcon>
               <Text size="sm" fw={500} c="dimmed">Satellite Analysis</Text>
                </Group>
            <Badge color="blue" variant="light">Automated</Badge>
          </Group>

          <Box style={{ position: 'relative', height: rem(200), overflow: 'hidden', background: 'var(--mantine-color-dark-8)', borderRadius: 'var(--mantine-radius-sm)', border: '1px solid var(--mantine-color-dark-6)' }}>
            {/* Simplified Visual Elements */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }} style={{ position: 'absolute', top: '5%', left: '5%', width: '35%', height: '30%', background: 'var(--mantine-color-farmGreen-8)', borderRadius: '4px' }}/>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.1 }} style={{ position: 'absolute', top: '5%', left: '42%', width: '15%', height: '18%', background: 'var(--mantine-color-yellow-8)', borderRadius: '4px' }}/>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.4 }} style={{ position: 'absolute', top: '38%', left: '5%', width: '35%', height: '25%', background: 'var(--mantine-color-farmGreen-7)', borderRadius: '4px' }}/>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.7 }} style={{ position: 'absolute', top: '66%', left: '5%', width: '35%', height: '28%', background: 'var(--mantine-color-farmGreen-9)', borderRadius: '4px' }}/>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 2.0 }} style={{ position: 'absolute', top: '5%', left: '60%', width: '8%', height: '90%', background: 'var(--mantine-color-dark-5)', transform: 'skewY(-20deg)', borderRadius: '2px' }}/>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 2.3 }} style={{ position: 'absolute', top: '5%', left: '70%', width: '25%', height: '20%', background: 'var(--mantine-color-yellow-7)', borderRadius: '4px' }}/>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 2.6 }} style={{ position: 'absolute', top: '28%', left: '70%', width: '25%', height: '35%', background: 'var(--mantine-color-farmGreen-6)', borderRadius: '4px' }}/>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 2.9 }} style={{ position: 'absolute', top: '66%', left: '70%', width: '25%', height: '28%', background: 'var(--mantine-color-dark-6)', borderRadius: '4px' }}>
               {housePositions && housePositions.map((pos, i) => ( <motion.div key={`house-${i}`} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, delay: 3.0 + (i * 0.1) % 1 }} style={{ position: 'absolute', top: pos.top, left: pos.left, width: '3px', height: '3px', background: 'var(--mantine-color-gray-5)', borderRadius: '50%' }} /> ))}
            </motion.div>
            {/* Scanning Lines */}
            <motion.div style={{ position: 'absolute', left: 0, top: '0%', width: '100%', height: '2px', background: 'rgba(0, 180, 255, 0.7)', boxShadow: '0 0 8px rgba(0, 180, 255, 0.9)', zIndex: 3 }} animate={{ top: ['0%', '100%', '100%', '0%'], opacity: [1, 1, 0, 0] }} transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatDelay: 2, times: [0, 0.5, 0.51, 1] }} />
            <motion.div style={{ position: 'absolute', left: '0%', top: 0, width: '2px', height: '100%', background: 'rgba(0, 180, 255, 0.7)', boxShadow: '0 0 8px rgba(0, 180, 255, 0.9)', zIndex: 3 }} animate={{ left: ['0%', '100%', '100%', '0%'], opacity: [1, 1, 0, 0] }} transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatDelay: 2, times: [0, 0.5, 0.51, 1] }} />
            {/* Analysis Text */}
            <motion.div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 4 }} animate={{ opacity: analysisComplete ? 0 : [0, 1, 1, 0], }} transition={{ duration: 4, repeat: analysisComplete ? 0 : Infinity, repeatDelay: 2 }}>
              <Text ta="center" fw={700} style={{ color: 'rgba(0, 200, 255, 0.9)', textShadow: '0 0 10px rgba(0, 150, 255, 0.7)' }}> ANALYZING </Text>
            </motion.div>
            {/* Results Overlay */}
            <motion.div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '5px', background: 'rgba(0, 0, 25, 0.6)', backdropFilter: 'blur(3px)', zIndex: 10, opacity: 0 }} animate={{ opacity: analysisComplete ? 1 : 0 }} transition={{ duration: 0.8 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: analysisComplete ? 1 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}>
                <ThemeIcon size={40} radius={20} color="blue" variant="filled"> <IconRulerMeasure size={20} /> </ThemeIcon>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: analysisComplete ? 1 : 0, y: analysisComplete ? 0 : 10 }} transition={{ duration: 0.5, delay: 0.6 }}>
                <Badge size="lg" color="blue" variant="filled"> Medium Farm </Badge>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: analysisComplete ? 1 : 0 }} transition={{ duration: 0.5, delay: 0.8 }}>
                 <Text size="xs" c="gray.3" ta="center">Confidence: 94%</Text>
              </motion.div>
            </motion.div>
          </Box>
          <Group align="center" gap="xs" mt="sm">
            <ThemeIcon radius="xl" size="sm" color="blue" variant="light"> <IconListDetails size={14} /> </ThemeIcon>
            <Text size="xs" c="dimmed">Provides farm size, field count, and crop type estimation.</Text>
        </Group>
        </Paper>
      </motion.div>
    );
}

// 4. Segmentation & Analytics Widget (Placeholder/Simplified)
const SegmentationAnalyticsWidget: React.FC = () => {
    // Example: Simple performance tracking display
    return (
         <motion.div
            key="segmentation-analytics"
            initial="hidden" animate="visible" exit="exit" variants={widgetVariant}
        >
             <Paper withBorder p="md" radius="md" shadow="sm" style={{ borderLeft: `3px solid var(--mantine-color-grape-6)` }}>
                <Group justify="space-between" mb="md">
                    <Text size="sm" fw={500} c="dimmed">Farm Analytics</Text>
                    <Badge color="grape" variant="light">Data Driven</Badge>
            </Group>
                <Stack gap="md">
                    <Paper withBorder p="sm" radius="sm">
                        <Group justify="space-between">
                            <Group gap="xs"><ThemeIcon color="grape" variant="light" size="md"><IconUsersGroup size={16}/></ThemeIcon><Text size="sm" fw={500}>Farmer Segments</Text></Group>
                            <Badge color="grape" variant="outline">Example: High Yield</Badge>
                        </Group>
                        <Text size="xs" c="dimmed" mt="xs">Grouping based on production, land use, etc. (Details require backend data).</Text>
          </Paper>
                     <Paper withBorder p="sm" radius="sm">
                        <Group justify="space-between">
                             <Group gap="xs"><ThemeIcon color="teal" variant="light" size="md"><IconTimeline size={16}/></ThemeIcon><Text size="sm" fw={500}>Performance Trend</Text></Group>
                             <Badge color="teal" variant="light" leftSection={<IconArrowUp size={12}/>}>+8% YTD</Badge>
                        </Group>
                        <Text size="xs" c="dimmed" mt="xs">Monitor key metrics over time to track progress and identify areas for improvement.</Text>
                    </Paper>
                 </Stack>
        </Paper>
      </motion.div>
    );
};


// --- Features Data (Updated with real widget components) ---
interface FeatureDetail {
  icon: React.FC<any>;
  text: string;
}

interface Feature {
  id: string; // Unique ID for key prop and potentially for widget selection
  icon: React.FC<any>;
  title: string;
  description: string;
  details?: FeatureDetail[]; // Optional for features without sub-details
  color?: string; // Optional color for theme icon
  widgetComponent?: React.FC; // Optional associated interactive widget
}

const featuresData: Feature[] = [
  {
    id: 'recommendations',
    icon: IconBulb, // Changed icon to represent 'Insights'
    title: 'Intelligent Recommendations',
    description: 'AI-driven insights for crop selection, yield prediction, fertilizer/irrigation optimization, and pesticide guidance.',
    details: [
      { icon: IconPlant2, text: 'Crop Suitability' },
      { icon: IconTractor, text: 'Yield Prediction' },
      { icon: IconGauge, text: 'Resource Optimization' }, // Combines Fertilizer, Irrigation, Water Mgt.
      { icon: IconTargetArrow, text: 'Pesticide Guidance' },
    ],
    color: 'farmGreen',
    widgetComponent: RecommendationWidget,
  },
  {
    id: 'plantHealth',
    icon: IconScan,
    title: 'Plant Health Analysis',
    description: 'Identify plant diseases and weeds from images using advanced AI, with tailored treatment suggestions.',
    details: [
      { icon: IconBug, text: 'Disease Detection' },
      { icon: IconZoomScan, text: 'Weed Identification' },
      { icon: IconVaccine, text: 'Treatment Advice' },
    ],
    color: 'red', // Indicate potential issues
    widgetComponent: PlantHealthWidget,
  },
  {
    id: 'satellite',
    icon: IconSatellite,
    title: 'Satellite Imagery Insights',
    description: 'Monitor crop health, classify land use, track vegetation indices, and detect environmental stress using satellite data.',
    details: [
        { icon: IconWorld, text: 'Crop Monitoring' },
        { icon: IconMapSearch, text: 'Land Use Classification' },
        { icon: IconPlant, text: 'Vegetation Index Tracking' },
        { icon: IconEyeglass, text: 'Environmental Monitoring' },
    ],
    color: 'blue',
    widgetComponent: SatelliteWidget,
  },
    {
    id: 'segmentation',
    icon: IconUsersGroup, // Changed icon
    title: 'Segmentation & Analytics',
    description: 'Understand farmer segments, analyze land use patterns, and track farm performance over time for targeted strategies.',
    details: [
        { icon: IconMoneybag, text: 'Farmer Profiling' }, // Financial aspect implied
        { icon: IconMapSearch, text: 'Land Use Analysis' }, // Reiteration, but distinct focus
        { icon: IconTimeline, text: 'Performance Tracking' },
    ],
    color: 'grape', // Different color for analytics
    widgetComponent: SegmentationAnalyticsWidget,
  },
];

// How it works data (Keep as is)
const howItWorksSteps = [
    { icon: IconUpload, title: 'Upload Data', description: 'Easily upload field data, images, or connect sensors.' },
    { icon: IconBrain, title: 'AI Analysis', description: 'Our models process your data using advanced ML algorithms.' },
    { icon: IconReportAnalytics, title: 'Get Insights', description: 'Receive actionable recommendations and predictions.' },
    { icon: IconBulb, title: 'Optimize & Act', description: 'Implement suggestions to improve yield and efficiency.' },
];

// Pricing Tiers Data (Keep as is, maybe adjust features slightly based on README)
const pricingTiers = [
    {
        title: 'Basic',
        price: '$0',
        period: '/ month',
        features: [
            'Basic Crop Recommendations', // Refined
            'Standard Weather Forecast', // Refined
            'Community Support'
        ],
        buttonText: 'Get Started Free', // Refined
        buttonVariant: 'default'
    },
    {
        title: 'Pro',
        price: '$49', // Keep price for example
        period: '/ month',
        features: [
            'Full Recommendation Suite',
            'AI Disease/Weed Detection', // Refined
            'Basic Satellite Analysis', // Refined
            'Priority Email Support' // Refined
        ],
        buttonText: 'Choose Pro Plan', // Refined
        buttonVariant: 'filled' // Use filled variant with farmGreen color
    },
    {
        title: 'Enterprise',
        price: 'Contact Us',
        period: '',
        features: [
            'All Pro Features +', // Refined
            'Advanced Satellite Insights', // Refined
            'Custom Model Integration',
            'Dedicated Account Manager',
            // 'API Access' // Keep if applicable
        ],
        buttonText: 'Request Enterprise Demo', // Refined
        buttonVariant: 'outline' // Change variant for distinction
    }
];

// Testimonials Data (Keep as is)
const testimonials = [
    {
        quote: "FarmWise transformed how we manage our crops. The yield predictions are incredibly accurate!",
        author: "John D., Small Family Farm"
    },
    {
        quote: "Detecting blight early with the image analysis saved us a significant portion of our harvest this year.",
        author: "Maria G., Organic Grower"
    },
    {
        quote: "The satellite analysis helped us optimize irrigation across our larger fields. Highly recommended.",
        author: "Chen W., Commercial Farm Manager"
    }
];

// Analytics Data (Keep as is - structure is fine, widgets can be added later)
const chartData = [
  { date: 'Mar 22', YieldEst: 2890, AvgYield: 2200 },
  { date: 'Mar 23', YieldEst: 2756, AvgYield: 2100 },
  { date: 'Mar 24', YieldEst: 3322, AvgYield: 2300 },
  { date: 'Mar 25', YieldEst: 3470, AvgYield: 2450 },
  { date: 'Mar 26', YieldEst: 3129, AvgYield: 2500 },
];
const cropDistributionData = [
  { name: 'Corn', value: 35, color: 'yellow.6' },
  { name: 'Wheat', value: 25, color: 'yellow.4' },
  { name: 'Soybeans', value: 20, color: 'green.5' },
  { name: 'Alfalfa', value: 15, color: 'farmGreen.5' },
  { name: 'Other', value: 5, color: 'gray.5' },
];
const soilHealthData = [
  { name: 'Field A', nitrogen: 65, phosphorus: 42, potassium: 85 },
  { name: 'Field B', nitrogen: 75, phosphorus: 55, potassium: 60 },
  { name: 'Field C', nitrogen: 58, phosphorus: 70, potassium: 75 },
  { name: 'Field D', nitrogen: 80, phosphorus: 40, potassium: 90 },
];
const rainfallData = [
  { month: 'Jan', amount: 50 }, { month: 'Feb', amount: 45 }, { month: 'Mar', amount: 70 },
  { month: 'Apr', amount: 85 }, { month: 'May', amount: 60 }, { month: 'Jun', amount: 35 },
  { month: 'Jul', amount: 20 }, { month: 'Aug', amount: 25 }, { month: 'Sep', amount: 40 },
  { month: 'Oct', amount: 55 }, { month: 'Nov', amount: 65 }, { month: 'Dec', amount: 60 },
];

// --- Main Page Component ---
export default function HomePage() {
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  const [activeFeatureWidgetId, setActiveFeatureWidgetId] = useState<string>(featuresData[0].id); // Default to first feature

  const handleFeatureSelect = (id: string) => {
    setActiveFeatureWidgetId(id);
  };

  // Find the active feature and its widget component
  const activeFeature = featuresData.find(f => f.id === activeFeatureWidgetId);
  const ActiveWidgetComponent = activeFeature?.widgetComponent;

  // --- Reusable Components ---

  // Feature Card Component (New Design)
  const FeatureCard: React.FC<{ feature: Feature; index: number; isActive: boolean; onSelect: (id: string) => void }> =
    ({ feature, index, isActive, onSelect }) => (
    <div
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}
    >
      <Card
        shadow="md"
        radius="md"
        className={`${classes.featureCard} ${isActive ? classes.featureCardActive : ''}`}
        padding="xl"
        withBorder
        onClick={() => feature.widgetComponent && onSelect(feature.id)}
        style={{
          cursor: feature.widgetComponent ? 'pointer' : 'default',
          height: '100%',
          opacity: 1,
          position: 'relative'
        }}
      >
        <Stack justify="space-between" style={{ height: '100%' }}>
          {/* Top Section: Icon and Title */}
          <Box>
             <Group justify="space-between" align="flex-start" wrap="nowrap" mb="md">
                  <ThemeIcon
                      size={60} // Slightly smaller icon
                      radius="lg" // Rounded large
                      variant="light" // Use light variant for subtle background
                      color={feature.color || 'farmGreen'}
                  >
                      <feature.icon style={{ width: rem(32), height: rem(32) }} stroke={1.5} />
                  </ThemeIcon>
                   {/* Optional: Add a small 'Active' indicator if needed */}
                  {isActive && feature.widgetComponent && <Badge variant="filled" color={feature.color || 'farmGreen'} size="sm">Active</Badge>}
              </Group>

              <Text fz="lg" fw={600} className={classes.featureTitle} mt="sm" mb="xs">
                  {feature.title}
        </Text>
              <Text fz="sm" c="dimmed" lh={1.5}>
                  {feature.description}
        </Text>
          </Box>

          {/* Bottom Section: Details List (if any) */}
          {feature.details && feature.details.length > 0 && (
            <Box mt="md">
              {/* <Divider my="sm" /> */}
        <List
                  spacing="xs" // Tighter spacing
            size="sm"
            icon={
                      <ThemeIcon size={20} radius="xl" variant="light" color={feature.color || 'farmGreen'}>
                          <IconCheck style={{ width: rem(12), height: rem(12) }} />
            </ThemeIcon>
            }
        >
                  {feature.details.map((detail) => (
                      <List.Item key={detail.text}>
                          {detail.text}
                      </List.Item>
            ))}
        </List>
            </Box>
          )}
        </Stack>
      </Card>
    </div>
  );

  // --- Render Logic ---
  return (
    <>
      {/* Hero Section */}
      <motion.div
        className={classes.hero}
        initial="hidden"
        animate="visible"
        variants={sectionVariant} // Apply section animation
      >
        {/* Background Carousel */}
        <Carousel
          withIndicators={false}
          withControls={false}
          height="100%"
          loop
          className={classes.heroCarousel}
          // @ts-ignore - Ignore plugin type issue if persistent
          plugins={[autoplay.current]}
          onMouseEnter={autoplay.current.stop}
          onMouseLeave={autoplay.current.reset}
        >
          {heroImages.map((image, index) => (
              <Carousel.Slide key={index}>
                  <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="100vw"
                      priority={index === 0} // Prioritize first image
                  />
              </Carousel.Slide>
          ))}
        </Carousel>
        <Overlay color="#000" opacity={0.65} zIndex={1} /> {/* Slightly darker overlay */}

        {/* Content */}
        <Container size="lg" className={classes.heroInner} pos="relative" style={{ zIndex: 2 }}>
             <motion.div variants={itemVariant}> {/* Animate content block */}
                <Title className={classes.heroTitle}>
                    Grow Smarter with{' '}
                    <Text component="span" inherit>
                        FarmWise
                    </Text>
                </Title>
            </motion.div>
            <motion.div variants={itemVariant}> {/* Animate content block */}
                <Text className={classes.heroDescription} mt="xl" mb="xl">
                    Leverage AI for intelligent recommendations, disease detection, and resource optimization.
                    Maximize your yield and efficiency like never before.
                </Text>
            </motion.div>
            <motion.div variants={itemVariant}> {/* Animate content block */}
                <Group mt="xl">
                  <Button
                      variant="filled"
                      color="farmGreen"
                      size="xl"
                      radius="xl"
                      className={classes.heroControl}
                      component={Link}
                      href="/signup"
                  >
                      Get Started Now
                  </Button>
                     <Button
                        variant="outline"
                        color="gray.0"
                        size="xl"
                        radius="xl"
                        className={classes.heroControl}
                        component={Link}
                        href="#features"
                    >
                        Explore Features
                    </Button>
                </Group>
             </motion.div>
        </Container>
      </motion.div>

      {/* Features Section - Revamped Layout */}
      <section
        id="features"
        className={`${classes.sectionWrapper} ${classes.firstSection}`}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <Container size="xl"> {/* Use larger container for feature grid */}
          <div>
            <Title order={2} className={classes.sectionTitle} ta="center">
              Unlock Your Farm's Potential
            </Title>
            <Text c="dimmed" ta="center" mt="sm" mb="xl" maw={600} mx="auto"> {/* Increased max width */}
              FarmWise offers a suite of powerful AI tools designed to optimize every aspect of your agricultural operations.
            </Text>
          </div>

          {/* Grid for Features and Active Widget */}
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 'var(--mantine-spacing-xl)' }}>
            {/* Feature Cards Column */}
            <div style={{ flex: '1 1 600px', minWidth: '280px', minHeight: '500px', position: 'relative', zIndex: 5 }}>
               <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                {featuresData.map((feature, index) => (
                    <FeatureCard
                      key={feature.id}
                      feature={feature}
                      index={index}
                      isActive={activeFeatureWidgetId === feature.id && !!feature.widgetComponent}
                      onSelect={handleFeatureSelect}
                    />
                ))}
               </SimpleGrid>
            </div>

            {/* Active Widget Column */}
            <div style={{ flex: '1 1 400px', minWidth: '280px', minHeight: '500px', position: 'relative', zIndex: 1 }}>
              {/* Ensure the motion div itself doesn't collapse */}
              <motion.div variants={itemVariant} style={{ position: 'sticky', top: rem(80), height: 'fit-content' }}>
                <Paper withBorder shadow="md" radius="md" p="xl" className={classes.stickyWidget} miw={300}> {/* Min width for widget area */}
                   <Title order={3} mb="lg"> {activeFeature?.title || 'Feature Details'} </Title>
                   {/* Remove AnimatePresence for now to isolate the issue */}
                   {ActiveWidgetComponent && (
                     <div key={activeFeatureWidgetId}>
                       {React.createElement(ActiveWidgetComponent)}
                     </div>
                   )}
                   {!ActiveWidgetComponent && (
                     <div>
                       <Center h={200}>
                         <Text c="dimmed">Select a feature card to see details.</Text>
                       </Center>
                     </div>
                   )}
                 </Paper>
                                            </motion.div>
            </div>
          </div>
        </Container>
      </section>

      <Divider my="xl" />

      {/* Data Visualizations Section - Enhanced Styling */}
      <motion.section
        id="analytics"
        className={`${classes.sectionWrapper} ${classes.analyticsSection}`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
      >
        <Container size="lg">
          <motion.div variants={itemVariant}>
            <Title order={2} className={classes.sectionTitle} ta="center">
                Farm Analytics Dashboard
            </Title>
            <Text c="dimmed" ta="center" mt="sm" mb="xl" maw={700} mx="auto">
                Visualize your farm's key metrics in real-time. Gain actionable insights into crop distribution, soil health, rainfall patterns, and yield projections to make data-driven decisions.
            </Text>
          </motion.div>

          {/* Using motion.div for each grid item for staggered animation */}
          <Grid gutter="xl">
            {/* Crop Distribution */}
            <Grid.Col span={{ base: 12, md: 6, lg: 5 }}>
              <motion.div
                variants={itemVariant}
                style={{ height: '100%' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card shadow="md" className={classes.analyticsCard} style={{ height: '100%' }}>
                  <Card.Section p="lg" bg="var(--mantine-color-farmGreen-0)">
                    <Group justify="space-between">
                      <Text component="div" className={classes.chartTitle}>
                        <ThemeIcon size={28} radius="xl" className={classes.chartIcon}>
                          <IconPlant2 size={16} />
                        </ThemeIcon>
                        <span>Crop Distribution</span>
                      </Text>
                      <Badge color="farmGreen" variant="light" size="lg">Current Season</Badge>
                    </Group>
                  </Card.Section>

                  <Card.Section p="lg">
                    <Flex direction={{ base: 'column', sm: 'row' }} gap="lg" align="center">
                      <Box flex={1} miw={180}>
                        <PieChart
                          h={220}
                          data={cropDistributionData}
                          tooltipDataSource="segment"
                          withTooltip
                          withLabels
                          labelsType="percent"
                          labelsPosition="outside"
                          tooltipProps={{
                            content: ({ payload }) => (
                              <Paper px="md" py="sm" withBorder shadow="md" radius="md">
                                {payload?.map((item: any) => (
                                  <Text key={item.name} c={item.color} fz="sm">
                                    {item.name}: {item.value}%
                                  </Text>
                                ))}
                              </Paper>
                            )
                          }}
                        />
                      </Box>
                      <Box flex={1}>
                        <Stack gap="sm">
                          {cropDistributionData.map((item) => (
                            <Group key={item.name} gap="sm">
                              <Box w={14} h={14} bg={item.color} style={{ borderRadius: '3px' }} />
                              <Flex justify="space-between" style={{ flex: 1 }}>
                                <Text component="span" size="sm">{item.name}</Text>
                                <Text component="span" size="sm" fw={500}>{item.value}%</Text>
                              </Flex>
                            </Group>
                          ))}
                        </Stack>
                      </Box>
                    </Flex>
                  </Card.Section>
                </Card>
              </motion.div>
            </Grid.Col>

            {/* Soil Health */}
            <Grid.Col span={{ base: 12, md: 6, lg: 7 }}>
              <motion.div
                variants={itemVariant}
                style={{ height: '100%' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card shadow="md" className={classes.analyticsCard} style={{ height: '100%' }}>
                  <Card.Section p="lg" bg="var(--mantine-color-blue-0)">
                    <Group justify="space-between">
                      <Text component="div" className={classes.chartTitle}>
                        <ThemeIcon size={28} radius="xl" className={classes.chartIcon} style={{ backgroundColor: 'var(--mantine-color-blue-6)' }}>
                          <IconTestPipe size={16} />
                        </ThemeIcon>
                        <span>Soil Health Overview</span>
                      </Text>
                      <Badge color="blue" variant="light" size="lg">Updated Weekly</Badge>
                    </Group>
                  </Card.Section>

                  <Card.Section p="lg">
                    <ScrollArea h={280} type="auto">
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                        {soilHealthData.map((field) => (
                          <Paper key={field.name} p="md" withBorder radius="md" mb="md">
                            <Group justify="space-between" mb="xs">
                              <Text size="md" fw={600}>{field.name}</Text>
                              <Badge variant="filled" color={((field.nitrogen + field.phosphorus + field.potassium) / 3) > 70 ? 'green' : 'orange'}>
                                Score: {Math.round((field.nitrogen + field.phosphorus + field.potassium) / 3)}%
                              </Badge>
                            </Group>
                            <Stack gap={12} mt="md">
                              <Box>
                                <Group justify="space-between" mb={5}><Text component="span" size="sm" fw={500}>Nitrogen</Text><Text component="span" size="sm" fw={600} c="blue">{field.nitrogen}%</Text></Group>
                                <Progress value={field.nitrogen} color="blue" size="md" radius="xl" striped animated />
                              </Box>
                              <Box>
                                <Group justify="space-between" mb={5}><Text component="span" size="sm" fw={500}>Phosphorus</Text><Text component="span" size="sm" fw={600} c="orange">{field.phosphorus}%</Text></Group>
                                <Progress value={field.phosphorus} color="orange" size="md" radius="xl" striped animated />
                              </Box>
                              <Box>
                                <Group justify="space-between" mb={5}><Text component="span" size="sm" fw={500}>Potassium</Text><Text component="span" size="sm" fw={600} c="violet">{field.potassium}%</Text></Group>
                                <Progress value={field.potassium} color="violet" size="md" radius="xl" striped animated />
                              </Box>
                            </Stack>
                          </Paper>
                        ))}
                      </SimpleGrid>
                    </ScrollArea>
                  </Card.Section>
                </Card>
              </motion.div>
            </Grid.Col>

            {/* Yearly Rainfall */}
            <Grid.Col span={{ base: 12, md: 6, lg: 7 }}>
              <motion.div
                variants={itemVariant}
                style={{ height: '100%' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Card shadow="md" className={classes.analyticsCard} style={{ height: '100%' }}>
                  <Card.Section p="lg" bg="var(--mantine-color-cyan-0)">
                    <Group justify="space-between">
                      <Text component="div" className={classes.chartTitle}>
                        <ThemeIcon size={28} radius="xl" className={classes.chartIcon} style={{ backgroundColor: 'var(--mantine-color-cyan-6)' }}>
                          <IconCloudRain size={16} />
                        </ThemeIcon>
                        <span>Annual Rainfall (mm)</span>
                      </Text>
                      <Badge color="cyan" variant="light" size="lg">Historical Data</Badge>
                    </Group>
                  </Card.Section>

                  <Card.Section p="lg">
                    <BarChart
                      h={280}
                      data={rainfallData}
                      dataKey="month"
                      series={[{ name: 'amount', color: 'cyan.6' }]}
                      tickLine="y"
                      gridAxis="y"
                      yAxisProps={{ width: 35 }}
                      tooltipProps={{
                        content: ({ label, payload }) => (
                          <Paper px="md" py="sm" withBorder shadow="md" radius="md">
                            <Text fw={500} mb={5}>{label}</Text>
                            {payload?.map((item: any) => (
                              <Text key={item.name} c={item.color} fz="sm">
                                Rainfall: {item.value} mm
                              </Text>
                            ))}
                          </Paper>
                        )
                      }}
                      barProps={{ radius: 4 }}
                    />
                  </Card.Section>
                </Card>
              </motion.div>
            </Grid.Col>

            {/* Yield Projection */}
            <Grid.Col span={{ base: 12, md: 6, lg: 5 }}>
              <motion.div
                variants={itemVariant}
                style={{ height: '100%' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Card shadow="md" className={classes.analyticsCard} style={{ height: '100%' }}>
                  <Card.Section p="lg" bg="var(--mantine-color-yellow-0)">
                    <Group justify="space-between">
                      <Text component="div" className={classes.chartTitle}>
                        <ThemeIcon size={28} radius="xl" className={classes.chartIcon} style={{ backgroundColor: 'var(--mantine-color-yellow-6)' }}>
                          <IconChartLine size={16} />
                        </ThemeIcon>
                        <span>Yield Projection</span>
                      </Text>
                      <Badge color="yellow" variant="light" size="lg">Live Forecast</Badge>
                    </Group>
                  </Card.Section>

                  <Card.Section p="lg">
                    <Center style={{ flexDirection: 'column', height: 'calc(100% - 20px)' }}>
                      <RingProgress
                        size={180}
                        thickness={18}
                        roundCaps
                        sections={[{ value: 75, color: 'farmGreen.6', tooltip: 'Projected completion: 75%' }]}
                        label={
                          <Stack align="center" gap={0}>
                            <Text component="div" ta="center" fw={800} size="2rem">75%</Text>
                            <Text component="div" ta="center" size="xs" c="dimmed">Target</Text>
                          </Stack>
                        }
                        mb="lg"
                      />
                      <Paper withBorder p="md" radius="md" mt="md" bg="var(--mantine-color-gray-0)">
                        <Stack align="center" gap="xs">
                          <Group gap="xs">
                            <Text component="span" size="lg" fw={700} ta="center">On Track</Text>
                            <Badge color="green" variant="filled" size="lg">+5% vs Last Year</Badge>
                          </Group>
                          <Text size="sm" c="dimmed" ta="center">
                            Current projection based on available data. Monitor conditions closely.
                          </Text>
                        </Stack>
                      </Paper>
                    </Center>
                  </Card.Section>
                </Card>
              </motion.div>
            </Grid.Col>
          </Grid>
        </Container>
      </motion.section>

      <Divider my="xl" />

      {/* How It Works Section - Enhanced Styling */}
      <motion.section
        id="how-it-works"
        className={`${classes.sectionWrapper} ${classes.stepsSection}`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
      >
        <Container size="lg">
          <motion.div variants={itemVariant}>
            <Title order={2} className={classes.sectionTitle} ta="center">
              Simple Steps to Smarter Farming
            </Title>
            <Text c="dimmed" ta="center" mt="sm" mb="xl" maw={700} mx="auto">
                Getting started with FarmWise is easy. Follow these simple steps to begin optimizing your farm today and see results in no time.
            </Text>
          </motion.div>

          {/* Enhanced Stepper with better visual elements */}
          <motion.div variants={itemVariant} className={classes.stepperWrapper}>
            <Stepper
              active={-1} // No active step initially
              color="farmGreen"
              allowNextStepsSelect={false}
              orientation="horizontal" // Explicitly horizontal
              iconSize={42}
              iconPosition="top"
              styles={{
                stepIcon: {
                  borderWidth: 2,
                  boxShadow: '0 0 10px rgba(92, 180, 118, 0.3)'
                },
                separator: {
                  backgroundColor: 'var(--mantine-color-farmGreen-3)',
                  height: 2,
                  marginTop: 20
                },
                step: { flex: 1 }
              }}
            >
              {howItWorksSteps.map((step, index) => (
                <Stepper.Step
                  key={step.title}
                  icon={<step.icon size={24} />}
                  label={
                    <Text fw={600} mt="sm" size="md">{`Step ${index + 1}`}</Text>
                  }
                  description={
                    <Text fw={700} size="lg" mt={4}>{step.title}</Text>
                  }
                >
                  <Paper withBorder p="md" radius="md" className={classes.stepContent} mt="md">
                    <Text size="md" lh={1.6}>{step.description}</Text>
                  </Paper>
                </Stepper.Step>
              ))}
            </Stepper>
          </motion.div>
        </Container>
      </motion.section>

      <Divider my="xl" />

      {/* Pricing Section - Enhanced Styling */}
      <motion.section
        id="pricing"
        className={`${classes.sectionWrapper} ${classes.pricingSection}`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
      >
        <Container size="lg">
          <motion.div variants={itemVariant}>
            <Title order={2} className={classes.sectionTitle} ta="center">
                Choose Your Plan
            </Title>
            <Text c="dimmed" ta="center" mt="sm" mb="xl" maw={700} mx="auto">
              Start optimizing your farm today with a plan that fits your needs and budget. All plans include core features with flexible options for growth.
            </Text>
           </motion.div>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" mt={40}>
                {pricingTiers.map((tier, index) => (
                  // Wrap each card in motion.div for staggered animation
                  <motion.div
                    key={tier.title}
                    variants={itemVariant}
                    style={{ height: '100%' }}
                  >
                    <Card
                      className={classes.pricingCard}
                      style={{ height: '100%' }}
                      data-popular={index === 1 ? "true" : undefined}
                    >
                       <Stack justify="space-between" style={{ height: '100%' }}>
                         {/* Top part: Title & Price */}
                         <Box>
                            <Text className={classes.pricingTitle}>
                                {tier.title}
                            </Text>
                            <Text className={classes.pricingPrice}>
                                {tier.price}
                                <Text span fz="sm" c="dimmed" fw={400}>{tier.period}</Text>
                            </Text>
                         </Box>

                         {/* Middle part: Features */}
                         <Box className={classes.pricingFeatureList}>
                             <Stack gap="md">
                                {tier.features.map((feature) => (
                                    <Group key={feature} gap="xs" className={classes.pricingFeature}>
                                        <ThemeIcon
                                          color="farmGreen"
                                          size={22}
                                          radius="xl"
                                          className={classes.pricingFeatureIcon}
                                        >
                                            <IconCheck style={{ width: rem(14), height: rem(14) }} />
                                        </ThemeIcon>
                                        <Text component="span" size="md">{feature}</Text>
                                    </Group>
                                ))}
                            </Stack>
                         </Box>

                         {/* Bottom part: Button */}
                         <Button
                           fullWidth
                           size="lg"
                           radius="md"
                           variant={tier.buttonVariant}
                           color="farmGreen"
                           className={classes.pricingButton}
                           component={Link}
                           href={tier.price === 'Contact Us' ? '/contact' : '/signup'}
                         >
                            {tier.buttonText}
                         </Button>
                       </Stack>
                    </Card>
                  </motion.div>
                ))}
            </SimpleGrid>
        </Container>
      </motion.section>

      <Divider my="xl" />

      {/* Testimonials Section - Minor Styling Adjustments */}
      <motion.section
        id="testimonials"
        className={classes.sectionWrapper}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
      >
        <Container size="lg">
          <motion.div variants={itemVariant}>
            <Title order={2} className={classes.sectionTitle} ta="center">
                What Farmers Are Saying
            </Title>
            <Text c="dimmed" ta="center" mt="sm" mb="xl" maw={600} mx="auto">
                Hear directly from farmers who have benefited from FarmWise insights and optimizations.
            </Text>
           </motion.div>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" mt="xl">
                {testimonials.map((item, index) => (
                    <motion.div key={item.author} variants={itemVariant} style={{ height: '100%' }}>
                        <Paper
                            withBorder
                            shadow="md"
                            p="xl"
                            radius="md"
                            className={classes.testimonialCard}
                            style={{ height: '100%' }}
                        >
                            <Stack justify="space-between" style={{ height: '100%' }}>
                                <Box>
                                    <ThemeIcon variant="light" color="farmGreen" size={40} radius="md" mb="lg">
                                        <IconQuote size={24} />
                                    </ThemeIcon>
                                    <Text fz="md" lh={1.6} style={{ fontStyle: 'italic' }}> {/* Improved line height */}
                                        "{item.quote}"
                                    </Text>
                                </Box>
                                <Text fw={500} size="sm" ta="right" mt="md">
                                    – {item.author}
                                </Text>
                            </Stack>
                        </Paper>
                    </motion.div>
                ))}
            </SimpleGrid>
        </Container>
      </motion.section>

      {/* CTA Section - Minor Styling Adjustments */}
      <motion.section
        className={classes.ctaSection} // Keep custom class for specific styling
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariant}
      >
        <Container size="lg" className={classes.ctaInner}>
          <motion.div variants={itemVariant}>
            <Title order={2} ta="center">
                Ready to Boost Your Farm's Potential?
            </Title>
          </motion.div>
          <motion.div variants={itemVariant}>
            <Text ta="center" c="dimmed" mt="sm" mb="xl" maw={600} mx="auto">
                Join hundreds of farmers using FarmWise to make data-driven decisions. Start your free trial today and see the difference.
            </Text>
          </motion.div>
          <motion.div variants={itemVariant}>
            <Center>
                <Button
                    size="xl"
                    radius="xl"
                    variant="filled"
                    color="farmGreen"
                    component={Link}
                    href="/signup"
                >
                    Start Free Trial Now
                </Button>
            </Center>
          </motion.div>
        </Container>
      </motion.section>
    </>
  );
}
