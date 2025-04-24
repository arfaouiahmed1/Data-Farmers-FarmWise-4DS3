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
} from '@mantine/core';
import Link from 'next/link';
import Image from 'next/image';
import {
  IconChartInfographic,
  IconPlant2,
  IconScan,
  IconSatellite,
  IconListDetails,
  IconTractor,
  IconDroplet,
  IconSun,
  IconBug,
  IconVaccine,
  IconZoomScan,
  IconRulerMeasure,
  IconCheck,
  IconUpload,
  IconBrain,
  IconReportAnalytics,
  IconBulb,
  IconMessages,
  IconCloudRain,
  IconTemperature,
  IconWind,
  IconDropletFilled,
  IconArrowUp,
  IconArrowDown,
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconDeviceMobile,
  IconLeaf,
  IconAlertTriangle,
  IconShieldCheck,
  IconWorld,
  IconTestPipe,
  IconChartLine,
  IconQuote, // Added for testimonials
} from '@tabler/icons-react';
import { AreaChart, PieChart, BarChart, DonutChart, LineChart } from '@mantine/charts';
import { motion } from 'framer-motion';
import classes from './HomePage.module.css';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';

// Animation variants
const sectionVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const itemVariant = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// Recommendation widget animation variants
const widgetVariant = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.3 }
  }
};

// Sample data for the chart
const chartData = [
  { date: 'Mar 22', YieldEst: 2890, AvgYield: 2200 },
  { date: 'Mar 23', YieldEst: 2756, AvgYield: 2100 },
  { date: 'Mar 24', YieldEst: 3322, AvgYield: 2300 },
  { date: 'Mar 25', YieldEst: 3470, AvgYield: 2450 },
  { date: 'Mar 26', YieldEst: 3129, AvgYield: 2500 },
];

// Crop suitability data
const cropSuitabilityData = [
  { crop: 'Corn', suitability: 92, color: 'yellow.6', notes: 'Excellent soil compatibility, ideal rainfall' },
  { crop: 'Wheat', suitability: 78, color: 'yellow.4', notes: 'Good soil conditions, moderate temperature' },
  { crop: 'Soybeans', suitability: 85, color: 'green.5', notes: 'Suitable pH levels, good drainage' },
  { crop: 'Tomatoes', suitability: 65, color: 'red.6', notes: 'Fair, requires irrigation supplementation' },
  { crop: 'Cotton', suitability: 32, color: 'gray.5', notes: 'Poor, climate not suitable' },
];

// Resource usage data
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

// Weather forecast data
const weatherForecastData = [
  { date: 'Today', temp: 24, precipitation: 10, condition: 'Partly Cloudy', icon: IconSun },
  { date: 'Tomorrow', temp: 22, precipitation: 60, condition: 'Rain Showers', icon: IconCloudRain },
  { date: 'Wed', temp: 25, precipitation: 5, condition: 'Sunny', icon: IconSun },
  { date: 'Thu', temp: 27, precipitation: 0, condition: 'Sunny', icon: IconSun },
  { date: 'Fri', temp: 26, precipitation: 30, condition: 'Scattered Showers', icon: IconCloudRain },
  { date: 'Sat', temp: 23, precipitation: 70, condition: 'Rain', icon: IconCloudRain },
  { date: 'Sun', temp: 22, precipitation: 40, condition: 'Scattered Showers', icon: IconCloudRain },
];

// Feature data
const features = [
  {
    icon: IconChartInfographic,
    title: 'Smart Recommendations',
    description:
      'Leverage AI for predictions on crops, yield, fertilizer/water usage, and weather forecasts to optimize your planning.',
    details: [
      { icon: IconPlant2, text: 'Crop suitability' },
      { icon: IconTractor, text: 'Yield estimation' },
      { icon: IconDroplet, text: 'Resource usage (water, fertilizer)' },
      { icon: IconSun, text: 'Localized weather forecasts' },
    ],
    extraContent: null, // We'll render this dynamically based on the active widget
  },
  {
    icon: IconScan,
    title: 'Plant Health Analysis',
    description:
      'Upload images to instantly detect diseases and weeds, receiving tailored treatment suggestions from our models.',
    details: [
        { icon: IconBug, text: 'Disease identification' },
        { icon: IconVaccine, text: 'Treatment recommendations' },
        { icon: IconZoomScan, text: 'Weed detection' },
    ],
    extraContent: (
      <Paper withBorder p="xs" mt="md">
        <Text size="xs" c="dimmed" ta="center" mb="xs">Analysis Simulation</Text>
        <Box style={{ position: 'relative', height: rem(100), overflow: 'hidden' }}>
          {/* Phone Icon - Animating position */}
          <motion.div
            style={{ position: 'absolute', top: rem(30), left: rem(20), zIndex: 3 }}
            animate={{ x: [0, 60, 60, 0] }}
            transition={{
                repeat: Infinity, 
                duration: 6,
                ease: "easeInOut",
                times: [0, 0.25, 0.75, 1]
            }}
          >
            <IconDeviceMobile size={40} color="var(--mantine-color-dimmed)" />
          </motion.div>

          {/* Leaf Icon - Animates color */}
          <motion.div 
             style={{ position: 'absolute', top: rem(30), right: rem(40), zIndex: 1 }}
             animate={{
                 color: [
                     "var(--mantine-color-farmGreen-6)",
                     "var(--mantine-color-farmGreen-6)",
                     "var(--mantine-color-yellow-7)",
                     "var(--mantine-color-farmGreen-6)",
                     "var(--mantine-color-farmGreen-6)"
                 ]
             }}
             transition={{
                 repeat: Infinity,
                 duration: 6,
                 times: [0, 0.3, 0.4, 0.8, 1] 
             }}
          >
            <IconLeaf size={40} />
          </motion.div>

          {/* Scanning Line */}
          <motion.div
              style={{
                  position: 'absolute',
                  right: rem(45),
                  width: rem(30),
                  height: rem(2),
                  backgroundColor: "var(--mantine-color-cyan-5)",
                  boxShadow: "0 0 5px var(--mantine-color-cyan-3)",
                  opacity: 0,
                  y: rem(30),
                  zIndex: 2,
              }}
              animate={{ 
                  opacity: [0, 1, 1, 0, 0], 
                  y: [rem(30), rem(30), rem(70), rem(70), rem(30)]
              }}
              transition={{
                  repeat: Infinity,
                  duration: 6,
                  times: [0, 0.15, 0.35, 0.4, 1]
              }}
          />

         {/* Analysis Indicator (Brain) */}
         <motion.div
             style={{ position: 'absolute', top: rem(5), left: rem(90), opacity: 0, zIndex: 4 }}
             animate={{ 
                 opacity: [0, 0, 1, 1, 0, 0],
                 rotate: [0, 0, 0, 360, 360, 0]
             }} 
             transition={{ 
                 repeat: Infinity, 
                 duration: 6, 
                 times: [0, 0.3, 0.4, 0.5, 0.6, 1]
             }}
         >
             <IconBrain size={20} color="var(--mantine-color-blue-5)"/>
         </motion.div>

         {/* Results */}
         {/* Disease Name */}
         <motion.div
             style={{ position: 'absolute', top: rem(5), left: 0, right: 0, opacity: 0, textAlign: 'center'}}
             animate={{ opacity: [0, 0, 1, 1, 0] }}
             transition={{ repeat: Infinity, duration: 6, times: [0, 0.55, 0.6, 0.85, 1] }}
         >
              <Badge color="red" variant="light" leftSection={<IconAlertTriangle size={12}/>}>Leaf Blight</Badge>
         </motion.div>

         {/* Action Recommended */}
         <motion.div
             style={{ position: 'absolute', bottom: rem(5), left: 0, right: 0, opacity: 0, textAlign: 'center'}}
             animate={{ opacity: [0, 0, 1, 1, 0] }}
             transition={{ repeat: Infinity, duration: 6, times: [0, 0.65, 0.7, 0.85, 1] }}
         >
              <Badge color="green" variant="light" leftSection={<IconShieldCheck size={12}/>}>Action: Fungicide</Badge>
         </motion.div>

        </Box>
      </Paper>
    ),
  },
  {
    icon: IconSatellite,
    title: 'Satellite Farm Insights',
    description:
      'Utilize satellite imagery analysis to automatically determine farm size (small, medium, large) for better recommendations.',
    details: [
        { icon: IconRulerMeasure, text: 'Accurate farm size classification' },
        { icon: IconListDetails, text: 'Input for personalized advice' },
    ]
  },
];

