'use client';

import React, { useState } from 'react';
import { Container, Title, Text, Paper, SimpleGrid, Card, Group, Badge, Tabs, Table, Button, Alert, Stack, List } from '@mantine/core';
import { IconDroplet, IconPlant, IconUsers, IconTractor, IconCalendarEvent, IconPackage, IconAlertTriangle } from '@tabler/icons-react';
import { format } from 'date-fns'; // Use date-fns if installed, otherwise use native Date formatting

// Example Data: Planned Tasks and Resource Allocation
interface AllocationEntry {
  id: number;
  task: string;
  startDate: Date;
  endDate: Date;
  resourceType: 'equipment' | 'labor' | 'material';
  resourceName: string; // e.g., 'Tractor John Deere 7R', 'Field Crew Alpha', 'Seed Pack Corn XY'
  field?: string; // Optional: Field associated with the task
  notes?: string;
}

const now = new Date();
const startOfWeek = (date: Date) => {
  const dt = new Date(date);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(dt.setDate(diff));
}
const addDays = (date: Date, days: number) => {
   const dt = new Date(date.valueOf());
   dt.setDate(dt.getDate() + days);
   return dt;
}

const plannedAllocations: AllocationEntry[] = [
  // Equipment
  { id: 1, task: 'Plowing Field A', startDate: startOfWeek(now), endDate: addDays(startOfWeek(now), 2), resourceType: 'equipment', resourceName: 'Tractor JD 7R', field: 'Field A' },
  { id: 2, task: 'Planting Field B', startDate: addDays(startOfWeek(now), 3), endDate: addDays(startOfWeek(now), 5), resourceType: 'equipment', resourceName: 'Planter Kinze 3600', field: 'Field B' },
  { id: 3, task: 'Spraying Field A', startDate: addDays(startOfWeek(now), 3), endDate: addDays(startOfWeek(now), 3), resourceType: 'equipment', resourceName: 'Sprayer Hagie STS12', field: 'Field A' }, // Potential conflict with Planter on day 4?
  { id: 4, task: 'Harvest Prep', startDate: addDays(startOfWeek(now), 6), endDate: addDays(startOfWeek(now), 6), resourceType: 'equipment', resourceName: 'Combine Case IH 9250', field: 'Field C' },
  // Labor
  { id: 5, task: 'Plowing Field A', startDate: startOfWeek(now), endDate: addDays(startOfWeek(now), 2), resourceType: 'labor', resourceName: 'Crew Alpha' },
  { id: 6, task: 'Planting Field B', startDate: addDays(startOfWeek(now), 3), endDate: addDays(startOfWeek(now), 5), resourceType: 'labor', resourceName: 'Crew Beta' },
  { id: 7, task: 'Scouting All Fields', startDate: addDays(startOfWeek(now), 0), endDate: addDays(startOfWeek(now), 6), resourceType: 'labor', resourceName: 'Agronomist Sarah' },
  // Materials
  { id: 8, task: 'Planting Field B', startDate: addDays(startOfWeek(now), 3), endDate: addDays(startOfWeek(now), 3), resourceType: 'material', resourceName: 'Seed Corn XY (50kg)', field: 'Field B' },
  { id: 9, task: 'Spraying Field A', startDate: addDays(startOfWeek(now), 3), endDate: addDays(startOfWeek(now), 3), resourceType: 'material', resourceName: 'Herbicide Gly (20L)', field: 'Field A' },
];

// Simple conflict check (naive example based on resource name and overlapping dates)
const findConflicts = (allocations: AllocationEntry[], type: 'equipment' | 'labor' | 'material') => {
  const conflicts: { [key: string]: AllocationEntry[] } = {};
  const typeAllocations = allocations.filter(a => a.resourceType === type);

  for (let i = 0; i < typeAllocations.length; i++) {
    for (let j = i + 1; j < typeAllocations.length; j++) {
      const a1 = typeAllocations[i];
      const a2 = typeAllocations[j];

      // Check if same resource and dates overlap
      if (a1.resourceName === a2.resourceName &&
          a1.startDate <= a2.endDate &&
          a1.endDate >= a2.startDate) {

        const conflictKey = `${a1.resourceName}-${a1.startDate.toISOString()}-${a2.startDate.toISOString()}`;
        if (!conflicts[conflictKey]) {
          conflicts[conflictKey] = [a1, a2];
        } else {
           // Add potentially other conflicting items if logic allows for >2 overlaps
           if (!conflicts[conflictKey].find(item => item.id === a1.id)) conflicts[conflictKey].push(a1);
           if (!conflicts[conflictKey].find(item => item.id === a2.id)) conflicts[conflictKey].push(a2);
        }
      }
    }
  }
  return conflicts;
};

