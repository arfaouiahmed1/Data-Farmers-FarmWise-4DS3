'use client';

import React, { useState, useMemo } from 'react';
import { Container, Title, Text, Paper, SimpleGrid, Card, Group, Badge, Tabs, Table, Button, Alert, Stack, List, Modal, ActionIcon } from '@mantine/core';
import { IconDroplet, IconPlant, IconUsers, IconTractor, IconCalendarEvent, IconPackage, IconAlertTriangle, IconPencil, IconTrash } from '@tabler/icons-react';
import { format } from 'date-fns';
import { AllocationForm } from '@/components/planning/AllocationForm';
import type { AllocationEntry } from '@/types/planning';

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

const initialAllocations: AllocationEntry[] = [
  // Equipment
  { id: 1, task: 'Plowing Field A', startDate: startOfWeek(now), endDate: addDays(startOfWeek(now), 2), resourceType: 'equipment', resourceName: 'Tractor JD 7R', field: 'Field A' },
  { id: 2, task: 'Planting Field B', startDate: addDays(startOfWeek(now), 3), endDate: addDays(startOfWeek(now), 5), resourceType: 'equipment', resourceName: 'Planter Kinze 3600', field: 'Field B' },
  { id: 3, task: 'Spraying Field A', startDate: addDays(startOfWeek(now), 3), endDate: addDays(startOfWeek(now), 3), resourceType: 'equipment', resourceName: 'Sprayer Hagie STS12', field: 'Field A' },
  { id: 4, task: 'Harvest Prep', startDate: addDays(startOfWeek(now), 6), endDate: addDays(startOfWeek(now), 6), resourceType: 'equipment', resourceName: 'Combine Case IH 9250', field: 'Field C' },
  // Labor
  { id: 5, task: 'Plowing Field A', startDate: startOfWeek(now), endDate: addDays(startOfWeek(now), 2), resourceType: 'labor', resourceName: 'Crew Alpha' },
  { id: 6, task: 'Planting Field B', startDate: addDays(startOfWeek(now), 3), endDate: addDays(startOfWeek(now), 5), resourceType: 'labor', resourceName: 'Crew Beta' },
  { id: 7, task: 'Scouting All Fields', startDate: addDays(startOfWeek(now), 0), endDate: addDays(startOfWeek(now), 6), resourceType: 'labor', resourceName: 'Agronomist Sarah' },
  // Materials
  { id: 8, task: 'Planting Field B', startDate: addDays(startOfWeek(now), 3), endDate: addDays(startOfWeek(now), 3), resourceType: 'material', resourceName: 'Seed Corn XY (50kg)', field: 'Field B' },
  { id: 9, task: 'Spraying Field A', startDate: addDays(startOfWeek(now), 3), endDate: addDays(startOfWeek(now), 3), resourceType: 'material', resourceName: 'Herbicide Gly (20L)', field: 'Field A' },
];

const findConflicts = (allocations: AllocationEntry[]) => {
  const conflictsByType: { [type in AllocationEntry['resourceType']]: { [key: string]: AllocationEntry[] } } = {
      equipment: {}, labor: {}, material: {}
  };

  const groupedByName: { [type in AllocationEntry['resourceType']]: { [name: string]: AllocationEntry[] } } = {
      equipment: {}, labor: {}, material: {}
  };

  allocations.forEach(a => {
      if (!groupedByName[a.resourceType]) groupedByName[a.resourceType] = {};
      if (!groupedByName[a.resourceType][a.resourceName]) groupedByName[a.resourceType][a.resourceName] = [];
      groupedByName[a.resourceType][a.resourceName].push(a);
  });

  for (const type in groupedByName) {
      const typeKey = type as AllocationEntry['resourceType'];
      for (const name in groupedByName[typeKey]) {
          const nameAllocations = groupedByName[typeKey][name];
          for (let i = 0; i < nameAllocations.length; i++) {
              for (let j = i + 1; j < nameAllocations.length; j++) {
                  const a1 = nameAllocations[i];
                  const a2 = nameAllocations[j];
                  if (a1.startDate <= a2.endDate && a1.endDate >= a2.startDate) {
                      const conflictKey = `${name}-${a1.startDate.toISOString()}-${a2.startDate.toISOString()}`;
                      if (!conflictsByType[typeKey][conflictKey]) {
                           conflictsByType[typeKey][conflictKey] = [];
                      }
                      if (!conflictsByType[typeKey][conflictKey].find(item => item.id === a1.id)) conflictsByType[typeKey][conflictKey].push(a1);
                      if (!conflictsByType[typeKey][conflictKey].find(item => item.id === a2.id)) conflictsByType[typeKey][conflictKey].push(a2);
                  }
              }
          }
      }
  }
  return conflictsByType;
};

