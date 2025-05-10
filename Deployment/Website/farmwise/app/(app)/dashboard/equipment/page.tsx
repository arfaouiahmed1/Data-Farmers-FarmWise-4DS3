'use client';
import React, { useState, useEffect } from 'react';
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
  LoadingOverlay
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconTractor, IconPlus, IconPencil, IconTrash, IconDotsVertical, IconTool, IconCalendarEvent, IconCircleCheck, IconCircleX, IconEngineOff } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import equipmentService, { Equipment } from '@/app/api/equipment';

// Helper to get status badge color and icon
const getStatusProps = (status: Equipment['status']) => {
  switch (status) {
    case 'Operational':
      return { color: 'green', icon: <IconCircleCheck size={14} /> };
    case 'Maintenance Needed':
      return { color: 'orange', icon: <IconTool size={14} /> };
    case 'Out of Service':
      return { color: 'red', icon: <IconEngineOff size={14} /> };
    default:
      return { color: 'gray', icon: <IconCircleX size={14} /> };
  }
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [opened, setOpened] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);

  const form = useForm<Omit<Equipment, 'id' | 'farmer' | 'created_at' | 'updated_at'>>({
    initialValues: {
      name: '',
      type: '',
      purchaseDate: null,
      status: 'Operational', // Default status
      nextMaintenance: null,
      notes: '',
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Equipment name is required'),
      type: (value) => (value ? null : 'Equipment type is required'),
      // Add more specific validation if needed
    },
  });

  // Fetch equipment data on component mount
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const data = await equipmentService.getEquipment();
        setEquipment(data);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load equipment data',
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
    form.setValues({
      name: item.name,
      type: item.type,
      purchaseDate: item.purchaseDate || null,
      status: item.status,
      nextMaintenance: item.nextMaintenance || null,
      notes: item.notes || '',
    });
    setOpened(true);
  };

  const handleDeleteItem = async (id: string) => {
    try {
      setLoading(true);
      const success = await equipmentService.deleteEquipment(id);
      
      if (success) {
        setEquipment((current) => current.filter((item) => item.id !== id));
        notifications.show({
          title: 'Success',
          message: 'Equipment deleted successfully',
          color: 'green',
        });
      } else {
        throw new Error('Failed to delete equipment');
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete equipment',
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
      
      if (editingItem) {
        // Update existing equipment
        updatedEquipment = await equipmentService.updateEquipment(editingItem.id!, values);
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
        updatedEquipment = await equipmentService.addEquipment(values);
        setEquipment((current) => [...current, updatedEquipment]);
        notifications.show({
          title: 'Success',
          message: 'Equipment added successfully',
          color: 'green',
        });
      }
      
      setOpened(false);
    } catch (error) {
      console.error('Error saving equipment:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save equipment',
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
            placeholder="Select or type equipment type"
            data={['Tractor', 'Harvester', 'Seeder', 'Sprayer', 'Trailer', 'Tillage', 'Other']} // Example types
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
              {...form.getInputProps('purchaseDate')}
            />
            <DatePickerInput
              label="Next Maintenance Date"
              placeholder="Select date"
              valueFormat="YYYY-MM-DD"
              {...form.getInputProps('nextMaintenance')}
            />
          </Group>
          <Select
            label="Status"
            placeholder="Select status"
            data={['Operational', 'Maintenance Needed', 'Out of Service']}
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