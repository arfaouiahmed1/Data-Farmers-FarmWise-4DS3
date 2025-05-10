'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
  Textarea,
  rem,
  LoadingOverlay,
  SegmentedControl,
  Input,
  Box,
  Flex,
  ThemeIcon,
  Divider,
  RingProgress,
  Tooltip,
  useMantineTheme,
  Grid,
  ScrollArea,
  ColorSwatch,
  Tabs,
  Progress
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { 
  IconTractor, 
  IconPlus, 
  IconPencil, 
  IconTrash, 
  IconDotsVertical, 
  IconTool, 
  IconCalendarEvent, 
  IconCircleCheck, 
  IconCircleX, 
  IconEngineOff,
  IconSearch,
  IconFilter,
  IconLayoutCards,
  IconLayoutList,
  IconSortAscending,
  IconSortDescending,
  IconAlertTriangle,
  IconChartPie,
  IconChevronDown,
  IconArrowsSort,
  IconCheck
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useLocalStorage } from '@mantine/hooks';
import equipmentService, { Equipment, EquipmentType, EquipmentStatus } from '@/app/api/equipment';

// Helper to get status badge color and icon
const getStatusProps = (status: EquipmentStatus) => {
  switch (status) {
    case 'Operational':
      return { color: 'teal', icon: <IconCircleCheck size={14} /> };
    case 'Maintenance Needed':
      return { color: 'orange', icon: <IconTool size={14} /> };
    case 'Out of Service':
      return { color: 'red', icon: <IconEngineOff size={14} /> };
    default:
      return { color: 'gray', icon: <IconCircleX size={14} /> };
  }
};

// Equipment type to color mapping
const typeColors: Record<EquipmentType, string> = {
  'Tractor': '#FF6B6B',
  'Harvester': '#4ECDC4',
  'Seeder': '#FFD166',
  'Sprayer': '#6A0572',
  'Trailer': '#F76E11',
  'Tillage': '#1A5D1A',
  'Other': '#5F7161'
};

