'use client';
import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic
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
import styles from './CropHealthPage.module.css';
import { GeoJsonObject } from 'geojson';
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from '@mantine/dropzone';

// Dynamically import the map component with SSR disabled
const CropHealthMap = dynamic(() => import('@/components/CropHealth/CropHealthMap'), {
    ssr: false,
    loading: () => <Group justify="center" align="center" style={{ height: '400px' }}><Loader /> Loading Map...</Group> // Optional loading state
});

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
    const [activeTab, setActiveTab] = useState<string | null>('map');

    // Add state or logic to fetch/update farmFieldsData if it's dynamic
    const [currentGeoJsonData, setCurrentGeoJsonData] = useState<GeoJSON.FeatureCollection<GeoJSON.Polygon, FieldProperties> | null>(farmFieldsData);

    return (
        <Container fluid className={styles.pageContainer}>
            <Title order={2} mb="lg">Crop Health Monitoring</Title>

            <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md" mb="lg">
                <Tabs.List grow>
                    <Tabs.Tab value="map" leftSection={<IconMapPin style={{ width: rem(16), height: rem(16) }} />}>
                        Field Map Overview
                    </Tabs.Tab>
                    <Tabs.Tab value="disease" leftSection={<IconBug style={{ width: rem(16), height: rem(16) }} />}>
                        Disease Detection
                    </Tabs.Tab>
                    <Tabs.Tab value="weed" leftSection={<IconLeaf style={{ width: rem(16), height: rem(16) }} />}>
                        Weed Identification
                    </Tabs.Tab>
                     <Tabs.Tab value="chat" leftSection={<IconMessageChatbot style={{ width: rem(16), height: rem(16) }} />}>
                        Treatment Advisor
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="map" pt="xs">
                    <Paper withBorder radius="md" p="md" shadow="sm">
                        <Title order={4} mb="sm">Satellite Imagery Analysis (NDVI/EVI)</Title>
                        {/* Use the dynamically imported map component */}
                        <CropHealthMap geoJsonData={currentGeoJsonData} />
                        <Text size="sm" c="dimmed" mt="xs">
                            Green areas indicate healthier vegetation based on NDVI/EVI scores. Click on a field for details.
                        </Text>
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="disease" pt="xs">
                    <Paper withBorder radius="md" p="md" shadow="sm">
                         <ImageAnalysis type="disease" />
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="weed" pt="xs">
                     <Paper withBorder radius="md" p="md" shadow="sm">
                        <ImageAnalysis type="weed" />
                    </Paper>
                </Tabs.Panel>

                 <Tabs.Panel value="chat" pt="xs">
                    <Paper withBorder radius="md" p="0" shadow="sm" style={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
                        <TreatmentChat />
                    </Paper>
                </Tabs.Panel>
            </Tabs>

        </Container>
    );
}
