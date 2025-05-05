'use client';
import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  SimpleGrid,
  Group,
  Select,
  Box,
  useMantineTheme,
  Grid,
  Table
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconChartInfographic,
  IconChartBar,
  IconChartAreaLine,
  IconChartDonut3,
  IconCalendarEvent,
  IconFilter
} from '@tabler/icons-react';
import { BarChart, LineChart, DonutChart, AreaChart } from '@mantine/charts';
import dayjs from 'dayjs';

// --- Mock Data ---

// Yield Data (Example: Tons per Hectare)
const yieldData = [
  { date: '2022-08-01', FieldA_Corn: 10.5, FieldB_Soybeans: 3.8, FieldC_Wheat: 6.2 },
  { date: '2023-08-01', FieldA_Soybeans: 4.1, FieldB_Corn: 11.2, FieldC_CoverCrop: 0 }, // Assuming cover crop has 0 yield
  { date: '2024-08-01', FieldA_Wheat: 6.8, FieldB_Soybeans: 4.0, FieldC_Corn: 10.1 }, // Projected/actual
];

// Cost Breakdown Data
const costData = [
  { name: 'Seeds', value: 15000, color: 'blue.6' },
  { name: 'Fertilizer', value: 25000, color: 'teal.6' },
  { name: 'Pesticides', value: 12000, color: 'grape.6' },
  { name: 'Fuel', value: 18000, color: 'orange.6' },
  { name: 'Maintenance', value: 9000, color: 'red.6' },
  { name: 'Labor', value: 35000, color: 'yellow.6' },
  { name: 'Other', value: 5000, color: 'gray.6' },
];

// Resource Usage (Example: Water in m³ per month)
const waterUsageData = [
  { date: '2024-01-01', usage: 800 },
  { date: '2024-02-01', usage: 750 },
  { date: '2024-03-01', usage: 1100 },
  { date: '2024-04-01', usage: 1500 },
  { date: '2024-05-01', usage: 1750 },
  { date: '2024-06-01', usage: 1900 }, // Projected
];

// Revenue/Profit Trend (Example)
const profitData = [
    { date: '2022', Revenue: 150000, Cost: 110000, Profit: 40000 },
    { date: '2023', Revenue: 165000, Cost: 119000, Profit: 46000 },
    { date: '2024', Revenue: 175000, Cost: 125000, Profit: 50000 }, // Projected
];

