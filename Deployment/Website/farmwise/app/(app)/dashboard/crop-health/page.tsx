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
    useMantineColorScheme
} from '@mantine/core';
import { IconPlant2, IconInfoCircle, IconBug, IconLeaf, IconMessageChatbot, IconUpload, IconPhoto, IconX, IconSend, IconCalendar, IconTrendingUp, IconChartBar, IconMapPin, IconPlayerPlay, IconPlayerPause, IconArrowsMaximize, IconArrowRight } from '@tabler/icons-react';
import styles from './CropHealthPage.module.css';
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from '@mantine/dropzone';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { AreaChart } from '@mantine/charts';

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
                    fetch('/api/detect-weeds', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                            image_base64: base64Image 
                        }),
                    })
                    .then(response => {
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
        } else if (type === 'disease') { // MOCK FOR DISEASE
            // Simulate analysis delay
            setTimeout(() => {
                setAnalyzing(false);
                // Simulate different outcomes for disease for testing UI
                const mockOutcomes = [
                    "The image shows symptoms of Septoria Leaf Blotch at early stage. This fungal disease affects wheat and can reduce yields by up to 30%. Early treatment is recommended. Ensure good air circulation by proper plant spacing and avoid overhead irrigation.",
                    "No significant disease symptoms detected in the provided image. Continue regular monitoring.",
                    "Possible signs of nutrient deficiency (e.g., nitrogen) observed. Consider soil testing for confirmation before applying treatments.",
                ];
                const randomOutcome = mockOutcomes[Math.floor(Math.random() * mockOutcomes.length)];
                setResult(randomOutcome);
                // Simulate an error occasionally
                // if (Math.random() > 0.8) {
                //     setAnalysisError("Mock analysis server error. Please try again.");
                //     setResult(null);
                // }
            }, 2500);
        }
    };

    // --- Common UI States ---

    // 1. Upload State (Common for both types)
    if (!uploadedImageDetails.url) {
        return (
            <Paper p="xl" radius="md" shadow="xs" withBorder>
                <Dropzone
                    onDrop={handleDrop}
                    accept={IMAGE_MIME_TYPE}
                    h={300}
                    styles={{
                        root: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s ease' },
                    }}
                >
                    <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                        <Dropzone.Accept><ThemeIcon color="blue" variant="light" size={60} radius="xl"><IconUpload stroke={1.5} size={30}/></ThemeIcon></Dropzone.Accept>
                        <Dropzone.Reject><ThemeIcon color="red" variant="light" size={60} radius="xl"><IconX stroke={1.5} size={30}/></ThemeIcon></Dropzone.Reject>
                        <Dropzone.Idle><ThemeIcon color="gray" variant="light" size={60} radius="xl"><IconPhoto stroke={1.5} size={30}/></ThemeIcon></Dropzone.Idle>
                        <Stack align="center" gap={5}>
                            <Text size="xl" fw={500}>Drag image here or click to select</Text>
                            <Text size="sm" c="dimmed">Upload a clear photo for {type === 'weed' ? 'weed identification' : 'disease detection'}.</Text>
                            <Text size="xs" c="dimmed" mt="xs">Max file size: 5MB. Supported formats: JPEG, PNG.</Text>
                        </Stack>
                    </Group>
                </Dropzone>
            </Paper>
        );
    }

    // 2. Analyzing State (Common for both types)
    if (analyzing) {
        return (
            <Paper withBorder p="xl" radius="md" shadow="xs" style={{ minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Loader size="xl" variant="bars" />
                <Title order={3} mt="lg">Analyzing Image for {type === 'weed' ? 'Weeds' : 'Diseases'}</Title>
                <Text c="dimmed" size="sm" mt={5}>Our AI is meticulously scanning your image. Please wait a moment.</Text>
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
                    <Alert title="Analysis Error" color="red" icon={<IconInfoCircle />} radius="md">
                        <Text mb="sm">{analysisError}</Text>
                        <Button onClick={resetAnalysisState} variant="light" color="red" mt="md">
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
                    <Paper withBorder p="xl" radius="md" shadow="xs" style={{ textAlign: 'center' }}>
                        <ThemeIcon size={80} radius="xl" variant="light" color="green" mx="auto" mb="lg">
                            <IconPlant2 size={40} />
                        </ThemeIcon>
                        <Title order={3} mb="xs">No Weeds Detected!</Title>
                        <Text c="dimmed" mb="xl" size="sm">
                            {result || 'Our analysis indicates the area is clear of common weeds. Great job!'}
                        </Text>
                        <Button onClick={resetAnalysisState} leftSection={<IconUpload size={18}/>}>
                            Analyze Another Image
                        </Button>
                    </Paper>
                );
            }

            // 3c. Weed: Detections Found - Main Layout
            return (
                <Paper withBorder p="lg" radius="md" shadow="xs">
                    <Grid gutter="lg">
                        <Grid.Col span={{ base: 12, lg: 7 }}>
                            <Stack>
                                <Group justify="space-between" align="center" mb="xs">
                                   <Title order={4}><IconPhoto size={20} style={{verticalAlign: 'middle', marginRight: rem(8)}}/>Analyzed Image</Title>
                                    <Tooltip label="Detections are highlighted on the image." position="top-end" withArrow>
                                        <ActionIcon variant="subtle" color="gray"><IconInfoCircle/></ActionIcon>
                                    </Tooltip>
                                </Group>
                                <Paper withBorder radius="md" p="xs" style={{ position: 'relative', backgroundColor: theme.colors.dark[8] }}>
                                    <Box style={{ position: 'relative', height: rem(450) /* Consistent height */ }}>
                                        <Image
                                            src={uploadedImageDetails.url!}
                                            alt="Uploaded weed image"
                                            h="100%" w="100%" fit="contain" radius="sm"
                                            style={{ position: 'absolute', top: 0, left: 0, opacity: 0.1, zIndex: 0 }}
                                        />
                                        <canvas
                                            ref={canvasRef}
                                            style={{ display: 'block', borderRadius: 'var(--mantine-radius-sm)', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
                                        />
                                    </Box>
                                </Paper>
                                <Group justify="flex-end" mt="sm">
                                    <Button variant="outline" onClick={resetAnalysisState} leftSection={<IconPhoto size={18}/>}>
                                        Analyze Another Image
                                    </Button>
                                </Group>
                            </Stack>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, lg: 5 }}>
                            <Stack h="100%">
                                <Title order={4} mb="xs"><IconLeaf size={20} style={{verticalAlign: 'middle', marginRight: rem(8)}}/>Detected Weeds ({detections.length})</Title>
                                <ScrollArea h={rem(200)} type="auto" offsetScrollbars="y" style={{border: `1px solid ${theme.colors.gray[3]}`, borderRadius: theme.radius.sm}}>
                                    <Stack gap="xs" p="xs">
                                        {detections.map((weed, index) => {
                                            const weedColorName = getColorNameForClass(weed.class_name);
                                            const weedColor = theme.colors[weedColorName][colorScheme === 'dark' ? 4 : 6];
                                            return (
                                            <Paper
                                                key={index}
                                                withBorder={selectedWeed !== weed}
                                                p="sm"
                                                radius="sm"
                                                onClick={() => setSelectedWeed(weed)}
                                                style={{
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    borderLeft: `4px solid ${weedColor}`,
                                                    boxShadow: selectedWeed === weed ? theme.shadows.md : theme.shadows.xs,
                                                    transform: selectedWeed === weed ? 'scale(1.02)' : 'scale(1)',
                                                    backgroundColor: selectedWeed === weed 
                                                                     ? (colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0]) 
                                                                     : (colorScheme === 'dark' ? theme.colors.dark[6] : theme.white),
                                                }}
                                                component="button"
                                                className={styles.weedListItem}
                                            >
                                                <Group justify="space-between">
                                                    <Text fw={selectedWeed === weed ? 700 : 500} size="sm" c={selectedWeed === weed ? theme.colors[weedColorName][colorScheme === 'dark' ? 3:7] : undefined}>
                                                        {weed.class_name.charAt(0).toUpperCase() + weed.class_name.slice(1)}
                                                    </Text>
                                                </Group>
                                            </Paper>
                                        );
                                        })}
                                    </Stack>
                                </ScrollArea>

                                <Box mt="md" style={{ flexGrow: 1 }}>
                                <Collapse in={!!selectedWeed} transitionDuration={300}>
                                    {selectedWeed && (() => {
                                        const selectedWeedColorName = getColorNameForClass(selectedWeed.class_name);
                                        const headerBgColor = theme.colors[selectedWeedColorName][colorScheme === 'dark' ? 8 : 6];
                                        const iconColor = theme.colors[selectedWeedColorName][colorScheme === 'dark' ? 2 : 7];
                                        const iconBgColor = theme.colors[selectedWeedColorName][colorScheme === 'dark' ? 6 : 1];

                                        return (
                                            <Card shadow="md" padding={0} radius="md" withBorder style={{ overflow: 'hidden', height: '100%' }}>
                                                <Card.Section
                                                    style={{ backgroundColor: headerBgColor, borderBottom: `1px solid ${theme.colors[selectedWeedColorName][colorScheme === 'dark' ? 7 : 5]}` }}
                                                    p="md"
                                                >
                                                    <Group justify="space-between">
                                                        <Group gap="sm">
                                                            <ThemeIcon
                                                                size={48}
                                                                radius="xl"
                                                                variant="filled"
                                                                style={{ backgroundColor: iconBgColor, border:`2px solid ${iconColor}`}}
                                                            >
                                                                <IconLeaf size={26} style={{color: iconColor }} />
                                                            </ThemeIcon>
                                                            <Stack gap={0}>
                                                                <Title order={4} c="white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}>
                                                                    {selectedWeed.class_name.charAt(0).toUpperCase() + selectedWeed.class_name.slice(1)}
                                                                </Title>
                                                            </Stack>
                                                        </Group>
                                                    </Group>
                                                </Card.Section>
                                                <ScrollArea h={rem(220)} p="md">
                                                <Stack gap="sm">
                                                    <Box>
                                                        <Text fw={700} size="sm" mb={2}>Description:</Text>
                                                        <Text size="xs" c="dimmed">
                                                            {weedInfoDB[selectedWeed.class_name]?.description || 'A competitive weed species...'}
                                                        </Text>
                                                    </Box>
                                                     <Box>
                                                        <Text fw={700} size="sm" mt="xs" mb={2}>Impact on Crops:</Text>
                                                        <Text size="xs" c="dimmed">
                                                            {weedInfoDB[selectedWeed.class_name]?.impact || 'Competes with crops...'}
                                                        </Text>
                                                    </Box>
                                                    <Box>
                                                        <Text fw={700} size="sm" mt="xs" mb={2}>Recommended Control:</Text>
                                                        <Text size="xs" c="dimmed">
                                                            {weedInfoDB[selectedWeed.class_name]?.control || 'Implement integrated weed management...'}
                                                        </Text>
                                                    </Box>
                                                </Stack>
                                                </ScrollArea>
                                            </Card>
                                        );
                                    })()}
                                </Collapse>
                                </Box>
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </Paper>
            );
        } else if (type === 'disease') {
             // 3d. Disease: Result (No specific "no disease" visual, relies on 'result' string)
            if (result) { // If there's any result string from the mock
                const isLikelyNoDisease = result.toLowerCase().includes("no significant disease symptoms detected");
                const cardColor = isLikelyNoDisease ? "green" : "blue";
                const cardIcon = isLikelyNoDisease ? <IconPlant2 size={28} /> : <IconBug size={28} />;
                
                return (
                    <Paper withBorder p="xl" radius="md" shadow="xs">
                        <Grid gutter="lg">
                            <Grid.Col span={{ base: 12, md: 7 }}>
                                <Stack>
                                     <Title order={4} mb="xs"><IconPhoto size={20} style={{verticalAlign: 'middle', marginRight: rem(8)}}/>Analyzed Image</Title>
                                     <Paper withBorder radius="md" p="xs" style={{ backgroundColor: theme.colors.dark[8] }}>
                                        <Image src={uploadedImageDetails.url!} alt="Uploaded disease image" fit="contain" h={rem(350)} radius="sm"/>
                                     </Paper>
                                </Stack>
                            </Grid.Col>
                             <Grid.Col span={{ base: 12, md: 5 }}>
                                <Card shadow="md" padding="lg" radius="md" withBorder h="100%">
                                    <Card.Section 
                                        style={{ backgroundColor: theme.colors[cardColor][colorScheme === 'dark' ? 8 : 6] }} 
                                        p="md"
                                    >
                                        <Group justify="space-between">
                                            <Group gap="sm">
                                                <ThemeIcon 
                                                    size={48} radius="xl" variant="filled"
                                                    style={{ backgroundColor: theme.colors[cardColor][colorScheme === 'dark' ? 6:1], border: `2px solid ${theme.colors[cardColor][colorScheme === 'dark' ? 2:7]}`}}
                                                >
                                                    {React.cloneElement(cardIcon, { style: { color: theme.colors[cardColor][colorScheme === 'dark' ? 2:7]}})}
                                                </ThemeIcon>
                                                <Stack gap={0}>
                                                    <Text fw={700} size="lg" c="white">
                                                        Disease Analysis Result
                                                    </Text>
                                                     {isLikelyNoDisease && (
                                                        <Text c={theme.colors[cardColor][0]} opacity={0.9} size="xs">
                                                            All Clear!
                                                        </Text>
                                                     )}
                                                </Stack>
                                            </Group>
                                        </Group>
                                    </Card.Section>
                                    <ScrollArea h={rem(250)} mt="md">
                                        <Text size="sm" lh="md" style={{whiteSpace: 'pre-line'}}>{result}</Text>
                                    </ScrollArea>
                                </Card>
                            </Grid.Col>
                        </Grid>
                        <Group justify="center" mt="xl">
                            <Button onClick={resetAnalysisState} leftSection={<IconUpload size={18}/>} variant="light">
                                Analyze Another Image
                            </Button>
                        </Group>
                    </Paper>
                );
            }
             // If no result string and no error (should ideally not happen with current mock, but good fallback)
            return (
                <Paper withBorder p="xl" radius="md" shadow="xs" style={{ textAlign: 'center' }}>
                     <Title order={4} c="dimmed">Analysis complete, but no specific details were returned.</Title>
                     <Button onClick={resetAnalysisState} mt="lg">Analyze Another</Button>
                </Paper>
            );
        }
    }


    // 4. Default Fallback: Image is uploaded, show preview and Analyze button (Common for both)
    // This state is reached if analysis has not been attempted yet.
    return (
        <Paper withBorder p="xl" radius="md" shadow="sm">
            <Stack align="center" gap="lg">
                 <Title order={3} ta="center">Image Ready for {type === 'weed' ? 'Weed' : 'Disease'} Analysis</Title>
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
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 0, sender: 'ai', text: 'Hello! I can suggest treatments for crop health issues. How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const messageEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputValue.trim() || isAiTyping) return;

        const userMessage: ChatMessage = {
            id: messages.length,
            sender: 'user',
            text: inputValue
        };

        setMessages([...messages, userMessage]);
        setInputValue('');
        setIsAiTyping(true);

        // Simulate AI response delay
        setTimeout(() => {
            const aiResponse = generateAiResponse(userMessage.text);
            setMessages(prevMessages => [
                ...prevMessages,
                { id: prevMessages.length, sender: 'ai', text: aiResponse }
            ]);
            setIsAiTyping(false);
        }, 1500);
    };

    const generateAiResponse = (userText: string): string => {
        // Simple rule-based responses
        const lowerText = userText.toLowerCase();
        
        if (lowerText.includes('septoria') || lowerText.includes('leaf blotch')) {
            return "For Septoria Leaf Blotch, I recommend applying a fungicide containing propiconazole or azoxystrobin. Apply at the first sign of disease, and repeat as needed following the product's instructions. Ensure good air circulation by proper plant spacing and avoid overhead irrigation.";
        }
        
        if (lowerText.includes('rust') || lowerText.includes('yellow rust')) {
            return "For Yellow Rust, apply a triazole or strobilurin fungicide as soon as symptoms appear. Resistant cultivars are the most effective control measure for the next growing season. Monitor your crop regularly especially during humid conditions.";
        }
        
        if (lowerText.includes('powdery mildew')) {
            return "For Powdery Mildew, apply sulfur-based fungicides or potassium bicarbonate as organic options. Chemical fungicides with active ingredients like trifloxystrobin or myclobutanil are also effective. Apply at first sign of infection and ensure good air circulation between plants.";
        }
        
        if (lowerText.includes('aphid')) {
            return "For aphid infestations, you can use insecticidal soaps or neem oil for organic control. For stronger options, consider systemic insecticides containing imidacloprid or acetamiprid. Encourage beneficial insects like ladybugs and lacewings that naturally prey on aphids.";
        }
        
        if (lowerText.includes('weed') || lowerText.includes('pigweed') || lowerText.includes('amaranth')) {
            return "For Redroot Pigweed (Amaranthus retroflexus), apply pre-emergence herbicides containing pendimethalin or S-metolachlor. For post-emergence control, herbicides with active ingredients like glyphosate (in resistant crops), 2,4-D, or dicamba are effective. Always follow the recommended application rates and timing.";
        }
        
        if (lowerText.includes('irrigation') || lowerText.includes('water')) {
            return "For optimal irrigation, I recommend monitoring soil moisture levels with sensors or the finger test. Most crops require 1-1.5 inches of water per week during growing season. Water deeply and infrequently to encourage deep root growth. Consider drip irrigation to reduce water usage and minimize leaf wetness that can promote disease.";
        }
        
        if (lowerText.includes('fertiliz') || lowerText.includes('nutri')) {
            return "For fertilization, I recommend soil testing first to determine exact needs. For general guidance, apply balanced NPK fertilizer before planting, then nitrogen-focused fertilizers during growth stages. Consider foliar micronutrient sprays if deficiency symptoms appear. Organic options include compost, manure, and cover crops.";
        }
        
        // Default response for unknown queries
        return "I understand you're asking about crop treatments. Could you provide more specific information about the issue you're facing? For example, what crop are you growing, what symptoms are you seeing, or what pests/diseases have you identified?";
    };

    return (
        <Paper withBorder shadow="md" radius="md" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '60vh' }}>
            <ScrollArea flex={1} p="md">
                <Stack>
                    {messages.map((message) => (
                        <Paper
                            key={message.id}
                            withBorder
                            radius="md"
                            p="sm"
                            style={{
                                alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                backgroundColor: message.sender === 'user' ? 'var(--mantine-color-blue-0)' : 'white'
                            }}
                        >
                            {message.sender === 'ai' && (
                                <Group align="center" mb={4}>
                                    <Avatar radius="xl" size="sm" color="green">AI</Avatar>
                                    <Text size="sm" fw={500}>Treatment Assistant</Text>
                                </Group>
                            )}
                            <Text>{message.text}</Text>
                            </Paper>
                    ))}
                     {isAiTyping && (
                        <Paper
                            withBorder
                            radius="md"
                            p="sm"
                            style={{ alignSelf: 'flex-start', maxWidth: '80%' }}
                        >
                            <Group align="center" mb={4}>
                                <Avatar radius="xl" size="sm" color="green">AI</Avatar>
                                <Text size="sm" fw={500}>Treatment Assistant</Text>
                            </Group>
                            <Group gap="xs">
                                <Loader size="xs" />
                                <Text size="sm">Typing a response...</Text>
                            </Group>
                             </Paper>
                     )}
                    <div ref={messageEndRef} />
                </Stack>
            </ScrollArea>
            <Group gap="xs" p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
                <TextInput
                    placeholder="Ask about treatments..."
                    style={{ flexGrow: 1 }}
                    value={inputValue}
                    onChange={(event) => setInputValue(event.currentTarget.value)}
                    onKeyDown={(event) => event.key === 'Enter' && handleSendMessage()}
                    disabled={isAiTyping}
                />
                <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isAiTyping} loading={isAiTyping}>
                    <IconSend size={18} />
                </Button>
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
                 <TreatmentChat />
            </Tabs.Panel>
        </Tabs>

    </Container>
  );
}
