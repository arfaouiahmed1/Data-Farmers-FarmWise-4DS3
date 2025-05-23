'use client';

import { useState, useRef } from 'react';
import { 
  Title, 
  Grid, 
  Card, 
  Text, 
  Group, 
  RingProgress, 
  ThemeIcon, 
  Badge, 
  Stack,
  SimpleGrid,
  Button,
  ActionIcon,
  List,
  Tabs,
  Paper,
  rem,
  useMantineTheme,
  Space,
  FileButton,
  Image,
  Box,
  Loader,
  Accordion,
  Divider,
  Center,
  Alert,
  Container,
  Table
} from '@mantine/core';
import { 
  IconDroplet, 
  IconPlant2, 
  IconCoin, 
  IconCalendar, 
  IconArrowsShuffle,
  IconTrendingUp,
  IconAlertCircle,
  IconTemperature,
  IconSun,
  IconCloud,
  IconPlus,
  IconCheck,
  IconPlant,
  IconSettings,
  IconCircleX,
  IconUpload,
  IconPhotoScan,
  IconBug,
  IconBrandHipchat,
  IconInfoCircle,
  IconTractor,
  IconBuildingWarehouse,
  IconListDetails,
  IconMapPin,
  IconZoomCheck
} from '@tabler/icons-react';
import { BarChart, LineChart, DonutChart } from '@mantine/charts';
import { notifications } from '@mantine/notifications';
import classes from './DashboardPage.module.css';
import Link from 'next/link';

const moistureData = [
  { date: 'Apr 18', moisture: 78 },
  { date: 'Apr 19', moisture: 72 },
  { date: 'Apr 20', moisture: 65 },
  { date: 'Apr 21', moisture: 58 },
  { date: 'Apr 22', moisture: 52 },
  { date: 'Apr 23', moisture: 45 },
  { date: 'Apr 24', moisture: 40 },
];

const yieldData = [
  { month: 'Jan', tomatoes: 40, corn: 23, wheat: 15 },
  { month: 'Feb', tomatoes: 32, corn: 30, wheat: 18 },
  { month: 'Mar', tomatoes: 47, corn: 42, wheat: 24 },
  { month: 'Apr', tomatoes: 65, corn: 52, wheat: 35 },
];

const costBreakdown = [
  { name: 'Seeds', value: 25, color: 'indigo.6' },
  { name: 'Fertilizer', value: 30, color: 'blue.6' },
  { name: 'Water', value: 15, color: 'cyan.6' },
  { name: 'Labor', value: 20, color: 'teal.6' },
  { name: 'Equipment', value: 10, color: 'green.6' },
];

const cropRotationSchedule = [
  { season: 'Spring 2025', crop: 'Tomatoes', field: 'Field A', status: 'Current' },
  { season: 'Summer 2025', crop: 'Corn', field: 'Field A', status: 'Planned' },
  { season: 'Fall 2025', crop: 'Cover Crop', field: 'Field A', status: 'Planned' },
  { season: 'Spring 2026', crop: 'Legumes', field: 'Field A', status: 'Planned' },
];

const plantingCalendar = [
  { crop: 'Tomatoes', bestStart: 'April 1', bestEnd: 'May 15', readyToPlant: true },
  { crop: 'Corn', bestStart: 'May 1', bestEnd: 'June 15', readyToPlant: true },
  { crop: 'Wheat', bestStart: 'Sept 15', bestEnd: 'Oct 30', readyToPlant: false },
  { crop: 'Carrots', bestStart: 'March 15', bestEnd: 'April 30', readyToPlant: false },
];

const plantHealthIssues = [
  { id: 'iss-1', type: 'Disease', name: 'Powdery Mildew', severity: 'Medium', location: 'Field A, North', date: '2024-05-22' },
  { id: 'iss-2', type: 'Pest', name: 'Aphids', severity: 'Low', location: 'Field B, All', date: '2024-05-21' },
  { id: 'iss-3', type: 'Weed', name: 'Chickweed', severity: 'High', location: 'Field C, West', date: '2024-05-23' },
];