export default function ResourcePlanningPage() {
  const [allocations, setAllocations] = useState<AllocationEntry[]>(initialAllocations);
  const [activeTab, setActiveTab] = useState<string | null>('equipment');
  const [formModalOpened, setFormModalOpened] = useState(false);
  const [currentAllocation, setCurrentAllocation] = useState<Partial<AllocationEntry> | null>(null);
  const [modalTitle, setModalTitle] = useState('Schedule New Task');

  const conflicts = useMemo(() => findConflicts(allocations), [allocations]);

  const handleAddTaskClick = () => {
    setCurrentAllocation(null);
    setModalTitle('Schedule New Task');
    setFormModalOpened(true);
  };

  const handleEditClick = (allocation: AllocationEntry) => {
    setCurrentAllocation(allocation);
    setModalTitle('Edit Task Allocation');
    setFormModalOpened(true);
  };

  const handleDeleteClick = (allocationId: number | string) => {
    if (window.confirm('Are you sure you want to delete this allocation?')) {
      setAllocations(prev => prev.filter(a => a.id !== allocationId));
      console.log(`Deleted allocation ID: ${allocationId}`);
    }
  };

  const handleSaveAllocation = (allocationData: AllocationEntry) => {
    setAllocations(prev => {
      if (currentAllocation && currentAllocation.id) {
        console.log('Updating allocation:', allocationData);
        return prev.map(a => (a.id === allocationData.id ? allocationData : a));
      } else {
        console.log('Adding allocation:', allocationData);
        return [...prev, allocationData];
      }
    });
    setFormModalOpened(false);
    setCurrentAllocation(null);
    console.log('API call for save/update');
  };

  const renderAllocationTable = (type: 'equipment' | 'labor' | 'material') => {
    const data = allocations.filter(a => a.resourceType === type);
    const typeConflicts = conflicts[type];

    const isRowConflicting = (row: AllocationEntry) => {
       return Object.values(typeConflicts).some(conflictList => conflictList.some(item => item.id === row.id));
    }

    const rows = data.map((row) => (
      <Table.Tr key={row.id} bg={isRowConflicting(row) ? 'var(--mantine-color-red-light)' : undefined}>
        <Table.Td>{row.task}</Table.Td>
        <Table.Td>{format(row.startDate, 'MMM d')} - {format(row.endDate, 'MMM d')}</Table.Td>
        <Table.Td>{row.resourceName}</Table.Td>
        <Table.Td>{row.field || 'N/A'}</Table.Td>
        <Table.Td>
           <Group gap="xs" wrap="nowrap">
              <ActionIcon variant="subtle" color="blue" onClick={() => handleEditClick(row)} title="Edit">
                   <IconPencil size={16} />
               </ActionIcon>
               <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteClick(row.id)} title="Delete">
                   <IconTrash size={16} />
               </ActionIcon>
           </Group>
        </Table.Td>
      </Table.Tr>
    ));

    return (
      <Stack>
         {Object.keys(typeConflicts).length > 0 && (
           <Alert title="Potential Scheduling Conflicts Detected" color="red" icon={<IconAlertTriangle />} variant="light" mt="md">
              <Text size="sm">The following resources appear to be scheduled for overlapping times:</Text>
              <List size="xs" mt="xs">
                {Object.entries(typeConflicts).map(([key, items]) => (
                  <List.Item key={key}>
                     <strong>{items[0]?.resourceName || 'Unknown Resource'}:</strong> Tasks "{items.map(i => i.task).join('" & "')}" have overlapping dates.
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
            <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={5}><Text c="dimmed" ta="center">No allocations scheduled.</Text></Table.Td></Table.Tr>}</Table.Tbody>
            </Table>
          <Button mt="md" style={{ alignSelf: 'flex-start' }} onClick={handleAddTaskClick}>Schedule New Task</Button>
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

      <AllocationForm
        opened={formModalOpened}
        onClose={() => setFormModalOpened(false)}
        onSubmit={handleSaveAllocation}
        initialValues={currentAllocation}
        title={modalTitle}
        defaultType={activeTab as AllocationEntry['resourceType'] | undefined}
      />

    </Container>
  );
} 