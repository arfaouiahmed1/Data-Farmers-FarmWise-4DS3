'use client';
import React, { useState, useEffect } from 'react';
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
  LoadingOverlay,
  Notification,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconBuildingWarehouse, IconPlus, IconPencil, IconTrash, IconPackage, IconAlertTriangle, IconCategory, IconX } from '@tabler/icons-react';
import inventoryService, { InventoryItem, CategoryUnits } from '../../../api/inventory';

// Define inventory categories based on backend requirements - must match Django choices exactly
const INVENTORY_CATEGORIES = ['Seeds', 'Fertilizers', 'Pesticides', 'Fuel', 'Parts', 'Tools'];

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [opened, setOpened] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryUnits, setCategoryUnits] = useState<CategoryUnits | null>(null);
  const [availableUnits, setAvailableUnits] = useState<{ value: string; label: string }[]>([]);

  // Form with proper field names matching the backend
  const form = useForm<Omit<InventoryItem, 'id' | 'farmer' | 'created_at' | 'updated_at' | 'is_low_stock'>>({
    initialValues: {
      name: '',
      category: '',
      quantity: 0,
      unit: '',
      low_stock_threshold: 0,
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Item name is required'),
      category: (value) => (categoryUnits?.categories[value] ? null : 'Please select a valid category'),
      quantity: (value) => (value >= 0 ? null : 'Quantity cannot be negative'),
      unit: (value) => (value.trim().length > 0 ? null : 'Unit is required'),
      low_stock_threshold: (value) => (value >= 0 ? null : 'Threshold cannot be negative'),
    },
    transformValues: (values) => ({
      ...values,
      // Ensure quantity and low_stock_threshold are proper numbers
      quantity: Number(values.quantity),
      low_stock_threshold: Number(values.low_stock_threshold),
    }),
  });

  // Watch for category changes to update available units
  useEffect(() => {
    const category = form.values.category;
    if (category && categoryUnits?.category_units[category]) {
      const units = categoryUnits.category_units[category].map(([value, label]) => ({
        value, 
        label
      }));
      setAvailableUnits(units);
      
      // Set default unit if available
      if (units.length > 0 && !form.values.unit) {
        form.setFieldValue('unit', units[0].value);
      }
    } else {
      setAvailableUnits([]);
    }
  }, [form.values.category, categoryUnits]);

  // Fetch inventory items and category units on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch both inventory items and category units concurrently
        const [items, units] = await Promise.all([
          inventoryService.getInventoryItems(),
          inventoryService.getCategoryUnits()
        ]);
        setInventory(items);
        setCategoryUnits(units);
      } catch (err: any) {
        console.error('Failed to load data:', err);
        // Display more specific error message
        const errorMessage = err.response?.data?.detail || 
                             err.response?.data?.error || 
                             err.message || 
                             'Failed to load inventory data. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
      low_stock_threshold: item.low_stock_threshold,
    });
    setOpened(true);
  };

  const handleDeleteItem = async (id: string | undefined) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const success = await inventoryService.deleteInventoryItem(id);
      if (success) {
        setInventory((current) => current.filter((item) => item.id !== id));
      } else {
        setError('Failed to delete item. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Error deleting item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = form.onSubmit(async (values) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Submitting inventory item:', values);
      
      if (editingItem && editingItem.id) {
        // Update existing item
        const updatedItem = await inventoryService.updateInventoryItem(editingItem.id, values);
        setInventory((current) =>
          current.map((item) => (item.id === editingItem.id ? updatedItem : item))
        );
        setOpened(false);
      } else {
        // Add new item
        const newItem = await inventoryService.addInventoryItem(values);
        setInventory((current) => [...current, newItem]);
        setOpened(false);
      }
    } catch (err: any) {
      console.error('Error saving inventory item:', err);
      // Log detailed error information
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
      }
      
      // Display more specific error message
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.error ||
                          (typeof err.response?.data === 'object' ? JSON.stringify(err.response.data) : err.response?.data) ||
                          err.message || 
                          'Failed to save inventory item. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  });

  const lowStockCount = inventory.filter(item => item.is_low_stock).length;
  const totalItems = inventory.length;
  const categories = Array.from(new Set(inventory.map(item => item.category))).length;

  // Prepare category options for Select component
  const categoryOptions = categoryUnits 
    ? Object.entries(categoryUnits.categories).map(([value, label]) => ({ value, label }))
    : [];

  const rows = inventory.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>{item.name}</Table.Td>
      <Table.Td>{item.category}</Table.Td>
      <Table.Td>
        {item.is_low_stock ? (
           <Badge color="red" leftSection={<IconAlertTriangle size={14} />} variant="light">
             {item.quantity}
           </Badge>
        ) : (
          item.quantity
        )}
      </Table.Td>
      <Table.Td>{item.unit}</Table.Td>
      <Table.Td>{item.low_stock_threshold}</Table.Td>
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
      {error && (
        <Notification
          title="Error"
          color="red"
          onClose={() => setError(null)}
          mb="md"
          withCloseButton
          icon={<IconX size={18} />}
        >
          {error}
        </Notification>
      )}

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
      <Paper withBorder p="xl" radius="md" shadow="sm" pos="relative">
        <LoadingOverlay visible={loading} zIndex={1000} />
        {inventory.length > 0 ? (
          <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Unit</Table.Th>
                <Table.Th>Low Stock Threshold</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        ) : !loading ? (
          <Text ta="center" py="xl" c="dimmed">
            No inventory items found. Click "Add Item" to create your first inventory item.
          </Text>
        ) : null}
      </Paper>

      {/* Add/Edit Modal */}
      <Modal opened={opened} onClose={() => setOpened(false)} title={editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}>
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Item Name"
            placeholder="Enter item name"
            withAsterisk
            {...form.getInputProps('name')}
            mb="md"
          />
          
          <Select
            label="Category"
            placeholder="Select a category"
            withAsterisk
            data={categoryOptions}
            searchable
            allowDeselect={false}
            comboboxProps={{ withinPortal: true }}
            {...form.getInputProps('category')}
            mb="md"
          />
          
          <NumberInput
            label="Quantity"
            placeholder="Enter quantity"
            withAsterisk
            min={0}
            {...form.getInputProps('quantity')}
            mb="md"
          />
          
          <Select
            label="Unit"
            placeholder="Select a unit"
            withAsterisk
            data={availableUnits}
            disabled={!form.values.category || availableUnits.length === 0}
            allowDeselect={false}
            comboboxProps={{ withinPortal: true }}
            {...form.getInputProps('unit')}
            mb="md"
          />
          
          <NumberInput
            label="Low Stock Threshold"
            description="You'll be alerted when quantity drops below this value"
            placeholder="Enter threshold"
            withAsterisk
            min={0}
            {...form.getInputProps('low_stock_threshold')}
            mb="md"
          />
          
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
} 