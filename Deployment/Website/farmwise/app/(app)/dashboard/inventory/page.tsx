'use client';
import React, { useState } from 'react';
import {
  Title,
  Text,
  Container,
  Paper,
  Table,
  Button,
  Group,
  Modal,
  TextInput,
  NumberInput,
  Select,
  SimpleGrid,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconBuildingWarehouse, IconPlus, IconPencil, IconTrash, IconPackage, IconAlertTriangle, IconCategory } from '@tabler/icons-react';

// Sample data structure - replace with actual data fetching
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
}

const sampleInventoryData: InventoryItem[] = [
  { id: '1', name: 'Corn Seed Bag (50kg)', category: 'Seeds', quantity: 15, unit: 'bags', lowStockThreshold: 5 },
  { id: '2', name: 'NPK Fertilizer (25kg)', category: 'Fertilizers', quantity: 40, unit: 'bags', lowStockThreshold: 10 },
  { id: '3', name: 'Roundup Herbicide (5L)', category: 'Pesticides', quantity: 8, unit: 'bottles', lowStockThreshold: 2 },
  { id: '4', name: 'Diesel Fuel', category: 'Fuel', quantity: 250, unit: 'liters', lowStockThreshold: 50 },
  { id: '5', name: 'Tractor Spare Filter', category: 'Parts', quantity: 3, unit: 'units', lowStockThreshold: 1 },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleInventoryData);
  const [opened, setOpened] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const form = useForm<Omit<InventoryItem, 'id'>>({
    initialValues: {
      name: '',
      category: '',
      quantity: 0,
      unit: '',
      lowStockThreshold: 0,
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Item name is required'),
      category: (value) => (value ? null : 'Category is required'),
      quantity: (value) => (value >= 0 ? null : 'Quantity cannot be negative'),
      unit: (value) => (value.trim().length > 0 ? null : 'Unit is required'),
      lowStockThreshold: (value) => (value >= 0 ? null : 'Threshold cannot be negative'),
    },
  });

  const handleAddItem = () => {
    setEditingItem(null);
    form.reset();
    setOpened(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    form.setValues({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      lowStockThreshold: item.lowStockThreshold,
    });
    setOpened(true);
  };

  const handleDeleteItem = (id: string) => {
    // Add confirmation logic here in a real app
    setInventory((current) => current.filter((item) => item.id !== id));
  };

  const handleSubmit = form.onSubmit((values) => {
    if (editingItem) {
      // Update existing item
      setInventory((current) =>
        current.map((item) =>
          item.id === editingItem.id ? { ...item, ...values } : item
        )
      );
    } else {
      // Add new item
      setInventory((current) => [
        ...current,
        { ...values, id: Math.random().toString(36).substring(7) }, // Simple unique ID generation
      ]);
    }
    setOpened(false);
  });

  const lowStockCount = inventory.filter(item => item.quantity <= item.lowStockThreshold).length;
  const totalItems = inventory.length;
  const categories = Array.from(new Set(inventory.map(item => item.category))).length;

  const rows = inventory.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>{item.name}</Table.Td>
      <Table.Td>{item.category}</Table.Td>
      <Table.Td>
        {item.quantity <= item.lowStockThreshold ? (
           <Badge color="red" leftSection={<IconAlertTriangle size={14} />} variant="light">
             {item.quantity}
           </Badge>
        ) : (
          item.quantity
        )}
      </Table.Td>
      <Table.Td>{item.unit}</Table.Td>
      <Table.Td>{item.lowStockThreshold}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button variant="subtle" size="xs" onClick={() => handleEditItem(item)}>
            <IconPencil size={16} />
          </Button>
          <Button variant="subtle" size="xs" color="red" onClick={() => handleDeleteItem(item.id)}>
            <IconTrash size={16} />
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container fluid>
      <Group justify="space-between" mb="lg">
        <Title order={2}>
         <IconBuildingWarehouse size={28} style={{ marginRight: '8px', verticalAlign: 'bottom' }} />
        Inventory Management
      </Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleAddItem}>
          Add Item
        </Button>
      </Group>
      <Text c="dimmed" mb="xl">
        Track stock levels of seeds, fertilizers, pesticides, and other farm supplies.
      </Text>

       {/* Summary Stats */}
       <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
         <Paper withBorder p="md" radius="md" shadow="sm">
            <Group>
                <IconPackage size={24} />
                <Text size="xl" fw={700}>{totalItems}</Text>
            </Group>
           <Text size="sm" c="dimmed">Total Items</Text>
         </Paper>
         <Paper withBorder p="md" radius="md" shadow="sm">
            <Group>
                <IconAlertTriangle size={24} color={lowStockCount > 0 ? 'var(--mantine-color-red-6)' : 'inherit'}/>
                <Text size="xl" fw={700} c={lowStockCount > 0 ? 'red' : 'inherit'}>{lowStockCount}</Text>
            </Group>
            <Text size="sm" c="dimmed">Items Low on Stock</Text>
         </Paper>
         <Paper withBorder p="md" radius="md" shadow="sm">
            <Group>
                <IconCategory size={24} />
                <Text size="xl" fw={700}>{categories}</Text>
            </Group>
            <Text size="sm" c="dimmed">Unique Categories</Text>
         </Paper>
       </SimpleGrid>

       {/* Inventory Table */}
       <Paper withBorder p="xl" radius="md" shadow="sm">
         {inventory.length > 0 ? (
           <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm">
             <Table.Thead>
               <Table.Tr>
                 <Table.Th>Item Name</Table.Th>
                 <Table.Th>Category</Table.Th>
                 <Table.Th>Quantity</Table.Th>
                 <Table.Th>Unit</Table.Th>
                 <Table.Th>Low Stock At</Table.Th>
                 <Table.Th>Actions</Table.Th>
               </Table.Tr>
             </Table.Thead>
             <Table.Tbody>{rows}</Table.Tbody>
           </Table>
         ) : (
            <Text c="dimmed" ta="center" p="lg">No inventory items found. Click "Add Item" to get started.</Text>
         )}
      </Paper>

       {/* Add/Edit Modal */}
      <Modal opened={opened} onClose={() => setOpened(false)} title={editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'} centered>
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Item Name"
            placeholder="e.g., Corn Seed Bag (50kg)"
            required
            {...form.getInputProps('name')}
            mb="md"
          />
          <Select
            label="Category"
            placeholder="Select or type category"
            data={['Seeds', 'Fertilizers', 'Pesticides', 'Fuel', 'Parts', 'Tools', 'Feed']} // Example categories
            required
            searchable
            {...form.getInputProps('category')}
             mb="md"
           />
          <Group grow mb="md">
            <NumberInput
              label="Quantity"
              placeholder="0"
              required
              min={0}
              {...form.getInputProps('quantity')}
            />
            <TextInput
              label="Unit"
              placeholder="e.g., bags, kg, liters, units"
              required
              {...form.getInputProps('unit')}
            />
          </Group>
           <NumberInput
             label="Low Stock Threshold"
             placeholder="e.g., 5"
             required
             min={0}
             {...form.getInputProps('lowStockThreshold')}
             mb="xl"
           />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingItem ? 'Save Changes' : 'Add Item'}</Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
} 