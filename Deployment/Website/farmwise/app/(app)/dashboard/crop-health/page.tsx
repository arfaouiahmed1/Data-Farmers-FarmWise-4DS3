'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    Title,
    Text,
    Container,
    Paper,
    Alert,
    Box,
    Tabs,
    Grid,
    Stack,
    rem,
    Button,
    ScrollArea,
    TextInput,
    Group,
    Avatar,
    Loader,
    ThemeIcon,
    Image,
    SegmentedControl,
    Select,
    Progress,
    Card,
    Badge,
    Slider,
    ActionIcon,
    Tooltip,
    useMantineTheme,
    Collapse,
    useMantineColorScheme,
    Divider,
    List,
    Center
} from '@mantine/core';
import { IconPlant2, IconInfoCircle, IconBug, IconLeaf, IconMessageChatbot, IconUpload, IconPhoto, IconX, IconSend, IconCalendar, IconTrendingUp, IconChartBar, IconMapPin, IconPlayerPlay, IconPlayerPause, IconArrowsMaximize, IconArrowRight, IconCheck, IconMedicineSyrup, IconShieldCheck, IconAlertTriangle } from '@tabler/icons-react';
import styles from './CropHealthPage.module.css';
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from '@mantine/dropzone';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { AreaChart } from '@mantine/charts';
import { AiChatInterface } from '@/components/AiChat/AiChatInterface';

