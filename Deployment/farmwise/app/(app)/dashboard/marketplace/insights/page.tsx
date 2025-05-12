'use client';

import { 
  Container, 
  Title, 
  Group, 
  Paper, 
  Grid, 
  Text, 
  Card, 
  SimpleGrid, 
  RingProgress, 
  ThemeIcon, 
  Stack, 
  Tabs, 
  Button,
  Select,
  Divider,
  Badge,
  ActionIcon,
} from '@mantine/core';
import { 
  IconArrowLeft, 
  IconTrendingUp, 
  IconTrendingDown, 
  IconChartBar,
  IconChartLine, 
  IconMapPin, 
  IconTractor, 
  IconSeedingOff,
  IconInfoCircle,
  IconCalendar,
  IconDownload,
} from '@tabler/icons-react';
import { LineChart, BarChart, DonutChart, AreaChart } from '@mantine/charts';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import classes from '../Marketplace.module.css';

// Mock data for market insights
const landPriceTrends = [
  { date: 'Jan 2023', price: 14000 },
  { date: 'Feb 2023', price: 14200 },
  { date: 'Mar 2023', price: 14500 },
  { date: 'Apr 2023', price: 14800 },
  { date: 'May 2023', price: 15300 },
  { date: 'Jun 2023', price: 15600 },
  { date: 'Jul 2023', price: 16100 },
  { date: 'Aug 2023', price: 16300 },
  { date: 'Sep 2023', price: 16500 },
  { date: 'Oct 2023', price: 16800 },
  { date: 'Nov 2023', price: 17200 },
  { date: 'Dec 2023', price: 17500 },
  { date: 'Jan 2024', price: 17800 },
  { date: 'Feb 2024', price: 18200 },
  { date: 'Mar 2024', price: 18600 },
  { date: 'Apr 2024', price: 19000 },
  { date: 'May 2024', price: 19500 },
];

const equipmentRentalDemand = [
  { month: 'Jan', tractors: 78, harvesters: 42, planting: 30 },
  { month: 'Feb', tractors: 82, harvesters: 35, planting: 28 },
  { month: 'Mar', tractors: 90, harvesters: 40, planting: 45 },
  { month: 'Apr', tractors: 95, harvesters: 55, planting: 60 },
  { month: 'May', tractors: 100, harvesters: 58, planting: 75 },
  { month: 'Jun', tractors: 112, harvesters: 64, planting: 52 },
  { month: 'Jul', tractors: 105, harvesters: 75, planting: 38 },
  { month: 'Aug', tractors: 98, harvesters: 82, planting: 35 },
  { month: 'Sep', tractors: 92, harvesters: 88, planting: 40 },
  { month: 'Oct', tractors: 85, harvesters: 72, planting: 48 },
  { month: 'Nov', tractors: 80, harvesters: 58, planting: 42 },
  { month: 'Dec', tractors: 75, harvesters: 50, planting: 38 },
];

const regionDistribution = [
  { region: 'Tunis', percentage: 22 },
  { region: 'Sfax', percentage: 18 },
  { region: 'Sousse', percentage: 15 },
  { region: 'Bizerte', percentage: 12 },
  { region: 'Kairouan', percentage: 10 },
  { region: 'Nabeul', percentage: 8 },
  { region: 'Other', percentage: 15 },
];

const categoryDistribution = [
  { name: 'Agricultural Land', value: 35, color: 'blue.6' },
  { name: 'Cultivation Land', value: 25, color: 'green.6' },
  { name: 'Pastoral Land', value: 15, color: 'teal.6' },
  { name: 'Orchards', value: 12, color: 'lime.6' },
  { name: 'Other Land', value: 13, color: 'cyan.6' },
];

