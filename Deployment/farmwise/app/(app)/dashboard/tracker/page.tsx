'use client';
import React, { useState, useRef } from 'react';
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
  Textarea,
  ActionIcon,
  rem,
  FileButton,
  Image,
  Timeline,
  ScrollArea,
  Badge,
  useMantineTheme,
  Menu
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconListDetails, IconPlus, IconPencil, IconTrash, IconCalendarEvent, IconCategory, IconNote, IconPhoto, IconMapPin, IconPlant, IconTrowel, IconSpray, IconActivity } from '@tabler/icons-react';
import dayjs from 'dayjs'; // Ensure dayjs is installed

// Log entry data structure
interface LogEntry {
  id: string;
  date: Date;
  type: 'Planting' | 'Harvesting' | 'Treatment' | 'Observation' | 'Maintenance' | 'Other';
  description: string;
  field?: string; // Optional field/area association
  notes?: string;
  imageUrl?: string | null; // Changed to allow null
}

// Sample log data
const sampleLogs: LogEntry[] = [
  { id: 'log-1', date: new Date(2024, 4, 23, 9, 0), type: 'Planting', description: 'Planted corn seeds', field: 'Field B', notes: 'Used new seeder attachment.' },
  { id: 'log-2', date: new Date(2024, 4, 22, 14, 30), type: 'Observation', description: 'Noticed signs of aphids', field: 'Field A', notes: 'Low density, monitor closely.' },
  { id: 'log-3', date: new Date(2024, 4, 22, 10, 15), type: 'Treatment', description: 'Applied fungicide', field: 'Field C', notes: 'Preventative measure for blight.' },
  { id: 'log-4', date: new Date(2024, 4, 21, 8, 0), type: 'Maintenance', description: 'Changed oil on Tractor JD8R', field: 'Workshop' },
  { id: 'log-5', date: new Date(2024, 4, 20, 11, 0), type: 'Harvesting', description: 'Harvested early strawberries', field: 'Greenhouse 1', notes: 'Yield slightly lower than expected.' },
];

// Helper to get icon based on log type
const getLogIcon = (type: LogEntry['type']) => {
  switch (type) {
    case 'Planting': return <IconPlant size={16} />;
    case 'Harvesting': return <IconTrowel size={16} />;
    case 'Treatment': return <IconSpray size={16} />;
    case 'Maintenance': return <IconNote size={16} />; // Placeholder, replace if better icon exists
    case 'Observation': return <IconActivity size={16} />;
    default: return <IconListDetails size={16} />;
  }
};

const logTypeColors: Record<LogEntry['type'], string> = {
  Planting: 'green',
  Harvesting: 'orange',
  Treatment: 'blue',
  Observation: 'violet',
  Maintenance: 'gray',
  Other: 'dark'
};