// How it works data
const howItWorksSteps = [
    { icon: IconUpload, title: 'Upload Data', description: 'Easily upload field data, images, or connect sensors.' },
    { icon: IconBrain, title: 'AI Analysis', description: 'Our models process your data using advanced ML algorithms.' },
    { icon: IconReportAnalytics, title: 'Get Insights', description: 'Receive actionable recommendations and predictions.' },
    { icon: IconBulb, title: 'Optimize & Act', description: 'Implement suggestions to improve yield and efficiency.' },
];

// Pricing Tiers Data
const pricingTiers = [
    {
        title: 'Basic',
        price: '$0',
        period: '/ month',
        features: [
            'Limited Recommendations',
            'Basic Weather Forecast',
            'Community Support'
        ],
        buttonText: 'Get Started',
        buttonVariant: 'default'
    },
    {
        title: 'Pro',
        price: '$49',
        period: '/ month',
        features: [
            'Full Recommendation Suite',
            'Advanced Disease Detection',
            'Satellite Farm Size Analysis',
            'Priority Support'
        ],
        buttonText: 'Choose Pro',
        buttonVariant: 'gradient'
    },
    {
        title: 'Enterprise',
        price: 'Contact Us',
        period: '',
        features: [
            'All Pro Features',
            'Custom Model Integration',
            'Dedicated Account Manager',
            'API Access'
        ],
        buttonText: 'Contact Sales',
        buttonVariant: 'default'
    }
];

// Testimonials Data
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

// Weather data example
const weatherData = {
  current: {
    temp: 24,
    humidity: 65,
    windSpeed: 12,
    condition: 'Partly Cloudy',
    icon: IconCloudRain,
  },
  forecast: [
    { day: 'Mon', temp: 25, icon: IconSun },
    { day: 'Tue', temp: 22, icon: IconCloudRain },
    { day: 'Wed', temp: 28, icon: IconSun },
    { day: 'Thu', temp: 21, icon: IconCloudRain },
    { day: 'Fri', temp: 23, icon: IconSun },
  ],
};

// Crop distribution data for pie chart
const cropDistributionData = [
  { name: 'Corn', value: 35, color: 'yellow.6' },
  { name: 'Wheat', value: 25, color: 'yellow.4' },
  { name: 'Soybeans', value: 20, color: 'green.5' },
  { name: 'Alfalfa', value: 15, color: 'farmGreen.5' },
  { name: 'Other', value: 5, color: 'gray.5' },
];

// Soil health data
const soilHealthData = [
  { name: 'Field A', nitrogen: 65, phosphorus: 42, potassium: 85 },
  { name: 'Field B', nitrogen: 75, phosphorus: 55, potassium: 60 },
  { name: 'Field C', nitrogen: 58, phosphorus: 70, potassium: 75 },
  { name: 'Field D', nitrogen: 80, phosphorus: 40, potassium: 90 },
];

// Monthly rainfall data
const rainfallData = [
  { month: 'Jan', amount: 50 },
  { month: 'Feb', amount: 45 },
  { month: 'Mar', amount: 70 },
  { month: 'Apr', amount: 85 },
  { month: 'May', amount: 60 },
  { month: 'Jun', amount: 35 },
  { month: 'Jul', amount: 20 },
  { month: 'Aug', amount: 25 },
  { month: 'Sep', amount: 40 },
  { month: 'Oct', amount: 55 },
  { month: 'Nov', amount: 65 },
  { month: 'Dec', amount: 60 },
];

const imageList = [
  { src: '/federico-respini-sYffw0LNr7s-unsplash.jpg', alt: 'Farm field landscape' },
  { src: '/gozha-net-xDrxJCdedcI-unsplash.jpg', alt: 'Close up of crops' },
  { src: '/markus-spiske-vrbZVyX2k4I-unsplash.jpg', alt: 'Tractor in field' },
  { src: '/megan-thomas-xMh_ww8HN_Q-unsplash.jpg', alt: 'Farmer inspecting plants' },
  { src: '/phuc-long-aqrIcYonB-o-unsplash.jpg', alt: 'Drone view of farm' },
];

