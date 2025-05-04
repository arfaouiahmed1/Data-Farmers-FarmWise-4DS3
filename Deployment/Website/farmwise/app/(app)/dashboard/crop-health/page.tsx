'use client';
import React, { useEffect, useState, useRef } from 'react';
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
    Tooltip
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

interface ImageAnalysisProps {
    type: AnalysisType;
}

const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ type }) => {
    const [image, setImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleDrop = (acceptedFiles: FileWithPath[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);
            setResult(null);
        }
    };

    const handleAnalyze = () => {
        if (!image) return;
        
        setAnalyzing(true);
        // Simulate analysis delay
        setTimeout(() => {
            setAnalyzing(false);
            
            // Mock results based on analysis type
            if (type === 'disease') {
                setResult('The image shows symptoms of Septoria Leaf Blotch at early stage. This fungal disease affects wheat and can reduce yields by up to 30%. Early treatment is recommended.');
            } else {
                setResult('Identified Amaranthus retroflexus (Redroot Pigweed) with 89% confidence. This weed competes with crops for nutrients and can significantly reduce yields if not controlled.');
            }
        }, 2000);
    };

    return (
        <Stack>
            {!image ? (
            <Dropzone
                onDrop={handleDrop}
                accept={IMAGE_MIME_TYPE}
                    h={300}
            >
                    <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                    <Dropzone.Accept>
                            <IconUpload
                                size={50}
                                stroke={1.5}
                                color={'var(--mantine-color-blue-6)'}
                            />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                            <IconX
                                size={50}
                                stroke={1.5}
                                color={'var(--mantine-color-red-6)'}
                            />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                            <IconPhoto size={50} stroke={1.5} />
                    </Dropzone.Idle>

                        <Stack gap={0}>
                        <Text size="xl" inline>
                            Drag image here or click to select file
                        </Text>
                        <Text size="sm" c="dimmed" inline mt={7}>
                                Upload a clear image of the {type === 'disease' ? 'plant showing symptoms' : 'weed for identification'}
                        </Text>
                        </Stack>
                </Group>
            </Dropzone>
            ) : (
                <>
                    <Paper withBorder radius="md" p="xs" style={{ position: 'relative' }}>
                        <Group justify="end" mb="xs">
                            <Button 
                                variant="subtle" 
                                size="compact-sm" 
                                color="red" 
                                onClick={() => {
                                    setImage(null);
                                    setResult(null);
                                }}
                            >
                                Remove
                    </Button>
                        </Group>
                        <Image 
                            src={image} 
                            h={300} 
                            fit="contain" 
                            radius="md"
                        />
                </Paper>

                <Group justify="center">
                        <Button 
                            leftSection={analyzing ? <Loader size="sm" /> : undefined}
                            onClick={handleAnalyze}
                            disabled={analyzing}
                        >
                            {analyzing ? 'Analyzing...' : 'Analyze Image'}
                        </Button>
                </Group>
                    
                    {result && (
                        <Alert title={`${type === 'disease' ? 'Disease' : 'Weed'} Analysis Result`} color="blue" mt="md">
                            {result}
                        </Alert>
                    )}
                </>
            )}
        </Stack>
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