const scanHistory = [
  { id: 'scan-1', type: 'Disease', date: '2024-05-23', field: 'Field C', resultSummary: 'Late Blight (Suspected)', severity: 'High' },
  { id: 'scan-2', type: 'Weed', date: '2024-05-22', field: 'Field A', resultSummary: 'Chickweed Identified', severity: 'Medium' },
  { id: 'scan-3', type: 'Disease', date: '2024-05-20', field: 'Field B', resultSummary: 'No Issues Detected', severity: 'Low' },
  { id: 'scan-4', type: 'Pest', date: '2024-05-19', field: 'Field B', resultSummary: 'Aphids (Low Density)', severity: 'Low' },
  { id: 'scan-5', type: 'Disease', date: '2024-05-18', field: 'Field A', resultSummary: 'Powdery Mildew', severity: 'Medium' },
];

const combinedHistory = [...plantHealthIssues, ...scanHistory]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const totalScans = scanHistory.length;
const issuesLast30Days = combinedHistory.filter(item => item.severity && item.severity !== 'Low').length;

const issueTypeCounts = combinedHistory.reduce((acc, item) => {
  if (item.type) {
    acc[item.type] = (acc[item.type] || 0) + 1;
  }
  return acc;
}, {} as Record<string, number>);

const issueBreakdownData = Object.entries(issueTypeCounts).map(([name, value], index) => ({
  name,
  value,
  color: ['red.6', 'orange.6', 'yellow.6', 'lime.6', 'cyan.6'][index % 5]
}));

