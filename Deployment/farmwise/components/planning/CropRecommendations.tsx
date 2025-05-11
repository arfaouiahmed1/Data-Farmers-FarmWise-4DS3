import React, { useState } from 'react';
import {
  Card,
  Text,
  Badge,
  Button,
  Group,
  Stack,
  Image,
  Box,
  SimpleGrid,
  Paper,
  Select,
  TextInput,
  Slider,
  Accordion,
  useMantineTheme,
  Divider
} from '@mantine/core';
import { IconPlant2, IconLeaf, IconSeeding, IconChartBar, IconSun, IconCloudRain } from '@tabler/icons-react';

// Define types for crop recommendations
interface CropRecommendation {
  id: number;
  name: string;
  field: string;
  confidence: number;
  reasons: string[];
  marketValue: string;
  waterRequirements: 'Low' | 'Medium' | 'High';
  growingSeason: string;
  soilCompatibility: number;
  image: string;
}

// Mock data for crop recommendations
const mockRecommendations: CropRecommendation[] = [
  { 
    id: 1, 
    name: 'Winter Wheat', 
    field: 'Field A', 
    confidence: 92, 
    reasons: [
      'Soil conditions optimal',
      'Previous crop compatibility',
      'Market forecast positive',
      'Good disease resistance for your region'
    ],
    marketValue: '$5.80/bushel',
    waterRequirements: 'Medium',
    growingSeason: 'Oct - Jul',
    soilCompatibility: 95,
    image: '/images/crops/wheat.jpg'
  },
  { 
    id: 2, 
    name: 'Soybeans', 
    field: 'Field B', 
    confidence: 87, 
    reasons: [
      'Nitrogen fixation benefit',
      'Rotation sequence optimal',
      'Disease pressure low',
      'Good market outlook'
    ],
    marketValue: '$13.20/bushel',
    waterRequirements: 'Medium',
    growingSeason: 'May - Oct',
    soilCompatibility: 88,
    image: '/images/crops/soybeans.jpg'
  },
  { 
    id: 3, 
    name: 'Cover Crop - Clover', 
    field: 'Field C', 
    confidence: 94, 
    reasons: [
      'Soil health improvement',
      'Erosion control needed',
      'Nitrogen fixation',
      'Weed suppression'
    ],
    marketValue: 'N/A (Soil Health)',
    waterRequirements: 'Low',
    growingSeason: 'Sep - Apr',
    soilCompatibility: 96,
    image: '/images/crops/clover.jpg'
  },
  { 
    id: 4, 
    name: 'Corn', 
    field: 'Field D', 
    confidence: 83, 
    reasons: [
      'Suitable for your soil type',
      'Good in rotation after soybeans',
      'Strong market demand',
      'Historically good yield in this field'
    ],
    marketValue: '$4.90/bushel',
    waterRequirements: 'High',
    growingSeason: 'Apr - Sep',
    soilCompatibility: 85,
    image: '/images/crops/corn.jpg'
  },
  { 
    id: 5, 
    name: 'Sunflowers', 
    field: 'Field E', 
    confidence: 79, 
    reasons: [
      'Drought tolerance',
      'Deep root system good for soil',
      'Diversification opportunity',
      'Growing market demand'
    ],
    marketValue: '$20.50/cwt',
    waterRequirements: 'Low',
    growingSeason: 'May - Sep',
    soilCompatibility: 80,
    image: '/images/crops/sunflowers.jpg'
  },
];

export function CropRecommendations() {
  const theme = useMantineTheme();
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [minConfidence, setMinConfidence] = useState(70);
  
  // Filter recommendations based on selected field and minimum confidence
  const filteredRecommendations = mockRecommendations.filter(crop => {
    const fieldMatch = selectedField ? crop.field === selectedField : true;
    return fieldMatch && crop.confidence >= minConfidence;
  });

  // Get unique fields for the filter dropdown
  const fields = Array.from(new Set(mockRecommendations.map(crop => crop.field)));
  
  return (
    <>
      <Paper withBorder p="md" radius="md" mb="xl">
        <Text fw={500} size="lg" mb="md">AI-Powered Crop Recommendations</Text>
        <Text c="dimmed" size="sm" mb="xl">
          Based on your soil conditions, historical data, weather forecasts, and market trends, our AI recommends the following crops for your fields.
        </Text>
        
        {/* Filters */}
        <Group mb="xl">
          <Select
            label="Filter by Field"
            placeholder="All Fields"
            data={fields}
            value={selectedField}
            onChange={setSelectedField}
            clearable
            style={{ width: 200 }}
          />
          <Box style={{ width: 250 }}>
            <Text size="sm" mb={8}>Minimum Confidence</Text>
            <Slider
              value={minConfidence}
              onChange={setMinConfidence}
              min={50}
              max={100}
              step={5}
              label={(value) => `${value}%`}
              marks={[
                { value: 50, label: '50%' },
                { value: 75, label: '75%' },
                { value: 100, label: '100%' },
              ]}
            />
          </Box>
        </Group>
        
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((crop) => (
              <Card key={crop.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section>
                  <Image
                    src={crop.image}
                    height={160}
                    fallbackSrc="https://placehold.co/400x200/e9ecef/495057?text=Crop+Image"
                    alt={crop.name}
                  />
                </Card.Section>
                <Group justify="space-between" mt="md" mb="xs">
                  <Text fw={500}>{crop.name}</Text>
                  <Badge 
                    color={crop.confidence > 90 ? 'green' : crop.confidence > 80 ? 'blue' : 'yellow'} 
                    variant="light"
                  >
                    {crop.confidence}% Match
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed" mb="md">For {crop.field}</Text>
                
                <Accordion variant="separated" mb="md">
                  <Accordion.Item value="details">
                    <Accordion.Control>Crop Details</Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="sm">Market Value:</Text>
                          <Text size="sm" fw={500}>{crop.marketValue}</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm">Water Needs:</Text>
                          <Badge 
                            size="sm" 
                            color={crop.waterRequirements === 'Low' ? 'green' : 
                                  crop.waterRequirements === 'Medium' ? 'blue' : 'red'}
                          >
                            {crop.waterRequirements}
                          </Badge>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm">Growing Season:</Text>
                          <Text size="sm">{crop.growingSeason}</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm">Soil Compatibility:</Text>
                          <Text 
                            size="sm" 
                            c={crop.soilCompatibility > 90 ? 'green' : 
                               crop.soilCompatibility > 80 ? 'blue' : 'orange'}
                            fw={500}
                          >
                            {crop.soilCompatibility}%
                          </Text>
                        </Group>
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
                
                <Divider my="sm" />
                
                <Text size="sm" fw={500} mb="xs">Why this crop?</Text>
                <Stack gap="xs" mb="md">
                  {crop.reasons.map((reason, idx) => (
                    <Group key={idx} gap="xs" align="flex-start" wrap="nowrap">
                      <IconLeaf size={14} style={{ minWidth: 14, marginTop: 4 }} color={theme.colors.green[6]} />
                      <Text size="sm">{reason}</Text>
                    </Group>
                  ))}
                </Stack>
                <Group gap="sm">
                  <Button variant="light" color="green" fullWidth>
                    Add to Rotation
                  </Button>
                  <Button variant="outline" color="blue" fullWidth>
                    View Details
                  </Button>
                </Group>
              </Card>
            ))
          ) : (
            <Text c="dimmed" ta="center" style={{ gridColumn: '1 / -1' }}>
              No crops match your current filter criteria. Try adjusting the filters.
            </Text>
          )}
        </SimpleGrid>
      </Paper>
    </>
  );
}