export default function HomePage() {
  const autoplay = useRef(Autoplay({ delay: 5000 }));
  const [activeRecommendationWidget, setActiveRecommendationWidget] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [activePlantHealthWidget, setActivePlantHealthWidget] = useState(0);
  const [plantHealthAnimationKey, setPlantHealthAnimationKey] = useState(0);
  
  // Auto cycle through recommendation widgets
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRecommendationWidget((prev: number) => (prev + 1) % 4);
    }, 8000); // Change every 8 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Widget selector component
  const RecommendationSelector = () => {
    const widgetOptions = [
      { value: 0, label: 'Crop Suitability', icon: IconPlant2 },
      { value: 1, label: 'Yield Estimation', icon: IconTractor },
      { value: 2, label: 'Resource Usage', icon: IconDroplet },
      { value: 3, label: 'Weather Forecast', icon: IconSun },
    ];

    // Handle selector click - updates the widget and resets animation
    const handleSelectorClick = (value: number) => {
      setActiveRecommendationWidget(value);
      setAnimationKey(prev => prev + 1); // Change key to force remount and reset animation
    };

    return (
      <Group justify="center" gap="sm" mb="md" mt={5}>
        {widgetOptions.map((option) => (
          <motion.div
            key={option.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ActionIcon
              variant={activeRecommendationWidget === option.value ? "filled" : "subtle"}
              color={activeRecommendationWidget === option.value ? "farmGreen" : "gray"}
              radius="md"
              size="lg"
              onClick={() => handleSelectorClick(option.value)}
              title={option.label}
              className={activeRecommendationWidget === option.value ? classes.activeSelector : undefined}
            >
              <option.icon size={22} />
            </ActionIcon>
          </motion.div>
        ))}
      </Group>
    );
  };

  // Plant Health Analysis selector
  const PlantHealthSelector = () => {
    const widgetOptions = [
      { value: 0, label: 'Disease Identification', icon: IconBug },
      { value: 1, label: 'Treatment Recommendations', icon: IconVaccine },
      { value: 2, label: 'Weed Detection', icon: IconZoomScan },
    ];

    // Handle selector click - updates the widget and resets animation
    const handleSelectorClick = (value: number) => {
      setActivePlantHealthWidget(value);
      setPlantHealthAnimationKey(prev => prev + 1); // Change key to force remount and reset animation
    };

    return (
      <Group justify="center" gap="sm" mb="md" mt={5}>
        {widgetOptions.map((option) => (
          <motion.div
            key={option.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ActionIcon
              variant={activePlantHealthWidget === option.value ? "filled" : "subtle"}
              color={activePlantHealthWidget === option.value ? "red" : "gray"}
              radius="md"
              size="lg"
              onClick={() => handleSelectorClick(option.value)}
              title={option.label}
            >
              <option.icon size={22} />
            </ActionIcon>
          </motion.div>
        ))}
      </Group>
    );
  };
  
  // Disease Identification Widget
  const DiseaseIdentificationWidget = () => (
    <motion.div 
      key="disease-identification"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={widgetVariant}
    >
      <Paper withBorder p="md" mt="md" radius="md" shadow="sm">
        <Group justify="space-between" mb="md">
          <Text size="sm" fw={500} c="dimmed">Disease Identification</Text>
          <Badge color="red" variant="light">AI Powered</Badge>
        </Group>
        
        <Box style={{ position: 'relative', height: rem(180), overflow: 'hidden' }}>
          {/* Clear instructions about the process */}
          <Text size="xs" c="dimmed" ta="center" mb="sm">
            Leaf Analysis in Progress
          </Text>
          
          {/* Actual leaf image with clear shape */}
          <Center style={{ position: 'relative', height: rem(150) }}>
            <motion.div
              style={{
                width: rem(140),
                height: rem(100),
                background: '#65a30d',
                clipPath: 'polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)',
                position: 'relative',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                borderRadius: '100% 0% 100% 0% / 12% 80% 20% 88%'
              }}
              animate={{
                boxShadow: ['0 2px 10px rgba(0,0,0,0.2)', '0 2px 15px rgba(0,0,0,0.3)', '0 2px 10px rgba(0,0,0,0.2)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Leaf veins for realism */}
              <Box style={{ 
                position: 'absolute', 
                top: '10%', 
                left: '50%', 
                height: '80%', 
                width: '1px', 
                background: 'rgba(255,255,255,0.5)', 
                transform: 'translateX(-50%)' 
              }} />
                
              {Array(4).fill(0).map((_, i) => (
                <Box 
                  key={i}
                  style={{ 
                    position: 'absolute', 
                    top: `${20 + i * 15}%`, 
                    left: '50%', 
                    width: '70%', 
                    height: '1px', 
                    background: 'rgba(255,255,255,0.4)', 
                    transform: `translateX(-50%) rotate(${i % 2 === 0 ? 25 : -25}deg)`,
                  }} 
                />
              ))}
              
              {/* Disease spots that grow over time */}
              {Array(5).fill(0).map((_, i) => {
                const positions = [
                  { top: '20%', left: '25%' },
                  { top: '50%', left: '70%' },
                  { top: '75%', left: '30%' },
                  { top: '35%', left: '80%' },
                  { top: '60%', left: '20%' }
                ];
                
                return (
                  <motion.div 
                    key={i}
                    style={{ 
                      position: 'absolute', 
                      width: 0,
                      height: 0, 
                      borderRadius: '50%',
                      background: 'rgba(150, 30, 30, 0.8)',
                      top: positions[i].top,
                      left: positions[i].left,
                      boxShadow: '0 0 3px rgba(150, 30, 30, 0.5)'
                    }}
                    animate={{ 
                      width: [0, rem(10 + Math.random() * 8)],
                      height: [0, rem(10 + Math.random() * 8)]
                    }}
                    transition={{ 
                      delay: 0.8 + i * 0.3,
                      duration: 1,
                      ease: "easeOut"
                    }}
                  />
                );
              })}
            </motion.div>
            
            {/* Scanning effect */}
            <motion.div
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                width: rem(2),
                height: '100%',
                background: 'rgba(0, 180, 255, 0.6)',
                boxShadow: '0 0 10px rgba(0, 180, 255, 0.8)',
                transform: 'translateX(-50%)'
              }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                top: ['0%', '0%', '100%', '100%']
              }}
              transition={{ 
                duration: 2.5,
                times: [0, 0.1, 0.9, 1],
                repeat: Infinity,
                repeatDelay: 0.5
              }}
            />
          </Center>
          
          {/* Clear results display */}
          <motion.div
            style={{
              position: 'absolute',
              top: rem(30),
              right: rem(10),
              zIndex: 6,
              background: 'white',
              padding: rem(8),
              borderRadius: rem(8),
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              border: '1px solid rgba(0,0,0,0.1)',
              width: rem(150),
              opacity: 0
            }}
            animate={{ 
              opacity: [0, 1],
              x: [20, 0]
            }}
            transition={{ 
              duration: 0.5,
              delay: 3,
              ease: "easeOut"
            }}
          >
            <Stack gap="xs">
              <Group gap="xs">
                <ThemeIcon size="md" radius="xl" color="red">
                  <IconAlertTriangle size={16} />
                </ThemeIcon>
                <Text size="sm" fw={600} c="red">Late Blight</Text>
              </Group>
              
              <Text size="xs" c="dimmed">Severity:</Text>
              <Progress 
                value={85} 
                color="red" 
                size="xs" 
                radius="xl"
                animated={true}
              />
              <Group align="center" gap={5}>
                <Text size="xs" fw={600}>High</Text>
                <Text size="xs" c="dimmed">(Confidence: 94%)</Text>
              </Group>
            </Stack>
          </motion.div>
        </Box>
        
        <Paper 
          withBorder 
          p="md" 
          mt="md" 
          radius="md"
          bg="rgba(220, 50, 50, 0.05)"
          style={{ border: '1px solid var(--mantine-color-red-2)' }}
        >
          <Group align="flex-start" gap="md">
            <ThemeIcon radius="xl" size="lg" color="red" variant="light">
              <IconBug size={20} />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={500} mb={4} c="red.7">Disease Recognition</Text>
              <Text size="sm">Our AI identifies 50+ crop diseases from a single image for faster treatment decisions.</Text>
            </div>
          </Group>
        </Paper>
      </Paper>
    </motion.div>
  );
  
  // Treatment Recommendations Widget
  const TreatmentRecommendationsWidget = () => (
    <motion.div 
      key="treatment-recommendations"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={widgetVariant}
    >
      <Paper withBorder p="md" mt="md" radius="md" shadow="sm">
        <Group justify="space-between" mb="md">
          <Text size="sm" fw={500} c="dimmed">Treatment Recommendations</Text>
          <Badge color="green" variant="light">AI POWERED</Badge>
        </Group>
        
        <Box style={{ position: 'relative', height: rem(180), overflow: 'hidden' }}>
          <Grid gutter={10}>
            {/* Left column - Diagnosed Issue */}
            <Grid.Col span={5}>
              <Text fw={600} size="sm" ta="center" mb={10}>
                Diagnosed Issue
              </Text>
              
              <Box style={{ 
                height: rem(120),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}>
                {/* Plant with disease image */}
                <Box style={{ 
                  width: rem(90), 
                  height: rem(90),
                  background: "#8bc34a",
                  borderRadius: "50% 50% 4px 4px",
                  position: 'relative',
                  marginBottom: rem(10)
                }}>
                  {/* Red disease spots */}
                  {Array(5).fill(0).map((_, i) => (
                    <Box
                      key={`disease-spot-${i}`}
                      style={{
                        position: 'absolute',
                        width: rem(5 + Math.random() * 4),
                        height: rem(5 + Math.random() * 4),
                        borderRadius: '50%',
                        background: '#d32f2f',
                        top: `${20 + Math.random() * 50}%`,
                        left: `${20 + Math.random() * 60}%`,
                      }}
                    />
                  ))}
                </Box>
                
                {/* Disease label */}
                <Badge 
                  color="red" 
                  size="lg"
                  style={{
                    padding: '3px 10px',
                    marginTop: rem(5)
                  }}
                >
                  Late Blight
                </Badge>
                
                <Group justify="space-between" w="100%" mt={10}>
                  <Text size="sm" c="dimmed">Severity:</Text>
                  <Text size="sm" fw={600} c="red">High</Text>
                </Group>
              </Box>
            </Grid.Col>
            
            {/* Divider */}
            <Grid.Col span={1} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Box style={{ width: 1, height: '80%', background: 'rgba(0,0,0,0.1)' }} />
            </Grid.Col>
            
            {/* Right column - Treatment Recommendations */}
            <Grid.Col span={6}>
              <Text fw={600} size="sm" ta="center" mb={10}>
                Recommended Treatments
              </Text>
              
              <Box>
                <Paper 
                  withBorder 
                  p="sm"
                  radius="md"
                  style={{
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    borderLeft: '3px solid var(--mantine-color-blue-6)',
                    marginBottom: rem(10)
                  }}
                >
                  <Group justify="space-between" mb={5}>
                    <Group gap="xs">
                      <ThemeIcon color="blue" size="md" radius="xl">
                        <IconVaccine size={16} />
                      </ThemeIcon>
                      <Text fw={600}>Fungicide</Text>
                    </Group>
                    <Badge color="blue" variant="filled">PRIMARY</Badge>
                  </Group>
                  
                  <Text size="sm" ml={30} c="dimmed">
                    Apply copper-based fungicide spray to affected areas
                  </Text>
                </Paper>
                
                <Box style={{ opacity: 0.7 }}>
                  <Group gap="xs" mb={5}>
                    <ThemeIcon color="green" size="sm" variant="light" radius="xl">
                      <IconPlant2 size={14} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>Plant Removal</Text>
                  </Group>
                  
                  <Text size="xs" ml={30} c="dimmed" mb={5}>
                    Remove and destroy infected plants
                  </Text>
                </Box>
              </Box>
            </Grid.Col>
          </Grid>
        </Box>
        
        <Paper 
          withBorder 
          p="md" 
          mt="md" 
          radius="md"
          bg="rgba(0, 180, 0, 0.05)"
          style={{ border: '1px solid var(--mantine-color-green-2)' }}
        >
          <Group align="flex-start" gap="md">
            <ThemeIcon radius="xl" size="lg" color="green" variant="light">
              <IconVaccine size={20} />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={500} mb={4} c="green.7">Treatment Advisor</Text>
              <Text size="sm">Our system suggests optimal treatment strategies based on disease type, severity, and local conditions.</Text>
            </div>
          </Group>
        </Paper>
      </Paper>
    </motion.div>
  );
  
  // Weed Detection Widget
  const WeedDetectionWidget = () => (
    <motion.div 
      key="weed-detection"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={widgetVariant}
    >
      <Paper withBorder p="md" mt="md" radius="md" shadow="sm">
        <Group justify="space-between" mb="md">
          <Text size="sm" fw={500} c="dimmed">Weed Detection</Text>
          <Badge color="blue" variant="light">AI Powered</Badge>
        </Group>
        
        <Box style={{ position: 'relative', height: rem(180), overflow: 'hidden' }}>
          {/* Phone frame */}
          <Center style={{ height: '100%' }}>
            <Box style={{ 
              width: rem(110), 
              height: rem(160), 
              borderRadius: rem(12), 
              border: '8px solid #333', 
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              {/* Phone screen - field with crops and weeds */}
              <Box style={{ 
                width: '100%', 
                height: '100%', 
                background: 'linear-gradient(180deg, #7da030 0%, #5c8022 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Crop rows */}
                {Array(3).fill(0).map((_, i) => (
                  <Box 
                    key={`crop-row-${i}`}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '3px',
                      top: `${30 + i * 30}%`,
                      background: 'rgba(255,255,255,0.2)'
                    }}
                  />
                ))}
                
                {/* Crops */}
                {Array(12).fill(0).map((_, i) => {
                  const row = Math.floor(i / 4);
                  const col = i % 4;
                  return (
                    <Box 
                      key={`crop-${i}`}
                      style={{
                        position: 'absolute',
                        width: rem(8),
                        height: rem(8),
                        borderRadius: '50%',
                        background: '#a1c940',
                        border: '1px solid #749628',
                        top: `${25 + row * 30}%`,
                        left: `${15 + col * 25}%`
                      }}
                    />
                  );
                })}
                
                {/* Weeds with detection boxes */}
                {Array(4).fill(0).map((_, i) => {
                  const positions = [
                    { top: '20%', left: '28%' },
                    { top: '40%', left: '68%' },
                    { top: '75%', left: '42%' },
                    { top: '50%', left: '22%' }
                  ];
                  
                  return (
                    <React.Fragment key={`weed-group-${i}`}>
                      {/* Weed */}
                      <motion.div
                        style={{
                          position: 'absolute',
                          width: rem(10),
                          height: rem(10),
                          borderRadius: '2px',
                          background: '#b88c3b',
                          top: positions[i].top,
                          left: positions[i].left,
                          zIndex: 2
                        }}
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, i % 2 === 0 ? 5 : -5, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.5
                        }}
                      />
                      
                      {/* Detection box */}
                      <motion.div
                        style={{
                          position: 'absolute',
                          width: rem(16),
                          height: rem(16),
                          border: '1px solid red',
                          borderRadius: '2px',
                          top: `calc(${positions[i].top} - 3px)`,
                          left: `calc(${positions[i].left} - 3px)`,
                          zIndex: 3
                        }}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0, 1, 1, 0],
                          scale: [0.9, 1.1, 1, 0.9]
                        }}
                        transition={{
                          duration: 2,
                          times: [0, 0.3, 0.7, 1],
                          delay: 1.5 + i * 0.5,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      />
                    </React.Fragment>
                  );
                })}
                
                {/* Camera interface elements */}
                <Box style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none'
                }}>
                  {/* Corner markers for camera view */}
                  {[
                    { top: '10%', left: '10%' },
                    { top: '10%', right: '10%' },
                    { bottom: '10%', left: '10%' },
                    { bottom: '10%', right: '10%' }
                  ].map((pos, i) => (
                    <Box
                      key={`corner-${i}`}
                      style={{
                        position: 'absolute',
                        width: rem(10),
                        height: rem(10),
                        borderStyle: 'solid',
                        borderWidth: '0px',
                        ...pos,
                        ...(i === 0 ? { borderTop: '1px solid white', borderLeft: '1px solid white' } :
                           i === 1 ? { borderTop: '1px solid white', borderRight: '1px solid white' } :
                           i === 2 ? { borderBottom: '1px solid white', borderLeft: '1px solid white' } :
                                     { borderBottom: '1px solid white', borderRight: '1px solid white' })
                      }}
                    />
                  ))}
                  
                  {/* Scanning animation */}
                  <motion.div
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '1px',
                      background: 'rgba(0, 180, 255, 0.8)',
                      boxShadow: '0 0 4px rgba(0, 180, 255, 0.6)',
                      top: '0%'
                    }}
                    animate={{
                      top: ['0%', '100%', '0%']
                    }}
                    transition={{
                      duration: 3,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 0.5
                    }}
                  />
                  
                  {/* Record button */}
                  <Box style={{
                    position: 'absolute',
                    bottom: '5%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: rem(18),
                    height: rem(18),
                    borderRadius: '50%',
                    border: '2px solid white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <motion.div
                      style={{
                        width: rem(12),
                        height: rem(12),
                        borderRadius: '50%',
                        background: 'red'
                      }}
                      animate={{
                        scale: [1, 0.8, 1]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Center>
          
          {/* Detection results */}
          <motion.div
            style={{
              position: 'absolute',
              top: rem(10),
              right: rem(5),
              background: 'white',
              padding: rem(8),
              borderRadius: rem(8),
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              border: '1px solid rgba(0,0,0,0.1)',
              width: rem(120),
              zIndex: 5,
              opacity: 0
            }}
            animate={{
              opacity: [0, 1],
              x: [20, 0]
            }}
            transition={{
              duration: 0.5,
              delay: 2,
              ease: "easeOut"
            }}
          >
            <Stack gap="xs">
              <Text size="sm" fw={600} c="blue.7">Detected: 4 Weeds</Text>
              <Progress value={100} color="blue" size="xs" radius="xl" animated={true} />
              <Group justify="space-between" gap={4}>
                <Badge size="xs" variant="outline" color="green">Auto-targeting</Badge>
                <Badge size="xs" variant="filled" color="blue">Active</Badge>
              </Group>
            </Stack>
          </motion.div>
        </Box>
        
        <Paper 
          withBorder 
          p="md" 
          mt="md" 
          radius="md"
          bg="rgba(0, 120, 220, 0.05)"
          style={{ border: '1px solid var(--mantine-color-blue-2)' }}
        >
          <Group align="flex-start" gap="md">
            <ThemeIcon radius="xl" size="lg" color="blue" variant="light">
              <IconZoomScan size={20} />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={500} mb={4} c="blue.7">Weed Monitoring</Text>
              <Text size="sm">Smartphone-based detection identifies weed types for targeted treatment, reducing chemical usage by up to 70%.</Text>
            </div>
          </Group>
        </Paper>
      </Paper>
    </motion.div>
  );

  // Get active plant health widget based on state
  const getActivePlantHealthWidget = () => {
    // Use key to force remount when manually selecting
    const widgetWithKey = (widget: React.ReactNode) => (
      <div key={`health-widget-${activePlantHealthWidget}-${plantHealthAnimationKey}`}>
        {widget}
      </div>
    );
    
    switch (activePlantHealthWidget) {
      case 0:
        return widgetWithKey(<DiseaseIdentificationWidget />);
      case 1:
        return widgetWithKey(<TreatmentRecommendationsWidget />);
      case 2:
        return widgetWithKey(<WeedDetectionWidget />);
      default:
        return widgetWithKey(<DiseaseIdentificationWidget />);
    }
  };
  
  const WeatherForecastWidget = () => (
    <motion.div 
      key="weather-forecast"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={widgetVariant}
    >
      <Paper withBorder p="md" mt="md" radius="md" shadow="sm">
        <Text size="sm" fw={500} c="dimmed" mb="md" ta="center">7-Day Weather Forecast</Text>
        
        <ScrollArea>
          <Group gap="md" wrap="nowrap" mb="md">
            {weatherForecastData.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Paper 
                  withBorder 
                  p="md" 
                  radius="md" 
                  w={90} 
                  shadow="sm"
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: index === 0 ? 'var(--mantine-color-body)' : undefined
                  }}
                >
                  <Text size="sm" fw={500} mb={8}>{day.date}</Text>
                  <Center mb={8}>
                    <day.icon size={28} style={{ color: day.condition.includes('Rain') ? 'var(--mantine-color-blue-5)' : day.condition.includes('Sunny') ? 'var(--mantine-color-yellow-5)' : 'var(--mantine-color-gray-5)' }} />
                  </Center>
                  <Text size="xl" fw={700} lh={1.2}>{day.temp}°C</Text>
                  <Text size="xs" c="dimmed" mb={5}>{day.condition}</Text>
                  <Group justify="center" gap={4}>
                    <IconDroplet size={14} color="var(--mantine-color-blue-5)" />
                    <Text size="xs" c="dimmed">{day.precipitation}%</Text>
                  </Group>
                </Paper>
              </motion.div>
            ))}
          </Group>
        </ScrollArea>
        
        <Paper 
          withBorder 
          p="md" 
          mt="md" 
          radius="md"
          bg="rgba(0, 140, 240, 0.05)"
          style={{ border: '1px solid var(--mantine-color-blue-2)' }}
        >
          <Group align="flex-start" gap="md">
            <ThemeIcon radius="xl" size="lg" color="blue" variant="light">
              <IconCloudRain size={20} />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={500} mb={4} c="blue.7">Weather Advisory</Text>
              <Text size="sm">Rainfall expected mid-week. Consider delaying fertilizer application until Friday for optimal absorption.</Text>
            </div>
          </Group>
        </Paper>
      </Paper>
    </motion.div>
  );
  
  const CropSuitabilityWidget = () => (
    <motion.div 
      key="crop-suitability"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={widgetVariant}
    >
      <Paper withBorder p="md" mt="md" radius="md" shadow="sm">
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
                    value={crop.suitability} 
                    color={crop.color} 
                    size="md" 
                    radius="xl"
                    animated={true}
                    striped={true}
                  />
                </Box>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text size="sm">{crop.notes}</Text>
              </HoverCard.Dropdown>
            </HoverCard>
          ))}
        </Box>
        
        <Paper 
          withBorder 
          p="md" 
          mt="md" 
          radius="md"
          bg="rgba(0, 180, 0, 0.05)"
          style={{ border: '1px solid var(--mantine-color-green-2)' }}
        >
          <Group align="flex-start" gap="md">
            <ThemeIcon radius="xl" size="lg" color="farmGreen" variant="light">
              <IconPlant2 size={20} />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={500} mb={4} c="farmGreen.7">Crop Recommendation</Text>
              <Text size="sm">Our AI analysis indicates corn and soybeans are highly suitable for your soil conditions and local climate.</Text>
            </div>
          </Group>
        </Paper>
      </Paper>
    </motion.div>
  );
  
  const YieldEstimationWidget = () => (
    <motion.div 
      key="yield-estimation"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={widgetVariant}
    >
      <Paper withBorder p="md" mt="md" radius="md" shadow="sm">
        <Text size="sm" fw={500} c="dimmed" mb="md">Yield Estimation (kg/ha)</Text>
        <Box mb="md">
          <LineChart 
            h={120}
            data={chartData}
            dataKey="date"
            series={[
              { name: 'YieldEst', color: 'farmGreen.6', label: 'Estimated Yield' },
              { name: 'AvgYield', color: 'blue.5', label: 'Avg. Regional Yield' },
            ]}
            curveType="monotone"
            withYAxis
            yAxisProps={{ width: 30 }}
            gridAxis="y"
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
        
        <Group justify="space-between" mb="md">
          <Stack gap={0}>
            <Text size="sm" c="dimmed">Projected Yield</Text>
            <Group gap="xs">
              <Text size="xl" fw={700}>3,215</Text>
              <Text size="xs" c="dimmed">kg/ha</Text>
            </Group>
          </Stack>
          
          <Badge color="green" size="lg" variant="light" leftSection={
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <IconArrowUp size={14} />
            </motion.div>
          }>
            +18% vs Avg
          </Badge>
        </Group>
        
        <Paper 
          withBorder 
          p="md" 
          mt="md"
          radius="md"
          bg="rgba(0, 180, 0, 0.05)"
          style={{ border: '1px solid var(--mantine-color-green-2)' }}
        >
          <Group align="flex-start" gap="md">
            <ThemeIcon radius="xl" size="lg" color="farmGreen" variant="light">
              <IconTractor size={20} />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={500} mb={4} c="farmGreen.7">Yield Insight</Text>
              <Text size="sm">Based on current conditions and historical data, your yield is projected to be 18% above regional average.</Text>
            </div>
          </Group>
        </Paper>
      </Paper>
    </motion.div>
  );
  
  const ResourceUsageWidget = () => (
    <motion.div 
      key="resource-usage"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={widgetVariant}
    >
      <Paper withBorder p="md" mt="md" radius="md" shadow="sm">
        <Tabs defaultValue="water" variant="outline">
          <Tabs.List grow mb="md">
            <Tabs.Tab value="water" leftSection={<IconDroplet size={16} />}>Water</Tabs.Tab>
            <Tabs.Tab value="fertilizer" leftSection={<IconVaccine size={16} />}>Fertilizer</Tabs.Tab>
          </Tabs.List>
          
          <Tabs.Panel value="water">
            <Group justify="space-between" mb="md">
              <Stack gap={0}>
                <Text size="sm" c="dimmed">Current Usage</Text>
                <Group gap="xs">
                  <Text size="xl" fw={700}>{resourceData.water.current}</Text>
                  <Text size="xs" c="dimmed">m³/ha</Text>
                </Group>
              </Stack>
              
              <Stack gap={0} align="flex-end">
                <Text size="sm" c="dimmed">Recommended</Text>
                <Group gap="xs">
                  <Text size="xl" fw={700} c="cyan">{resourceData.water.recommended}</Text>
                  <Text size="xs" c="dimmed">m³/ha</Text>
                </Group>
              </Stack>
            </Group>
            
            <Text size="sm" fw={500} c="dimmed" mb="xs">Weekly Distribution (m³)</Text>
            <Box mb="md">
              <BarChart
                h={100}
                data={resourceData.water.forecast}
                dataKey="week"
                series={[{ name: 'amount', color: 'cyan.6' }]}
                barProps={{ radius: 4 }}
                tickLine="x"
                withYAxis={false}
                gridAxis="none"
              />
            </Box>
            
            <Paper 
              withBorder 
              p="md" 
              mt="md"
              radius="md"
              bg="rgba(0, 140, 240, 0.05)"
              style={{ border: '1px solid var(--mantine-color-blue-2)' }}
            >
              <Group align="flex-start" gap="md">
                <ThemeIcon radius="xl" size="lg" color="blue" variant="light">
                  <IconDroplet size={20} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={500} mb={4} c="blue.7">Water Optimization</Text>
                  <Text size="sm">Potential water savings of {resourceData.water.savings}% by following AI-optimized irrigation schedule.</Text>
                </div>
              </Group>
            </Paper>
          </Tabs.Panel>
          
          <Tabs.Panel value="fertilizer">
            <Group justify="space-between" mb="md">
              <Stack gap={0}>
                <Text size="sm" c="dimmed">Current Usage</Text>
                <Group gap="xs">
                  <Text size="xl" fw={700}>{resourceData.fertilizer.current}</Text>
                  <Text size="xs" c="dimmed">kg/ha</Text>
                </Group>
              </Stack>
              
              <Stack gap={0} align="flex-end">
                <Text size="sm" c="dimmed">Recommended</Text>
                <Group gap="xs">
                  <Text size="xl" fw={700} c="green">{resourceData.fertilizer.recommended}</Text>
                  <Text size="xs" c="dimmed">kg/ha</Text>
                </Group>
              </Stack>
            </Group>
            
            <Text size="sm" fw={500} c="dimmed" mb="xs">Nutrient Breakdown</Text>
            <Box mb="md">
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <thead>
                  <tr>
                    <th>Nutrient</th>
                    <th style={{ textAlign: 'right' }}>Current</th>
                    <th style={{ textAlign: 'right' }}>Recommended</th>
                  </tr>
                </thead>
                <tbody>
                  {resourceData.fertilizer.forecast.map((item) => (
                    <tr key={item.nutrient}>
                      <td>{item.nutrient}</td>
                      <td style={{ textAlign: 'right' }}>{item.current} kg/ha</td>
                      <td style={{ textAlign: 'right' }}>{item.recommended} kg/ha</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
            
            <Paper 
              withBorder 
              p="md" 
              mt="md"
              radius="md"
              bg="rgba(0, 180, 0, 0.05)"
              style={{ border: '1px solid var(--mantine-color-green-2)' }}
            >
              <Group align="flex-start" gap="md">
                <ThemeIcon radius="xl" size="lg" color="green" variant="light">
                  <IconVaccine size={20} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={500} mb={4} c="green.7">Fertilizer Optimization</Text>
                  <Text size="sm">Optimize fertilizer application for a {resourceData.fertilizer.savings}% reduction while maintaining yield.</Text>
                </div>
              </Group>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </motion.div>
  );

  // Satellite Farm Insights Widget - ENHANCED
  const SatelliteFarmInsightsWidget = () => {
    const [housePositions, setHousePositions] = useState<{ top: string; left: string }[] | null>(null);
    const [analysisComplete, setAnalysisComplete] = useState(false);

    useEffect(() => {
      // Generate positions only on the client after mount
      const positions = Array(15).fill(0).map(() => ({
        top: `${10 + Math.random() * 80}%`,
        left: `${10 + Math.random() * 80}%`,
      }));
      setHousePositions(positions);
      
      // Set analysis complete after 5 seconds
      const timer = setTimeout(() => {
        setAnalysisComplete(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
      <motion.div
        key="satellite-insights"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={widgetVariant}
      >
        <Paper withBorder p="md" mt="md" radius="md" shadow="sm">
          <Group justify="space-between" mb="md">
            <Group>
              <motion.div
                animate={{ 
                  rotate: [0, 0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  repeatDelay: 4,
                  times: [0, 0.1, 1]
                }}
              >
                <IconSatellite size={20} style={{ color: 'var(--mantine-color-blue-5)' }} />
              </motion.div>
            <Text size="sm" fw={500} c="dimmed">Satellite Analysis</Text>
            </Group>
            <Badge color="blue" variant="light">AI Powered</Badge>
          </Group>

          <Box style={{
            position: 'relative',
            height: rem(200),
            overflow: 'hidden',
            background: 'var(--mantine-color-dark-8)', // Dark background for satellite view
            borderRadius: 'var(--mantine-radius-sm)',
            border: '1px solid var(--mantine-color-dark-6)'
          }}>
            {/* Field 1 (Top Left Large) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              style={{ position: 'absolute', top: '5%', left: '5%', width: '35%', height: '30%', background: 'var(--mantine-color-farmGreen-8)', borderRadius: '4px' }}
            />
            {/* Field 2 (Top Left Small) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              style={{ position: 'absolute', top: '5%', left: '42%', width: '15%', height: '18%', background: 'var(--mantine-color-yellow-8)', borderRadius: '4px' }}
            />
            {/* Field 3 (Mid Left) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              style={{ position: 'absolute', top: '38%', left: '5%', width: '35%', height: '25%', background: 'var(--mantine-color-farmGreen-7)', borderRadius: '4px' }}
            />
            {/* Field 4 (Bottom Left) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.7 }}
              style={{ position: 'absolute', top: '66%', left: '5%', width: '35%', height: '28%', background: 'var(--mantine-color-farmGreen-9)', borderRadius: '4px' }}
            />
            {/* Road (Vertical) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 2.0 }}
              style={{ position: 'absolute', top: '5%', left: '60%', width: '8%', height: '90%', background: 'var(--mantine-color-dark-5)', transform: 'skewY(-20deg)', borderRadius: '2px' }}
            />
            {/* Field 5 (Top Right) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 2.3 }}
              style={{ position: 'absolute', top: '5%', left: '70%', width: '25%', height: '20%', background: 'var(--mantine-color-yellow-7)', borderRadius: '4px' }}
            />
            {/* Field 6 (Mid Right Large) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 2.6 }}
              style={{ position: 'absolute', top: '28%', left: '70%', width: '25%', height: '35%', background: 'var(--mantine-color-farmGreen-6)', borderRadius: '4px' }}
            />
            
            {/* Residential Area (Bottom Right) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 2.9 }}
              style={{ position: 'absolute', top: '66%', left: '70%', width: '25%', height: '28%', background: 'var(--mantine-color-dark-6)', borderRadius: '4px' }}
            >
               {/* Tiny dots for houses - Render only when positions are ready */}
               {housePositions && housePositions.map((pos, i) => (
                  <motion.div 
                    key={`house-${i}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.2, 
                      delay: 3.0 + (i * 0.1) % 1 // Stagger the appearance
                    }}
                    style={{ 
                      position: 'absolute', 
                      top: pos.top, 
                      left: pos.left, 
                      width: '3px', 
                      height: '3px', 
                      background: 'var(--mantine-color-gray-5)', 
                      borderRadius: '50%' 
                    }} 
                  />
               ))}
            </motion.div>

            {/* Grid overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.2, 0.2, 0] }}
              transition={{ 
                duration: 6, 
                delay: 0.5,
                repeat: Infinity,
                repeatDelay: 3
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'linear-gradient(rgba(0, 180, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 180, 255, 0.3) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                zIndex: 2
              }}
            />

            {/* Horizontal Scanning Line Animation */}
            <motion.div
              style={{
                position: 'absolute',
                left: 0,
                top: '0%',
                width: '100%',
                height: '2px',
                background: 'rgba(0, 180, 255, 0.7)',
                boxShadow: '0 0 8px rgba(0, 180, 255, 0.9)',
                zIndex: 3
              }}
              animate={{
                top: ['0%', '100%', '100%', '0%'],
                opacity: [1, 1, 0, 0]
              }}
              transition={{
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 2,
                times: [0, 0.5, 0.51, 1]
              }}
            />

            {/* Vertical Scanning Line Animation */}
            <motion.div
              style={{
                position: 'absolute',
                left: '0%',
                top: 0,
                width: '2px',
                height: '100%',
                background: 'rgba(0, 180, 255, 0.7)',
                boxShadow: '0 0 8px rgba(0, 180, 255, 0.9)',
                zIndex: 3
              }}
              animate={{
                left: ['0%', '100%', '100%', '0%'],
                opacity: [1, 1, 0, 0]
              }}
              transition={{
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 2,
                times: [0, 0.5, 0.51, 1]
              }}
            />

            {/* Calculating text that appears during scan */}
            <motion.div
              style={{
                position: 'absolute',
                top: '45%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 4
              }}
              animate={{
                opacity: analysisComplete ? 0 : [0, 1, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: analysisComplete ? 0 : Infinity,
                repeatDelay: 2
              }}
            >
              <Text ta="center" fw={700} style={{ color: 'rgba(0, 200, 255, 0.9)', textShadow: '0 0 10px rgba(0, 150, 255, 0.7)' }}>
                ANALYZING
              </Text>
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
              >
                <Text size="xs" ta="center" c="cyan">Processing satellite data...</Text>
              </motion.div>
            </motion.div>

            {/* Classification Results */}
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '10px',
                background: 'rgba(0, 0, 25, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 10,
                opacity: 0
              }}
              animate={{
                opacity: analysisComplete ? 1 : 0,
              }}
              transition={{
                duration: 0.8,
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: analysisComplete ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
              >
                <ThemeIcon size={60} radius={30} color="blue" variant="filled">
                  <IconRulerMeasure size={30} />
                </ThemeIcon>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: analysisComplete ? 1 : 0, y: analysisComplete ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Badge
                  size="xl"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
              >
                  Medium Farm (150-500 acres)
              </Badge>
            </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: analysisComplete ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Text size="sm" c="gray.3" ta="center">Analysis complete with 94% confidence</Text>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: analysisComplete ? 1 : 0, y: analysisComplete ? 0 : 10 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <Group mt="sm">
                  <Badge color="green" variant="light">6 Fields Detected</Badge>
                  <Badge color="yellow" variant="light">2 Crop Types</Badge>
                </Group>
              </motion.div>
            </motion.div>
          </Box>

          <Paper
            withBorder
            p="md"
            mt="md"
            radius="md"
            bg="rgba(0, 120, 220, 0.05)"
            style={{ border: '1px solid var(--mantine-color-blue-2)' }}
          >
            <Group align="flex-start" gap="md">
              <ThemeIcon radius="xl" size="lg" color="blue" variant="light">
                <IconRulerMeasure size={20} />
              </ThemeIcon>
              <div>
                <Text size="sm" fw={500} mb={4} c="blue.7">Size Classification</Text>
                <Text size="sm">Analysis indicates a medium-sized farm (150-500 acres), allowing for tailored resource recommendations.</Text>
              </div>
            </Group>
          </Paper>
        </Paper>
      </motion.div>
    );
  }

  // Get active recommendation widget based on state
  const getActiveRecommendationWidget = () => {
    // Use key to force remount when manually selecting
    const widgetWithKey = (widget: React.ReactNode) => (
      <div key={`widget-${activeRecommendationWidget}-${animationKey}`}>
        {widget}
      </div>
    );
    
    switch (activeRecommendationWidget) {
      case 0:
        return widgetWithKey(<CropSuitabilityWidget />);
      case 1:
        return widgetWithKey(<YieldEstimationWidget />);
      case 2:
        return widgetWithKey(<ResourceUsageWidget />);
      case 3:
        return widgetWithKey(<WeatherForecastWidget />);
      default:
        return widgetWithKey(<YieldEstimationWidget />);
    }
  };

  const howItWorksItems = howItWorksSteps.map((step, index) => (
    <Stepper.Step
        key={step.title}
        icon={<step.icon size={24} />}
        label={`Step ${index + 1}`}
        description={step.title}
    >
      <Text size="sm">{step.description}</Text>
    </Stepper.Step>
  ));

  const pricingItems = pricingTiers.map((tier) => (
    <motion.div key={tier.title} variants={itemVariant}>
      <Paper withBorder p="xl" className={classes.pricingCard}>
        <Text ta="center" fz="lg" fw={500} mt="md">
            {tier.title}
        </Text>
        <Text ta="center" fz="xl" fw={700} mt="sm">
            {tier.price}
            <Text span fz="sm" c="dimmed">{tier.period}</Text>
        </Text>

        <Divider my="md" />

        <List
            spacing="sm"
            size="sm"
            center
            icon={
            <ThemeIcon color="farmGreen" size={24} radius="xl">
                <IconCheck style={{ width: rem(16), height: rem(16) }} />
            </ThemeIcon>
            }
        >
            {tier.features.map((feature) => (
                <List.Item key={feature}>{feature}</List.Item>
            ))}
        </List>

        <Button
            fullWidth
            variant={tier.buttonVariant as any} // Cast because variant can be gradient string
            gradient={tier.buttonVariant === 'gradient' ? { from: 'farmGreen', to: 'cyan' } : undefined}
            mt="xl"
            component={Link}
            href={tier.price === 'Contact Us' ? '/contact' : '/signup'} // Example links
        >
            {tier.buttonText}
        </Button>
      </Paper>
    </motion.div>
  ));

  // Weather widget component
  const WeatherWidget = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Paper p="md" withBorder className={classes.weatherWidget} style={{ width: rem(280) }}>
        <Group mb="md">
          <weatherData.current.icon size={32} />
          <div>
            <Text fw={700} size="xl">{weatherData.current.temp}°C</Text>
            <Text size="sm">{weatherData.current.condition}</Text>
          </div>
        </Group>
        
        <Grid>
          <Grid.Col span={4}>
            <Group>
              <IconDropletFilled size={20} />
              <Text size="sm">{weatherData.current.humidity}%</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={4}>
            <Group>
              <IconWind size={20} />
              <Text size="sm">{weatherData.current.windSpeed} km/h</Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={4}>
            <Group>
              <IconTemperature size={20} />
              <Group gap={4}>
                <IconArrowUp size={16} />
                <Text size="sm">26°</Text>
              </Group>
            </Group>
          </Grid.Col>
        </Grid>

        <Divider my="sm" />
        
        <Group grow>
          {weatherData.forecast.map((day) => (
            <Flex key={day.day} direction="column" align="center" gap={5}>
              <Text size="xs">{day.day}</Text>
              <day.icon size={20} />
              <Text size="sm">{day.temp}°</Text>
            </Flex>
          ))}
        </Group>
      </Paper>
    </motion.div>
  );

  return (
    <>
      {/* Hero Section */}
      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={sectionVariant}
        className={classes.hero}
      >
        {/* Background Carousel */}
        <Carousel
          withIndicators={false}
          withControls={false}
          height="100%"
          slideSize="100%"
          loop
          align="start"
          slidesToScroll={1}
          className={classes.heroCarousel}
          // @ts-ignore 
          plugins={[autoplay.current]}
          onMouseEnter={autoplay.current.stop}
          onMouseLeave={autoplay.current.reset}
        >
          {imageList.map((image, index) => (
              <Carousel.Slide key={index}>
                  <Image
                      src={image.src}
                      alt={image.alt}
                      fill // Replace layout="fill"
                      style={{ objectFit: 'cover' }} // Replace objectFit="cover"
                      sizes="100vw" // Add sizes
                      priority={index === 0}
                  />
              </Carousel.Slide>
          ))}
        </Carousel>

        {/* Overlay for text readability */}
        <Overlay color="#000" opacity={0.6} zIndex={2} /> 

        {/* Content on top */}
        <Container size="lg" className={classes.heroInner}> 
            <Group justify="space-between" w="100%" align="center">
              <div style={{ flex: 1 }}> 
                <Title className={classes.heroTitle}>
                    Grow Smarter with{' '}
                    <Text component="span" variant="gradient" gradient={{ from: 'farmGreen', to: 'cyan' }} inherit>
                        FarmWise
                    </Text>
                </Title>
                <Text className={classes.heroDescription} color="dimmed" mt="xl" mb="xl">
                    Leverage AI for intelligent recommendations, disease detection, and resource optimization.
                    Maximize your yield and efficiency like never before.
                </Text>
                <Group mt="xl">
                  <Button
                      variant="gradient"
                      gradient={{ from: 'farmGreen', to: 'cyan' }}
                      size="xl"
                      radius="xl"
                      className={classes.heroControl}
                      component={Link}
                      href="/signup"
                  >
                      Get Started Now
                  </Button>
                </Group>
              </div>
              {/* <WeatherWidget /> */} {/* Removed WeatherWidget */}
            </Group>
        </Container>
      </motion.div>

      {/* Features Section */}
      <motion.section
        id="features"
        className={classes.sectionWrapper}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
      >
        <Container size="lg">
            <Title order={2} className={classes.sectionTitle} ta="center">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    Our
                </motion.span>{' '}
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className={classes.highlightedText}
                >
                    Key Features
                </motion.span>
            </Title>
            
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt="xl">
                {features.map((feature, index) => (
                    <motion.div 
                        key={feature.title} 
                        custom={index}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={{
                            hidden: { opacity: 0, y: 50 },
                            visible: (i) => ({
                                opacity: 1,
                                y: 0,
                                transition: {
                                    delay: i * 0.2,
                                    duration: 0.7,
                                    ease: [0.215, 0.61, 0.355, 1]
                                }
                            })
                        }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            <Card 
                                shadow="md" 
                                className={classes.featureCard} 
                                padding="xl"
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.3 + 0.8, duration: 0.6, type: "spring" }}
                                >
                                    <ThemeIcon 
                                        size={70} 
                                        radius={35} 
                                        variant="gradient" 
                                        gradient={{ from: 'farmGreen', to: 'cyan', deg: 45 }}
                                        className={classes.featureIcon}
                                    >
                                        <motion.div
                                            animate={{ rotate: [0, 360] }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", border: "2px dashed rgba(255,255,255,0.2)" }}
                                        />
                                        <feature.icon style={{ width: rem(40), height: rem(40) }} stroke={1.5} />
                                    </ThemeIcon>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.3 + 1.2, duration: 0.4 }}
                                >
                                    <Text fz="lg" fw={600} className={classes.featureTitle} mt="md">
                                        {feature.title}
                                    </Text>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.3 + 1.4, duration: 0.5 }}
                                >
                                    <Text fz="sm" c="dimmed" mt="sm">
                                        {feature.description}
                                    </Text>
                                </motion.div>
                                
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    transition={{ delay: index * 0.3 + 1.6, duration: 0.5 }}
                                >
                                    <List
                                        mt="md"
                                        spacing="sm"
                                        size="sm"
                                        className={classes.featureCardList}
                                        icon={
                                            <ThemeIcon size={20} radius="xl" variant="light" color="farmGreen">
                                                <IconListDetails style={{ width: rem(12), height: rem(12) }} />
                                            </ThemeIcon>
                                        }
                                    >
                                        {feature.details.map((detail, detailIndex) => (
                                            <motion.div 
                                                key={detail.text}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.2 + detailIndex * 0.1 + 1.8, duration: 0.3 }}
                                            >
                                                <List.Item
                                                    icon={
                                                        <ThemeIcon
                                                            size={20}
                                                            radius="xl"
                                                            variant="light"
                                                            color={index === 0 ? "farmGreen" : index === 1 && detailIndex === activePlantHealthWidget ? "red" : "farmGreen"}
                                                            className={(index === 0 && detailIndex === activeRecommendationWidget) || (index === 1 && detailIndex === activePlantHealthWidget) ? classes.pulsingIcon : undefined}
                                                        >
                                                            <detail.icon style={{ width: rem(12), height: rem(12) }} />
                                                        </ThemeIcon>
                                                    }
                                                >
                                                    {detail.text}
                                                </List.Item>
                                            </motion.div>
                                        ))}
                                    </List>
                                </motion.div>
                                
                                {/* Use Stack for consistent vertical spacing of selectors and widgets */}
                                <Stack mt="lg" gap="md">
                                    {index === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 2.3, duration: 0.5 }}
                                        >
                                            <RecommendationSelector />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 2.5, duration: 0.5 }}
                                            >
                                                {getActiveRecommendationWidget()}
                                            </motion.div>
                                        </motion.div>
                                    )}
                                    {index === 1 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 2.3, duration: 0.5 }}
                                        >
                                            <PlantHealthSelector />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 2.5, duration: 0.5 }}
                                            >
                                                {getActivePlantHealthWidget()}
                                            </motion.div>
                                        </motion.div>
                                    )}
                                    {/* Render Satellite Widget for the third feature, maintaining structure */}
                                    {index === 2 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 2.3, duration: 0.5 }}
                                        >
                                            <SatelliteFarmInsightsWidget />
                                        </motion.div>
                                    )}
                                </Stack>
                            </Card>
                        </motion.div>
                    </motion.div>
                ))}
            </SimpleGrid>
        </Container>
      </motion.section>

      <Divider my="xl" />

      {/* Data Visualizations Section - Refactored */}
      <motion.section
        id="analytics"
        className={classes.sectionWrapper}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
      >
        <Container size="lg">
            <Title order={2} className={classes.sectionTitle} ta="center">
                Farm Analytics Dashboard
            </Title>
            <Text c="dimmed" ta="center" mt="sm" mb="xl" maw={560} mx="auto">
                Visualize your farm's key metrics. Gain insights into crop distribution, soil health, rainfall patterns, and yield projections to make informed decisions.
            </Text>

            <Grid gutter="xl">
              {/* Crop Distribution */}
              <Grid.Col span={{ base: 12, md: 6, lg: 5 }}>
                <motion.div variants={itemVariant} style={{ height: '100%' }}> {/* Ensure motion div takes full height */}
                  <Paper p="xl" withBorder shadow="md" radius="md" className={classes.analyticsCard} style={{ height: '100%' }}> {/* Added height 100% */}
                    <Group justify="space-between" mb="lg">
                        <Text fw={600} size="lg">Crop Distribution</Text>
                        <ThemeIcon variant="light" color="farmGreen" size="lg" radius="md">
                            <IconPlant2 size={20} />
                        </ThemeIcon>
                    </Group>
                    {/* Use Flex to position chart and legend */}
                    <Flex direction={{ base: 'column', sm: 'row' }} gap="lg" align="center">
                      {/* Pie Chart */}
                      <Box flex={1} miw={180}> {/* Ensure chart has minimum width */}
                        <PieChart
                          h={220} // Adjust height if needed
                          data={cropDistributionData}
                          tooltipDataSource="segment"
                          withTooltip
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
                          // Removed withLabels and labelsType
                        />
                      </Box>
                      {/* Custom Legend */}
                      <Box flex={1}>
                        <Stack gap="sm">
                          {cropDistributionData.map((item) => (
                            <Group key={item.name} gap="sm">
                              <Box w={14} h={14} bg={item.color} style={{ borderRadius: '3px' }} />
                              <Flex justify="space-between" style={{ flex: 1 }}>
                                <Text size="sm">{item.name}</Text>
                                <Text size="sm" c="dimmed">{item.value}%</Text>
                              </Flex>
                            </Group>
                          ))}
                        </Stack>
                      </Box>
                    </Flex>
                  </Paper>
                </motion.div>
              </Grid.Col>

              {/* Soil Health */}
              <Grid.Col span={{ base: 12, md: 6, lg: 7 }}>
                <motion.div variants={itemVariant} style={{ height: '100%' }}> {/* Ensure motion div takes full height */}
                  <Paper p="xl" withBorder shadow="md" radius="md" className={classes.analyticsCard} style={{ height: '100%' }}> {/* Added height 100% */}
                     <Group justify="space-between" mb="lg">
                        <Text fw={600} size="lg">Soil Health Overview</Text>
                        <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                            <IconTestPipe size={20} /> {/* Changed icon */}
                        </ThemeIcon>
                    </Group>
                    <ScrollArea h={280} type="auto"> {/* Added ScrollArea */}
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                        {soilHealthData.map((field) => (
                          <Box key={field.name} mb="md">
                            <Group justify="space-between" mb="xs">
                              <Text size="sm" fw={500}>{field.name}</Text>
                              <Badge variant="light" color={ ((field.nitrogen + field.phosphorus + field.potassium) / 3) > 70 ? 'green' : 'orange'}>
                                  Score: {Math.round((field.nitrogen + field.phosphorus + field.potassium) / 3)}%
                              </Badge>
                            </Group>
                            <Stack gap={8} mt="sm">
                                <Box>
                                    <Group justify="space-between"><Text size="xs" c="dimmed">Nitrogen</Text><Text size="xs">{field.nitrogen}%</Text></Group>
                                    <Progress value={field.nitrogen} color="blue" size="sm" radius="sm" />
                                </Box>
                                <Box>
                                    <Group justify="space-between"><Text size="xs" c="dimmed">Phosphorus</Text><Text size="xs">{field.phosphorus}%</Text></Group>
                                    <Progress value={field.phosphorus} color="orange" size="sm" radius="sm"/>
                                </Box>
                                <Box>
                                    <Group justify="space-between"><Text size="xs" c="dimmed">Potassium</Text><Text size="xs">{field.potassium}%</Text></Group>
                                    <Progress value={field.potassium} color="violet" size="sm" radius="sm"/>
                                </Box>
                            </Stack>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </ScrollArea>
                  </Paper>
                </motion.div>
              </Grid.Col>

              {/* Yearly Rainfall */}
              <Grid.Col span={{ base: 12, md: 6, lg: 7 }}>
                <motion.div variants={itemVariant} style={{ height: '100%' }}> {/* Ensure motion div takes full height */}
                  <Paper p="xl" withBorder shadow="md" radius="md" className={classes.analyticsCard} style={{ height: '100%' }}> {/* Added height 100% */}
                    <Group justify="space-between" mb="lg">
                        <Text fw={600} size="lg">Annual Rainfall (mm)</Text>
                         <ThemeIcon variant="light" color="cyan" size="lg" radius="md">
                            <IconCloudRain size={20} />
                        </ThemeIcon>
                    </Group>
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
                  </Paper>
                </motion.div>
              </Grid.Col>

              {/* Yield Projection */}
              <Grid.Col span={{ base: 12, md: 6, lg: 5 }}>
                <motion.div variants={itemVariant} style={{ height: '100%' }}> {/* Ensure motion div takes full height */}
                  <Paper p="xl" withBorder shadow="md" radius="md" className={classes.analyticsCard} style={{ height: '100%' }}>
                    <Group justify="space-between" mb="lg">
                        <Text fw={600} size="lg">Yield Projection</Text>
                         <ThemeIcon variant="light" color="yellow" size="lg" radius="md">
                            <IconChartLine size={20} /> {/* Changed icon */}
                        </ThemeIcon>
                    </Group>
                    <Center style={{ flexDirection: 'column', height: 'calc(100% - 80px)' }}> {/* Adjust height */}
                        <RingProgress
                            size={160} // Increased size
                            thickness={16} // Increased thickness
                            roundCaps
                            sections={[{ value: 75, color: 'farmGreen.6', tooltip: 'Projected completion: 75%' }]}
                            label={
                                <Stack align="center" gap={0}>
                                    <Text ta="center" fw={700} size="xl">75%</Text>
                                    <Text ta="center" size="xs" c="dimmed">Target</Text>
                                </Stack>
                            }
                            mb="lg"
                        />
                        <Stack align="center" gap="xs">
                             <Text size="lg" fw={700} ta="center" component="div"> {/* Added component="div" */}
                               On Track <Badge color="green" variant="light" size="sm">+5% vs Last Year</Badge>
                             </Text>
                             <Text size="sm" c="dimmed" ta="center">
                               Current projection based on available data. Monitor conditions closely.
                             </Text>
                        </Stack>
                    </Center>
                  </Paper>
                </motion.div>
              </Grid.Col>
            </Grid>
        </Container>
      </motion.section>

      <Divider my="xl" />

      {/* How It Works Section */}
      <motion.section
        id="how-it-works"
        className={classes.sectionWrapper}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
      >
        <Container size="lg">
            <Title order={2} className={classes.sectionTitle} ta="center">
                How FarmWise Works
            </Title>
            <Stepper 
              active={-1} 
              mt="xl" 
              color="farmGreen" 
              allowNextStepsSelect={false}
            >
              {howItWorksItems}
            </Stepper>
        </Container>
      </motion.section>

      <Divider my="xl" />

      {/* Pricing Section */}
      <motion.section
        id="pricing"
        className={classes.sectionWrapper}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
      >
        <Container size="lg">
            <Title order={2} className={classes.sectionTitle} ta="center">
                Choose Your Plan
            </Title>
            <Text c="dimmed" ta="center" mt="sm">
                Start optimizing your farm today with a plan that suits your needs.
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" mt="xl">
                {pricingItems}
            </SimpleGrid>
        </Container>
      </motion.section>

      <Divider my="xl" />

      {/* Testimonials Section - Reworked */}
      <motion.section
        id="testimonials"
        className={classes.sectionWrapper}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariant}
      >
        <Container size="lg">
            <Title order={2} className={classes.sectionTitle} ta="center">
                What Farmers Are Saying
            </Title>
            <Text c="dimmed" ta="center" mt="sm" mb="xl" maw={560} mx="auto">
                Hear directly from farmers who have benefited from FarmWise insights.
            </Text>

            {/* Use SimpleGrid for layout (can be swapped for Carousel later) */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl" mt="xl">
                {testimonials.map((item) => (
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
                                    <Text fz="md" style={{ fontStyle: 'italic' }}>
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

      {/* CTA Section */}
      <motion.section
        className={classes.ctaSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariant}
      >
        <Container size="lg" className={classes.ctaInner}>
            <Title order={2} ta="center">
                Ready to Boost Your Farm's Potential?
            </Title>
            <Text ta="center" c="dimmed" mt="sm" mb="xl">
                Join hundreds of farmers using FarmWise to make data-driven decisions.
            </Text>
            <Center>
                <Button
                    size="xl"
                    radius="xl"
                    variant="gradient"
                    gradient={{ from: 'farmGreen', to: 'cyan' }}
                    component={Link}
                    href="/signup"
                >
                    Sign Up for Free Trial
                </Button>
            </Center>
        </Container>
      </motion.section>
    </>
  );
}
