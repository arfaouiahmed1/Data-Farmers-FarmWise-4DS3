'use client';

import React, { useMemo, useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Paper, 
  Button, 
  Group, 
  Select, 
  SimpleGrid, 
  Stack, 
  Badge, 
  Alert, 
  Divider, 
  Box, 
  Tabs,
  Card,
  ThemeIcon,
  Timeline,
  Grid,
  RingProgress,
  useMantineTheme,
  Image,
  Tooltip
} from '@mantine/core';
import { 
  IconInfoCircle, 
  IconPlant2, 
  IconArrowRight, 
  IconAlertTriangle, 
  IconPencil, 
  IconTrash, 
  IconEye,
  IconRotate,
  IconChartBar,
  IconLeaf,
  IconSun,
  IconCloudRain,
  IconTemperature
} from '@tabler/icons-react';
import { RotationEntryForm } from '@/components/planning/RotationEntryForm';
import { CropRecommendations } from '@/components/planning/CropRecommendations';
import type { RotationEntry } from '@/types/planning';

const initialRotationData: RotationEntry[] = [
  { id: 1, field: 'Field A', year: 2024, season: 'Spring', crop: 'Tomatoes', status: 'Harvested', family: 'Nightshade' },
  { id: 2, field: 'Field A', year: 2024, season: 'Summer', crop: 'Corn', status: 'Growing', family: 'Grass' },
  { id: 3, field: 'Field A', year: 2024, season: 'Fall', crop: 'Cover Crop (Rye)', status: 'Planned', family: 'Grass' },
  { id: 4, field: 'Field B', year: 2024, season: 'Spring', crop: 'Lettuce', status: 'Harvested', family: 'Aster' },
  { id: 5, field: 'Field B', year: 2024, season: 'Summer', crop: 'Soybeans', status: 'Growing', family: 'Legume' },
  { id: 6, field: 'Field B', year: 2024, season: 'Fall', crop: 'Fallow', status: 'Planned', family: 'None' },
  { id: 7, field: 'Field C', year: 2024, season: 'Spring/Summer', crop: 'Wheat', status: 'Harvested', family: 'Grass' },
  { id: 8, field: 'Field C', year: 2024, season: 'Fall', crop: 'Cover Crop (Clover)', status: 'Planned', family: 'Legume' },
  { id: 9, field: 'Field A', year: 2025, season: 'Spring', crop: 'Peppers', status: 'Planned', family: 'Nightshade' },
  { id: 10, field: 'Field D', year: 2024, season: 'Spring', crop: 'Carrots', status: 'Harvested', family: 'Apiaceae' },
  { id: 11, field: 'Field D', year: 2024, season: 'Summer', crop: 'Beans', status: 'Growing', family: 'Legume' },
  { id: 12, field: 'Field D', year: 2024, season: 'Fall', crop: 'Cover Crop (Vetch)', status: 'Planned', family: 'Legume' },
];

// Mock soil health data
const soilHealthData = {
  'Field A': { 
    organic: 3.8, // percentage
    nitrogen: 'Medium',
    phosphorus: 'High',
    potassium: 'Medium',
    ph: 6.4,
    texture: 'Loam',
    healthScore: 82
  },
  'Field B': { 
    organic: 4.2,
    nitrogen: 'High',
    phosphorus: 'Medium',
    potassium: 'High',
    ph: 6.8,
    texture: 'Clay Loam',
    healthScore: 88
  },
  'Field C': { 
    organic: 2.9,
    nitrogen: 'Low',
    phosphorus: 'Medium',
    potassium: 'Low',
    ph: 5.9,
    texture: 'Sandy Loam',
    healthScore: 71
  },
  'Field D': { 
    organic: 3.5,
    nitrogen: 'Medium',
    phosphorus: 'Medium',
    potassium: 'Medium',
    ph: 6.2,
    texture: 'Silt Loam',
    healthScore: 78
  }
};

const groupRotationByField = (data: RotationEntry[]) => {
  return data.reduce((acc: { [field: string]: RotationEntry[] }, item: RotationEntry) => {
    if (!acc[item.field]) {
      acc[item.field] = [];
    }
    acc[item.field].push(item);
    acc[item.field].sort((a: RotationEntry, b: RotationEntry) => {
      if (a.year !== b.year) return a.year - b.year;
      const seasonOrder: { [key: string]: number } = { 'Spring': 1, 'Spring/Summer': 2, 'Summer': 3, 'Fall': 4, 'Winter': 5, 'Full Year': 6 };
      return (seasonOrder[a.season] || 99) - (seasonOrder[b.season] || 99);
    });
    return acc;
  }, {});
};

