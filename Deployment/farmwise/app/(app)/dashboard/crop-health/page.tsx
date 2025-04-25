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
    Image
} from '@mantine/core';
import { IconPlant2, IconInfoCircle, IconMapPin, IconBug, IconLeaf, IconMessageChatbot, IconUpload, IconPhoto, IconX, IconSend } from '@tabler/icons-react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L, { Layer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './CropHealthPage.module.css';
import { GeoJsonObject } from 'geojson';
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from '@mantine/dropzone';

// Define interface for Feature properties
interface FieldProperties {
    name?: string;
    ndvi?: number;
    evi?: number;
}

// Use the specific FeatureCollection type from GeoJSON namespace
const farmFieldsData: GeoJSON.FeatureCollection<GeoJSON.Polygon, FieldProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Field A', ndvi: 0.75, evi: 0.6 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-74.0, 40.7],
            [-74.0, 40.8],
            [-73.9, 40.8],
            [-73.9, 40.7],
            [-74.0, 40.7],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Field B', ndvi: 0.5, evi: 0.4 },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-73.9, 40.7],
            [-73.9, 40.8],
            [-73.8, 40.8],
            [-73.8, 40.7],
            [-73.9, 40.7],
          ],
        ],
      },
    },
    {
        type: 'Feature',
        properties: { name: 'Field C', ndvi: 0.9, evi: 0.85 },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-74.0, 40.6],
              [-74.0, 40.7],
              [-73.9, 40.7],
              [-73.9, 40.6],
              [-74.0, 40.6],
            ],
          ],
        },
      },
  ],
};

// --- Helper Functions (Map) ---
const calculateHealthScore = (ndvi: number | undefined, evi: number | undefined): number => {
    if (ndvi === undefined || evi === undefined) return 0;
    const normNdvi = Math.max(0, Math.min(1, (ndvi + 1) / 2));
    const normEvi = Math.max(0, Math.min(1, evi));
    return 0.6 * normNdvi + 0.4 * normEvi;
};
const getColor = (score: number): string => {
  return score > 0.7 ? '#4CAF50' :
         score > 0.4 ? '#FFEB3B' :
                       '#F44336';
};
const styleFeature = (feature: GeoJSON.Feature<GeoJSON.Geometry, FieldProperties> | undefined) => {
  if (!feature || !feature.properties) {
    return {
        fillColor: '#CCCCCC',
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.5,
      };
  }
  const { ndvi, evi } = feature.properties;
  const score = calculateHealthScore(ndvi, evi);
  return {
    fillColor: getColor(score),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7,
  };
};
const onEachFeature = (feature: GeoJSON.Feature<GeoJSON.Geometry, FieldProperties>, layer: Layer) => {
    if (feature.properties) {
        const { name, ndvi, evi } = feature.properties;
        const score = calculateHealthScore(ndvi, evi);
        const popupContent = `
            <b>${name || 'Unnamed Field'}</b><br/>
            NDVI: ${ndvi !== undefined ? ndvi.toFixed(2) : 'N/A'}<br/>
            EVI: ${evi !== undefined ? evi.toFixed(2) : 'N/A'}<br/>
            Health Score: ${score.toFixed(2)}
        `;
        layer.bindPopup(popupContent);
    }
};
interface FitBoundsProps {
    geoJsonData: GeoJsonObject | null;
}
const FitBounds: React.FC<FitBoundsProps> = ({ geoJsonData }) => {
    const map = useMap();
    useEffect(() => {
        if (map && geoJsonData && (geoJsonData.type === 'FeatureCollection' || geoJsonData.type === 'Feature')) {
            const geoJsonLayer = L.geoJSON(geoJsonData);
            if (Object.keys(geoJsonLayer.getBounds()).length > 0) {
                 map.fitBounds(geoJsonLayer.getBounds());
            } else {
                console.warn("Could not calculate bounds for GeoJSON data.");
            }
        }
    }, [map, geoJsonData]);
    return null;
};

// --- Image Analysis Component ---
type AnalysisType = 'disease' | 'weed';

interface ImageAnalysisProps {
    type: AnalysisType;
}

