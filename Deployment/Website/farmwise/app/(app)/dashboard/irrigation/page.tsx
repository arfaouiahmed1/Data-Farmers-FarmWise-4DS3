'use client';
import React, { useState } from 'react';
import {
  Title,
  Text,
  Container,
  Paper,
  Button,
  Group,
  Modal,
  TextInput,
  Select,
  SimpleGrid,
  Card,
  Badge,
  ActionIcon,
  Menu,
  rem,
  Progress,
  RingProgress,
  Table,
  Switch,
  NumberInput,
  MultiSelect,
  Box,
  Stack,
} from '@mantine/core';
import { TimeInput, DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { 
    IconDroplet, 
    IconPlus, 
    IconPencil, 
    IconTrash, 
    IconClockHour4, 
    IconCalendarEvent, 
    IconRepeat, 
    IconPlayerPlay, 
    IconPlayerStop, 
    IconCircleCheck, 
    IconAlertTriangle, 
    IconChartAreaLine, 
    IconCheck, 
    IconX,
    IconSettings
} from '@tabler/icons-react';
import { LineChart } from '@mantine/charts';
import dayjs from 'dayjs';

// --- Data Structures ---
interface IrrigationZone {
  id: string;
  name: string;
  currentMoisture: number; // Percentage 0-100
  targetMoisture: number;
  status: 'Idle' | 'Running' | 'Scheduled';
  lastIrrigated: Date | null;
}

interface IrrigationSchedule {
  id: string;
  zoneIds: string[];
  startTime: string; // HH:mm format
  durationMinutes: number;
  frequency: 'Daily' | 'Every 2 Days' | 'Weekly' | 'Custom';
  // customDays?: string[]; // For custom frequency
  enabled: boolean;
}

// --- Sample Data ---
const sampleZones: IrrigationZone[] = [
  { id: 'zone-a', name: 'Field A (North)', currentMoisture: 65, targetMoisture: 70, status: 'Idle', lastIrrigated: new Date(2024, 4, 23, 6, 0) },
  { id: 'zone-b', name: 'Field B (West)', currentMoisture: 45, targetMoisture: 60, status: 'Scheduled', lastIrrigated: new Date(2024, 4, 22, 18, 0) },
  { id: 'zone-c', name: 'Greenhouse 1', currentMoisture: 75, targetMoisture: 70, status: 'Idle', lastIrrigated: new Date(2024, 4, 23, 8, 0) },
  { id: 'zone-d', name: 'Orchard Row 3', currentMoisture: 55, targetMoisture: 65, status: 'Running', lastIrrigated: new Date(2024, 4, 21, 12, 0) },
  { id: 'zone-e', name: 'Field A (South)', currentMoisture: 35, targetMoisture: 70, status: 'Idle', lastIrrigated: new Date(2024, 4, 22, 6, 0) },
];

const sampleSchedules: IrrigationSchedule[] = [
  { id: 'sched-1', zoneIds: ['zone-b', 'zone-e'], startTime: '05:00', durationMinutes: 45, frequency: 'Daily', enabled: true },
  { id: 'sched-2', zoneIds: ['zone-a', 'zone-c'], startTime: '19:00', durationMinutes: 30, frequency: 'Every 2 Days', enabled: true },
  { id: 'sched-3', zoneIds: ['zone-d'], startTime: '10:00', durationMinutes: 60, frequency: 'Weekly', enabled: false },
];

const waterUsageData = [
  { date: 'May 18', usage: 1200 },
  { date: 'May 19', usage: 1500 },
  { date: 'May 20', usage: 1350 },
  { date: 'May 21', usage: 1600 },
  { date: 'May 22', usage: 1450 },
  { date: 'May 23', usage: 1700 },
  { date: 'May 24', usage: 1550 },
];

// --- Helper Functions ---
const getMoistureColor = (moisture: number, target: number): string => {
  if (moisture < target * 0.6) return 'red';
  if (moisture < target * 0.9) return 'orange';
  if (moisture <= target * 1.1) return 'green';
  return 'blue'; // Over-watered?
};

const getStatusBadge = (status: IrrigationZone['status']): React.ReactElement => {
    switch (status) {
        case 'Idle': return <Badge color="gray">Idle</Badge>;
        case 'Running': return <Badge color="blue" leftSection={<IconPlayerPlay size={12}/>}>Running</Badge>;
        case 'Scheduled': return <Badge color="cyan" leftSection={<IconClockHour4 size={12}/>}>Scheduled</Badge>;
        default: return <Badge color="gray">Unknown</Badge>;
    }
};

export default function IrrigationPage() {
  const [zones, setZones] = useState<IrrigationZone[]>(sampleZones);
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>(sampleSchedules);
  const [scheduleModalOpened, setScheduleModalOpened] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<IrrigationSchedule | null>(null);

  const scheduleForm = useForm<Omit<IrrigationSchedule, 'id'>>({
    initialValues: {
      zoneIds: [],
      startTime: '06:00',
      durationMinutes: 30,
      frequency: 'Daily',
      enabled: true,
    },
    validate: {
      zoneIds: (value) => (value.length > 0 ? null : 'Select at least one zone'),
      startTime: (value) => (/^([01]\d|2[0-3]):([0-5]\d)$/.test(value) ? null : 'Invalid time format (HH:MM)'),
      durationMinutes: (value) => (value > 0 ? null : 'Duration must be positive'),
    },
  });

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    scheduleForm.reset();
    setScheduleModalOpened(true);
  };

  const handleEditSchedule = (schedule: IrrigationSchedule) => {
    setEditingSchedule(schedule);
    scheduleForm.setValues({
        zoneIds: schedule.zoneIds,
        startTime: schedule.startTime,
        durationMinutes: schedule.durationMinutes,
        frequency: schedule.frequency,
        enabled: schedule.enabled,
    });
    setScheduleModalOpened(true);
  };

  const handleDeleteSchedule = (id: string) => {
    // Add confirmation
    setSchedules((current) => current.filter((s) => s.id !== id));
  };

  const handleScheduleSubmit = scheduleForm.onSubmit((values) => {
    if (editingSchedule) {
      setSchedules((current) =>
        current.map((s) => (s.id === editingSchedule.id ? { ...s, ...values } : s))
      );
    } else {
      setSchedules((current) => [
        ...current,
        { ...values, id: Math.random().toString(36).substring(7) },
      ]);
    }
    setScheduleModalOpened(false);
  });

  const toggleZoneStatus = (zoneId: string) => {
    setZones((currentZones) =>
      currentZones.map((zone) => {
        if (zone.id === zoneId) {
          const newStatus = zone.status === 'Running' ? 'Idle' : 'Running';
          return { ...zone, status: newStatus };
        }
        return zone;
      })
    );
    // Add logic here to actually send command to irrigation system
  };

  const toggleScheduleEnabled = (scheduleId: string, checked: boolean) => {
     setSchedules((current) =>
        current.map((s) => (s.id === scheduleId ? { ...s, enabled: checked } : s))
      );
      // Add logic to update backend/system
  };

  // Calculate Stats
  const zonesRunning = zones.filter(z => z.status === 'Running').length;
  const zonesNeedWater = zones.filter(z => z.currentMoisture < z.targetMoisture * 0.8).length;
  const totalWaterUsage = waterUsageData.reduce((sum, day) => sum + day.usage, 0) / 1000; // Example: Liters to m³

  const zoneOptions = zones.map(z => ({ label: z.name, value: z.id }));

  // --- Render Logic ---
  const zoneCards = zones.map((zone) => {
    const moistureColor = getMoistureColor(zone.currentMoisture, zone.targetMoisture);
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder key={zone.id}>
        <Group justify="space-between" mb="xs">
          <Text fw={500}>{zone.name}</Text>
          {getStatusBadge(zone.status)}
        </Group>

        <Text size="sm" c="dimmed" mb="md">
             Target Moisture: {zone.targetMoisture}%
        </Text>
        
        <Group grow align="flex-start" mb="lg" preventGrowOverflow={false} wrap="nowrap">
            <Box style={{ flexBasis: '80px', flexGrow: 0 }}>
                <RingProgress
                    size={80}
                    thickness={8}
                    roundCaps
                    sections={[{ value: zone.currentMoisture, color: moistureColor }]}
                    label={
                        <Text c={moistureColor} fw={700} ta="center" size="lg">
                        {zone.currentMoisture}%
                        </Text>
                    }
                />
            </Box>
            <Stack gap="xs" justify="center" style={{ flexGrow: 1, minWidth: 0 }}>
                 <Text size="xs" c="dimmed" mt={4}>
                    Last Irrigated: {zone.lastIrrigated ? dayjs(zone.lastIrrigated).format('MMM D, h:mm A') : 'N/A'}
                 </Text>
                 {zone.currentMoisture < zone.targetMoisture * 0.8 && (
                    <Badge 
                        color="orange" 
                        variant='light' 
                        size="sm" 
                        leftSection={<IconAlertTriangle size={12} />}
                        style={{ alignSelf: 'flex-start' }}
                    >
                        Low Moisture
                    </Badge>
                 )}
            </Stack>
        </Group>

        <Button
          fullWidth
          variant={zone.status === 'Running' ? 'filled' : 'outline'}
          color={zone.status === 'Running' ? 'red' : 'blue'}
          leftSection={zone.status === 'Running' ? <IconPlayerStop size={16} /> : <IconPlayerPlay size={16} />}
          onClick={() => toggleZoneStatus(zone.id)}
          mt="auto"
        >
          {zone.status === 'Running' ? 'Stop Now' : 'Start Now'}
        </Button>
      </Card>
    );
  });

  const scheduleRows = schedules.map((schedule) => (
    <Table.Tr key={schedule.id}>
      <Table.Td>
         <Switch 
            checked={schedule.enabled} 
            onChange={(event) => toggleScheduleEnabled(schedule.id, event.currentTarget.checked)}
            label={schedule.enabled ? "Enabled" : "Disabled"}
            size="sm"
         />
      </Table.Td>
      <Table.Td>{schedule.zoneIds.map(id => zones.find(z=>z.id === id)?.name || 'Unknown Zone').join(', ')}</Table.Td>
      <Table.Td>{schedule.startTime}</Table.Td>
      <Table.Td>{schedule.durationMinutes} min</Table.Td>
      <Table.Td>{schedule.frequency}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={() => handleEditSchedule(schedule)}>
             <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteSchedule(schedule.id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container fluid>
      <Title order={2} mb="lg">
         <IconDroplet size={28} style={{ marginRight: '8px', verticalAlign: 'bottom' }} />
        Irrigation Control
      </Title>
      <Text c="dimmed" mb="xl">
        Monitor soil moisture levels, manage irrigation schedules, and control your irrigation systems.
      </Text>

      {/* Overview Stats */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        <Paper withBorder p="md" radius="md" shadow="sm">
           <Group>
               <IconDroplet size={24} color='var(--mantine-color-blue-6)'/>
               <Text size="xl" fw={700}>{totalWaterUsage.toFixed(1)} m³</Text>
           </Group>
          <Text size="sm" c="dimmed">Est. Water Usage (Last 7 Days)</Text>
        </Paper>
        <Paper withBorder p="md" radius="md" shadow="sm">
           <Group>
               <IconPlayerPlay size={24} color={zonesRunning > 0 ? 'var(--mantine-color-blue-6)' : 'inherit'}/>
               <Text size="xl" fw={700} c={zonesRunning > 0 ? 'blue' : 'inherit'}>{zonesRunning}</Text>
           </Group>
           <Text size="sm" c="dimmed">Zones Currently Irrigating</Text>
        </Paper>
        <Paper withBorder p="md" radius="md" shadow="sm">
           <Group>
               <IconAlertTriangle size={24} color={zonesNeedWater > 0 ? 'var(--mantine-color-orange-6)' : 'inherit'}/>
               <Text size="xl" fw={700} c={zonesNeedWater > 0 ? 'orange' : 'inherit'}>{zonesNeedWater}</Text>
           </Group>
            <Text size="sm" c="dimmed">Zones Needing Water</Text>
        </Paper>
      </SimpleGrid>

       {/* Zone Status Grid */}
       <Title order={4} mb="md">Zone Status & Control</Title>
       <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mb="xl">
         {zoneCards}
       </SimpleGrid>

       {/* Irrigation Schedules Table */}
       <Paper withBorder p="lg" radius="md" shadow="sm" mb="xl">
         <Group justify="space-between" mb="md">
             <Title order={4}>Irrigation Schedules</Title>
             <Button size="xs" leftSection={<IconPlus size={14} />} onClick={handleAddSchedule}>
               Add Schedule
             </Button>
         </Group>
         {schedules.length > 0 ? (
           <Table striped highlightOnHover withTableBorder verticalSpacing="sm">
             <Table.Thead>
               <Table.Tr>
                 <Table.Th>Status</Table.Th>
                 <Table.Th>Zones</Table.Th>
                 <Table.Th>Start Time</Table.Th>
                 <Table.Th>Duration</Table.Th>
                 <Table.Th>Frequency</Table.Th>
                 <Table.Th>Actions</Table.Th>
               </Table.Tr>
             </Table.Thead>
             <Table.Tbody>{scheduleRows}</Table.Tbody>
           </Table>
         ) : (
            <Text c="dimmed" ta="center" p="lg">No irrigation schedules found. Click "Add Schedule" to create one.</Text>
         )}
       </Paper>
       
       {/* Water Usage Chart */} 
        <Paper withBorder p="lg" radius="md" shadow="sm" mb="xl">
             <Title order={4} mb="md">Water Usage Trend (Last 7 Days)</Title>
             <Box h={300}>
                <LineChart
                    h={300}
                    data={waterUsageData}
                    dataKey="date"
                    series={[{ name: 'usage', color: 'blue.6', label: 'Water Usage (Liters)' }]}
                    curveType="natural"
                    yAxisProps={{ domain: ['auto', 'auto'] }}
                    tooltipProps={{ content: ({ label, payload }) => 
                        <Paper px="md" py="sm" withBorder shadow="md" radius="md">
                            <Text fw={500} mb={5}>{label}</Text>
                            {payload?.map((item: any) => (
                            <Text key={item.name} c={item.color} fz="sm">
                                {item.name}: {item.value} Liters
                            </Text>
                            ))}
                        </Paper>
                    }}
                    />
            </Box>
        </Paper>

      {/* Add/Edit Schedule Modal */}
      <Modal opened={scheduleModalOpened} onClose={() => setScheduleModalOpened(false)} title={editingSchedule ? 'Edit Irrigation Schedule' : 'Add New Schedule'} centered size="lg">
        <form onSubmit={handleScheduleSubmit}>
           <MultiSelect
              label="Zones to Irrigate"
              placeholder="Select one or more zones"
              data={zoneOptions}
              required
              searchable
              {...scheduleForm.getInputProps('zoneIds')}
              mb="md"
            />
          <Group grow mb="md">
            <TimeInput
               label="Start Time (24h)"
               required
               leftSection={<IconClockHour4 size={16} />}
               {...scheduleForm.getInputProps('startTime')}
            />
            <NumberInput
              label="Duration (Minutes)"
              placeholder="e.g., 30"
              required
              min={1}
              step={5}
              {...scheduleForm.getInputProps('durationMinutes')}
            />
          </Group>
          <Select
            label="Frequency"
            placeholder="Select frequency"
            data={['Daily', 'Every 2 Days', 'Weekly']} // 'Custom' would need more UI
            required
            {...scheduleForm.getInputProps('frequency')}
            mb="md"
          />
          <Switch
            label="Enable Schedule"
            {...scheduleForm.getInputProps('enabled', { type: 'checkbox' })}
            mb="xl"
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setScheduleModalOpened(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingSchedule ? 'Save Changes' : 'Add Schedule'}</Button>
          </Group>
        </form>
      </Modal>

    </Container>
  );
} 