// Dynamically import FarmHealthMap, disabling SSR
const FarmHealthMap = dynamic(
  () => import('./FarmHealthMap'),
  { 
    ssr: false,
    loading: () => <Box style={{ height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader /> <Text ml="sm">Loading Map...</Text></Box> // Optional loading indicator
  }
);

// Define interface for farm data
interface Farm {
  id: string;
  name: string;
  location: string;
  area: number; // in hectares
  cropType: string;
  coordinates: number[][]; // GeoJSON-like coordinates
}

// Sample farm data (this would come from user input in a real application)
const farmData: Farm[] = [
  {
    id: 'farm-1',
    name: 'North Field',
    location: 'Béja, Tunisia',
    area: 12.5,
    cropType: 'Wheat',
    coordinates: [
      [9.05, 36.65], [9.05, 37.0], [9.45, 37.0], [9.45, 36.65], [9.05, 36.65]
    ]
  },
  {
    id: 'farm-2',
    name: 'South Valley',
    location: 'Jendouba, Tunisia',
    area: 8.3,
    cropType: 'Barley',
    coordinates: [
      [8.75, 36.40], [8.75, 36.60], [9.10, 36.60], [9.10, 36.40], [8.75, 36.40]
    ]
  },
  {
    id: 'farm-3',
    name: 'East Plantation',
    location: 'Siliana, Tunisia',
    area: 5.7,
    cropType: 'Olives',
    coordinates: [
      [9.30, 36.00], [9.30, 36.20], [9.55, 36.20], [9.55, 36.00], [9.30, 36.00]
    ]
  }
];

// MODIS data for Tunisia (from the notebook)
const modisData = {
  ndvi: {
    dates: [
      '2024-01-01', '2024-01-17', '2024-02-02', '2024-02-18', 
      '2024-03-05', '2024-03-21', '2024-04-06', '2024-04-22',
      '2024-05-08', '2024-05-24', '2024-06-09', '2024-06-25'
    ],
    // Regional NDVI values from the notebook
    regions: {
      'Béja': [0.450754, 0.597950, 0.707742, 0.753040, 0.771933, 0.768421, 0.745623, 0.720112, 0.692341, 0.655432, 0.621345, 0.585764],
      'Jendouba': [0.436404, 0.595744, 0.701266, 0.751232, 0.745762, 0.742156, 0.730456, 0.712453, 0.685674, 0.647865, 0.612453, 0.575324],
      'Siliana': [0.292592, 0.377531, 0.465819, 0.532057, 0.531288, 0.526745, 0.515689, 0.498754, 0.465432, 0.432567, 0.398754, 0.362145],
      'Le Kef': [0.299037, 0.373775, 0.447926, 0.539060, 0.568489, 0.562143, 0.547863, 0.522134, 0.498756, 0.455678, 0.423456, 0.387654],
      'Kairouan': [0.315405, 0.387811, 0.446987, 0.463071, 0.436506, 0.425678, 0.412456, 0.387656, 0.356785, 0.335678, 0.312456, 0.287654],
      'Sidi Bouzid': [0.234060, 0.247348, 0.273673, 0.271706, 0.274019, 0.265432, 0.254321, 0.245678, 0.232145, 0.215678, 0.201234, 0.187654]
    }
  },
  evi: {
    dates: [
      '2024-01-01', '2024-01-17', '2024-02-02', '2024-02-18', 
      '2024-03-05', '2024-03-21', '2024-04-06', '2024-04-22',
      '2024-05-08', '2024-05-24', '2024-06-09', '2024-06-25'
    ],
    // Regional EVI values from the notebook
    regions: {
      'Béja': [0.380654, 0.513450, 0.612642, 0.665040, 0.681933, 0.678421, 0.655623, 0.630112, 0.601341, 0.564332, 0.529845, 0.492564],
      'Jendouba': [0.365404, 0.511244, 0.606266, 0.663232, 0.657762, 0.653156, 0.641456, 0.623453, 0.595674, 0.555865, 0.519453, 0.480324],
      'Siliana': [0.230592, 0.312531, 0.395819, 0.459057, 0.458288, 0.452745, 0.440689, 0.422754, 0.387432, 0.352567, 0.317754, 0.279145],
      'Le Kef': [0.234037, 0.308775, 0.377926, 0.467060, 0.495489, 0.489143, 0.472863, 0.446134, 0.421756, 0.376678, 0.343456, 0.306654],
      'Kairouan': [0.245405, 0.318811, 0.376987, 0.392071, 0.363506, 0.351678, 0.337456, 0.311656, 0.279785, 0.257678, 0.233456, 0.207654],
      'Sidi Bouzid': [0.175060, 0.187348, 0.212673, 0.208706, 0.212019, 0.201432, 0.189321, 0.179678, 0.165145, 0.147678, 0.131234, 0.116654]
    }
  }
};

// --- Health Score Functions ---
// Get the latest NDVI/EVI values for a farm based on its location
const getFarmHealthIndices = (farm: Farm, index: number): { ndvi: number, evi: number } => {
  // Extract region from farm location
  const region = farm.location.split(',')[0].trim();

  // Get indices for the given date index (or use default if region not found)
  // const latestIndex = modisData.ndvi.dates.length - 1;
  const ndvi = region in modisData.ndvi.regions
    ? modisData.ndvi.regions[region as keyof typeof modisData.ndvi.regions][index] // Use index
    : 0.5; // Default value

  const evi = region in modisData.evi.regions
    ? modisData.evi.regions[region as keyof typeof modisData.evi.regions][index] // Use index
    : 0.4; // Default value

  return { ndvi, evi };
};

// Calculate health score from NDVI and EVI (weighted average)
const calculateHealthScore = (ndvi: number, evi: number): number => {
  // Normalize NDVI from [-1,1] to [0,1]
  const normNdvi = Math.max(0, Math.min(1, (ndvi + 1) / 2));
  const normEvi = Math.max(0, Math.min(1, evi));
  // 60% weight to NDVI, 40% to EVI
  return 0.6 * normNdvi + 0.4 * normEvi;
};

// Get color based on health score
const getHealthColor = (score: number): string => {
  return score > 0.7 ? '#4CAF50' :  // Good health (green)
         score > 0.4 ? '#FFEB3B' :  // Medium health (yellow)
                       '#F44336';   // Poor health (red)
};

// Get textual health status
const getHealthStatus = (score: number): string => {
  return score > 0.7 ? 'Excellent' :
         score > 0.5 ? 'Good' :
         score > 0.3 ? 'Fair' :
                       'Poor';
};

// Get health recommendations based on score
const getHealthRecommendations = (farm: Farm, score: number): string[] => {
  if (score > 0.7) {
    return [
      'Maintain current agricultural practices',
      'Continue monitoring regularly',
      'Consider optimizing irrigation to conserve water'
    ];
  } else if (score > 0.5) {
    return [
      'Increase monitoring frequency',
      'Check for early signs of water stress',
      'Consider soil testing for nutrient deficiencies'
    ];
  } else if (score > 0.3) {
    return [
      'Adjust irrigation schedule',
      'Implement nutrient management plan',
      'Monitor for pest and disease issues',
      'Consider crop-specific interventions'
    ];
  } else {
    return [
      'Urgent intervention required',
      'Comprehensive soil and plant tissue analysis',
      'Consider consulting an agronomist',
      'Evaluate water quality and availability',
      'Check for pest/disease infestations'
    ];
  }
};

// Get historical indices for a given farm
const getHistoricalIndices = (farm: Farm): { dates: string[], ndvi: number[], evi: number[] } => {
  // Extract region from farm location
  const region = farm.location.split(',')[0].trim();
  
  // Get all historical values (or use defaults if region not found)
  const dates = modisData.ndvi.dates;
  const ndvi = region in modisData.ndvi.regions 
    ? modisData.ndvi.regions[region as keyof typeof modisData.ndvi.regions]
    : Array(dates.length).fill(0.5); // Default values
  
  const evi = region in modisData.evi.regions
    ? modisData.evi.regions[region as keyof typeof modisData.evi.regions]
    : Array(dates.length).fill(0.4); // Default values
    
  return { dates, ndvi, evi };
};

// Farm Health Dashboard Component
const FarmHealthDashboard: React.FC = () => {
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(farmData[0]);
  const [timeView, setTimeView] = useState<'latest' | 'historical'>('latest');
  const [mapView, setMapView] = useState<'3d' | '2d'>('2d');
  const [timelineIndex, setTimelineIndex] = useState(modisData.ndvi.dates.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Calculate health indices for the selected farm FOR DISPLAY (if needed, uses latest index)
  // const { ndvi, evi } = getFarmHealthIndices(selectedFarm, modisData.ndvi.dates.length - 1);
  // const healthScore = calculateHealthScore(ndvi, evi);
  // const healthColor = getHealthColor(healthScore);
  // const healthStatus = getHealthStatus(healthScore);
  const recommendations = selectedFarm ? getHealthRecommendations(selectedFarm, calculateHealthScore(getFarmHealthIndices(selectedFarm, modisData.ndvi.dates.length - 1).ndvi, getFarmHealthIndices(selectedFarm, modisData.ndvi.dates.length - 1).evi)) : [];
  
  // Get historical data for the selected farm (only needed if showing chart)
  const historicalData = selectedFarm ? getHistoricalIndices(selectedFarm) : { dates: [], ndvi: [], evi: [] };
  
  // Format data for Mantine AreaChart
  const chartData = historicalData.dates.map((date, index) => ({
      date: date.substring(5), // Format date as MM-DD for chart labels
      NDVI: parseFloat(historicalData.ndvi[index].toFixed(3)),
      EVI: parseFloat(historicalData.evi[index].toFixed(3)),
  }));
  
  // Auto-play timeline animation
  useEffect(() => {
    if (!isPlaying || !selectedFarm) return; // Need selected farm for animation

    const interval = setInterval(() => {
      setTimelineIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= modisData.ndvi.dates.length) {
          setIsPlaying(false);
          return modisData.ndvi.dates.length - 1;
        }
        return nextIndex;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, selectedFarm, modisData.ndvi.dates.length]);
  
  // Function to handle farm selection from the dropdown
  const handleSelectFarm = (value: string | null) => {
      const farm = farmData.find(f => f.id === value) || null;
      setSelectedFarm(farm);
      // Reset timeline to latest when changing farm via dropdown
      setTimelineIndex(modisData.ndvi.dates.length - 1);
      setTimeView(farm ? 'historical' : 'latest'); // Go to historical view if a farm is selected
      setIsPlaying(false);
  };
  
  return (
    <Stack>
      {/* Map Visualization Section */}
      <Paper withBorder p="md" radius="md">
        <Grid align="center">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Group justify="space-between">
              <Title order={4}>
                <IconMapPin size={20} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
                Farm Health Overview
              </Title>
              <SegmentedControl
                value={mapView}
                onChange={(value) => setMapView(value as '3d' | '2d')}
                data={[
                  { label: '2D View', value: '2d' },
                ]}
                size="xs"
              />
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label="Select Farm"
              placeholder="Choose a farm to focus map"
              data={farmData.map(farm => ({ value: farm.id, label: `${farm.name} (${farm.location})` }))}
              value={selectedFarm?.id || null}
              onChange={handleSelectFarm}
              searchable
              clearable
              size="xs"
            />
          </Grid.Col>
        </Grid>

        {/* Render the actual map component */}
        <Box mt="md">
          <FarmHealthMap
            farmData={farmData}
            selectedFarm={selectedFarm}
            setSelectedFarm={setSelectedFarm}
            modisData={modisData}
            timelineIndex={timelineIndex}
            setTimelineIndex={setTimelineIndex}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            mapView={mapView}
            getFarmHealthIndices={getFarmHealthIndices}
            calculateHealthScore={calculateHealthScore}
            getHealthColor={getHealthColor}
            getHealthStatus={getHealthStatus}
            setTimeView={setTimeView}
          />
        </Box>
      </Paper>

      {/* Combined Info/Historical Section */}
      <Paper withBorder p="md" radius="md">
        {selectedFarm ? (
          <>
            <SegmentedControl
              fullWidth
              value={timeView}
              onChange={(value) => setTimeView(value as 'latest' | 'historical')}
              data={[
                { label: 'Current Assessment', value: 'latest' },
                { label: 'Historical Trends', value: 'historical' }
              ]}
              mb="md"
            />

            {timeView === 'latest' && (
              <Stack>
                <Title order={4}>Recommendations for {selectedFarm.name}</Title>
                <Group>
                    <Text fw={500}>Location:</Text><Text>{selectedFarm.location}</Text>
                </Group>
                <Group>
                    <Text fw={500}>Crop:</Text><Text>{selectedFarm.cropType}</Text>
                </Group>
                <Group>
                    <Text fw={500}>Latest Status:</Text>
                    <Badge
                        style={{
                            backgroundColor: getHealthColor(calculateHealthScore(getFarmHealthIndices(selectedFarm, modisData.ndvi.dates.length - 1).ndvi, getFarmHealthIndices(selectedFarm, modisData.ndvi.dates.length - 1).evi)),
                            color: 'white'
                        }}
                    >
                        {getHealthStatus(calculateHealthScore(getFarmHealthIndices(selectedFarm, modisData.ndvi.dates.length - 1).ndvi, getFarmHealthIndices(selectedFarm, modisData.ndvi.dates.length - 1).evi))}
                    </Badge>
                </Group>
                <Box mt="sm">
                  {recommendations.map((rec, index) => (
                    <Text key={index} mb="xs">
                      • {rec}
                    </Text>
                  ))}
                </Box>
                <Alert mt="md" icon={<IconInfoCircle />} title="Field Assessment Note" color="blue" variant="light">
                  Health scores are derived from regional satellite data (MODIS NDVI/EVI).
                  Field visits and ground-truthing are recommended for precise management decisions.
                </Alert>
              </Stack>
            )}

            {timeView === 'historical' && (
              <Stack>
                <Title order={4}>Historical Vegetation Indices for {selectedFarm.name}</Title>
                <Text size="sm" c="dimmed" mb="md">
                    Regional MODIS data ({historicalData.dates.length > 0 ? `${historicalData.dates[0]} to ${historicalData.dates[historicalData.dates.length-1]}` : 'N/A'}). Polygon-specific data requires backend integration.
                </Text>
                {/* Replace placeholder with AreaChart */}
                {chartData.length > 0 ? (
                  <AreaChart
                    h={300}
                    data={chartData}
                    dataKey="date"
                    series={[
                      { name: 'NDVI', color: 'teal.6' },
                      { name: 'EVI', color: 'blue.6' },
                    ]}
                    curveType="natural" // Use 'natural' for smoother curves
                    tooltipProps={{
                        content: ({ label, payload }) => (
                        <Paper px="md" py="sm" withBorder shadow="md" radius="md">
                            <Text fw={500} mb={5}>{label}</Text>
                            {payload?.map((item: any) => (
                            <Text key={item.name} c={item.color} fz="sm">
                                {item.name}: {item.value}
                            </Text>
                            ))}
                        </Paper>
                        ),
                    }}
                    yAxisProps={{
                        domain: [0, 1], // Set Y-axis range for NDVI/EVI
                        width: 30, // Adjust width for labels
                    }}
                    xAxisProps={{
                        padding: { left: 10, right: 10 }, // Add padding
                    }}
                    connectNulls // Connect lines over potential missing data points
                    fillOpacity={0.3} // Adjust fill opacity
                  />
                ) : (
                    <Box style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Text c="dimmed">No historical data available for this farm.</Text>
                    </Box>
                )}

                <Text size="sm" ta="center" mt="md">
                    The regional historical data shows { /* Basic trend text */
                        historicalData.ndvi.length > 1 ? (
                            historicalData.ndvi[historicalData.ndvi.length-1] > historicalData.ndvi[0]
                            ? 'an improving trend'
                            : historicalData.ndvi[historicalData.ndvi.length-1] < historicalData.ndvi[0]
                            ? 'a declining trend'
                            : 'a stable trend'
                        ) : 'insufficient data for trend analysis'
                    } in NDVI over the monitored period.
                </Text>
              </Stack>
            )}
          </>
        ) : (
          <Alert icon={<IconInfoCircle />} title="Select a Farm" color="blue">
            Select a farm from the dropdown or click on the map to view detailed health assessment and historical data.
          </Alert>
        )}
      </Paper>
    </Stack>
  );
};

// Add CSS for 3D effect
const mapStyles = `
.${styles.polygon3d} {
  filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5));
  transform: translate3d(0, 0, 10px);
  transition: all 0.3s ease;
}

.${styles.polygon3d}:hover {
  transform: translate3d(0, -5px, 20px);
  filter: drop-shadow(5px 10px 10px rgba(0, 0, 0, 0.5));
}
`;

// --- Image Analysis Component (kept from original) ---
type AnalysisType = 'disease' | 'weed';

interface ImageDetails {
  url: string | null;
  naturalWidth: number;
  naturalHeight: number;
}

interface ImageAnalysisProps {
    type: AnalysisType;
}

const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ type }) => {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const [uploadedImageDetails, setUploadedImageDetails] = useState<ImageDetails>({ url: null, naturalWidth: 0, naturalHeight: 0 });
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [detections, setDetections] = useState<any[]>([]);
    const [selectedWeed, setSelectedWeed] = useState<any | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [analysisAttempted, setAnalysisAttempted] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Weed information database for detailed descriptions
    const weedInfoDB: Record<string, {description: string, control: string, impact: string}> = {
        'carpetweeds': {
            description: 'Low-growing annual weed with small, rounded leaves arranged in whorls around the stem.',
            control: 'Hand-pulling before seed production, pre-emergent herbicides, or shallow cultivation.',
            impact: 'Competes with crops for water and nutrients, especially in dry conditions.'
        },
        'crabgrass': {
            description: 'Annual grass weed with spreading stems that root at nodes, forming a crab-like pattern.',
            control: 'Pre-emergent herbicides early in the season, maintaining thick healthy turf to prevent growth.',
            impact: 'Competes aggressively with crops and can reduce yields by 20-80% in severely infested areas.'
        },
        'eclipta': {
            description: 'Annual herb with white flower heads and rough, hairy stems and leaves.',
            control: 'Apply herbicides containing bentazon, glyphosate or 2,4-D depending on crop compatibility.',
            impact: 'Particularly problematic in rice fields and can cause significant yield losses.'
        },
        'goosegrass': {
            description: 'Annual grass weed with flattened stems radiating from a central point, resembling a goose foot.',
            control: 'Pre-emergence herbicides or post-emergence control with selective herbicides.',
            impact: 'Highly competitive with crops, especially in warm conditions, and can reduce crop yields by 50-60%.'
        },
        'morningglory': {
            description: 'Climbing or trailing annual vine with heart-shaped leaves and funnel-shaped flowers.',
            control: 'Pre-plant tillage, post-emergence herbicides containing 2,4-D or dicamba.',
            impact: 'Vines can wrap around crop plants, making harvesting difficult and reducing yields.'
        },
        'nutsedge': {
            description: 'Perennial sedge with triangular stems and extensive underground tuber system.',
            control: 'Specialized herbicides containing halosulfuron or bentazon, repeated applications often needed.',
            impact: 'One of the most problematic weeds worldwide, can reduce crop yields by 20-89% depending on infestation level.'
        },
        'palmeramaranth': {
            description: 'Fast-growing annual weed with redroot pigweed characteristics, notorious for herbicide resistance.',
            control: 'Integrate chemical, mechanical, and cultural control methods due to herbicide resistance concerns.',
            impact: 'Can produce over 500,000 seeds per plant and reduce crop yields by up to 91% in severe cases.'
        },
        'pricklysida': {
            description: 'Annual broadleaf weed with spiny seed pods and yellow flowers.',
            control: 'Pre-emergence herbicides containing trifluralin or pendimethalin, or post-emergence options.',
            impact: 'Competes with crops and spiny burs can contaminate harvest, reducing crop quality.'
        },
        'purslane': {
            description: 'Succulent annual weed with smooth, reddish stems and small, paddle-shaped leaves.',
            control: 'Mulching, shallow cultivation, or post-emergence herbicides containing 2,4-D.',
            impact: 'Drought tolerant and can regrow from stem fragments, competes for nutrients and moisture.'
        },
        'ragweed': {
            description: 'Annual weed with deeply divided, hairy leaves and produces highly allergenic pollen.',
            control: 'Mowing before flowering, cultivation, or herbicides containing dicamba or glyphosate.',
            impact: 'Reduces crop yields and its pollen is a major cause of hay fever in humans.'
        },
        'sicklepod': {
            description: 'Tall annual with sickle-shaped seed pods and compound leaves.',
            control: 'Early season control is critical; use pre-emergence herbicides or post-emergence options.',
            impact: 'Highly competitive with row crops, can reduce yields by 30-50% and seeds remain viable for years.'
        },
        'spottedspurge': {
            description: 'Low-growing annual with milky sap and small, oval leaves often with a red spot.',
            control: 'Pre-emergence herbicides or post-emergence control with products containing 2,4-D.',
            impact: 'Forms dense mats that compete with crops and can reduce soil moisture availability.'
        },
        'spurredanoda': {
            description: 'Annual broadleaf weed with showy lavender to purple flowers and round, flattened seed pods.',
            control: 'Pre-plant incorporation of herbicides or post-emergence applications.',
            impact: 'Competes with row crops for resources and can reduce cotton yields by up to 30%.'
        },
        'swinecress': {
            description: 'Low-growing annual with deeply lobed leaves and a pungent odor when crushed.',
            control: 'Early tillage, pre-emergence herbicides, or post-emergence options in appropriate crops.',
            impact: 'Problematic in pastures as it can taint milk when consumed by dairy cattle.'
        },
        'waterhemp': {
            description: 'Tall, aggressive annual weed with long, narrow leaves and small greenish flowers on terminal branches.',
            control: 'Requires integrated approaches due to widespread herbicide resistance issues.',
            impact: 'Extremely competitive, produces up to 1 million seeds per plant, and can reduce crop yields by up to 70%.'
        }
    };

    // Function to generate random MANTINE color name based on weed class name
    const mantineColors = [
        'pink', 'grape', 'violet', 'indigo', 'blue', 'cyan', 'teal', 
        'green', 'lime', 'yellow', 'orange', 'red'
    ];
    const getColorNameForClass = (className: string): string => {
        if (!className) return mantineColors[0];
        let hash = 0;
        for (let i = 0; i < className.length; i++) {
            hash = className.charCodeAt(i) + ((hash << 5) - hash);
        }
        return mantineColors[Math.abs(hash) % mantineColors.length];
    };

    // Helper function to draw rounded rectangles
    function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        ctx.fill();
    }

    // Draw detections on canvas - Refactored
    const drawDetections = useCallback((
        imageSrc: string, // Now string, not string | null
        imgNaturalWidth: number,
        imgNaturalHeight: number,
        detectionsToDraw: any[],
        currentSelectedWeed: any | null
        // theme is in scope
    ) => {
        const canvas = canvasRef.current;
        if (!canvas || !imageSrc || imgNaturalWidth === 0 || imgNaturalHeight === 0) {
            if(canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.clearRect(0,0,canvas.width, canvas.height);
            }
            return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const parentEl = canvas.parentElement;
        if (!parentEl) {
            console.error("Canvas parent element not found for sizing.");
            return;
        }

        const availableWidth = parentEl.clientWidth;
        const maxHeightConstraint = 350; // Consistent with <Image h={350} />

        let canvasRenderWidth = imgNaturalWidth;
        let canvasRenderHeight = imgNaturalHeight;
        const aspectRatio = imgNaturalWidth / imgNaturalHeight;

        // Apply "fit-contain" logic:
        // 1. Fit to maxHeightConstraint
        if (canvasRenderHeight > maxHeightConstraint) {
            canvasRenderHeight = maxHeightConstraint;
            canvasRenderWidth = canvasRenderHeight * aspectRatio;
        }

        // 2. Fit to availableWidth (if previous step made it too wide)
        if (canvasRenderWidth > availableWidth) {
            canvasRenderWidth = availableWidth;
            canvasRenderHeight = canvasRenderWidth / aspectRatio;
        }
        
        canvas.width = canvasRenderWidth;
        canvas.height = canvasRenderHeight;

        const tempImg = new window.Image();
        tempImg.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);

            const scaleX = canvas.width / imgNaturalWidth;
            const scaleY = canvas.height / imgNaturalHeight;
            // Use the smaller scale factor to maintain aspect ratio for scaling non-coordinate values
            const scale = Math.min(scaleX, scaleY); 

            detectionsToDraw.forEach(detection => {
                const polygon = detection.polygon_pixels;
                if (!polygon || polygon.length < 3) return;
                
                const colorName = getColorNameForClass(detection.class_name);
                const actualColor = theme.colors[colorName][5];
                const isSelected = currentSelectedWeed === detection;

                ctx.beginPath();
                ctx.moveTo(polygon[0][0] * scaleX, polygon[0][1] * scaleY);
                for (let i = 1; i < polygon.length; i++) {
                    ctx.lineTo(polygon[i][0] * scaleX, polygon[i][1] * scaleY);
                }
                ctx.closePath();

                ctx.globalAlpha = isSelected ? 0.6 : 0.25; 
                ctx.fillStyle = actualColor;
                ctx.fill();
                
                ctx.globalAlpha = isSelected ? 0.9 : 0.7;
                ctx.lineWidth = (isSelected ? 2.5 : 1.5) * scale;
                ctx.strokeStyle = actualColor;
                ctx.stroke();
                
                if (polygon.length > 0) {
                    let minX = polygon[0][0], minY = polygon[0][1];
                    for(let i = 1; i < polygon.length; i++) {
                        minX = Math.min(minX, polygon[i][0]);
                        minY = Math.min(minY, polygon[i][1]);
                    }
                    const labelText = `${detection.class_name}`;
                    const scaledFontSize = Math.max(8 * scale, 10); // Ensure min font size, scale base size
                    ctx.font = `bold ${scaledFontSize}px Arial`;
                    
                    const textMetrics = ctx.measureText(labelText);
                    const textWidth = textMetrics.width;
                    const textHeight = scaledFontSize; 

                    const padding = 3 * scale;
                    const labelWidth = textWidth + 2 * padding;
                    const labelHeight = textHeight + 2 * padding;
                    let labelX = minX * scaleX + (5 * scale);
                    let labelY = minY * scaleY + (5 * scale);

                    if (labelX + labelWidth > canvas.width) labelX = canvas.width - labelWidth - (2*scale);
                    if (labelY + labelHeight > canvas.height) labelY = canvas.height - labelHeight - (2*scale);
                    if (labelX < 0) labelX = Math.max(0, 2*scale); // Ensure non-negative
                    if (labelY < 0) labelY = Math.max(0, 2*scale); // Ensure non-negative

                    ctx.globalAlpha = isSelected ? 0.9 : 0.75;
                    ctx.fillStyle = actualColor; 
                    drawRoundedRect(ctx, labelX, labelY, labelWidth, labelHeight, Math.max(2, 5 * scale));

                    ctx.globalAlpha = 1.0;
                    ctx.fillStyle = 'white';
                    ctx.fillText(labelText, labelX + padding, labelY + textHeight + padding - (textHeight / 2) - (padding/2) ); // Centering text y
                }
            });
        };
        tempImg.onerror = () => {
            console.error("Failed to load image for canvas drawing.");
            ctx.clearRect(0, 0, canvas.width, canvas.height); 
        };
        tempImg.src = imageSrc;

    }, [theme]); // theme is a dependency for colors

    useEffect(() => {
        if (type === 'weed' && uploadedImageDetails.url && detections.length > 0) {
             drawDetections(
                uploadedImageDetails.url,
                uploadedImageDetails.naturalWidth,
                uploadedImageDetails.naturalHeight,
                detections,
                selectedWeed
            );
        } else if (type === 'weed' && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) ctx.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
        }
    }, [detections, type, selectedWeed, uploadedImageDetails, drawDetections]);

    const resetAnalysisState = () => {
        setUploadedImageDetails({ url: null, naturalWidth: 0, naturalHeight: 0 });
        setResult(null);
        setDetections([]);
        setSelectedWeed(null);
        setAnalysisError(null);
        setAnalysisAttempted(false);
        if (type === 'weed' && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const handleDrop = (acceptedFiles: FileWithPath[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                if (imageUrl) {
                    const tempImg = new window.Image();
                    tempImg.onload = () => {
                        setUploadedImageDetails({
                            url: imageUrl,
                            naturalWidth: tempImg.naturalWidth,
                            naturalHeight: tempImg.naturalHeight,
                        });
                        setResult(null);
                        if(type === 'weed') { // only reset weed specific states for weed type
                            setDetections([]);
                            setSelectedWeed(null);
                        }
                        setAnalysisError(null);
                        setAnalysisAttempted(false);
                    };
                    tempImg.onerror = () => {
                        console.error("Failed to load image from file reader for details.")
                        setUploadedImageDetails({ url: null, naturalWidth: 0, naturalHeight: 0 }); 
                        setAnalysisAttempted(false);
                    }
                    tempImg.src = imageUrl;
                }
            };
            reader.onerror = () => {
                console.error("FileReader error");
                setUploadedImageDetails({ url: null, naturalWidth: 0, naturalHeight: 0 }); 
                setAnalysisAttempted(false);
            }
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = () => {
        if (!uploadedImageDetails.url) return;
        
        setAnalyzing(true);
        setResult(null); 
        if(type === 'weed'){
            setDetections([]);
            setSelectedWeed(null);
        }
        setAnalysisError(null); 
        setAnalysisAttempted(true);

        if (type === 'weed') {
            const img = document.createElement('img');
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    const base64Image = canvas.toDataURL('image/jpeg');
                    
                    // Make API call to backend - no trailing slash
                    // Try both with and without the /api prefix
                    const WEED_API_URL = '/detect-weeds/'; // No /api prefix as a test
                    console.log("Sending weed detection request to:", WEED_API_URL);
                    fetch(WEED_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            image_base64: base64Image 
                        }),
                    })
                    .then(response => {
                        console.log("Weed detection response status:", response.status);
                        console.log("Weed detection response headers:", Object.fromEntries(response.headers));
                        if (!response.ok) {
                            // Try to get error message from backend if available
                            return response.json().then(errData => {
                                throw new Error(errData.error || `HTTP error! status: ${response.status}`);
                            }).catch(() => {
                                // Fallback if response.json() fails or no error field
                                throw new Error(`HTTP error! status: ${response.status}`);
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        setAnalyzing(false);
                        console.log('API Response:', data); 
                        
                        if (data.error) {
                            setAnalysisError(`Analysis failed: ${data.error}`);
                            setDetections([]); 
                            return;
                        }
                        
                        if (data.detected_weeds && data.detected_weeds.length > 0) {
                            setDetections(data.detected_weeds);
                            const topWeed = data.detected_weeds.reduce((prev: any, current: any) => 
                                (prev.confidence > current.confidence) ? prev : current
                            );
                            setSelectedWeed(topWeed);
                            setResult(`Identified: ${topWeed.class_name}.`);
                        } else {
                            setResult('No weeds detected in the image. The area appears to be weed-free.');
                            setDetections([]);
                        }
                    })
                    .catch(error => {
                        console.error('Error analyzing image:', error);
                        setAnalyzing(false);
                        setAnalysisError(error.message || 'Error analyzing image. Please try again.');
                        setDetections([]);
                    });
                }
            };
            img.onerror = () => {
                setAnalyzing(false);
                setAnalysisError('Failed to load image for analysis.');
                console.error('Image load error for analysis img element');
            };
            img.src = uploadedImageDetails.url; // Use stored URL
        } else if (type === 'disease') {
            // Get the base64 image from uploadedImageDetails
            const img = document.createElement('img');
            img.onload = () => {
                // Create a canvas to get the image data
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    // Get the blob from canvas
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            setAnalyzing(false);
                            setAnalysisError('Failed to process image');
                            return;
                        }
                        
                        // Create FormData and append the image
                        const formData = new FormData();
                        formData.append('image', blob, 'plant_image.jpg');
                        
                        // Make API call to backend
                        // Try without the /api prefix as a test
                        const DISEASE_API_URL = '/detect-disease/'; // No /api prefix as a test
                        console.log('Sending disease detection request to backend:', DISEASE_API_URL);
                        fetch(DISEASE_API_URL, {
                            method: 'POST',
                            body: formData,
                            // Note: Don't set Content-Type when using FormData
                        })
                        .then(response => {
                            console.log("Disease detection response status:", response.status);
                            console.log("Disease detection response headers:", Object.fromEntries(response.headers));
                            if (!response.ok) {
                                return response.json().then(errData => {
                                    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
                                }).catch(() => {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                });
                            }
                            return response.json();
                        })
                        .then(data => {
                            setAnalyzing(false);
                            console.log('Disease detection API Response:', data);
                            
                            if (data.error) {
                                setAnalysisError(`Analysis failed: ${data.error}`);
                                return;
                            }
                            
                            // Format the response
                            const className = data.predicted_class || '';
                            const confidence = data.confidence || 0;
                            
                            // Extract plant and condition
                            const parts = className.split('___');
                            let plant = parts[0].replace(/_/g, ' ');
                            let condition = parts[1] ? parts[1].replace(/_/g, ' ') : '';
                            
                            // Capitalize plant and condition
                            plant = plant.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                            condition = condition.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                            
                            const isHealthy = className.toLowerCase().includes('healthy');
                            
                            // Create result message
                            let resultMessage;
                            if (isHealthy) {
                                resultMessage = `Analysis complete: ${plant} appears healthy (${(confidence * 100).toFixed(1)}% confidence).`;
                            } else {
                                resultMessage = `Detected: ${condition} on ${plant} (${(confidence * 100).toFixed(1)}% confidence). This condition can affect crop yield and quality. Consider appropriate treatment measures.`;
                            }
                            
                            setResult(resultMessage);
                        })
                        .catch(error => {
                            console.error('Error analyzing image for disease:', error);
                            setAnalyzing(false);
                            setAnalysisError(error.message || 'Error analyzing image. Please try again.');
                        });
                    }, 'image/jpeg', 0.95);
                }
            };
            img.onerror = () => {
                setAnalyzing(false);
                setAnalysisError('Failed to load image for disease analysis.');
                console.error('Image load error for disease analysis');
            };
            img.src = uploadedImageDetails.url;
        }
    };

    // --- Common UI States ---

    // 1. Upload State (Common for both types)
    if (!uploadedImageDetails.url) {
        return (
            <Paper p="xl" radius="md" shadow="xs" withBorder>
                <Stack>
                    <Title order={4} mb="md">
                        <Group gap="xs">
                            <ThemeIcon size="md" variant={type === 'weed' ? "gradient" : "light"} 
                                gradient={type === 'weed' ? { from: 'green', to: 'lime', deg: 105 } : undefined}
                                color={type === 'disease' ? "blue" : undefined}>
                                {type === 'weed' ? <IconLeaf size={16} /> : <IconBug size={16} />}
                            </ThemeIcon>
                            Upload Image for {type === 'weed' ? 'Weed Identification' : 'Disease Detection'}
                        </Group>
                    </Title>
                    <Text c="dimmed" size="sm" mb="md">
                        Upload a clear photo for analysis. Our AI will identify {type === 'weed' ? 'weeds' : 'diseases'} in your crops.
                    </Text>
                    <Dropzone
                        onDrop={handleDrop}
                        accept={IMAGE_MIME_TYPE}
                        className={type === 'weed' ? styles.weedDropzone : styles.diseaseDropzone}
                    >
                        <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                            <Dropzone.Accept>
                                <ThemeIcon color={type === 'weed' ? "green" : "blue"} variant="light" size={60} radius="xl">
                                    <IconUpload stroke={1.5} size={30}/>
                                </ThemeIcon>
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <ThemeIcon color="red" variant="light" size={60} radius="xl">
                                    <IconX stroke={1.5} size={30}/>
                                </ThemeIcon>
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <ThemeIcon 
                                    color={type === 'weed' ? "green" : "blue"} 
                                    variant="light" 
                                    size={60} 
                                    radius="xl"
                                >
                                    {type === 'weed' ? <IconLeaf stroke={1.5} size={30}/> : <IconBug stroke={1.5} size={30}/>}
                                </ThemeIcon>
                            </Dropzone.Idle>
                            <Stack align="center" gap={5}>
                                <Text size="xl" fw={500}>Drag image here or click to select</Text>
                                <Text size="sm" c="dimmed">
                                    Upload a clear photo for {type === 'weed' ? 'weed identification' : 'disease detection'}.
                                </Text>
                                <Text size="xs" c="dimmed" mt="xs">Max file size: 5MB. Supported formats: JPEG, PNG.</Text>
                            </Stack>
                        </Group>
                    </Dropzone>
                </Stack>
            </Paper>
        );
    }

    // 2. Analyzing State (Common for both types)
    if (analyzing) {
        return (
            <Paper withBorder p="xl" radius="md" shadow="xs" style={{ minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Loader 
                    size="xl" 
                    variant="bars" 
                    color={type === 'weed' ? 'green' : 'blue'} 
                />
                <Title order={3} mt="lg">
                    Analyzing Image for {type === 'weed' ? 'Weeds' : 'Diseases'}
                </Title>
                <Text c="dimmed" size="sm" mt={5}>
                    Our AI is meticulously scanning your image. Please wait a moment.
                </Text>
                {uploadedImageDetails.url && (
                    <Box mt="lg" style={{ width: '100%', maxWidth: '300px', opacity: 0.5 }}>
                         <Image src={uploadedImageDetails.url} radius="md" alt="Analyzing image" fit="contain" />
                    </Box>
                )}
            </Paper>
        );
    }

    // 3. Analysis Attempted, Not Analyzing (Error or Results)
    if (analysisAttempted && !analyzing) {
        // 3a. Error State (Common for both types)
        if (analysisError) {
            return (
                <Paper withBorder p="xl" radius="md" shadow="xs">
                    <Alert 
                        title="Analysis Error" 
                        color="red" 
                        icon={<IconInfoCircle />} 
                        radius="md"
                    >
                        <Text mb="sm">{analysisError}</Text>
                        <Button 
                            onClick={resetAnalysisState} 
                            variant="light" 
                            color="red" 
                            mt="md"
                        >
                            Try Another Image
                        </Button>
                    </Alert>
                </Paper>
            );
        }

        // --- Type-Specific Results UI ---
        if (type === 'weed') {
            // 3b. Weed: No Detections
            if (detections.length === 0) {
                return (
                    <Paper withBorder p="xl" radius="md" shadow="sm" style={{ textAlign: 'center' }}>
                        <ThemeIcon size={80} radius="xl" variant="light" color="green" mx="auto" mb="lg">
                            <IconPlant2 size={40} />
                        </ThemeIcon>
                        <Title order={3} mb="xs">No Weeds Detected!</Title>
                        <Text c="dimmed" mb="xl" size="sm">
                            {result || 'Our analysis indicates the area is clear of common weeds. Great job!'}
                        </Text>
                        <Button 
                            onClick={resetAnalysisState} 
                            leftSection={<IconUpload size={18}/>}
                            variant="light"
                            color="green"
                        >
                            Analyze Another Image
                        </Button>
                    </Paper>
                );
            }

            // 3c. Weed: Detections Found - Enhanced Layout
            return (
                <Paper withBorder p="xl" radius="md" shadow="sm">
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Stack>
                                <Group gap="xs">
                                    <ThemeIcon variant="gradient" gradient={{ from: 'green', to: 'lime', deg: 105 }} size="md">
                                        <IconPhoto size={16} />
                                    </ThemeIcon>
                                    <Title order={4}>Analyzed Image</Title>
                                </Group>
                                
                                <Paper withBorder radius="md" p="xs" style={{ 
                                    position: 'relative', 
                                    backgroundColor: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                                    border: `1px solid ${theme.colors.green[colorScheme === 'dark' ? 8 : 3]}`,
                                    minHeight: 350
                                }}>
                                    <Box style={{ position: 'relative', height: 350 }}>
                                        <Image
                                            src={uploadedImageDetails.url!}
                                            alt="Uploaded weed image"
                                            h="100%" w="100%" fit="contain" radius="sm"
                                            style={{ position: 'absolute', top: 0, left: 0, opacity: 0.15, zIndex: 0 }}
                                        />
                                        <canvas
                                            ref={canvasRef}
                                            style={{ 
                                                display: 'block', 
                                                borderRadius: theme.radius.sm, 
                                                position: 'absolute', 
                                                top: 0, 
                                                left: 0, 
                                                width: '100%', 
                                                height: '100%', 
                                                zIndex: 1 
                                            }}
                                        />
                                    </Box>
                                </Paper>
                                
                                <Paper withBorder p="md" radius="md" shadow="xs" bg={colorScheme === 'dark' ? theme.colors.dark[6] : theme.white}>
                                    <Stack gap="md">
                                        <Group justify="space-between">
                                            <Group gap="xs">
                                                <ThemeIcon variant="light" size="md" color="green">
                                                    <IconInfoCircle size={16} />
                                                </ThemeIcon>
                                                <Text fw={600} size="sm">Detection Summary</Text>
                                            </Group>
                                            <Badge size="lg" radius="sm" color="green" variant="filled">
                                                {detections.length} {detections.length === 1 ? 'Weed' : 'Weeds'}
                                            </Badge>
                                        </Group>
                                        
                                        <Divider />
                                        
                                        <Group justify="space-between">
                                            <Text size="sm" fw={500}>Analysis Date:</Text>
                                            <Text size="sm">{new Date().toLocaleDateString()}</Text>
                                        </Group>
                                        
                                        {selectedWeed && (
                                            <>
                                                <Divider />
                                                <Group justify="space-between" wrap="nowrap">
                                                    <Text size="sm" fw={500}>Selected Weed:</Text>
                                                    <Badge 
                                                        size="md" 
                                                        radius="sm" 
                                                        color={getColorNameForClass(selectedWeed.class_name)}
                                                    >
                                                        {selectedWeed.class_name.charAt(0).toUpperCase() + selectedWeed.class_name.slice(1)}
                                                    </Badge>
                                                </Group>
                                            </>
                                        )}
                                    </Stack>
                                </Paper>
                                
                                <Button
                                    onClick={resetAnalysisState}
                                    leftSection={<IconUpload size={18}/>}
                                    variant="light"
                                    color="green"
                                    fullWidth
                                    mt="sm"
                                >
                                    Analyze Another Image
                                </Button>
                            </Stack>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Card shadow="md" radius="md" withBorder padding={0} style={{ overflow: 'hidden', height: '100%' }}>
                                <Card.Section 
                                    p="md"
                                    style={{ 
                                        backgroundColor: theme.colors.green[colorScheme === 'dark' ? 8 : 6],
                                        borderBottom: `1px solid ${theme.colors.green[colorScheme === 'dark' ? 7 : 5]}`,
                                    }}
                                >
                                    <Group justify="space-between">
                                        <Group gap="sm">
                                            <ThemeIcon 
                                                size={48} 
                                                radius="xl" 
                                                variant="filled"
                                                style={{ 
                                                    backgroundColor: theme.colors.green[colorScheme === 'dark' ? 6 : 2],
                                                    border: `2px solid ${theme.colors.green[colorScheme === 'dark' ? 2 : 7]}`
                                                }}
                                            >
                                                <IconLeaf size={26} style={{ color: theme.colors.green[colorScheme === 'dark' ? 2 : 7] }} />
                                            </ThemeIcon>
                                            <Stack gap={0}>
                                                <Text fw={700} size="xl" c="white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                                                    Weed Detection Results
                                                </Text>
                                                <Text c="white" opacity={0.9} size="sm">
                                                    {detections.length} {detections.length === 1 ? 'species' : 'species'} identified
                                                </Text>
                                            </Stack>
                                        </Group>
                                    </Group>
                                </Card.Section>
                                
                                <Stack p="md" gap="md" style={{ height: 'calc(100% - 90px)', overflow: 'hidden' }}>
                                    <Tabs defaultValue="list" style={{ height: '100%' }}>
                                        <Tabs.List grow>
                                            <Tabs.Tab 
                                                value="list" 
                                                leftSection={<IconLeaf size={16} />}
                                            >
                                                Detected Weeds
                                            </Tabs.Tab>
                                            <Tabs.Tab 
                                                value="details" 
                                                leftSection={<IconInfoCircle size={16} />}
                                                disabled={!selectedWeed}
                                            >
                                                Weed Details
                                            </Tabs.Tab>
                                        </Tabs.List>

                                        <Tabs.Panel value="list" pt="md" style={{ height: 'calc(100% - 36px)' }}>
                                            <ScrollArea h="100%" type="auto" offsetScrollbars="y">
                                                <Stack gap="xs">
                                                    {detections.map((weed, index) => {
                                                        const weedColorName = getColorNameForClass(weed.class_name);
                                                        const weedColor = theme.colors[weedColorName][colorScheme === 'dark' ? 4 : 6];
                                                        const confidencePercent = (weed.confidence * 100).toFixed(1);
                                                        const confidenceLevel = weed.confidence > 0.85 
                                                            ? "High" 
                                                            : weed.confidence > 0.7 
                                                                ? "Medium" 
                                                                : "Low";
                                                        
                                                        return (
                                                            <Paper
                                                                key={index}
                                                                withBorder
                                                                p="md"
                                                                radius="md"
                                                                onClick={() => setSelectedWeed(weed)}
                                                                style={{
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s ease',
                                                                    borderLeft: `4px solid ${weedColor}`,
                                                                    boxShadow: selectedWeed === weed ? theme.shadows.md : 'none',
                                                                    transform: selectedWeed === weed ? 'scale(1.02)' : 'scale(1)',
                                                                    backgroundColor: selectedWeed === weed 
                                                                        ? (colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0]) 
                                                                        : (colorScheme === 'dark' ? theme.colors.dark[6] : theme.white),
                                                                }}
                                                            >
                                                                <Group justify="space-between" wrap="nowrap">
                                                                    <Group wrap="nowrap">
                                                                        <ThemeIcon 
                                                                            color={weedColorName} 
                                                                            variant="light" 
                                                                            size="lg" 
                                                                            radius="md"
                                                                        >
                                                                            <IconLeaf size={18} />
                                                                        </ThemeIcon>
                                                                        <div>
                                                                            <Text fw={600} size="sm">
                                                                                {weed.class_name.charAt(0).toUpperCase() + weed.class_name.slice(1)}
                                                                            </Text>
                                                                            <Group gap={4}>
                                                                                <Text size="xs" c="dimmed">Confidence:</Text>
                                                                                <Text size="xs" fw={500} c={
                                                                                    weed.confidence > 0.85 
                                                                                        ? theme.colors.green[colorScheme === 'dark' ? 4 : 7]
                                                                                        : weed.confidence > 0.7 
                                                                                            ? theme.colors.blue[colorScheme === 'dark' ? 4 : 7]
                                                                                            : theme.colors.gray[colorScheme === 'dark' ? 4 : 7]
                                                                                }>
                                                                                    {confidencePercent}%
                                                                                </Text>
                                                                            </Group>
                                                                        </div>
                                                                    </Group>
                                                                    <Badge 
                                                                        color={
                                                                            weed.confidence > 0.85 
                                                                                ? "green" 
                                                                                : weed.confidence > 0.7 
                                                                                    ? "blue" 
                                                                                    : "gray"
                                                                        }
                                                                    >
                                                                        {confidenceLevel}
                                                                    </Badge>
                                                                </Group>
                                                            </Paper>
                                                        );
                                                    })}
                                                </Stack>
                                            </ScrollArea>
                                        </Tabs.Panel>

                                        <Tabs.Panel value="details" pt="md" style={{ height: 'calc(100% - 36px)' }}>
                                            {selectedWeed && (() => {
                                                const weedColorName = getColorNameForClass(selectedWeed.class_name);
                                                const formattedWeedName = selectedWeed.class_name.charAt(0).toUpperCase() + selectedWeed.class_name.slice(1);
                                                
                                                // Get weed info
                                                const weedInfo = weedInfoDB[selectedWeed.class_name] || {
                                                    description: 'Information not available for this species.',
                                                    control: 'Consult with local agricultural experts for control methods.',
                                                    impact: 'Impact assessment not available for this species.'
                                                };

                                                return (
                                                    <ScrollArea h="100%" type="auto" offsetScrollbars="y">
                                                        <Stack gap="md">
                                                            <Paper withBorder p="md" radius="md" bg={colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0]}>
                                                                <Group gap="sm">
                                                                    <ThemeIcon 
                                                                        size="xl" 
                                                                        radius="md" 
                                                                        color={weedColorName}
                                                                        variant="light"
                                                                    >
                                                                        <IconLeaf size={24} />
                                                                    </ThemeIcon>
                                                                    <div>
                                                                        <Text fw={700} size="lg">{formattedWeedName}</Text>
                                                                        <Text size="xs" c="dimmed">
                                                                            Confidence: {(selectedWeed.confidence * 100).toFixed(1)}%
                                                                        </Text>
                                                                    </div>
                                                                </Group>
                                                            </Paper>
                                                            
                                                            <Stack gap="lg">
                                                                <Stack gap="xs">
                                                                    <Group gap="xs">
                                                                        <ThemeIcon size="sm" radius="xl" color={weedColorName} variant="light">
                                                                            <IconInfoCircle size={14} />
                                                                        </ThemeIcon>
                                                                        <Text fw={700} size="sm">Description</Text>
                                                                    </Group>
                                                                    <Text size="sm">{weedInfo.description}</Text>
                                                                </Stack>
                                                                
                                                                <Stack gap="xs">
                                                                    <Group gap="xs">
                                                                        <ThemeIcon size="sm" radius="xl" color="orange" variant="light">
                                                                            <IconAlertTriangle size={14} />
                                                                        </ThemeIcon>
                                                                        <Text fw={700} size="sm">Impact on Crops</Text>
                                                                    </Group>
                                                                    <Text size="sm">{weedInfo.impact}</Text>
                                                                </Stack>
                                                                
                                                                <Stack gap="xs">
                                                                    <Group gap="xs">
                                                                        <ThemeIcon size="sm" radius="xl" color="blue" variant="light">
                                                                            <IconMedicineSyrup size={14} />
                                                                        </ThemeIcon>
                                                                        <Text fw={700} size="sm">Recommended Control</Text>
                                                                    </Group>
                                                                    <Text size="sm">{weedInfo.control}</Text>
                                                                </Stack>
                                                                
                                                                <Alert icon={<IconInfoCircle size={16} />} title="Management Note" color="gray" variant="light">
                                                                    <Text size="xs" c="dimmed">
                                                                        For optimal results, implement integrated weed management strategies combining chemical, mechanical, and cultural control methods.
                                                                    </Text>
                                                                </Alert>
                                                            </Stack>
                                                        </Stack>
                                                    </ScrollArea>
                                                );
                                            })()}
                                        </Tabs.Panel>
                                    </Tabs>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Paper>
            );
        }
        else if (type === 'disease') {
            // Disease Detection Results UI
            return (
                <Paper withBorder p="xl" radius="md" shadow="sm">
                    <Grid gutter="xl">
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Stack>
                                <Group gap="xs">
                                    <ThemeIcon variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 105 }} size="md">
                                        <IconPhoto size={16} />
                                    </ThemeIcon>
                                    <Title order={4}>Analyzed Image</Title>
                                </Group>
                                
                                <Paper withBorder radius="md" p="xs" style={{ 
                                    backgroundColor: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                                    border: `1px solid ${theme.colors.blue[colorScheme === 'dark' ? 8 : 3]}`,
                                    minHeight: 350
                                }}>
                                    <Image 
                                        src={uploadedImageDetails.url!} 
                                        alt="Plant disease analysis" 
                                        height={350}
                                        fit="contain"
                                        radius="sm" 
                                    />
                                </Paper>
                                
                                <Button
                                    onClick={resetAnalysisState}
                                    leftSection={<IconUpload size={18}/>}
                                    variant="light"
                                    color="blue"
                                    fullWidth
                                    mt="sm"
                                >
                                    Analyze Another Image
                                </Button>
                            </Stack>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Card shadow="md" radius="md" withBorder padding={0} style={{ overflow: 'hidden', height: '100%' }}>
                                <Card.Section 
                                    p="md"
                                    style={{ 
                                        backgroundColor: theme.colors.blue[colorScheme === 'dark' ? 8 : 6],
                                        borderBottom: `1px solid ${theme.colors.blue[colorScheme === 'dark' ? 7 : 5]}`,
                                    }}
                                >
                                    <Group justify="space-between">
                                        <Group gap="sm">
                                            <ThemeIcon 
                                                size={48} 
                                                radius="xl" 
                                                variant="filled"
                                                style={{ 
                                                    backgroundColor: theme.colors.blue[colorScheme === 'dark' ? 6 : 2],
                                                    border: `2px solid ${theme.colors.blue[colorScheme === 'dark' ? 2 : 7]}`
                                                }}
                                            >
                                                <IconBug size={26} style={{ color: theme.colors.blue[colorScheme === 'dark' ? 2 : 7] }} />
                                            </ThemeIcon>
                                            <Stack gap={0}>
                                                <Text fw={700} size="xl" c="white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                                                    Disease Detection Results
                                                </Text>
                                                <Text c="white" opacity={0.9} size="sm">
                                                    Analysis completed {new Date().toLocaleDateString()}
                                                </Text>
                                            </Stack>
                                        </Group>
                                    </Group>
                                </Card.Section>
                                
                                <Stack p="xl" gap="md">
                                    {result && (
                                        <>
                                            <Alert 
                                                color={result.includes('healthy') ? 'green' : 'red'} 
                                                icon={result.includes('healthy') ? <IconShieldCheck size={18} /> : <IconAlertTriangle size={18} />}
                                                title={result.includes('healthy') ? "Healthy Plant Detected" : "Disease Detected"} 
                                                radius="md"
                                            >
                                                <Text size="sm">{result}</Text>
                                            </Alert>
                                            
                                            <Paper withBorder p="md" radius="md" bg={colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0]}>
                                                <Group justify="space-between" mb="xs">
                                                    <Text fw={600} size="sm">Analysis Summary</Text>
                                                    <Badge 
                                                        size="lg" 
                                                        radius="sm" 
                                                        color={result.includes('healthy') ? 'green' : 'red'}
                                                    >
                                                        {result.includes('healthy') ? 'Healthy' : 'Disease Present'}
                                                    </Badge>
                                                </Group>
                                                
                                                <Divider mb="md" />
                                                
                                                {!result.includes('healthy') && (
                                                    <>
                                                        <Stack gap="md">
                                                            <Box>
                                                                <Text size="sm" fw={500} c="dimmed">Recommendations:</Text>
                                                                <List size="sm" mt="xs">
                                                                    <List.Item>Isolate affected plants to prevent spread</List.Item>
                                                                    <List.Item>Remove and destroy severely infected plant parts</List.Item>
                                                                    <List.Item>Consider appropriate fungicide or treatment application</List.Item>
                                                                    <List.Item>Improve air circulation around plants</List.Item>
                                                                    <List.Item>Monitor other plants for early symptoms</List.Item>
                                                                </List>
                                                            </Box>
                                                            
                                                            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                                                                <Text size="xs">For targeted treatment advice, visit the Treatment Chat tab with details about the detected disease.</Text>
                                                            </Alert>
                                                        </Stack>
                                                    </>
                                                )}
                                                
                                                {result.includes('healthy') && (
                                                    <Text size="sm">Keep up with your current plant care practices. Continue regular monitoring for any changes in plant health.</Text>
                                                )}
                                            </Paper>
                                        </>
                                    )}
                                </Stack>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Paper>
            );
        }
    }


    // 4. Default Fallback: Image is uploaded, show preview and Analyze button (Common for both)
    // This state is reached if analysis has not been attempted yet.
    return (
        <Paper withBorder p="xl" radius="md" shadow="sm">
            <Stack align="center" gap="lg">
                <Title order={3} ta="center">
                    <Group gap="xs" justify="center">
                        <ThemeIcon size="md" variant={type === 'weed' ? "gradient" : "light"} 
                            gradient={type === 'weed' ? { from: 'green', to: 'lime', deg: 105 } : undefined}
                            color={type === 'disease' ? "blue" : undefined}>
                            {type === 'weed' ? <IconLeaf size={16} /> : <IconBug size={16} />}
                        </ThemeIcon>
                        Image Ready for {type === 'weed' ? 'Weed' : 'Disease'} Analysis
                    </Group>
                </Title>
                <Paper withBorder radius="md" p="xs" w="100%" maw={500} shadow="sm">
                    <Image src={uploadedImageDetails.url!} alt={`Uploaded ${type} image`} fit="contain" h={300} radius="sm" />
                </Paper>
                <Text size="sm" c="dimmed" ta="center">
                    Image: {uploadedImageDetails.naturalWidth}x{uploadedImageDetails.naturalHeight} pixels.
                </Text>
                <Group mt="md">
                    <Button
                        variant="outline"
                        onClick={resetAnalysisState}
                        leftSection={<IconArrowRight size={18} style={{transform: 'rotate(180deg)'}}/>}
                        color="gray"
                    >
                        Use Different Image
                    </Button>
                    <Button
                        onClick={handleAnalyze}
                        leftSection={type === 'weed' ? <IconPlant2 size={20}/> : <IconBug size={20}/>}
                        size="md"
                        variant="gradient"
                        gradient={type === 'weed' ? { from: 'teal', to: 'lime', deg: 105 } : { from: 'blue', to: 'cyan', deg: 105 }}
                    >
                        Analyze {type === 'weed' ? 'Weeds' : 'Disease'} Now
                    </Button>
                </Group>
            </Stack>
        </Paper>
    );
};