export default function TrackerPage() {
  const theme = useMantineTheme();
  const [logs, setLogs] = useState<LogEntry[]>(sampleLogs.sort((a, b) => b.date.getTime() - a.date.getTime()));
  const [opened, setOpened] = useState(false);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [logImage, setLogImage] = useState<File | null>(null);
  const [logImageUrl, setLogImageUrl] = useState<string | null>(null);
  const resetFileRef = useRef<() => void>(null);

  const form = useForm<Omit<LogEntry, 'id' | 'imageUrl'>>({
    initialValues: {
      date: new Date(),
      type: 'Observation',
      description: '',
      field: '',
      notes: '',
    },
    validate: {
      date: (value) => (value ? null : 'Date is required'),
      type: (value) => (value ? null : 'Log type is required'),
      description: (value) => (value.trim().length > 0 ? null : 'Description is required'),
    },
  });

  const handleAddLog = () => {
    setEditingLog(null);
    form.reset();
    form.setFieldValue('date', new Date()); // Reset date to now
    setLogImage(null);
    setLogImageUrl(null);
    resetFileRef.current?.();
    setOpened(true);
  };

  const handleEditLog = (log: LogEntry) => {
    setEditingLog(log);
    form.setValues({
      date: new Date(log.date),
      type: log.type,
      description: log.description,
      field: log.field || '',
      notes: log.notes || '',
    });
    setLogImage(null); // Reset image input on edit
    setLogImageUrl(log.imageUrl || null); // Show existing image if available
    resetFileRef.current?.();
    setOpened(true);
  };

  const handleDeleteLog = (id: string) => {
    // Add confirmation
    setLogs((current) => current.filter((log) => log.id !== id));
  };

  const handleImageUpload = (file: File | null) => {
    if (file) {
      setLogImage(file);
      const imageUrl = URL.createObjectURL(file);
      setLogImageUrl(imageUrl);
    } else {
      setLogImage(null);
      setLogImageUrl(null);
    }
  };

  const handleSubmit = form.onSubmit((values) => {
    // In a real app, upload image file if logImage exists, get the URL, then save
    const newLogEntry: LogEntry = {
      ...values,
      id: editingLog ? editingLog.id : Math.random().toString(36).substring(7),
      imageUrl: logImageUrl, // Now compatible with LogEntry['imageUrl']
    };

    if (editingLog) {
      setLogs((current) =>
        current.map((log) => (log.id === editingLog.id ? newLogEntry : log))
      );
    } else {
      setLogs((current) => [newLogEntry, ...current]); // Add to beginning
    }
    // Sort logs again after adding/editing
    setLogs((current) => [...current].sort((a, b) => b.date.getTime() - a.date.getTime()));
    setOpened(false);
  });

  const logsTodayCount = logs.filter(log => dayjs(log.date).isSame(dayjs(), 'day')).length;
  const logsThisWeekCount = logs.filter(log => dayjs(log.date).isSame(dayjs(), 'week')).length;

  return (
    <Container fluid>
      <Group justify="space-between" mb="lg">
        <Title order={2}>
           <IconListDetails size={28} style={{ marginRight: '8px', verticalAlign: 'bottom' }} />
          Farm Log & Tracker
        </Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleAddLog}>
          Add Log Entry
        </Button>
      </Group>
      <Text c="dimmed" mb="xl">
        Record and view daily activities, observations, and important events on the farm.
      </Text>

      {/* Summary Stats */}
       <SimpleGrid cols={{ base: 1, sm: 2 }} mb="xl">
         <Paper withBorder p="md" radius="md" shadow="sm">
            <Group>
                <IconListDetails size={24} />
                <Text size="xl" fw={700}>{logsTodayCount}</Text>
            </Group>
           <Text size="sm" c="dimmed">Logs Added Today</Text>
         </Paper>
         <Paper withBorder p="md" radius="md" shadow="sm">
            <Group>
                <IconCalendarEvent size={24} />
                <Text size="xl" fw={700}>{logsThisWeekCount}</Text>
            </Group>
           <Text size="sm" c="dimmed">Logs This Week</Text>
         </Paper>
       </SimpleGrid>

      {/* Log Timeline/List */}
      <Paper withBorder p="xl" radius="md" shadow="sm">
         <Title order={4} mb="lg">Activity Feed</Title>
        {logs.length > 0 ? (
           <ScrollArea h={500}> {/* Adjust height as needed */} 
             <Timeline active={logs.length} bulletSize={24} lineWidth={2} color="gray">
              {logs.map((log, index) => (
                <Timeline.Item
                  key={log.id}
                  bullet={getLogIcon(log.type)}
                  title={
                    <Group justify="space-between" align="flex-start">
                      <Text size="sm" fw={500}>{log.description}</Text>
                       <Group gap="xs">
                         <Text size="xs" c="dimmed">{dayjs(log.date).format('MMM D, YYYY h:mm A')}</Text>
                         <Menu shadow="md" width={150} position="bottom-end">
                            <Menu.Target>
                               <ActionIcon variant="subtle" size="xs" color="gray">
                                   <IconPencil size={14} />
                               </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                               <Menu.Item onClick={() => handleEditLog(log)}>
                                 Edit
                               </Menu.Item>
                               <Menu.Item color="red" onClick={() => handleDeleteLog(log.id)}>
                                 Delete
                               </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                       </Group>
                    </Group>
                  }
                  color={logTypeColors[log.type] || 'gray'}
                >
                  <Group align="center" gap="sm" mb={4}>
                    <Badge variant="light" size="xs" color={logTypeColors[log.type] || 'gray'}>
                        {log.type}
                    </Badge>
                    {log.field && (
                         <Group gap={4} align="center">
                             <IconMapPin size={14} style={{ opacity: 0.7 }}/>
                             <Text size="xs" c="dimmed">{log.field}</Text>
                         </Group>
                    )}
                  </Group>
                  {log.notes && <Text c="dimmed" size="xs" mb={log.imageUrl ? 'xs' : 0}>{log.notes}</Text>}
                  {log.imageUrl && (
                    <Image
                      radius="sm"
                      src={log.imageUrl}
                      alt={`Image for log: ${log.description}`}
                      h={100}
                      w="auto"
                      fit="contain"
                      mt="xs"
                    />
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
           </ScrollArea>
        ) : (
          <Text c="dimmed" ta="center" p="lg">No log entries found. Click "Add Log Entry" to get started.</Text>
        )}
      </Paper>

      {/* Add/Edit Log Modal */}
      <Modal opened={opened} onClose={() => setOpened(false)} title={editingLog ? 'Edit Log Entry' : 'Add New Log Entry'} centered size="lg">
        <form onSubmit={handleSubmit}>
          <Group grow mb="md">
            <DatePickerInput
              label="Date & Time"
              placeholder="Select date and time"
              required
              valueFormat="YYYY-MM-DD HH:mm"
              {...form.getInputProps('date')}
            />
            <Select
              label="Log Type"
              placeholder="Select type"
              data={['Planting', 'Harvesting', 'Treatment', 'Observation', 'Maintenance', 'Other']}
              required
              {...form.getInputProps('type')}
            />
          </Group>
          <TextInput
            label="Description"
            placeholder="e.g., Irrigated Field A, Observed pest activity"
            required
            {...form.getInputProps('description')}
            mb="md"
          />
          <TextInput
            label="Field/Area (Optional)"
            placeholder="e.g., Field A, Greenhouse 2"
            {...form.getInputProps('field')}
            mb="md"
          />
          <Textarea
            label="Notes (Optional)"
            placeholder="Add extra details..."
            {...form.getInputProps('notes')}
            mb="md"
            autosize
            minRows={2}
          />

           <Group mb="xl">
             <FileButton resetRef={resetFileRef} onChange={handleImageUpload} accept="image/png,image/jpeg">
               {(props) => <Button {...props} variant="outline" leftSection={<IconPhoto size={14}/>}>Upload Image</Button>}
             </FileButton>
             {logImageUrl && (
                <Group align="center" gap="xs">
                    <Image src={logImageUrl} alt="Preview" w={50} h={50} fit="cover" radius="sm" />
                    <ActionIcon variant="subtle" color="red" onClick={() => handleImageUpload(null)} title="Remove image">
                         <IconTrash size={16} />
                    </ActionIcon>
                </Group>
             )}
            {!logImageUrl && logImage && <Text size="sm">{logImage.name}</Text>}
           </Group>

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingLog ? 'Save Changes' : 'Add Entry'}</Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
} 