// Helper for equipment type icon
const getTypeIcon = (type: EquipmentType) => {
  switch(type) {
    case 'Tractor': return <IconTractor size={18} />;
    case 'Harvester': return <IconTractor size={18} />;
    case 'Seeder': return <IconTool size={18} />;
    case 'Sprayer': return <IconTool size={18} />;
    case 'Trailer': return <IconTractor size={18} />;
    case 'Tillage': return <IconTool size={18} />;
    case 'Other': return <IconTool size={18} />;
  }
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [opened, setOpened] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);

  const EQUIPMENT_TYPES: EquipmentType[] = ['Tractor', 'Harvester', 'Seeder', 'Sprayer', 'Trailer', 'Tillage', 'Other'];
  const EQUIPMENT_STATUSES: EquipmentStatus[] = ['Operational', 'Maintenance Needed', 'Out of Service'];

  const form = useForm<Omit<Equipment, 'id' | 'farmer' | 'created_at' | 'updated_at'>>({
    initialValues: {
      name: '',
      type: 'Tractor',
      purchaseDate: null,
      status: 'Operational',
      nextMaintenance: null,
      notes: '',
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Equipment name is required'),
      type: (value) => (value ? null : 'Equipment type is required'),
    },
  });

  // Fetch equipment data on component mount
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const data = await equipmentService.getEquipment();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }
        
        // Check for maintenance dates that have passed and update UI accordingly
        const updatedData = data.map(item => {
          if (item.nextMaintenance && new Date(item.nextMaintenance) < new Date()) {
            return { ...item, status: 'Maintenance Needed' as EquipmentStatus };
          }
          return item;
        });
        
        setEquipment(updatedData);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load equipment data. Please try refreshing the page.',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const handleAddItem = () => {
    setEditingItem(null);
    form.reset();
    setOpened(true);
  };

  const handleEditItem = (item: Equipment) => {
    setEditingItem(item);
    
    // Parse date strings into proper Date objects for the date picker
    let purchaseDate = null;
    let nextMaintenance = null;
    
    // Safely parse the purchase date if it exists
    if (item.purchaseDate) {
      try {
        purchaseDate = new Date(item.purchaseDate);
        // Check if the date is valid
        if (isNaN(purchaseDate.getTime())) {
          purchaseDate = null;
        }
      } catch (e) {
        console.error("Error parsing purchase date:", e);
        purchaseDate = null;
      }
    }
    
    // Safely parse the next maintenance date if it exists
    if (item.nextMaintenance) {
      try {
        nextMaintenance = new Date(item.nextMaintenance);
        // Check if the date is valid
        if (isNaN(nextMaintenance.getTime())) {
          nextMaintenance = null;
        }
      } catch (e) {
        console.error("Error parsing next maintenance date:", e);
        nextMaintenance = null;
      }
    }
    
    form.setValues({
      name: item.name,
      type: item.type,
      purchaseDate: purchaseDate,
      status: item.status,
      nextMaintenance: nextMaintenance,
      notes: item.notes || '',
    });
    
    setOpened(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (!id) {
      notifications.show({
        title: 'Error',
        message: 'Invalid equipment ID',
        color: 'red',
      });
      return;
    }
    
    try {
      setLoading(true);
      await equipmentService.deleteEquipment(id);
      
      // If no error was thrown, deletion was successful
      setEquipment((current) => current.filter((item) => item.id !== id));
      notifications.show({
        title: 'Success',
        message: 'Equipment deleted successfully',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Error deleting equipment:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to delete equipment',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      setLoading(true);
      let updatedEquipment: Equipment;
      
      // Safely convert dates to ISO format without risking type errors
      let purchaseDate = null;
      let nextMaintenance = null;
      
      if (values.purchaseDate) {
        try {
          // Make sure we have a valid Date object
          const dateObj = values.purchaseDate instanceof Date 
            ? values.purchaseDate 
            : new Date(String(values.purchaseDate));
          
          if (!isNaN(dateObj.getTime())) {
            purchaseDate = dateObj.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Error formatting purchase date:', e);
        }
      }
      
      if (values.nextMaintenance) {
        try {
          // Make sure we have a valid Date object
          const dateObj = values.nextMaintenance instanceof Date 
            ? values.nextMaintenance 
            : new Date(String(values.nextMaintenance));
          
          if (!isNaN(dateObj.getTime())) {
            nextMaintenance = dateObj.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Error formatting maintenance date:', e);
        }
      }
      
      // Create form data with properly formatted dates
      const formData = {
        ...values,
        purchaseDate,
        nextMaintenance
      };
      
      console.log("Submitting form data:", formData);
      
      if (editingItem) {
        // Update existing equipment
        updatedEquipment = await equipmentService.updateEquipment(editingItem.id!, formData);
        
        // Check if update was successful (should have an id)
        if (!updatedEquipment || !updatedEquipment.id) {
          throw new Error('Failed to update equipment');
        }
        
        setEquipment((current) =>
          current.map((item) => (item.id === editingItem.id ? updatedEquipment : item))
        );
        notifications.show({
          title: 'Success',
          message: 'Equipment updated successfully',
          color: 'green',
        });
      } else {
        // Add new equipment
        updatedEquipment = await equipmentService.addEquipment(formData);
        
        // Check if creation was successful (should have an id)
        if (!updatedEquipment || !updatedEquipment.id) {
          throw new Error('Failed to create equipment');
        }
        
        setEquipment((current) => [...current, updatedEquipment]);
        notifications.show({
          title: 'Success',
          message: 'Equipment added successfully',
          color: 'green',
        });
      }
      
      setOpened(false);
    } catch (error: any) {
      console.error('Error saving equipment:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Failed to save equipment',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  });

  const totalEquipment = equipment.length;
  const maintenanceNeededCount = equipment.filter(e => e.status === 'Maintenance Needed').length;

  const equipmentCards = equipment.map((item) => {
    const statusProps = getStatusProps(item.status);
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder key={item.id}>
        <Group justify="space-between" mb="xs">
          <Text fw={500}>{item.name}</Text>
          <Menu shadow="md" width={200}>
             <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                   <IconDotsVertical style={{ width: rem(16), height: rem(16) }} />
                </ActionIcon>
             </Menu.Target>
             <Menu.Dropdown>
               <Menu.Item leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />} onClick={() => handleEditItem(item)}>
                 Edit
               </Menu.Item>
               <Menu.Item color="red" leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />} onClick={() => handleDeleteItem(item.id!)}>
                 Delete
               </Menu.Item>
             </Menu.Dropdown>
           </Menu>
        </Group>

        <Text size="sm" c="dimmed" mb="sm">
          Type: {item.type}
        </Text>

        <Badge
          color={statusProps.color}
          variant="light"
          leftSection={statusProps.icon}
          mb="sm"
        >
          {item.status}
        </Badge>

        <Group gap="xs" mb="xs">
           <IconCalendarEvent size={16} opacity={0.7} />
           <Text size="sm" c="dimmed">
             Purchased: {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'N/A'}
           </Text>
        </Group>
        <Group gap="xs">
           <IconTool size={16} opacity={0.7} />
           <Text size="sm" c="dimmed">
             Next Maintenance: {item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString() : 'N/A'}
           </Text>
        </Group>
         {item.notes && (
            <Text size="xs" c="dimmed" mt="sm" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-2)'}}>
                Notes: {item.notes}
            </Text>
         )}
      </Card>
    );
  });

  return (
    <Container fluid>
      <LoadingOverlay visible={loading} />
      <Group justify="space-between" mb="lg">
        <Title order={2}>
           <IconTractor size={28} style={{ marginRight: '8px', verticalAlign: 'bottom' }} />
          Equipment Management
        </Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleAddItem}>
          Add Equipment
        </Button>
      </Group>
      <Text c="dimmed" mb="xl">
        Track your farm equipment, manage maintenance schedules, and monitor operational status.
      </Text>

      {/* Summary Stats */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} mb="xl">
        <Paper withBorder p="md" radius="md" shadow="sm">
           <Group>
               <IconTractor size={24} />
               <Text size="xl" fw={700}>{totalEquipment}</Text>
           </Group>
          <Text size="sm" c="dimmed">Total Equipment</Text>
        </Paper>
        <Paper withBorder p="md" radius="md" shadow="sm">
           <Group>
               <IconTool size={24} color={maintenanceNeededCount > 0 ? 'var(--mantine-color-orange-6)' : 'inherit'}/>
               <Text size="xl" fw={700} c={maintenanceNeededCount > 0 ? 'orange' : 'inherit'}>{maintenanceNeededCount}</Text>
           </Group>
           <Text size="sm" c="dimmed">Needs Maintenance</Text>
        </Paper>
      </SimpleGrid>

      {/* Equipment Grid */}
      {equipment.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {equipmentCards}
        </SimpleGrid>
      ) : (
         <Paper withBorder p="xl" radius="md" shadow="sm">
            <Text c="dimmed" ta="center" p="lg">No equipment found. Click "Add Equipment" to get started.</Text>
         </Paper>
      )}

      {/* Add/Edit Modal */}
      <Modal opened={opened} onClose={() => setOpened(false)} title={editingItem ? 'Edit Equipment' : 'Add New Equipment'} centered size="lg">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Equipment Name"
            placeholder="e.g., John Deere 8R"
            required
            {...form.getInputProps('name')}
            mb="md"
          />
          <Select
            label="Equipment Type"
            placeholder="Select equipment type"
            data={EQUIPMENT_TYPES}
            required
            searchable
            {...form.getInputProps('type')}
            mb="md"
          />
          <Group grow mb="md">
            <DatePickerInput
              label="Purchase Date"
              placeholder="Select date"
              valueFormat="YYYY-MM-DD"
              clearable
              type="default"
              firstDayOfWeek={0}
              allowDeselect
              maxLevel="month"
              {...form.getInputProps('purchaseDate')}
            />
            <DatePickerInput
              label="Next Maintenance Date"
              placeholder="Select date"
              valueFormat="YYYY-MM-DD"
              clearable
              type="default"
              firstDayOfWeek={0}
              allowDeselect
              maxLevel="month"
              {...form.getInputProps('nextMaintenance')}
            />
          </Group>
          <Select
            label="Status"
            placeholder="Select status"
            data={EQUIPMENT_STATUSES}
            required
            {...form.getInputProps('status')}
            mb="md"
          />
          <Textarea
             label="Notes (Optional)"
             placeholder="Add any relevant notes, e.g., maintenance details, issues..."
             {...form.getInputProps('notes')}
             mb="xl"
             autosize
             minRows={2}
           />
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setOpened(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}