const fertilizersData = [
  { month: 'Jan', organic: 32, chemical: 58 },
  { month: 'Feb', organic: 35, chemical: 55 },
  { month: 'Mar', organic: 38, chemical: 54 },
  { month: 'Apr', organic: 42, chemical: 52 },
  { month: 'May', organic: 45, chemical: 50 },
  { month: 'Jun', organic: 47, chemical: 48 },
  { month: 'Jul', organic: 49, chemical: 46 },
  { month: 'Aug', organic: 52, chemical: 44 },
  { month: 'Sep', organic: 55, chemical: 42 },
  { month: 'Oct', organic: 58, chemical: 40 },
  { month: 'Nov', organic: 60, chemical: 38 },
  { month: 'Dec', organic: 63, chemical: 35 },
];

const marketStatistics = [
  { 
    title: 'Total Listings', 
    value: 3842, 
    diff: 12.4, 
    icon: IconChartBar, 
    color: 'blue' 
  },
  { 
    title: 'Active Transactions', 
    value: 245, 
    diff: 8.2, 
    icon: IconTrendingUp, 
    color: 'green' 
  },
  { 
    title: 'Land Prices', 
    value: '19,500 TND/ha', 
    diff: 6.5, 
    icon: IconMapPin, 
    color: 'teal' 
  },
  { 
    title: 'Equipment Rentals', 
    value: 578, 
    diff: -3.2, 
    icon: IconTractor, 
    color: 'orange' 
  },
];

