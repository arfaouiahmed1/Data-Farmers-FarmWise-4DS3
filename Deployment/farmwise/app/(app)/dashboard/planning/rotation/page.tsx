'use client';

import React, { useMemo } from 'react';
import { Container, Title, Text, Paper, Table, Button, Group, Select, SimpleGrid, Stack, Badge, Alert, Divider, Box } from '@mantine/core';
import { IconInfoCircle, IconPlant2, IconArrowRight, IconAlertTriangle } from '@tabler/icons-react';

// Example Data (Grouped by field implicitly)
interface RotationEntry {
  id: number;
  field: string;
  year: number;
  season: string;
  crop: string;
  status: string;
  family: string;
}

const rotationData: RotationEntry[] = [
  { id: 1, field: 'Field A', year: 2024, season: 'Spring', crop: 'Tomatoes', status: 'Harvested', family: 'Nightshade' },
  { id: 2, field: 'Field A', year: 2024, season: 'Summer', crop: 'Corn', status: 'Growing', family: 'Grass' },
  { id: 3, field: 'Field A', year: 2024, season: 'Fall', crop: 'Cover Crop (Rye)', status: 'Planned', family: 'Grass' }, // Example warning: Corn -> Rye (both grass)
  { id: 4, field: 'Field B', year: 2024, season: 'Spring', crop: 'Lettuce', status: 'Harvested', family: 'Aster' },
  { id: 5, field: 'Field B', year: 2024, season: 'Summer', crop: 'Soybeans', status: 'Growing', family: 'Legume' },
  { id: 6, field: 'Field B', year: 2024, season: 'Fall', crop: 'Fallow', status: 'Planned', family: 'None' },
  { id: 7, field: 'Field C', year: 2024, season: 'Spring/Summer', crop: 'Wheat', status: 'Harvested', family: 'Grass' },
  { id: 8, field: 'Field C', year: 2024, season: 'Fall', crop: 'Cover Crop (Clover)', status: 'Planned', family: 'Legume' }, // Example good: Wheat -> Clover
  { id: 9, field: 'Field A', year: 2025, season: 'Spring', crop: 'Peppers', status: 'Planned', family: 'Nightshade' }, // Example warning: Tomatoes (2024) -> Peppers (2025)
];

// Helper to group data by field
const groupRotationByField = (data: RotationEntry[]) => {
  return data.reduce((acc: { [field: string]: RotationEntry[] }, item: RotationEntry) => {
    if (!acc[item.field]) {
      acc[item.field] = [];
    }
    acc[item.field].push(item);
    // Sort entries within a field by year then season (simple sort for now)
    acc[item.field].sort((a: RotationEntry, b: RotationEntry) => {
      if (a.year !== b.year) return a.year - b.year;
      // Basic season sort - needs improvement for complex seasons like 'Spring/Summer'
      const seasonOrder: { [key: string]: number } = { 'Spring': 1, 'Spring/Summer': 2, 'Summer': 3, 'Fall': 4 };
      return (seasonOrder[a.season] || 99) - (seasonOrder[b.season] || 99);
    });
    return acc;
  }, {});
};

// Function to check for basic rotation warnings (example logic)
const checkRotationIssues = (fieldRotations: RotationEntry[]) => {
  const issues: string[] = [];
  for (let i = 1; i < fieldRotations.length; i++) {
    const prev = fieldRotations[i - 1];
    const current = fieldRotations[i];
    // Warning: Same crop family in consecutive seasons/years (basic check)
    if (prev.family !== 'None' && prev.family === current.family && prev.family !== 'Cover Crop') { // Ignore cover crops for this simple check
       issues.push(`Potential issue: Planting ${current.crop} (${current.family}) after ${prev.crop} (${prev.family}) in ${current.year}.`);
    }
     // Can add more complex checks here (e.g., nutrient depletion, pest cycles)
  }
  return issues;
};

export default function RotationSchedulePage() {
  // TODO: Add state for filters (year, field)
  const [selectedYear, setSelectedYear] = React.useState('2024'); // Example filter state

  const groupedData = useMemo(() => groupRotationByField(rotationData), []);

  const handleAddEntry = () => {
    alert('Add Rotation Entry functionality needs implementation.');
  };

  const filteredFields = Object.keys(groupedData).filter(field =>
    groupedData[field].some((entry: RotationEntry) => entry.year.toString() === selectedYear)
  );

  return (
    <Container size="xl">
      <Group justify="space-between" align="flex-start" mb="lg">
        <Title order={2}>Crop Rotation Plan</Title>
         <Group>
           <Select
              label="Year"
              placeholder="Filter by year"
              data={['2024', '2025']} // Populate dynamically later
              value={selectedYear}
              onChange={(value) => setSelectedYear(value || '2024')}
              clearable
            />
           <Button onClick={handleAddEntry} mt="xl">Add Rotation Entry</Button>
         </Group>
       </Group>

      <Alert icon={<IconInfoCircle size="1rem" />} title="Rotation Planning" color="blue" variant="light" mb="lg">
         Effective crop rotation helps manage soil fertility, control pests and diseases, and improve long-term soil health.
         Review the planned sequences below.
       </Alert>

      <Paper shadow="xs" p="md">
         <Stack gap="xl">
           {filteredFields.length > 0 ? filteredFields.map((field) => {
            const fieldRotations = groupedData[field].filter((entry: RotationEntry) => entry.year.toString() === selectedYear);
             const rotationIssues = checkRotationIssues(groupedData[field]); // Check issues across all years for the field

             return (
               <Box key={field}>
                 <Title order={4} mb="sm">{field}</Title>
                 <Paper withBorder p="md" radius="sm">
                   <Text size="sm" c="dimmed" mb="xs">Planned Rotation Sequence ({selectedYear})</Text>
                   <Group wrap="wrap" gap="xs" mb="md">
                     {fieldRotations.map((entry: RotationEntry, index: number) => (
                       <React.Fragment key={entry.id}>
                        <Badge
                           leftSection={<IconPlant2 size={14}/>}
                           variant="light"
                           color={entry.status === 'Planned' ? 'gray' : entry.status === 'Growing' ? 'green' : 'blue'}
                           size="lg"
                         >
                          {entry.crop} ({entry.season})
                         </Badge>
                         {index < fieldRotations.length - 1 && <IconArrowRight size={16} color="gray" />}
                       </React.Fragment>
                     ))}
                   </Group>
                   {rotationIssues.length > 0 && (
                     <>
                       <Divider my="xs" />
                       <Alert variant="outline" color="orange" title="Potential Rotation Considerations" icon={<IconAlertTriangle />} mt="sm" radius="xs">
                         <Stack gap="xs">
                           {rotationIssues.map((issue: string, idx: number) => <Text key={idx} size="xs">- {issue}</Text>)}
                          </Stack>
                        </Alert>
                    </>
                   )}
                 </Paper>
               </Box>
             );
          }) : (
             <Text c="dimmed" ta="center">No rotation data found for the selected year.</Text>
           )}
         </Stack>
       </Paper>

       {/* Original Table (Optional - could be removed or kept for detailed view) */}
       {/* <Title order={3} mt="xl" mb="md">Detailed View</Title>
       <Table striped highlightOnHover withTableBorder withColumnBorders>
         <Table.Thead> ... </Table.Thead>
         <Table.Tbody> ... </Table.Tbody>
       </Table> */}
    </Container>
  );
} 