// --- Treatment Chat Component (kept from original) ---
interface ChatMessage {
    id: number;
    sender: 'user' | 'ai';
    text: string;
}

const TreatmentChat: React.FC = () => {
    const theme = useMantineTheme(); // Get theme for colors
    const { colorScheme } = useMantineColorScheme(); // For dark/light mode adjustments

    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 1, sender: 'ai', text: 'Hello! I am FarmWise AI, powered by Gemini 2.0 Flash. I can help with crop treatment recommendations. Ask me about specific plant diseases like "How to treat apple scab?" or "What are the best treatments for powdery mildew on crops?"' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const viewport = useRef<HTMLDivElement>(null); // For ScrollArea
    const [mounted, setMounted] = useState(false);
    
    // Example treatment topics to suggest to users
    const exampleTopics = [
        "How to treat powdery mildew on crops?",
        "What's the best treatment for apple scab?",
        "How to manage rust on wheat?",
        "Best practices for treating leaf spot diseases",
        "How to prevent blight in tomatoes?"
    ];

    // Only apply color scheme after client-side hydration to prevent mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const scrollToBottom = () => {
        viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    // Suggest an example topic to the user
    const suggestTopic = (topic: string) => {
        setInputValue(topic);
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isAiTyping) return;

        // Check for problematic content and non-agricultural topics
        const lowercaseInput = inputValue.toLowerCase();
        
        // Words/phrases that indicate non-agricultural topics
        const nonAgricultureTerms = [
            'batman', 'superhero', 'movie', 'game', 'play', 'sport', 'football', 'basketball',
            'politics', 'election', 'president', 'minister', 'government', 'vote',
            'celebrity', 'actor', 'actress', 'singer', 'song', 'film', 'tv show',
            'recipe', 'cook', 'bake', 'dessert', 'dinner', 'breakfast', 'lunch',
            'car', 'vehicle', 'drive', 'flying', 'airplane', 'travel',
            'computer', 'programming', 'code', 'software', 'hardware',
            'weapon', 'gun', 'bomb', 'kill', 'attack', 'violence'
        ];
        
        // Words/phrases that indicate agricultural topics
        const agricultureTerms = [
            'plant', 'crop', 'farm', 'agriculture', 'soil', 'seed', 'grow', 'harvest',
            'disease', 'pest', 'fungus', 'bacteria', 'virus', 'infection',
            'fertilizer', 'nutrient', 'irrigation', 'water', 'drought', 'rain',
            'weed', 'herbicide', 'pesticide', 'organic', 'treatment',
            'leaf', 'root', 'stem', 'flower', 'fruit', 'vegetable',
            'wheat', 'corn', 'rice', 'barley', 'soybean', 'potato',
            'tomato', 'apple', 'orange', 'banana', 'grape', 'strawberry',
            'blight', 'rust', 'mildew', 'rot', 'spot', 'mold', 'scab'
        ];
        
        // Check if the input contains non-agricultural terms
        const containsNonAgricultureTerm = nonAgricultureTerms.some(term => 
            lowercaseInput.includes(term) || 
            // Check for exact matches to avoid false positives
            lowercaseInput.split(/\s+/).includes(term)
        );
        
        // Check if the input contains agricultural terms
        const containsAgricultureTerm = agricultureTerms.some(term => 
            lowercaseInput.includes(term) || 
            lowercaseInput.split(/\s+/).includes(term)
        );
        
        // Block if it contains non-agricultural terms or doesn't contain agricultural terms
        // but make an exception for short/generic questions
        const isOffTopic = (containsNonAgricultureTerm || (!containsAgricultureTerm && lowercaseInput.length > 15));
        
        // Potentially harmful content list from before
        const potentiallyBlockedTerms = [
            'harmful', 'dangerous', 'illegal', 'weapon', 'violence', 'suicide', 'attack',
            'bomb', 'kill', 'hurt', 'offensive', 'sexually explicit'
        ];
        
        const containsBlockedTerm = potentiallyBlockedTerms.some(term => lowercaseInput.includes(term));
        
        const userMessage: ChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: inputValue
        };

        setMessages(prevMessages => [...prevMessages, userMessage]);
        const currentInput = inputValue;
        setInputValue('');
        setIsAiTyping(true);

        // If the message is off-topic or contains harmful content
        if (isOffTopic || containsBlockedTerm) {
            setTimeout(() => {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { 
                        id: Date.now() + 1, 
                        sender: 'ai', 
                        text: "I'm sorry, I can only assist with agricultural topics, particularly about crop treatments, diseases, and farming practices. Please ask a question related to plant health, crop management, or agricultural practices."
                    }
                ]);
                setIsAiTyping(false);
            }, 1000);
            return;
        }

        try {
            // Use API endpoint without trailing slash to match Django URL pattern
            const response = await fetch('/api/chat-treatment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: currentInput })
            });

            if (!response.ok) {
                let errorMessage = "There was an issue connecting to the treatment advisor service.";
                try {
                    const errorData = await response.json();
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    console.error("Failed to parse error response:", e);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const aiResponseText = data.ai_response || "Sorry, I couldn't get a meaningful response.";

            setMessages(prevMessages => [
                ...prevMessages,
                { id: Date.now() + 1, sender: 'ai', text: aiResponseText }
            ]);

        } catch (error) {
            console.error("Error sending message to backend:", error);
            
            let friendlyErrorMessage = "I'm sorry, I encountered an issue processing your request. Please try a different question about crop treatments.";
            if (error instanceof Error) {
                // Don't expose raw error messages to users, use a friendly message
                if (error.message.includes('GOOGLE_API_KEY')) {
                    friendlyErrorMessage = "The AI treatment advisor is currently unavailable. Please try again later.";
                }
            }
            
            setMessages(prevMessages => [
                ...prevMessages,
                { id: Date.now() + 1, sender: 'ai', text: friendlyErrorMessage }
            ]);
        } finally {
            setIsAiTyping(false);
        }
    };

    // Avatar for AI
    const AiAvatar = () => (
        <Avatar radius="xl" size="sm" color={theme.primaryColor} variant="filled">
            <IconMessageChatbot size="0.8rem" />
        </Avatar>
    );

    // Default styles (light mode)
    const defaultPaperStyle = {
        height: '70vh', 
        display: 'flex', 
        flexDirection: 'column' as const,
        backgroundColor: theme.white,
    };

    const defaultDividerStyle = {
        borderTop: `1px solid ${theme.colors.gray[3]}`, 
        paddingTop: theme.spacing.md
    };

    // Apply color scheme only after mounting to prevent hydration mismatch
    const paperStyle = mounted ? {
        ...defaultPaperStyle,
        backgroundColor: colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    } : defaultPaperStyle;

    const groupDividerStyle = mounted ? {
        ...defaultDividerStyle,
        borderTop: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3]}`,
    } : defaultDividerStyle;

    // Helper function to get message style after mounting
    const getMessageStyle = (sender: 'user' | 'ai') => {
        if (!mounted) {
            return {
                backgroundColor: sender === 'user' ? theme.colors[theme.primaryColor][5] : theme.white,
                color: sender === 'user' ? theme.white : theme.black,
                borderTopLeftRadius: sender === 'ai' ? rem(4) : 'lg',
                borderTopRightRadius: sender === 'user' ? rem(4) : 'lg',
            };
        }

        return {
            backgroundColor: sender === 'user' 
                ? (colorScheme === 'dark' ? theme.colors[theme.primaryColor][8] : theme.colors[theme.primaryColor][5]) 
                : (colorScheme === 'dark' ? theme.colors.dark[6] : theme.white),
            color: sender === 'user' 
                ? theme.white 
                : (colorScheme === 'dark' ? theme.colors.dark[0] : theme.black),
            borderTopLeftRadius: sender === 'ai' ? rem(4) : 'lg',
            borderTopRightRadius: sender === 'user' ? rem(4) : 'lg',
        };
    };

    // Get text color based on color scheme
    const getTextColor = (isUser: boolean) => {
        if (!mounted) {
            return isUser ? theme.white : theme.colors.gray[7];
        }
        return isUser 
            ? theme.white 
            : colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.gray[7];
    };

    // Get title color based on mounting state and color scheme
    const titleColor = mounted 
        ? (colorScheme === 'dark' ? theme.colors.gray[3] : theme.colors.gray[8])
        : theme.colors.gray[8];

    return (
        <Paper 
            shadow="md" 
            radius="lg" 
            p="lg"
            withBorder 
            style={paperStyle}
        >
            <Title order={4} mb="md" c={titleColor}>
                <Group gap="xs">
                    <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: theme.primaryColor, to: 'cyan' }}>
                        <IconMessageChatbot size={20}/>
                    </ThemeIcon>
                    AI Treatment Advisor (Gemini 2.0 Flash)
                </Group>
            </Title>
            <Text size="sm" c="dimmed" mb="md">
                Powered by Google's advanced Gemini 2.0 Flash model for more dynamic and helpful responses.
            </Text>

            <ScrollArea viewportRef={viewport} style={{ flex: 1, marginBottom: theme.spacing.md }} type="auto">
                <Stack gap="lg" p="xs">
                    {messages.map((message) => (
                        <Box
                            key={message.id}
                            style={{
                                alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                            }}
                        >
                            <Paper
                                shadow="sm"
                                radius="lg"
                                p="md"
                                withBorder={message.sender === 'ai'}
                                style={getMessageStyle(message.sender)}
                            >
                                {message.sender === 'ai' && (
                                    <Group gap="xs" mb={rem(5)}>
                                        <AiAvatar />
                                        <Text size="sm" fw={500} c={getTextColor(false)}>
                                            FarmWise AI
                                        </Text>
                                    </Group>
                                )}
                                <Text style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                    {message.text}
                                </Text>
                            </Paper>
                        </Box>
                    ))}
                     {isAiTyping && (
                        <Box style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                            <Paper
                                shadow="sm"
                                radius="lg"
                                p="md"
                                withBorder
                                style={getMessageStyle('ai')}
                            >
                                <Group gap="xs" mb={rem(5)}>
                                    <AiAvatar />
                                    <Text size="sm" fw={500} c={getTextColor(false)}>
                                        FarmWise AI
                                    </Text>
                                </Group>
                                <Group gap="xs" align="center">
                                    <Loader size="sm" color={theme.primaryColor} />
                                    <Text size="sm" c="dimmed">Typing...</Text>
                                </Group>
                            </Paper>
                        </Box>
                     )}
                </Stack>
            </ScrollArea>
            
            {/* Add suggested topics */}
            {messages.length < 3 && (
                <Paper withBorder p="xs" mb="md" radius="md" style={{ backgroundColor: colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0] }}>
                    <Text size="xs" c="dimmed" mb="xs">Suggested topics:</Text>
                    <Group gap="xs" wrap="wrap">
                        {exampleTopics.map((topic, index) => (
                            <Button
                                key={index}
                                variant="light"
                                size="xs"
                                color={theme.primaryColor}
                                onClick={() => suggestTopic(topic)}
                            >
                                {topic}
                            </Button>
                        ))}
                    </Group>
                </Paper>
            )}
            
            <Group gap="md" style={groupDividerStyle}>
                <TextInput
                    placeholder="Ask about treatments... e.g., 'How to treat apple scab?'"
                    style={{ flexGrow: 1 }}
                    value={inputValue}
                    onChange={(event) => setInputValue(event.currentTarget.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault(); // Prevent newline on Enter
                            handleSendMessage();
                        }
                    }}
                    disabled={isAiTyping}
                    radius="xl"
                    rightSectionWidth={rem(42)}
                    rightSectionProps={{ style: { pointerEvents: 'all' } }} // Ensure button is clickable
                    rightSection={
                        isAiTyping ? (
                            <Loader size="xs" color={theme.primaryColor} />
                        ) : (
                            <ActionIcon 
                                onClick={handleSendMessage} 
                                disabled={!inputValue.trim() || isAiTyping} 
                                size={32} 
                                radius="xl" 
                                color={theme.primaryColor} 
                                variant="filled"
                            >
                                <IconSend size={rem(18)} />
                            </ActionIcon>
                        )
                    }
                />
            </Group>
        </Paper>
    );
};


// --- Main Page Component ---
export default function CropHealthPage() {
  return (
    <Container fluid>
      <Title order={2} mb="lg">
        <IconPlant2 size={28} style={{ marginRight: '8px', verticalAlign: 'bottom' }} />
        Crop Health Monitoring
      </Title>
      <Text c="dimmed" mb="xl">
        Monitor your farm's health with satellite-derived vegetation indices and AI-powered tools.
      </Text>

        <Tabs defaultValue="health">
            <Tabs.List grow>
                <Tabs.Tab value="health" leftSection={<IconChartBar size={16} />}>
                    Farm Health
                </Tabs.Tab>
                <Tabs.Tab value="disease" leftSection={<IconBug size={16} />}>
                    Disease Detection
                </Tabs.Tab>
                <Tabs.Tab value="weed" leftSection={<IconLeaf size={16} />}>
                    Weed Identification
                </Tabs.Tab>
                <Tabs.Tab value="chat" leftSection={<IconMessageChatbot size={16} />}>
                    Treatment Chat
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="health" pt="lg">
                <FarmHealthDashboard />
            </Tabs.Panel>

            <Tabs.Panel value="disease" pt="lg">
                 <Paper withBorder p="xl" radius="md" shadow="sm">
                     <Title order={4} mb="md">Upload Crop Image for Disease Analysis</Title>
                    <ImageAnalysis type="disease" />
                 </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="weed" pt="lg">
      <Paper withBorder p="xl" radius="md" shadow="sm">
                     <Title order={4} mb="md">Upload Image for Weed Identification</Title>
                     <ImageAnalysis type="weed" />
      </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="chat" pt="lg">
                <Paper withBorder shadow="md" radius="md" p={0}>
                    <AiChatInterface isFullScreen={false} />
                </Paper>
            </Tabs.Panel>
        </Tabs>

    </Container>
  );
}