const checkRotationIssues = (allRotationsByField: { [field: string]: RotationEntry[] }) => {
  const issues: { [field: string]: string[] } = {};
  for (const field in allRotationsByField) {
    const fieldRotations = allRotationsByField[field];
    issues[field] = [];
    for (let i = 1; i < fieldRotations.length; i++) {
      const prev = fieldRotations[i - 1];
      const current = fieldRotations[i];
      if (prev.family && prev.family !== 'None' && prev.family === current.family && prev.family !== 'Cover Crop') {
        issues[field].push(`Potential issue in ${field}: Planting ${current.crop} (${current.family}) after ${prev.crop} (${prev.family}) - ${prev.year}/${prev.season} -> ${current.year}/${current.season}.`);
      }
      if (current.year === prev.year + 1 && prev.family && prev.family !== 'None' && prev.family === current.family && prev.family !== 'Cover Crop') {
        issues[field].push(`Potential issue in ${field} (Year Change): Planting ${current.crop} (${current.family}, ${current.year}) after ${prev.crop} (${prev.family}, ${prev.year}).`);
      }
    }
  }
  return issues;
};

export default function RotationSchedulePage() {
  const theme = useMantineTheme();
  const [rotationEntries, setRotationEntries] = useState<RotationEntry[]>(initialRotationData);
  const [selectedYear, setSelectedYear] = useState<string | null>(new Date().getFullYear().toString());
  const [formModalOpened, setFormModalOpened] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<RotationEntry | null>(null);
  const [currentEntry, setCurrentEntry] = useState<Partial<RotationEntry> | null>(null);
  const [modalTitle, setModalTitle] = useState('Add Rotation Entry');
  const [activeTab, setActiveTab] = useState<string>('rotation');
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const groupedData = useMemo(() => groupRotationByField(rotationEntries), [rotationEntries]);
  const rotationIssues = useMemo(() => checkRotationIssues(groupedData), [groupedData]);

  const availableYears = useMemo(() => {
    const years = new Set(rotationEntries.map(e => e.year.toString()));
    return Array.from(years).sort().reverse();
  }, [rotationEntries]);

  const availableFields = useMemo(() => {
    return Object.keys(groupedData).sort();
  }, [groupedData]);

  const filteredFields = useMemo(() => {
    if (selectedField) {
      return [selectedField];
    }
    
    return Object.keys(groupedData).filter(field =>
      !selectedYear || groupedData[field].some((entry: RotationEntry) => entry.year.toString() === selectedYear)
    );
  }, [groupedData, selectedYear, selectedField]);

  const handleAddEntryClick = () => {
    setCurrentEntry(null);
    setModalTitle('Add Rotation Entry');
    setFormModalOpened(true);
  };

  const handleEditEntryClick = (entry: RotationEntry) => {
    setCurrentEntry(entry);
    setModalTitle('Edit Rotation Entry');
    setFormModalOpened(true);
  };

  const handleDeleteEntry = (entryId: number | string) => {
    if (window.confirm('Are you sure you want to delete this rotation entry?')) {
      setRotationEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
      console.log(`Deleted rotation entry with ID: ${entryId}`);
    }
  };

  const handleSaveEntry = (entryData: RotationEntry) => {
    setRotationEntries(prevEntries => {
      if (currentEntry && currentEntry.id) {
        console.log('Updating rotation entry:', entryData);
        return prevEntries.map(entry => (entry.id === entryData.id ? entryData : entry));
      } else {
        console.log('Adding new rotation entry:', entryData);
        return [...prevEntries, entryData];
      }
    });
    setFormModalOpened(false);
    setCurrentEntry(null);
  };

  // Get color based on crop family
  const getFamilyColor = (family: string) => {
    switch(family) {
      case 'Nightshade': return 'violet';
      case 'Grass': return 'green';
      case 'Legume': return 'blue';
      case 'Aster': return 'yellow';
      case 'Apiaceae': return 'orange';
      case 'Brassica': return 'cyan';
      case 'Cover Crop': return 'teal';
      case 'None': return 'gray';
      default: return 'gray';
    }
  };

  // Get color based on status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Planned': return 'blue';
      case 'Growing': return 'green';
      case 'Harvested': return 'grape';
      case 'Fallow': return 'gray';
      default: return 'gray';
    }
  };

  // Get soil health color
  const getHealthColor = (score: number) => {
    if (score >= 85) return theme.colors.green[6];
    if (score >= 75) return theme.colors.blue[6];
    if (score >= 60) return theme.colors.yellow[6];
    return theme.colors.red[6];
  };

  return (
    <Container size="xl">
      <Group justify="space-between" align="flex-start" mb="lg">
        <Title order={2}>
          <Group gap="xs">
            <IconRotate size={28} stroke={1.5} />
            <Text>Crop Rotation Planner</Text>
          </Group>
        </Title>
        <Group>
          <Select
            label="Filter by Year"
            placeholder="All Years"
            data={availableYears}
            value={selectedYear}
            onChange={(value) => {
              setSelectedYear(value);
              // Reset field filter when changing year
              if (value !== selectedYear) {
                setSelectedField(null);
              }
            }}
            clearable
            style={{ width: 140 }}
          />
          <Select
            label="Filter by Field"
            placeholder="All Fields"
            data={availableFields}
            value={selectedField}
            onChange={setSelectedField}
            clearable
            style={{ width: 140 }}
          />
          <Button onClick={handleAddEntryClick} mt={24}>Add Rotation Entry</Button>
        </Group>
      </Group>

      <Tabs value={activeTab} onChange={(value) => value && setActiveTab(value)} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="rotation" leftSection={<IconRotate size="0.8rem" />}>
            Rotation Plan
          </Tabs.Tab>
          <Tabs.Tab value="recommendations" leftSection={<IconLeaf size="0.8rem" />}>
            Crop Recommendations
          </Tabs.Tab>
          <Tabs.Tab value="soil" leftSection={<IconChartBar size="0.8rem" />}>
            Soil Health
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="rotation">
          <Alert icon={<IconInfoCircle size="1rem" />} title="Rotation Planning" color="blue" variant="light" mb="lg">
            Effective crop rotation helps manage soil fertility, control pests and diseases, and improve long-term soil health.
            Click on a crop in the timeline to see details or to edit/delete.
          </Alert>

          <Paper shadow="xs" p="md">
            <Stack gap="xl">
              {filteredFields.length > 0 ? filteredFields.map((field) => {
                const fieldRotations = selectedYear
                  ? groupedData[field].filter((entry: RotationEntry) => entry.year.toString() === selectedYear)
                  : groupedData[field];

                if (fieldRotations.length === 0) return null;

                const fieldIssues: string[] = rotationIssues[field] || [];
                const soilData = soilHealthData[field as keyof typeof soilHealthData];

                return (
                  <Box key={field}>
                    <Group justify="space-between" mb="sm">
                      <Title order={4}>{field}</Title>
                      {soilData && (
                        <Group gap="xs">
                          <RingProgress
                            size={36}
                            thickness={3}
                            roundCaps
                            sections={[{ value: soilData.healthScore, color: getHealthColor(soilData.healthScore) }]}
                            label={
                              <Text size="xs" ta="center" fw={700}>
                                {soilData.healthScore}%
                              </Text>
                            }
                          />
                          <div>
                            <Text size="sm" fw={500}>Soil Health</Text>
                            <Text size="xs" c="dimmed">{soilData.texture}, pH {soilData.ph}</Text>
                          </div>
                        </Group>
                      )}
                    </Group>
                    
                    <Paper withBorder p="md" radius="sm">
                      <Text size="sm" c="dimmed" mb="md">Rotation Timeline {selectedYear ? `(${selectedYear})` : '(All Years)'}</Text>
                      
                      <Timeline active={fieldRotations.length - 1} bulletSize={24} lineWidth={2}>
                        {fieldRotations.map((entry: RotationEntry, index: number) => (
                          <Timeline.Item 
                            key={entry.id}
                            bullet={<IconPlant2 size={12} />}
                            title={
                              <Group gap="xs">
                                <Text fw={500}>{entry.crop}</Text>
                                <Badge color={getFamilyColor(entry.family)} size="sm" variant="light">
                                  {entry.family}
                                </Badge>
                                <Badge color={getStatusColor(entry.status)} size="sm">
                                  {entry.status}
                                </Badge>
                              </Group>
                            }
                          >
                            <Text size="sm" c="dimmed">{entry.season} {entry.year}</Text>
                            <Group mt="xs">
                              <Button 
                                variant="light" 
                                size="xs" 
                                leftSection={<IconPencil size={14} />}
                                onClick={() => handleEditEntryClick(entry)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="light" 
                                color="red" 
                                size="xs" 
                                leftSection={<IconTrash size={14} />}
                                onClick={() => handleDeleteEntry(entry.id)}
                              >
                                Delete
                              </Button>
                            </Group>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                      
                      {fieldIssues.length > 0 && (
                        <>
                          <Divider my="md" />
                          <Alert variant="outline" color="orange" title="Potential Rotation Considerations" icon={<IconAlertTriangle />} radius="xs">
                            <Stack gap="xs">
                              {fieldIssues.map((issue: string, idx: number) => <Text key={idx} size="xs">- {issue}</Text>)}
                            </Stack>
                          </Alert>
                        </>
                      )}
                    </Paper>
                  </Box>
                );
              }) : (
                <Text c="dimmed" ta="center">No rotation data found{selectedYear ? ` for ${selectedYear}`: ''}. Add entries to get started.</Text>
              )}
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="recommendations">
          <CropRecommendations />
        </Tabs.Panel>

        <Tabs.Panel value="soil">
          <Paper withBorder p="md" radius="md" mb="xl">
            <Text fw={500} size="lg" mb="md">Soil Health Analysis</Text>
            <Text c="dimmed" size="sm" mb="xl">
              Soil health is critical for successful crop rotation. Monitor key indicators to make informed decisions.
            </Text>
            
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              {Object.entries(soilHealthData).map(([field, data]) => (
                <Card key={field} shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="lg">{field}</Text>
                    <RingProgress
                      size={80}
                      thickness={8}
                      roundCaps
                      sections={[{ value: data.healthScore, color: getHealthColor(data.healthScore) }]}
                      label={
                        <Text size="xs" ta="center" fw={700}>
                          {data.healthScore}%
                        </Text>
                      }
                    />
                  </Group>
                  
                  <Divider my="sm" />
                  
                  <Grid>
                    <Grid.Col span={6}>
                      <Group gap="xs" mb="xs">
                        <ThemeIcon color="brown" size="sm" variant="light">
                          <IconSun size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={500}>Organic Matter</Text>
                      </Group>
                      <Text size="sm">{data.organic}%</Text>
                    </Grid.Col>
                    
                    <Grid.Col span={6}>
                      <Group gap="xs" mb="xs">
                        <ThemeIcon color="blue" size="sm" variant="light">
                          <IconTemperature size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={500}>pH Level</Text>
                      </Group>
                      <Text size="sm">{data.ph}</Text>
                    </Grid.Col>
                    
                    <Grid.Col span={6}>
                      <Group gap="xs" mb="xs">
                        <ThemeIcon color="green" size="sm" variant="light">
                          <IconPlant2 size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={500}>Nitrogen</Text>
                      </Group>
                      <Badge color={data.nitrogen === 'High' ? 'green' : data.nitrogen === 'Medium' ? 'blue' : 'yellow'}>
                        {data.nitrogen}
                      </Badge>
                    </Grid.Col>
                    
                    <Grid.Col span={6}>
                      <Group gap="xs" mb="xs">
                        <ThemeIcon color="orange" size="sm" variant="light">
                          <IconLeaf size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={500}>Phosphorus</Text>
                      </Group>
                      <Badge color={data.phosphorus === 'High' ? 'green' : data.phosphorus === 'Medium' ? 'blue' : 'yellow'}>
                        {data.phosphorus}
                      </Badge>
                    </Grid.Col>
                    
                    <Grid.Col span={6}>
                      <Group gap="xs" mb="xs">
                        <ThemeIcon color="violet" size="sm" variant="light">
                          <IconCloudRain size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={500}>Potassium</Text>
                      </Group>
                      <Badge color={data.potassium === 'High' ? 'green' : data.potassium === 'Medium' ? 'blue' : 'yellow'}>
                        {data.potassium}
                      </Badge>
                    </Grid.Col>
                    
                    <Grid.Col span={6}>
                      <Group gap="xs" mb="xs">
                        <ThemeIcon color="gray" size="sm" variant="light">
                          <IconInfoCircle size={14} />
                        </ThemeIcon>
                        <Text size="sm" fw={500}>Texture</Text>
                      </Group>
                      <Text size="sm">{data.texture}</Text>
                    </Grid.Col>
                  </Grid>
                  
                  <Button variant="light" color="blue" fullWidth mt="md">
                    View Detailed Analysis
                  </Button>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      <RotationEntryForm
        opened={formModalOpened}
        onClose={() => setFormModalOpened(false)}
        onSubmit={handleSaveEntry}
        initialValues={currentEntry}
        title={modalTitle}
      />
    </Container>
  );
} 