const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ type }) => {
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const previews = files.map((file, index) => {
        const imageUrl = URL.createObjectURL(file);
        return <Image key={index} src={imageUrl} onLoad={() => URL.revokeObjectURL(imageUrl)} alt={`preview ${index}`} radius="md" h={150} fit="contain" />;
    });

    const handleDrop = (acceptedFiles: FileWithPath[]) => {
        setFiles(acceptedFiles);
        setAnalysisResult(null); // Clear previous results
        setIsLoading(false);
    };

    const handleAnalyze = () => {
        if (files.length === 0) return;
        setIsLoading(true);
        setAnalysisResult(null);
        // Simulate API call
        setTimeout(() => {
            let resultText = `Analysis for ${type}:
`;
            if (type === 'disease') {
                const diseases = ['Septoria Leaf Spot', 'Powdery Mildew', 'Early Blight', 'Healthy'];
                const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
                const confidence = (Math.random() * 0.4 + 0.6).toFixed(2); // Simulate confidence (60-100%)
                resultText += `Detected: ${randomDisease} (Confidence: ${confidence})`;
                if(randomDisease !== 'Healthy') {
                    resultText += `\nRecommendation: Consider applying a fungicide suitable for ${randomDisease}. Check local guidelines.`
                }
            } else {
                const weeds = ['Crabgrass', 'Dandelion', 'Thistle', 'No Weeds Detected'];
                const randomWeed = weeds[Math.floor(Math.random() * weeds.length)];
                 const confidence = (Math.random() * 0.3 + 0.7).toFixed(2); // Simulate confidence (70-100%)
                resultText += `Identified: ${randomWeed} (Confidence: ${confidence})`;
                 if(randomWeed !== 'No Weeds Detected') {
                    resultText += `\nRecommendation: Use a selective herbicide or manual removal for ${randomWeed}.`
                }
            }
            setAnalysisResult(resultText);
            setIsLoading(false);
        }, 2000); // Simulate 2 seconds delay
    };

    return (
        <Stack gap="lg">
            <Dropzone
                onDrop={handleDrop}
                onReject={(files) => console.log('rejected files', files)}
                maxSize={5 * 1024 ** 2} // 5MB
                accept={IMAGE_MIME_TYPE}
                multiple={false}
            >
                <Group justify="center" gap="xl" mih={180} style={{ pointerEvents: 'none' }}>
                    <Dropzone.Accept>
                        <IconUpload style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }} stroke={1.5} />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                        <IconX style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }} stroke={1.5} />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                        <IconPhoto style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }} stroke={1.5} />
                    </Dropzone.Idle>
                    <div>
                        <Text size="xl" inline>
                            Drag image here or click to select file
                        </Text>
                        <Text size="sm" c="dimmed" inline mt={7}>
                            Attach one image file, should not exceed 5mb
                        </Text>
                    </div>
                </Group>
            </Dropzone>

            {files.length > 0 && (
                <Paper withBorder p="md" radius="md">
                    <Title order={5} mb="xs">Preview:</Title>
                     <Group justify="center">{previews}</Group>
                    <Button onClick={handleAnalyze} mt="md" disabled={isLoading} loading={isLoading} fullWidth>
                        Analyze {type === 'disease' ? 'Disease' : 'Weed'}
                    </Button>
                </Paper>
            )}

            {isLoading && (
                <Group justify="center">
                    <Loader />
                    <Text>Analyzing image...</Text>
                </Group>
            )}

            {analysisResult && (
                <Paper withBorder p="md" radius="md" bg="gray.0">
                    <Title order={5} mb="xs">Analysis Result:</Title>
                    <Text style={{ whiteSpace: 'pre-wrap' }}>{analysisResult}</Text>
                </Paper>
            )}
        </Stack>
    );
};

// --- Treatment Chat Component ---
interface ChatMessage {
    id: number;
    sender: 'user' | 'ai';
    text: string;
}

