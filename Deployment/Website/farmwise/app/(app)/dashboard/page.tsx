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
    <Container fluid px="lg" py="md"> 
      <Group justify="space-between" mb="xl">
        <Title order={1} className={classes.pageTitle}>
          Farm Dashboard
        </Title>
        <Badge 
          size="lg" 
          color={daysUntilIrrigation <= 2 ? "red" : "blue"} 
          variant="light"
          leftSection={
            <ThemeIcon color={daysUntilIrrigation <= 2 ? "red" : "blue"} variant="light" size="sm" radius="xl">
              <IconDroplet size={14} />
            </ThemeIcon>
          }
        >
          {daysUntilIrrigation} Day{daysUntilIrrigation !== 1 ? 's' : ''} Until Next Recommended Irrigation
        </Badge>
      </Group>

      <Tabs value={selectedTab} onChange={handleTabChange} mb="xl" variant="pills" radius="md">
        <Tabs.List grow>
          <Tabs.Tab value="stats" leftSection={<IconTrendingUp size={16} />}>
            Key Stats
          </Tabs.Tab>
          <Tabs.Tab value="health" leftSection={<IconPlant2 size={16} />}>
            Plant Health Center
          </Tabs.Tab>
          <Tabs.Tab value="planning" leftSection={<IconCalendar size={16} />}>
            Planning & Schedule
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {selectedTab === 'stats' && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {/* Water Status Card */}
          <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.dataCard}>
            <Group justify="space-between" mb="xs">
              <Group align="center" gap="xs">
                <ThemeIcon color="blue" variant="light" size={36} radius="md">
                  <IconDroplet size={20} />
                </ThemeIcon>
                <Text fw={500} size="lg">Water Status</Text>
              </Group>
              <Badge color={moistureStatus === 'Low' ? 'red' : moistureStatus === 'Adequate' ? 'yellow' : 'green'} variant="light">
                {moistureStatus}
              </Badge>
            </Group>
            <Text c="dimmed" size="sm" mb="md">
              Current average soil moisture: {currentMoisture}%
            </Text>
            
            <LineChart
              h={160}
              data={moistureData}
              dataKey="date"
              series={[
                { name: 'moisture', color: 'blue.6', label: 'Soil Moisture (%)' },
              ]}
              curveType="natural"
              withDots={false}
              // withLegend
              yAxisProps={{ domain: [0, 100] }}
              tooltipProps={{
                content: ({ label, payload }) => (
                  <Paper px="md" py="sm" withBorder shadow="md" radius="md">
                    <Text fw={500} mb={5}>{label}</Text>
                    {payload?.map((item: any) => (
                      <Text key={item.name} c={item.color} fz="sm">
                        {item.name}: {item.value}%
                      </Text>
                    ))}
                  </Paper>
                ),
              }}
            />
            <Alert 
              variant="light" 
              color={daysUntilIrrigation <= 2 ? "red" : "blue"} 
              title={daysUntilIrrigation <= 2 ? "Action Required" : "Recommendation"} 
              icon={<IconInfoCircle />} 
              mt="md"
              radius="md"
            >
              Next irrigation recommended in ~{daysUntilIrrigation} day{daysUntilIrrigation !== 1 ? 's' : ''}.
            </Alert>
          </Card>

          {/* Yield Forecast Card */}
          <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.dataCard}>
             <Group justify="space-between" mb="xs">
               <Group align="center" gap="xs">
                 <ThemeIcon color="farmGreen" variant="light" size={36} radius="md">
                   <IconPlant size={20} />
                 </ThemeIcon>
                 <Text fw={500} size="lg">Yield Forecast</Text>
               </Group>
               <Badge color="farmGreen" variant="light">Est. Monthly</Badge>
             </Group>
             <Text c="dimmed" size="sm" mb="md">
               Estimated yield based on current conditions (kg/hectare).
             </Text>
            <BarChart
              h={180} 
              mt="md"
              data={yieldData}
              dataKey="month"
              type="stacked" // Changed to stacked
              series={[
                { name: 'tomatoes', color: 'red.6', label: 'Tomatoes' },
                { name: 'corn', color: 'yellow.6', label: 'Corn' },
                { name: 'wheat', color: 'orange.6', label: 'Wheat' }, // Changed color
              ]}
              barProps={{ radius: 4 }}
              // withLegend
              tooltipProps={{
                content: ({ label, payload }) => (
                  <Paper px="md" py="sm" withBorder shadow="md" radius="md">
                    <Text fw={500} mb={5}>{label}</Text>
                    {payload?.map((item: any) => (
                      <Text key={item.name} c={item.color} fz="sm">
                        {item.name}: {item.value} kg/ha
                      </Text>
                    ))}
                  </Paper>
                ),
              }}
            />
             <Button 
                variant="light" 
                color="farmGreen" 
                fullWidth 
                mt="md" 
                radius="md"
                leftSection={<IconTrendingUp size={16} />}
             >
                View Detailed Analytics
             </Button>
          </Card>

          {/* Cost Estimation Card */}
           <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.dataCard}>
             <Group justify="space-between" mb="xs">
               <Group align="center" gap="xs">
                 <ThemeIcon color="teal" variant="light" size={36} radius="md">
                   <IconCoin size={20} />
                 </ThemeIcon>
                 <Text fw={500} size="lg">Cost Breakdown</Text>
               </Group>
               <Badge color="teal" variant="light">Est. %</Badge>
             </Group>
             <Text c="dimmed" size="sm" mb="md">
               Estimated operational cost distribution for the current cycle.
             </Text>
             <DonutChart 
                h={180} 
                mt="md" 
                data={costBreakdown} 
                tooltipDataSource="segment" 
                chartLabel={`${costBreakdown.reduce((acc, item) => acc + item.value, 0)}% Total`}
                tooltipProps={{
                    content: ({ payload }) => (
                      <Paper px="md" py="sm" withBorder shadow="md" radius="md">
                        {payload?.map((item: any) => (
                          <Text key={item.name} c={item.payload.fill} fz="sm" fw={500}>
                            {item.name}: {item.value}%
                          </Text>
                        ))}
                      </Paper>
                    ),
                }}
                />
             <Button 
                variant="light" 
                color="teal" 
                fullWidth 
                mt="md" 
                radius="md"
                leftSection={<IconSettings size={16} />}
             >
                Manage Budget
             </Button>
           </Card>
          
        </SimpleGrid>
      )}

      {selectedTab === 'health' && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          
          {/* Health Stats Overview & Chart */}
          <Stack>
             <Title order={3} mb="sm">Health Overview</Title>
             <SimpleGrid cols={2} spacing="md">
                <StatCard title="Total Scans" value={totalScans} icon={IconPhotoScan} color="blue" />
                <StatCard title="Issues Found (Recent)" value={issuesLast30Days} icon={IconAlertCircle} color={issuesLast30Days > 0 ? 'orange' : 'green'} />
             </SimpleGrid>
             <Paper withBorder radius="md" p="md" shadow="sm">
                <Group justify="space-between" mb="xs">
                    <Text fw={500}>Issue Type Breakdown</Text>
                    <Badge color="gray">Based on History</Badge>
                </Group>
                {issueBreakdownData.length > 0 ? (
                    <Center>
                        <DonutChart 
                            h={200} 
                            data={issueBreakdownData} 
                            tooltipDataSource="segment" 
                            chartLabel="Issue Types"
                        />
                    </Center>
                ) : (
                    <Text c="dimmed" ta="center" my="lg">No issue history data available.</Text>
                )}
             </Paper>
             <Button 
                 variant="light" 
                 color="green" 
                 radius="md"
                 leftSection={<IconPhotoScan size={16} />}
                 component={Link} 
                 href="/dashboard/disease-detection" // Link to dedicated analysis page
             >
                 Analyze New Image
             </Button>
          </Stack>

          {/* Recent Scan History Table */}
          <Paper withBorder radius="md" p="md" shadow="sm">
            <Title order={3} mb="md">Recent Health History</Title>
            {combinedHistory.length > 0 ? (
              <Box style={{ maxHeight: '450px', overflowY: 'auto' }}> {/* Scrollable history */} 
                <Table striped highlightOnHover withTableBorder verticalSpacing="xs" stickyHeader>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Location/Field</Table.Th>
                      <Table.Th>Result/Severity</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {combinedHistory.slice(0, 15).map((item: any) => ( // Use any temporarily or define a common type
                      <Table.Tr key={item.id}>
                        <Table.Td>{item.date}</Table.Td>
                        <Table.Td>
                          <Badge 
                            variant="light" 
                            color={item.type === 'Disease' ? 'red' : item.type === 'Pest' ? 'orange' : item.type === 'Weed' ? 'yellow' : 'blue'}
                          >
                            {item.type ?? 'Unknown'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{item.location ?? item.field ?? 'N/A'}</Table.Td>
                        <Table.Td>
                          {item.resultSummary ?? item.name ?? 'N/A'} 
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
              <Text c="dimmed">No scan or issue history found.</Text>
            )}
          </Paper>
        </SimpleGrid>
      )}

      {selectedTab === 'planning' && (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {/* Crop Rotation Card */}
          <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.dataCard}>
            <Group justify="space-between" mb="md">
              <Group align="center" gap="xs">
                <ThemeIcon color="orange" variant="light" size={36} radius="md">
                  <IconArrowsShuffle size={20} />
                </ThemeIcon>
                <Text fw={500} size="lg">Crop Rotation</Text>
              </Group>
              <Badge color="orange" variant="light">Field A</Badge>
            </Group>
            <List spacing="xs" size="sm">
              {cropRotationSchedule.map((item, index) => (
                <List.Item 
                  key={index}
                  icon={
                    <ThemeIcon 
                      color={item.status === 'Current' ? 'green' : 'gray'} 
                      variant="light" 
                      size={20} 
                      radius="xl"
                    >
                      {item.status === 'Current' ? <IconCheck size={12} /> : <IconCalendar size={12} />}
                    </ThemeIcon>
                  }
                >
                  <Group justify="space-between">
                    <Text>{item.season}: {item.crop}</Text>
                    <Badge variant="outline" color={item.status === 'Current' ? 'green' : 'gray'}>{item.status}</Badge>
                  </Group>
                </List.Item>
              ))}
            </List>
             <Button 
                variant="light" 
                color="orange" 
                fullWidth 
                mt="md" 
                radius="md"
                leftSection={<IconSettings size={16} />}
             >
                Manage Rotation Plan
             </Button>
          </Card>

          {/* Planting Calendar Card */}
          <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.dataCard}>
            <Group justify="space-between" mb="md">
              <Group align="center" gap="xs">
                <ThemeIcon color="lime" variant="light" size={36} radius="md">
                  <IconCalendar size={20} />
                </ThemeIcon>
                <Text fw={500} size="lg">Planting Calendar</Text>
              </Group>
              <Badge color="lime" variant="light">Optimal Windows</Badge>
            </Group>
            <List spacing="xs" size="sm">
              {plantingCalendar.map((item, index) => (
                <List.Item 
                  key={index}
                  icon={
                    <ThemeIcon 
                      color={item.readyToPlant ? 'green' : 'gray'} 
                      variant="light" 
                      size={20} 
                      radius="xl"
                    >
                      {item.readyToPlant ? <IconCheck size={12} /> : <IconCircleX size={12} />}
                    </ThemeIcon>
                  }
                >
                  <Group justify="space-between">
                    <Text fw={500}>{item.crop}</Text>
                    <Text size="xs" c="dimmed">{item.bestStart} - {item.bestEnd}</Text>
                    <Badge variant="light" color={item.readyToPlant ? 'green' : 'gray'}>
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
                mt="md" 
                radius="md"
                leftSection={<IconPlus size={16} />}
             >
                Add Crop to Calendar
             </Button>
          </Card>
        </SimpleGrid>
      )}

      <Space h="xl" /> 

      {/* Top-Level Statistics Grid */}
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="lg" mb="xl">
         <StatCard title="Irrigation Alert" value={`${daysUntilIrrigation} Day${daysUntilIrrigation !== 1 ? 's' : ''}`} icon={IconDroplet} color={daysUntilIrrigation <= 2 ? "red" : "blue"} />
         <StatCard title="Diagnosed Issues" value={diagnosedPlantsCount} icon={IconZoomCheck} color={diagnosedPlantsCount > 0 ? "orange" : "green"} />
         <StatCard title="Fields Monitored" value={fieldsMonitored} icon={IconMapPin} color="cyan" />
         <StatCard title="Upcoming Tasks" value={upcomingTasks} icon={IconCalendar} color="grape" />
         <StatCard title="Total Crops" value={totalCrops} icon={IconPlant} color="farmGreen" />
         <StatCard title="Equipment Issues" value={equipmentIssues} icon={IconTractor} color={equipmentIssues > 0 ? "yellow" : "gray"} />
         <StatCard title="Low Inventory" value={lowInventory} icon={IconBuildingWarehouse} color={lowInventory > 0 ? "pink" : "gray"} />
         <StatCard title="Recent Logs" value={recentLogs} icon={IconListDetails} color="lime" />
      </SimpleGrid>
    </Container>
  );
}

const StatCard = ({ title, value, icon: IconComponent, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) => (
  <Paper withBorder radius="md" p="md" shadow="sm">
    <Group>
      <ThemeIcon color={color} variant="light" size={36} radius="md">
        <IconComponent size={20} />
      </ThemeIcon>
      <Stack gap={0}>
        <Text c="dimmed" size="xs" tt="uppercase" fw={700}>{title}</Text>
        <Text fw={700} size="xl">{value}</Text>
      </Stack>
    </Group>
  </Paper>
);