export default function AnalyticsPage() {
  const theme = useMantineTheme();
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    dayjs().subtract(1, 'year').startOf('year').toDate(),
    dayjs().endOf('year').toDate(),
  ]);

  // Add filtering logic based on dateRange if needed for charts

  return (
    <Container fluid>
      <Title order={2} mb="lg">
        <IconChartInfographic size={28} style={{ marginRight: '8px', verticalAlign: 'bottom' }} />
        Farm Analytics
      </Title>
      <Text c="dimmed" mb="xl">
        Analyze trends, monitor performance, and gain insights into your farm operations.
      </Text>

      {/* --- Filters --- */}
      <Paper withBorder p="md" radius="md" shadow="sm" mb="xl">
        <Group>
             <IconFilter size={18} style={{ opacity: 0.7 }} />
            <Text size="sm" fw={500}>Filters</Text>
             <DatePickerInput
                type="range"
                label="Date Range"
                placeholder="Select date range"
                value={dateRange}
                onChange={setDateRange}
                maw={320}
                size="xs"
                leftSection={<IconCalendarEvent size={16} />} 
            />
             {/* Add more filters if needed (e.g., by field, by crop) */}
        </Group>
      </Paper>

      {/* --- Charts Grid --- */}
       <Grid gutter="xl">
         {/* Yield Comparison Chart */} 
         <Grid.Col span={{ base: 12, md: 6 }}>
             <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
                <Group justify="space-between" mb="md">
                     <Title order={4}>Yield Comparison (Tons/ha)</Title>
                     <IconChartBar size={20} opacity={0.6}/>
                 </Group>
                 <Box h={300}>
                     <BarChart
                        h={300}
                        data={yieldData}
                        dataKey="date"
                        series={[
                            { name: 'FieldA_Corn', color: 'yellow.6', label: 'Field A (Corn)' },
                            { name: 'FieldB_Soybeans', color: 'lime.6', label: 'Field B (Soy)' },
                            { name: 'FieldC_Wheat', color: 'orange.6', label: 'Field C (Wheat)' },
                            { name: 'FieldA_Soybeans', color: 'lime.6', label: 'Field A (Soy)' },
                            { name: 'FieldB_Corn', color: 'yellow.6', label: 'Field B (Corn)' },
                            // Add other series as needed
                        ]}
                        tickLine="none"
                        gridAxis="none"
                        xAxisProps={{ padding: { left: 30, right: 30 } }}
                        tooltipProps={{ content: ({ label, payload }) => 
                             <ChartTooltip theme={theme} label={label} payload={payload} unit=" T/ha" /> 
                        }}
                     />
                 </Box>
             </Paper>
         </Grid.Col>

         {/* Cost Breakdown Chart */} 
         <Grid.Col span={{ base: 12, md: 6 }}>
             <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
                 <Group justify="space-between" mb="md">
                     <Title order={4}>Cost Breakdown (YTD)</Title>
                     <IconChartDonut3 size={20} opacity={0.6}/>
                 </Group>
                 <Box h={300}>
                     <DonutChart
                         h={300}
                         data={costData}
                         tooltipDataSource="segment"
                         chartLabel={`Total: $${costData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}`}
                         withLabelsLine
                         withLabels
                         tooltipProps={{ content: ({ payload }) => 
                             <ChartTooltip theme={theme} payload={payload} unit="$" valueFormat="currency" /> 
                         }}
                     />
                 </Box>
             </Paper>
         </Grid.Col>

         {/* Water Usage Trend Chart */} 
         <Grid.Col span={{ base: 12, md: 6 }}>
             <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
                 <Group justify="space-between" mb="md">
                     <Title order={4}>Water Usage Trend (m³)</Title>
                     <IconChartAreaLine size={20} opacity={0.6}/>
                 </Group>
                 <Box h={300}>
                     <AreaChart
                         h={300}
                         data={waterUsageData}
                         dataKey="date"
                         series={[{ name: 'usage', color: 'blue.6', label: 'Monthly Usage' }]}
                         curveType="natural"
                         yAxisProps={{ domain: ['auto', 'auto'], width: 60 }}
                         xAxisProps={{ tickFormatter: (value) => dayjs(value).format('MMM YY') }}
                         tooltipProps={{ content: ({ label, payload }) => 
                            <ChartTooltip theme={theme} label={dayjs(label).format('MMM YYYY')} payload={payload} unit=" m³" /> 
                         }}
                         connectNulls // If you might have gaps in data
                         fillOpacity={0.3}
                     />
                 </Box>
             </Paper>
         </Grid.Col>
         
          {/* Profitability Trend */} 
         <Grid.Col span={{ base: 12, md: 6 }}>
             <Paper withBorder p="lg" radius="md" shadow="sm" h="100%">
                 <Group justify="space-between" mb="md">
                     <Title order={4}>Profitability Trend</Title>
                     <IconChartAreaLine size={20} opacity={0.6}/>
                 </Group>
                 <Box h={300}>
                     <LineChart
                         h={300}
                         data={profitData}
                         dataKey="date"
                         series={[
                            { name: 'Revenue', color: 'green.6' },
                            { name: 'Cost', color: 'red.6' },
                            { name: 'Profit', color: 'blue.6' },
                         ]}
                         curveType="linear"
                         yAxisProps={{ domain: ['auto', 'auto'], width: 70, tickFormatter: (value) => `$${(value / 1000).toFixed(0)}k` }}
                         tooltipProps={{ content: ({ label, payload }) => 
                            <ChartTooltip theme={theme} label={`Year ${label}`} payload={payload} unit="$" valueFormat="currency" /> 
                         }}
                     />
                 </Box>
             </Paper>
         </Grid.Col>

         {/* Data Table Example (Placeholder) */} 
         {/* <Grid.Col span={12}>
             <Paper withBorder p="lg" radius="md" shadow="sm">
                 <Title order={4} mb="md">Detailed Yield Data</Title>
                 <Table striped highlightOnHover withTableBorder>
                     <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Year</Table.Th>
                            <Table.Th>Field A Crop</Table.Th>
                            <Table.Th>Field A Yield (T/ha)</Table.Th>
                            <Table.Th>Field B Crop</Table.Th>
                            <Table.Th>Field B Yield (T/ha)</Table.Th>
                             {/* ... more columns ... * /}
                        </Table.Tr>
                     </Table.Thead>
                     <Table.Tbody>
                         {/* Map data here * /}
                     </Table.Tbody>
                 </Table>
             </Paper>
         </Grid.Col> */} 

      </Grid>
    </Container>
  );
}

// Helper component for consistent chart tooltips

// Define the props type including theme
interface ChartTooltipProps {
  theme: any; // Use MantineTheme if imported, otherwise 'any' is simpler for now
  label?: string;
  payload: any[] | undefined;
  unit?: string;
  valueFormat?: 'number' | 'currency';
}

function ChartTooltip({ theme, label, payload, unit = '', valueFormat = 'number' }: ChartTooltipProps) { // Use the defined props type
  if (!payload || payload.length === 0) return null;

  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md">
      {label && <Text fw={500} mb={5}>{label}</Text>}
      {payload.map((item: any) => {
         const formattedValue = valueFormat === 'currency' 
            ? `$${item.value.toLocaleString()}` 
            : item.value.toLocaleString();
         return (
             <Text key={item.name} c={item.color || theme.primaryColor} fz="sm">
                {item.name}: {formattedValue}{unit}
             </Text>
         );
       })}
    </Paper>
  );
}