export default function MarketInsightsPage() {
  const router = useRouter();
  
  return (
    <Container fluid px="md">
      <Group mb="xl">
        <Button variant="subtle" leftSection={<IconArrowLeft size={18} />} component={Link} href="/dashboard/marketplace">
          Back to Marketplace
        </Button>
        <Title className={classes.pageTitle}>Market Insights</Title>
      </Group>
      
      <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} mb="md">
        {marketStatistics.map((stat) => (
          <Card key={stat.title} withBorder p="md" radius="md">
            <Group justify="space-between">
              <Text size="lg" fw={500}>{stat.title}</Text>
              <ThemeIcon color={stat.color} variant="light" size="lg" radius="md">
                <stat.icon size={20} />
              </ThemeIcon>
            </Group>
            
            <Group mt="md" align="baseline">
              <Text size="xl" fw={700}>{stat.value}</Text>
              <Badge 
                color={stat.diff > 0 ? 'green' : 'red'} 
                leftSection={stat.diff > 0 ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />}
              >
                {stat.diff > 0 ? '+' : ''}{stat.diff}%
              </Badge>
            </Group>
            
            <Text size="xs" c="dimmed" mt={5}>Compared to previous month</Text>
          </Card>
        ))}
      </SimpleGrid>
      
      <Tabs defaultValue="land">
        <Tabs.List>
          <Tabs.Tab value="land" leftSection={<IconMapPin size={16} />}>Land Market</Tabs.Tab>
          <Tabs.Tab value="equipment" leftSection={<IconTractor size={16} />}>Equipment Rentals</Tabs.Tab>
          <Tabs.Tab value="resources" leftSection={<IconSeedingOff size={16} />}>Agricultural Resources</Tabs.Tab>
          <Tabs.Tab value="forecast" leftSection={<IconChartLine size={16} />}>Market Forecast</Tabs.Tab>
        </Tabs.List>
        
        <Tabs.Panel value="land" pt="md">
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Card withBorder p="md" radius="md">
                <Group justify="space-between" mb="md">
                  <Title order={3}>Land Price Trends</Title>
                  <Group>
                    <Select
                      defaultValue="hectare"
                      data={[
                        { value: 'hectare', label: 'Per Hectare' },
                        { value: 'acre', label: 'Per Acre' },
                        { value: 'sq_meter', label: 'Per Square Meter' },
                      ]}
                      style={{ width: 150 }}
                    />
                    <ActionIcon variant="subtle" color="gray">
                      <IconDownload size={18} />
                    </ActionIcon>
                  </Group>
                </Group>
                
                <LineChart
                  h={300}
                  data={landPriceTrends}
                  dataKey="date"
                  series={[
                    { name: 'price', color: 'blue.6' },
                  ]}
                  curveType="monotone"
                  gridAxis="xy"
                  withLegend
                  tooltipAnimationDuration={200}
                  yAxisProps={{ domain: ['auto', 'auto'], tickFormatter: (value: number) => `${value.toLocaleString()} TND` }}
                />
                
                <Group justify="space-between" mt="md">
                  <Stack gap={0}>
                    <Text size="sm" c="dimmed">Current Average</Text>
                    <Group gap={5} align="baseline">
                      <Text fw={700} size="lg">19,500 TND</Text>
                      <Text size="sm" c="dimmed">per hectare</Text>
                    </Group>
                  </Stack>
                  
                  <Stack gap={0} align="flex-end">
                    <Text size="sm" c="dimmed">Year-to-Date Change</Text>
                    <Group gap={5} align="baseline">
                      <Text fw={700} size="lg" c="green.7">+11.4%</Text>
                      <Text size="sm" c="dimmed">(+2,000 TND)</Text>
                    </Group>
                  </Stack>
                </Group>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Card withBorder p="md" radius="md" h="100%">
                <Title order={3} mb="md">Land Types Distribution</Title>
                <DonutChart
                  data={categoryDistribution}
                  thickness={32}
                  size={220}
                  chartLabel="Land Types"
                  mx="auto"
                  withTooltip
                  tooltipDataSource="segment"
                  mb="md"
                />
                
                <Divider mb="md" />
                
                <Stack gap="xs">
                  {categoryDistribution.map((category) => (
                    <Group key={category.name} justify="space-between">
                      <Group gap="xs">
                        <div style={{ width: 12, height: 12, backgroundColor: `var(--mantine-color-${category.color})`, borderRadius: '50%' }} />
                        <Text size="sm">{category.name}</Text>
                      </Group>
                      <Text size="sm" fw={500}>{category.value}%</Text>
                    </Group>
                  ))}
                </Stack>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder p="md" radius="md">
                <Title order={3} mb="md">Regional Distribution</Title>
                <BarChart
                  h={300}
                  data={regionDistribution}
                  dataKey="region"
                  series={[
                    { name: 'percentage', color: 'indigo.6' },
                  ]}
                  barProps={{ radius: 4 }}
                  yAxisProps={{ domain: [0, 'auto'], tickFormatter: (value: number) => `${value}%` }}
                  withLegend={false}
                />
              </Card>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder p="md" radius="md">
                <Title order={3} mb="md">Market Insights</Title>
                <Stack gap="md">
                  <Paper withBorder p="md" radius="sm">
                    <Group gap="xs" mb={5}>
                      <ThemeIcon radius="xl" size="sm" color="blue" variant="light">
                        <IconInfoCircle size={14} />
                      </ThemeIcon>
                      <Text fw={500}>Highest Demand Areas</Text>
                    </Group>
                    <Text size="sm">
                      Tunis, Sfax, and Sousse continue to lead in agricultural land demand, with prices 15-20% higher than the national average.
                    </Text>
                  </Paper>
                  
                  <Paper withBorder p="md" radius="sm">
                    <Group gap="xs" mb={5}>
                      <ThemeIcon radius="xl" size="sm" color="green" variant="light">
                        <IconTrendingUp size={14} />
                      </ThemeIcon>
                      <Text fw={500}>Emerging Markets</Text>
                    </Group>
                    <Text size="sm">
                      Kairouan and Nabeul regions are showing the fastest growth rates, with price increases of 18% and 16% respectively over the past year.
                    </Text>
                  </Paper>
                  
                  <Paper withBorder p="md" radius="sm">
                    <Group gap="xs" mb={5}>
                      <ThemeIcon radius="xl" size="sm" color="yellow" variant="light">
                        <IconCalendar size={14} />
                      </ThemeIcon>
                      <Text fw={500}>Seasonal Trends</Text>
                    </Group>
                    <Text size="sm">
                      The highest transaction volume occurs during Q2 (April-June), coinciding with the pre-planting season.
                    </Text>
                  </Paper>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
        
        <Tabs.Panel value="equipment" pt="md">
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Card withBorder p="md" radius="md">
                <Group justify="space-between" mb="md">
                  <Title order={3}>Equipment Rental Demand</Title>
                  <Select
                    defaultValue="2024"
                    data={[
                      { value: '2024', label: '2024' },
                      { value: '2023', label: '2023' },
                      { value: '2022', label: '2022' },
                    ]}
                    style={{ width: 100 }}
                  />
                </Group>
                
                <BarChart
                  h={300}
                  data={equipmentRentalDemand}
                  dataKey="month"
                  series={[
                    { name: 'tractors', color: 'blue.6', label: 'Tractors' },
                    { name: 'harvesters', color: 'orange.6', label: 'Harvesters' },
                    { name: 'planting', color: 'green.6', label: 'Planting Equipment' },
                  ]}
                  barProps={{ radius: 4 }}
                  withLegend
                  tooltipAnimationDuration={200}
                />
                
                <Group justify="space-between" mt="md">
                  <Stack gap={0}>
                    <Text size="sm" c="dimmed">Most Rented Equipment</Text>
                    <Text fw={700}>Tractors & Implements</Text>
                  </Stack>
                  
                  <Stack gap={0} align="flex-end">
                    <Text size="sm" c="dimmed">Peak Rental Season</Text>
                    <Text fw={700}>May-July</Text>
                  </Stack>
                </Group>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Card withBorder p="md" radius="md" h="100%">
                <Title order={3} mb="md">Equipment Market Stats</Title>
                
                <Group mt="lg">
                  <RingProgress
                    size={120}
                    thickness={12}
                    sections={[
                      { value: 42, color: 'blue' },
                      { value: 25, color: 'orange' },
                      { value: 18, color: 'green' },
                      { value: 15, color: 'cyan' },
                    ]}
                    label={
                      <Text ta="center" size="xs" fw={700}>
                        Equipment Types
                      </Text>
                    }
                  />
                  
                  <Stack gap="xs">
                    <Group gap="xs">
                      <div style={{ width: 12, height: 12, backgroundColor: 'var(--mantine-color-blue-6)', borderRadius: '50%' }} />
                      <Text size="sm">Tractors (42%)</Text>
                    </Group>
                    <Group gap="xs">
                      <div style={{ width: 12, height: 12, backgroundColor: 'var(--mantine-color-orange-6)', borderRadius: '50%' }} />
                      <Text size="sm">Harvesters (25%)</Text>
                    </Group>
                    <Group gap="xs">
                      <div style={{ width: 12, height: 12, backgroundColor: 'var(--mantine-color-green-6)', borderRadius: '50%' }} />
                      <Text size="sm">Planting (18%)</Text>
                    </Group>
                    <Group gap="xs">
                      <div style={{ width: 12, height: 12, backgroundColor: 'var(--mantine-color-cyan-6)', borderRadius: '50%' }} />
                      <Text size="sm">Other (15%)</Text>
                    </Group>
                  </Stack>
                </Group>
                
                <Divider my="md" />
                
                <Stack gap="md">
                  <Paper withBorder p="xs" radius="sm">
                    <Group justify="space-between">
                      <Text size="sm">Average Rental Period</Text>
                      <Text fw={500}>2.7 weeks</Text>
                    </Group>
                  </Paper>
                  
                  <Paper withBorder p="xs" radius="sm">
                    <Group justify="space-between">
                      <Text size="sm">Average Rental Price</Text>
                      <Text fw={500}>3,250 TND/week</Text>
                    </Group>
                  </Paper>
                  
                  <Paper withBorder p="xs" radius="sm">
                    <Group justify="space-between">
                      <Text size="sm">Utilization Rate</Text>
                      <Text fw={500}>72%</Text>
                    </Group>
                  </Paper>
                  
                  <Paper withBorder p="xs" radius="sm">
                    <Group justify="space-between">
                      <Text size="sm">YoY Growth</Text>
                      <Text fw={500} c="green.7">+15.3%</Text>
                    </Group>
                  </Paper>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
        
        <Tabs.Panel value="resources" pt="md">
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Card withBorder p="md" radius="md">
                <Title order={3} mb="md">Fertilizer Market Trends</Title>
                
                <AreaChart
                  h={300}
                  data={fertilizersData}
                  dataKey="month"
                  series={[
                    { name: 'organic', color: 'green.6', label: 'Organic Fertilizers' },
                    { name: 'chemical', color: 'blue.6', label: 'Chemical Fertilizers' },
                  ]}
                  curveType="monotone"
                  gridAxis="xy"
                  withLegend
                  withDots={false}
                  tooltipAnimationDuration={200}
                  yAxisProps={{ domain: [0, 'auto'], tickFormatter: (value: number) => `${value}%` }}
                />
                
                <Group mt="md">
                  <Paper withBorder p="sm" radius="sm" style={{ flex: 1 }}>
                    <Text size="sm" c="dimmed">Organic Fertilizers</Text>
                    <Group align="baseline" gap={5}>
                      <Text fw={700} size="lg">63%</Text>
                      <Badge color="green">+31%</Badge>
                    </Group>
                    <Text size="xs" c="dimmed">Market share (YoY change)</Text>
                  </Paper>
                  
                  <Paper withBorder p="sm" radius="sm" style={{ flex: 1 }}>
                    <Text size="sm" c="dimmed">Chemical Fertilizers</Text>
                    <Group align="baseline" gap={5}>
                      <Text fw={700} size="lg">35%</Text>
                      <Badge color="red">-23%</Badge>
                    </Group>
                    <Text size="xs" c="dimmed">Market share (YoY change)</Text>
                  </Paper>
                </Group>
              </Card>
            </Grid.Col>
            
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Card withBorder p="md" radius="md" h="100%">
                <Title order={3} mb="md">Resource Market Insights</Title>
                
                <Stack gap="md">
                  <Paper withBorder p="md" radius="sm">
                    <Group gap="xs" mb={5}>
                      <ThemeIcon radius="xl" size="sm" color="green" variant="light">
                        <IconTrendingUp size={14} />
                      </ThemeIcon>
                      <Text fw={500}>Organic Movement</Text>
                    </Group>
                    <Text size="sm">
                      The shift toward organic farming inputs continues to accelerate, with organic fertilizers and natural pesticides seeing 31% YoY growth.
                    </Text>
                  </Paper>
                  
                  <Paper withBorder p="md" radius="sm">
                    <Group gap="xs" mb={5}>
                      <ThemeIcon radius="xl" size="sm" color="blue" variant="light">
                        <IconInfoCircle size={14} />
                      </ThemeIcon>
                      <Text fw={500}>Price Trends</Text>
                    </Group>
                    <Text size="sm">
                      The average price of organic inputs has decreased by 8% due to increased local production, while chemical product prices have risen by 12%.
                    </Text>
                  </Paper>
                  
                  <Paper withBorder p="md" radius="sm">
                    <Group gap="xs" mb={5}>
                      <ThemeIcon radius="xl" size="sm" color="yellow" variant="light">
                        <IconSeedingOff size={14} />
                      </ThemeIcon>
                      <Text fw={500}>Top Selling Categories</Text>
                    </Group>
                    <Text size="sm">
                      High-yield seeds, organic fertilizers, and natural pest control products are the fastest-growing resource categories.
                    </Text>
                  </Paper>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
        
        <Tabs.Panel value="forecast" pt="md">
          <Card withBorder p="md" radius="md" mb="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Market Forecast (Next 12 Months)</Title>
              <Button variant="outline" leftSection={<IconDownload size={16} />}>
                Download Report
              </Button>
            </Group>
            
            <SimpleGrid cols={{ base: 1, md: 3 }}>
              <Card withBorder p="md" radius="md">
                <ThemeIcon size="lg" color="blue" mb="md">
                  <IconMapPin size={20} />
                </ThemeIcon>
                <Title order={4}>Land Market</Title>
                <Text mt="md">
                  Land prices are projected to increase by 8-10% over the next 12 months, with highest growth expected in areas with improved water access and infrastructure development.
                </Text>
                <Group mt="md">
                  <Badge color="green">+8-10% Price</Badge>
                  <Badge color="blue">+12% Transactions</Badge>
                </Group>
              </Card>
              
              <Card withBorder p="md" radius="md">
                <ThemeIcon size="lg" color="orange" mb="md">
                  <IconTractor size={20} />
                </ThemeIcon>
                <Title order={4}>Equipment Market</Title>
                <Text mt="md">
                  Equipment rental demand is expected to grow by 15% with a shift toward modern, eco-friendly machinery. Precision farming equipment will see the highest demand increase.
                </Text>
                <Group mt="md">
                  <Badge color="green">+15% Demand</Badge>
                  <Badge color="blue">+6% Pricing</Badge>
                </Group>
              </Card>
              
              <Card withBorder p="md" radius="md">
                <ThemeIcon size="lg" color="green" mb="md">
                  <IconSeedingOff size={20} />
                </ThemeIcon>
                <Title order={4}>Resources Market</Title>
                <Text mt="md">
                  Organic inputs will continue their upward trend, with forecast growth of 25-30%. Demand for specialized high-yield seeds adapted to local conditions will increase by 20%.
                </Text>
                <Group mt="md">
                  <Badge color="green">+28% Organic</Badge>
                  <Badge color="blue">+20% Seeds</Badge>
                </Group>
              </Card>
            </SimpleGrid>
            
            <Divider my="lg" />
            
            <Title order={4} mb="md">Key Market Drivers</Title>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
              <Paper withBorder p="md" radius="md">
                <Text fw={700} mb="xs">Climate Adaptation</Text>
                <Text size="sm">
                  Growing need for drought-resistant crops and water-efficient farming methods
                </Text>
              </Paper>
              
              <Paper withBorder p="md" radius="md">
                <Text fw={700} mb="xs">Sustainability Shift</Text>
                <Text size="sm">
                  Increasing consumer and regulatory pressure for sustainable farming practices
                </Text>
              </Paper>
              
              <Paper withBorder p="md" radius="md">
                <Text fw={700} mb="xs">Technology Adoption</Text>
                <Text size="sm">
                  Accelerating integration of precision agriculture and IoT solutions
                </Text>
              </Paper>
              
              <Paper withBorder p="md" radius="md">
                <Text fw={700} mb="xs">Export Opportunities</Text>
                <Text size="sm">
                  Growing international demand for organic Tunisian agricultural products
                </Text>
              </Paper>
            </SimpleGrid>
          </Card>
          
          <Card withBorder p="md" radius="md">
            <Title order={3} mb="md">Recommendations</Title>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <Paper withBorder p="md" radius="md">
                    <Title order={5} mb="xs">For Land Buyers/Sellers</Title>
                    <Text size="sm">
                      Focus on properties with sustainable water access and proximity to transportation infrastructure. Lands with established irrigation systems will command premium prices in the coming year.
                    </Text>
                  </Paper>
                  
                  <Paper withBorder p="md" radius="md">
                    <Title order={5} mb="xs">For Equipment Providers</Title>
                    <Text size="sm">
                      Expand inventory of precision farming equipment and GPS-enabled machinery. Consider flexible rental options during peak seasons (May-July) to maximize equipment utilization.
                    </Text>
                  </Paper>
                </Stack>
              </Grid.Col>
              
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <Paper withBorder p="md" radius="md">
                    <Title order={5} mb="xs">For Resource Suppliers</Title>
                    <Text size="sm">
                      Focus on expanding organic product lines and high-yield, drought-resistant seed varieties. Bundle products with advisory services to increase value proposition and customer loyalty.
                    </Text>
                  </Paper>
                  
                  <Paper withBorder p="md" radius="md">
                    <Title order={5} mb="xs">For All Market Participants</Title>
                    <Text size="sm">
                      Leverage FarmWise marketplace data analytics to optimize pricing strategies and timing of market entries. Consider regional variations in demand patterns and adjust offerings accordingly.
                    </Text>
                  </Paper>
                </Stack>
              </Grid.Col>
            </Grid>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
} 