export default function ResourcePlanningPage() {
  const [activeTab, setActiveTab] = useState<string | null>('equipment');

  const equipmentConflicts = findConflicts(plannedAllocations, 'equipment');
  const laborConflicts = findConflicts(plannedAllocations, 'labor');

  const renderAllocationTable = (type: 'equipment' | 'labor' | 'material') => {
    const data = plannedAllocations.filter(a => a.resourceType === type);
    const conflicts = type === 'equipment' ? equipmentConflicts : type === 'labor' ? laborConflicts : {};

    // Check if a row is part of any conflict
    const isRowConflicting = (row: AllocationEntry) => {
       return Object.values(conflicts).some(conflictList => conflictList.some(item => item.id === row.id));
    }

    const rows = data.map((row) => (
      <Table.Tr key={row.id} bg={isRowConflicting(row) ? 'var(--mantine-color-red-light)' : undefined}>
        <Table.Td>{row.task}</Table.Td>
        <Table.Td>{format(row.startDate, 'MMM d')} - {format(row.endDate, 'MMM d')}</Table.Td>
        <Table.Td>{row.resourceName}</Table.Td>
        <Table.Td>{row.field || 'N/A'}</Table.Td>
        <Table.Td>{/* Actions like Edit/Delete? */}</Table.Td>
      </Table.Tr>
    ));

    return (
      <Stack>
         {Object.keys(conflicts).length > 0 && (
           <Alert title="Potential Scheduling Conflicts Detected" color="red" icon={<IconAlertTriangle />} variant="light" mt="md">
              <Text size="sm">The following resources appear to be scheduled for overlapping times:</Text>
              <List size="xs" mt="xs">
                {Object.entries(conflicts).map(([key, items]) => (
                  <List.Item key={key}>
                     <strong>{items[0].resourceName}:</strong> Tasks "{items.map(i => i.task).join('" & "')}" have overlapping dates.
                   </List.Item>
                ))}
               </List>
            </Alert>
         )}
         <Table striped highlightOnHover withTableBorder mt="md">
            <Table.Thead>
                <Table.Tr>
                <Table.Th>Task</Table.Th>
                <Table.Th>Dates</Table.Th>
                <Table.Th>Resource Name</Table.Th>
                <Table.Th>Field</Table.Th>
                <Table.Th>Actions</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          <Button mt="md" style={{ alignSelf: 'flex-start' }}>Schedule New Task</Button>
       </Stack>
    );
  };

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Resource Planning & Allocation</Title>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="equipment" leftSection={<IconTractor size={14} />}>
            Equipment
          </Tabs.Tab>
          <Tabs.Tab value="labor" leftSection={<IconUsers size={14} />}>
            Labor
          </Tabs.Tab>
          <Tabs.Tab value="materials" leftSection={<IconPackage size={14} />}>
            Materials
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="equipment" pt="lg">
          <Paper shadow="xs" p="md">
             <Title order={4} mb="md">Equipment Allocation Schedule</Title>
             <Text size="sm" c="dimmed" mb="md">Plan and view the schedule for tractors, planters, sprayers, and other machinery.</Text>
             {renderAllocationTable('equipment')}
           </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="labor" pt="lg">
           <Paper shadow="xs" p="md">
             <Title order={4} mb="md">Labor Allocation Schedule</Title>
             <Text size="sm" c="dimmed" mb="md">Assign tasks to field crews, agronomists, and other personnel.</Text>
             {renderAllocationTable('labor')}
           </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="materials" pt="lg">
      <Paper shadow="xs" p="md">
             <Title order={4} mb="md">Material Allocation Plan</Title>
             <Text size="sm" c="dimmed" mb="md">Track planned usage of seeds, fertilizers, pesticides, etc., for specific tasks.</Text>
             {renderAllocationTable('material')}
           </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Original Status Section (Could be kept or integrated elsewhere) */}
      {/*
      <Title order={3} mt="xl" mb="md">Current Resource Status</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} >
          {resourceStatus.map((resource) => (
              // ... Original Card rendering ...
          ))}
        </SimpleGrid>
      */}

    </Container>
  );
} 