const TreatmentChat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 1, sender: 'ai', text: 'Hello! How can I help you with crop treatments today? Describe the issue or ask about a specific treatment.' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const viewport = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newUserMessage: ChatMessage = {
            id: messages.length + 1,
            sender: 'user',
            text: inputValue.trim(),
        };
        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsAiTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse: ChatMessage = {
                id: messages.length + 2,
                sender: 'ai',
                text: generateAiResponse(newUserMessage.text), // Simple response logic
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsAiTyping(false);
        }, 1500 + Math.random() * 1000);
    };

    // Basic AI response simulation
    const generateAiResponse = (userText: string): string => {
        const lowerText = userText.toLowerCase();
        if (lowerText.includes('septoria')) {
            return "For Septoria Leaf Spot, consider fungicides containing chlorothalonil or mancozeb. Ensure proper coverage and follow label instructions. Rotate crops and remove infected debris.";
        } else if (lowerText.includes('aphids')) {
            return "Aphids can be controlled with insecticidal soaps, neem oil, or specific insecticides like pyrethroids. Encourage natural predators like ladybugs. Check the underside of leaves.";
        } else if (lowerText.includes('weed control') || lowerText.includes('crabgrass')) {
             return "For Crabgrass control, pre-emergent herbicides applied in spring are effective. Post-emergent options exist but timing is crucial. Maintain a dense, healthy lawn or crop stand to compete.";
        } else if (lowerText.includes('fertilizer')){
             return "Soil testing is recommended before applying fertilizer. Based on the results, a balanced NPK fertilizer can be applied. For specific crop needs, consult nutrient management guidelines.";
        }
        return "I understand you're asking about that. Could you please provide more details about the specific crop and observed symptoms? Knowing the growth stage and environmental conditions would also be helpful.";
    };

    return (
        <Paper withBorder radius="md" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            <ScrollArea style={{ flexGrow: 1 }} p="md" viewportRef={viewport}>
                <Stack gap="lg">
                    {messages.map((message) => (
                        <Group key={message.id} wrap="nowrap" gap="sm" style={{ alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                            {message.sender === 'ai' && <Avatar color="green" radius="xl"><IconMessageChatbot size="1.2rem" /></Avatar>}
                            <Paper withBorder={message.sender === 'user'} p="sm" radius="lg" bg={message.sender === 'user' ? 'blue.1' : 'gray.1'}>
                                <Text size="sm">{message.text}</Text>
                            </Paper>
                            {message.sender === 'user' && <Avatar color="blue" radius="xl">You</Avatar>}
                        </Group>
                    ))}
                     {isAiTyping && (
                         <Group wrap="nowrap" gap="sm" style={{ alignSelf: 'flex-start' }}>
                             <Avatar color="green" radius="xl"><IconMessageChatbot size="1.2rem" /></Avatar>
                             <Paper p="sm" radius="lg" bg={'gray.1'}>
                                <Loader size="xs" type="dots" />
                             </Paper>
                         </Group>
                     )}
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
  // Check if running in browser for Leaflet
  const isBrowser = typeof window !== 'undefined';

  return (
    <Container fluid>
      <Title order={2} mb="lg">
        <IconPlant2 size={28} style={{ marginRight: '8px', verticalAlign: 'bottom' }} />
        Crop Health Monitoring
      </Title>
      <Text c="dimmed" mb="xl">
        Utilize map overlays, image analysis, and AI chat to monitor and manage crop health.
      </Text>

        <Tabs defaultValue="map">
            <Tabs.List grow>
                <Tabs.Tab value="map" leftSection={<IconMapPin size={16} />}>
                    Map View
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

            <Tabs.Panel value="map" pt="lg">
                 <Paper withBorder p="xl" radius="md" shadow="sm" className={styles.mapPaper}>
                    {isBrowser ? (
                    <MapContainer
                        center={[40.75, -73.95]} // Initial center (will be adjusted by FitBounds)
                        zoom={12}              // Initial zoom
                        className={styles.mapContainer} // Apply CSS module style
                    >
                        <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {farmFieldsData.type === 'FeatureCollection' && (
                        <GeoJSON
                            data={farmFieldsData}
                            style={styleFeature}
                            onEachFeature={onEachFeature}
                        />
                        )}
                        <FitBounds geoJsonData={farmFieldsData} />
                    </MapContainer>
                    ) : (
                    <Alert variant="light" color="blue" title="Map Loading..." icon={<IconInfoCircle />}>
                        The interactive map will load shortly.
                    </Alert>
                    )}
                </Paper>
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