export default function DashboardPage() {
  const theme = useMantineTheme();
  const [selectedTab, setSelectedTab] = useState('stats');
  const [healthSubTab, setHealthSubTab] = useState('issues');
  
  const [diseaseImage, setDiseaseImage] = useState<File | null>(null);
  const [weedImage, setWeedImage] = useState<File | null>(null);
  const [diseaseImageUrl, setDiseaseImageUrl] = useState<string | null>(null);
  const [weedImageUrl, setWeedImageUrl] = useState<string | null>(null);
  const [isAnalyzingDisease, setIsAnalyzingDisease] = useState(false);
  const [isAnalyzingWeed, setIsAnalyzingWeed] = useState(false);
  const [diseaseResult, setDiseaseResult] = useState<string | null>(null);
  const [weedResult, setWeedResult] = useState<string | null>(null);
  const [treatmentResult, setTreatmentResult] = useState<string | null>(null);
  const [isLoadingTreatment, setIsLoadingTreatment] = useState(false);
  
  const resetFileRef = useRef<() => void>(null);
  const resetWeedFileRef = useRef<() => void>(null);

  const currentMoisture = moistureData[moistureData.length - 1].moisture;
  const daysUntilIrrigation = Math.max(1, Math.ceil((currentMoisture - 30) / 5));
  const moistureStatus = currentMoisture > 60 ? 'Optimal' : currentMoisture > 40 ? 'Adequate' : 'Low';

  const diagnosedPlantsCount = combinedHistory.filter(item => item.severity && item.severity !== 'Low').length;

  const totalCrops = 5;
  const fieldsMonitored = 3;
  const upcomingTasks = 2;
  const equipmentIssues = 1;
  const lowInventory = 3;
  const recentLogs = 5;

  const handleDiseaseImageUpload = (file: File | null) => {
    if (file) {
      setDiseaseImage(file);
      const imageUrl = URL.createObjectURL(file);
      setDiseaseImageUrl(imageUrl);
      setDiseaseResult(null);
      setTreatmentResult(null);
    }
  };

  const handleWeedImageUpload = (file: File | null) => {
    if (file) {
      setWeedImage(file);
      const imageUrl = URL.createObjectURL(file);
      setWeedImageUrl(imageUrl);
      setWeedResult(null);
      setTreatmentResult(null);
    }
  };

  const analyzeDiseaseImage = async () => {
    if (!diseaseImage) return;
    
    setIsAnalyzingDisease(true);
    setDiseaseResult(null);
    setTreatmentResult(null);
    
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    try {
      const mockResult = 'Late blight detected (Phytophthora infestans) - Confidence: 92%';
      setDiseaseResult(mockResult);
      
      notifications.show({
        title: 'Analysis Complete',
        message: 'Disease detection analysis completed successfully',
        color: 'green',
        icon: <IconCheck />,
      });
    } catch (error) {
      console.error('Error analyzing disease:', error);
      notifications.show({
        title: 'Analysis Failed',
        message: 'There was an error analyzing the image',
        color: 'red',
        icon: <IconCircleX />,
      });
    } finally {
      setIsAnalyzingDisease(false);
    }
  };

  const analyzeWeedImage = async () => {
    if (!weedImage) return;
    
    setIsAnalyzingWeed(true);
    setWeedResult(null);
    setTreatmentResult(null);
    
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    try {
      const mockResult = 'Common chickweed (Stellaria media) - Coverage: ~15% of field area';
      setWeedResult(mockResult);
      
      notifications.show({
        title: 'Analysis Complete',
        message: 'Weed detection analysis completed successfully',
        color: 'green',
        icon: <IconCheck />,
      });
    } catch (error) {
      console.error('Error analyzing weed:', error);
      notifications.show({
        title: 'Analysis Failed',
        message: 'There was an error analyzing the image',
        color: 'red',
        icon: <IconCircleX />,
      });
    } finally {
      setIsAnalyzingWeed(false);
    }
  };

  const getTreatmentRecommendation = async () => {
    if (!diseaseResult && !weedResult) {
        notifications.show({
            title: 'No Analysis Data',
            message: 'Please analyze a disease or weed image first.',
            color: 'yellow',
            icon: <IconInfoCircle />,
        });
        return;
    }

    setIsLoadingTreatment(true);
    setTreatmentResult(null);

    await new Promise(resolve => setTimeout(resolve, 2000)); 

    try {
      let recommendation = "Treatment Recommendations:\n\n";
      if (diseaseResult?.includes('Late blight')) {
          recommendation += "For Late Blight (Phytophthora infestans):\n" +
                            "1. Apply copper-based fungicide immediately.\n" +
                            "2. Remove and destroy infected plant material.\n" +
                            "3. Improve air circulation (pruning).\n" +
                            "4. Use drip irrigation, avoid overhead watering.\n\n";
      }
      if (weedResult?.includes('Common chickweed')) {
          recommendation += "For Common Chickweed (Stellaria media):\n" +
                            "1. Hand pulling for small patches.\n" +
                            "2. Apply mulch to smother weeds.\n" +
                            "3. Consider post-emergent herbicides (e.g., 2,4-D) for large areas.\n" +
                            "4. Use cover crops in rotation.\n\n";
      }
      if (!diseaseResult && !weedResult) {
          recommendation = "No specific issues detected requiring treatment based on current analysis.";
      }

      setTreatmentResult(recommendation.trim());
      
      notifications.show({
        title: 'Treatment Recommendation Ready',
        message: 'Successfully generated treatment recommendations',
        color: 'green',
        icon: <IconCheck />,
      });
    } catch (error) {
      // Mock error handling
      console.error('Error getting treatment:', error);
      notifications.show({
        title: 'Request Failed',
        message: 'There was an error getting treatment recommendations',
        color: 'red',
        icon: <IconCircleX />,
      });
    } finally {
      setIsLoadingTreatment(false);
    }
  };

  const handleTabChange = (value: string | null) => {
    if (value !== null) {
      setSelectedTab(value);
    }
  };

  return (
    <Container fluid px="xs" py="xs">
      <Group justify="space-between" mb="md">
        <Title order={2} className={classes.pageTitle}>
          Farm Dashboard
        </Title>
        <Badge 
          size="md" 
          color={daysUntilIrrigation <= 2 ? "red" : "blue"} 
          variant="light"
          leftSection={
            <ThemeIcon color={daysUntilIrrigation <= 2 ? "red" : "blue"} variant="light" size="sm" radius="xl">
              <IconDroplet size={12} />
            </ThemeIcon>
          }
        >
          {daysUntilIrrigation} Day{daysUntilIrrigation !== 1 ? 's' : ''} Until Irrigation
        </Badge>
      </Group>

      {/* Top-Level Statistics Grid */}
      <SimpleGrid cols={{ base: 2, sm: 4, lg: 8 }} spacing="xs" mb="md">
         <StatCard title="Irrigation" value={`${daysUntilIrrigation}d`} icon={IconDroplet} color={daysUntilIrrigation <= 2 ? "red" : "blue"} />
         <StatCard title="Issues" value={diagnosedPlantsCount} icon={IconZoomCheck} color={diagnosedPlantsCount > 0 ? "orange" : "green"} />
         <StatCard title="Fields" value={fieldsMonitored} icon={IconMapPin} color="cyan" />
         <StatCard title="Tasks" value={upcomingTasks} icon={IconCalendar} color="grape" />
         <StatCard title="Crops" value={totalCrops} icon={IconPlant} color="green" />
         <StatCard title="Equipment" value={equipmentIssues} icon={IconTractor} color={equipmentIssues > 0 ? "yellow" : "gray"} />
         <StatCard title="Inventory" value={lowInventory} icon={IconBuildingWarehouse} color={lowInventory > 0 ? "pink" : "gray"} />
         <StatCard title="Logs" value={recentLogs} icon={IconListDetails} color="lime" />
      </SimpleGrid>

      <Tabs value={selectedTab} onChange={handleTabChange} mb="md" variant="outline" radius="sm">
        <Tabs.List>
          <Tabs.Tab value="stats" leftSection={<IconTrendingUp size={14} />}>
            Key Stats
          </Tabs.Tab>
          <Tabs.Tab value="health" leftSection={<IconPlant2 size={14} />}>
            Plant Health
          </Tabs.Tab>
          <Tabs.Tab value="planning" leftSection={<IconCalendar size={14} />}>
            Planning
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {selectedTab === 'stats' && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xs">
          {/* Water Status Card */}
          <Card shadow="sm" padding="sm" radius="md" withBorder className={classes.dataCard}>
            <Group justify="space-between" mb="xs">
              <Group align="center" gap="xs">
                <ThemeIcon color="blue" variant="light" size={28} radius="md">
                  <IconDroplet size={16} />
                </ThemeIcon>
                <Text fw={500}>Water Status</Text>
              </Group>
              <Badge color={moistureStatus === 'Low' ? 'red' : moistureStatus === 'Adequate' ? 'yellow' : 'green'} variant="light">
                {moistureStatus}
              </Badge>
            </Group>
            <Text c="dimmed" size="xs" mb="xs">
              Current average soil moisture: {currentMoisture}%
            </Text>
            
            <LineChart
              h={120}
              data={moistureData}
              dataKey="date"
              series={[
                { name: 'moisture', color: 'blue.6', label: 'Soil Moisture (%)' },
              ]}
              curveType="natural"
              withDots={false}
              yAxisProps={{ domain: [0, 100] }}
              withLegend={false}
            />
            <Alert 
              variant="light" 
              color={daysUntilIrrigation <= 2 ? "red" : "blue"} 
              title={daysUntilIrrigation <= 2 ? "Action Required" : "Recommendation"} 
              icon={<IconInfoCircle size={16} />} 
              mt="xs"
              radius="md"
              p="xs"
            >
              <Text size="xs">Next irrigation in ~{daysUntilIrrigation} day{daysUntilIrrigation !== 1 ? 's' : ''}.</Text>
            </Alert>
          </Card>

          {/* Yield Forecast Card */}
          <Card shadow="sm" padding="sm" radius="md" withBorder className={classes.dataCard}>
             <Group justify="space-between" mb="xs">
               <Group align="center" gap="xs">
                 <ThemeIcon color="green" variant="light" size={28} radius="md">
                   <IconPlant size={16} />
                 </ThemeIcon>
                 <Text fw={500}>Yield Forecast</Text>
               </Group>
               <Badge color="green" variant="light">Est. Monthly</Badge>
             </Group>
             <Text c="dimmed" size="xs" mb="xs">
               Estimated yield based on current conditions (kg/hectare).
             </Text>
            <BarChart
              h={140} 
              mt="xs"
              data={yieldData}
              dataKey="month"
              type="stacked"
              series={[
                { name: 'tomatoes', color: 'red.6', label: 'Tomatoes' },
                { name: 'corn', color: 'yellow.6', label: 'Corn' },
                { name: 'wheat', color: 'orange.6', label: 'Wheat' },
              ]}
              barProps={{ radius: 4 }}
              withLegend={false}
            />
             <Button 
                variant="light" 
                color="green" 
                fullWidth 
                mt="xs" 
                radius="md"
                leftSection={<IconTrendingUp size={14} />}
                size="xs"
             >
                View Analytics
             </Button>
          </Card>

          {/* Cost Estimation Card */}
           <Card shadow="sm" padding="sm" radius="md" withBorder className={classes.dataCard}>
             <Group justify="space-between" mb="xs">
               <Group align="center" gap="xs">
                 <ThemeIcon color="teal" variant="light" size={28} radius="md">
                   <IconCoin size={16} />
                 </ThemeIcon>
                 <Text fw={500}>Cost Breakdown</Text>
               </Group>
               <Badge color="teal" variant="light">Est. %</Badge>
             </Group>
             <Text c="dimmed" size="xs" mb="xs">
               Estimated operational cost distribution for the current cycle.
             </Text>
             <DonutChart 
                h={140} 
                mt="xs" 
                data={costBreakdown} 
                tooltipDataSource="segment" 
                chartLabel={`${costBreakdown.reduce((acc, item) => acc + item.value, 0)}% Total`}
                withLabels={false}
                withTooltip={true}
                />
             <Button 
                variant="light" 
                color="teal" 
                fullWidth 
                mt="xs" 
                radius="md"
                leftSection={<IconSettings size={14} />}
                size="xs"
             >
                Manage Budget
             </Button>
           </Card>
          
        </SimpleGrid>
      )}

      {selectedTab === 'health' && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xs">
          
          {/* Health Stats Overview & Chart */}
          <Stack gap="xs">
             <SimpleGrid cols={2} spacing="xs">
                <StatCard title="Total Scans" value={totalScans} icon={IconPhotoScan} color="blue" />
                <StatCard title="Issues Found" value={issuesLast30Days} icon={IconAlertCircle} color={issuesLast30Days > 0 ? 'orange' : 'green'} />
             </SimpleGrid>
             <Paper withBorder radius="md" p="xs" shadow="sm">
                <Group justify="space-between" mb="xs">
                    <Text fw={500} size="sm">Issue Type Breakdown</Text>
                    <Badge color="gray" size="xs">Based on History</Badge>
                </Group>
                {issueBreakdownData.length > 0 ? (
                    <Center>
                        <DonutChart 
                            h={150} 
                            data={issueBreakdownData} 
                            tooltipDataSource="segment" 
                            chartLabel="Issue Types"
                            withLabels={false}
                        />
                    </Center>
                ) : (
                    <Text c="dimmed" ta="center" my="md" size="xs">No issue history data available.</Text>
                )}
             </Paper>
             <Button 
                 variant="light" 
                 color="green" 
                 radius="md"
                 leftSection={<IconPhotoScan size={14} />}
                 component={Link} 
                 href="/dashboard/disease-detection"
                 size="xs"
             >
                 Analyze New Image
             </Button>
          </Stack>

          {/* Recent Scan History Table */}
          <Paper withBorder radius="md" p="xs" shadow="sm">
            <Text fw={500} size="sm" mb="xs">Recent Health History</Text>
            {combinedHistory.length > 0 ? (
              <Box style={{ maxHeight: '300px', overflowY: 'auto' }}> 
                <Table striped highlightOnHover withTableBorder verticalSpacing="xs" stickyHeader fontSize="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Location</Table.Th>
                      <Table.Th>Result</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {combinedHistory.slice(0, 8).map((item: any) => (
                      <Table.Tr key={item.id}>
                        <Table.Td>{item.date}</Table.Td>
                        <Table.Td>
                          <Badge 
                            variant="light" 
                            color={item.type === 'Disease' ? 'red' : item.type === 'Pest' ? 'orange' : item.type === 'Weed' ? 'yellow' : 'blue'}
                            size="xs"
                          >
                            {item.type ?? 'Unknown'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{item.location ?? item.field ?? 'N/A'}</Table.Td>
                        <Table.Td>
                          {(item.resultSummary ?? item.name ?? 'N/A').substring(0, 15)}
                          {(item.resultSummary ?? item.name ?? '').length > 15 ? '...' : ''}
                          {item.severity && (
                            <Badge 
                              ml={5} 
                              variant="filled" 
                              size="xs" 
                              color={item.severity === 'High' ? 'red' : item.severity === 'Medium' ? 'orange' : 'green'}
                            >
                              {item.severity}
                            </Badge>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Box>
            ) : (
              <Text c="dimmed" size="xs">No scan or issue history found.</Text>
            )}
          </Paper>
        </SimpleGrid>
      )}

      {selectedTab === 'planning' && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xs">
          {/* Crop Rotation Card */}
          <Card shadow="sm" padding="sm" radius="md" withBorder className={classes.dataCard}>
            <Group justify="space-between" mb="xs">
              <Group align="center" gap="xs">
                <ThemeIcon color="orange" variant="light" size={28} radius="md">
                  <IconArrowsShuffle size={16} />
                </ThemeIcon>
                <Text fw={500}>Crop Rotation</Text>
              </Group>
              <Badge color="orange" variant="light" size="xs">Field A</Badge>
            </Group>
            <List spacing="xs" size="xs">
              {cropRotationSchedule.map((item, index) => (
                <List.Item 
                  key={index}
                  icon={
                    <ThemeIcon 
                      color={item.status === 'Current' ? 'green' : 'gray'} 
                      variant="light" 
                      size={18} 
                      radius="xl"
                    >
                      {item.status === 'Current' ? <IconCheck size={10} /> : <IconCalendar size={10} />}
                    </ThemeIcon>
                  }
                >
                  <Group justify="space-between">
                    <Text size="xs">{item.season}: {item.crop}</Text>
                    <Badge variant="outline" color={item.status === 'Current' ? 'green' : 'gray'} size="xs">{item.status}</Badge>
                  </Group>
                </List.Item>
              ))}
            </List>
             <Button 
                variant="light" 
                color="orange" 
                fullWidth 
                mt="xs" 
                radius="md"
                leftSection={<IconSettings size={14} />}
                size="xs"
             >
                Manage Rotation Plan
             </Button>
          </Card>

          {/* Planting Calendar Card */}
          <Card shadow="sm" padding="sm" radius="md" withBorder className={classes.dataCard}>
            <Group justify="space-between" mb="xs">
              <Group align="center" gap="xs">
                <ThemeIcon color="lime" variant="light" size={28} radius="md">
                  <IconCalendar size={16} />
                </ThemeIcon>
                <Text fw={500}>Planting Calendar</Text>
              </Group>
              <Badge color="lime" variant="light" size="xs">Optimal Windows</Badge>
            </Group>
            <List spacing="xs" size="xs">
              {plantingCalendar.map((item, index) => (
                <List.Item 
                  key={index}
                  icon={
                    <ThemeIcon 
                      color={item.readyToPlant ? 'green' : 'gray'} 
                      variant="light" 
                      size={18} 
                      radius="xl"
                    >
                      {item.readyToPlant ? <IconCheck size={10} /> : <IconCircleX size={10} />}
                    </ThemeIcon>
                  }
                >
                  <Group justify="space-between">
                    <Text size="xs" fw={500}>{item.crop}</Text>
                    <Text size="xs" c="dimmed">{item.bestStart} - {item.bestEnd}</Text>
                    <Badge variant="light" color={item.readyToPlant ? 'green' : 'gray'} size="xs">
                      {item.readyToPlant ? 'Ready' : 'Not Ready'}
                    </Badge>
                  </Group>
                </List.Item>
              ))}
            </List>
             <Button 
                variant="light" 
                color="lime" 
                fullWidth 
                mt="xs" 
                radius="md"
                leftSection={<IconPlus size={14} />}
                size="xs"
             >
                Add Crop to Calendar
             </Button>
          </Card>
        </SimpleGrid>
      )}
    </Container>
  );
}

const StatCard = ({ title, value, icon: IconComponent, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) => (
  <Paper withBorder radius="md" p="xs" shadow="sm">
    <Group gap="xs">
      <ThemeIcon color={color} variant="light" size={28} radius="md">
        <IconComponent size={16} />
      </ThemeIcon>
      <div>
        <Text c="dimmed" size="xs" tt="uppercase" fw={500}>{title}</Text>
        <Text fw={700} size="sm">{value}</Text>
      </div>
    </Group>
  </Paper>
);