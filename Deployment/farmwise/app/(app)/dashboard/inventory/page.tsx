'use client';
import React, { useState, useEffect, useMemo } from 'react';
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
  ActionIcon,
  Tabs,
  Box,
  Card,
  Flex,
  Tooltip,
  ThemeIcon,
  Progress,
  Menu,
  rem,
  Chip,
  ScrollArea,
  useMantineTheme,
  RingProgress,
  SegmentedControl,
  Grid,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconBuildingWarehouse,
  IconPlus,
  IconPencil,
  IconTrash,
  IconPackage,
  IconAlertTriangle,
  IconCategory,
  IconX,
  IconSearch,
  IconAdjustments,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconChartPie,
  IconListCheck,
  IconBoxSeam,
  IconInfoCircle,
  IconSeeding,
  IconBottle,
  IconBolt,
  IconTool,
  IconEngine,
  IconDotsVertical,
  IconArrowsSort
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import inventoryService, { InventoryItem, CategoryUnits } from '../../../api/inventory';
import authService from '../../../api/auth';
import axios from 'axios';

// Define inventory categories based on backend requirements - must match Django choices exactly
const INVENTORY_CATEGORIES = ['Seeds', 'Fertilizers', 'Pesticides', 'Fuel', 'Parts', 'Tools'];

// Get icon for category
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Seeds':
      return <IconSeeding size={18} />;
    case 'Fertilizers':
      return <IconBottle size={18} />;
    case 'Pesticides':
      return <IconBolt size={18} />;
    case 'Fuel':
      return <IconEngine size={18} />;
    case 'Parts':
      return <IconBoxSeam size={18} />;
    case 'Tools':
      return <IconTool size={18} />;
    default:
      return <IconPackage size={18} />;
  }
};

// Get color for category
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Seeds':
      return '#4CAF50'; // Green
    case 'Fertilizers':
      return '#9C27B0'; // Purple
    case 'Pesticides':
      return '#F44336'; // Red
    case 'Fuel':
      return '#FF9800'; // Orange
    case 'Parts':
      return '#2196F3'; // Blue
    case 'Tools':
      return '#795548'; // Brown
    default:
      return '#607D8B'; // Blue Grey
  }
};

export default function InventoryPage() {
  const theme = useMantineTheme();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [opened, setOpened] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryUnits, setCategoryUnits] = useState<CategoryUnits | null>(null);
  const [availableUnits, setAvailableUnits] = useState<{ value: string; label: string }[]>([]);
  const [currentFarmerId, setCurrentFarmerId] = useState<number | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [stockFilter, setStockFilter] = useState<'all' | 'low'>('all');

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
      quantity: (value) => {
        const num = parseFloat(String(value));
        return !isNaN(num) && num >= 0 ? null : 'Quantity must be a positive number';
      },
      unit: (value) => (value.trim().length > 0 ? null : 'Unit is required'),
      low_stock_threshold: (value) => {
        const num = parseFloat(String(value));
        return !isNaN(num) && num >= 0 ? null : 'Threshold must be a positive number';
      },
    },
    transformValues: (values) => ({
      ...values,
      // Ensure quantity and low_stock_threshold are proper numbers with 2 decimal precision
      quantity: parseFloat(parseFloat(String(values.quantity)).toFixed(2)),
      low_stock_threshold: parseFloat(parseFloat(String(values.low_stock_threshold)).toFixed(2)),
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

  // Fetch user information and inventory data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get current user data from auth service
        const userData = authService.getCurrentUser();
        
        if (!userData) {
          console.error('No user data found');
          setError('You must be logged in to access inventory. Please log in and try again.');
          setLoading(false);
          return;
        }
        
        // Get farmer ID from user data
        // Assuming user profile contains farmer ID or user ID can be used as farmer ID
        const farmerId = userData.id;
        setCurrentFarmerId(farmerId);
        console.log('Using farmer ID:', farmerId);

        // Fetch both inventory items and category units concurrently
        const [items, units] = await Promise.all([
          inventoryService.getInventoryItems(),
          inventoryService.getCategoryUnits()
        ]);
        setInventory(items);
        setFilteredInventory(items);
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

  // Filter and sort inventory based on search, category, and sort options
  useEffect(() => {
    let result = [...inventory];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(item => item.category === selectedCategory);
    }

    // Apply stock level filter
    if (stockFilter === 'low') {
      result = result.filter(item => item.is_low_stock);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case 'name':
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          break;
        case 'category':
          compareA = a.category.toLowerCase();
          compareB = b.category.toLowerCase();
          break;
        case 'quantity':
          compareA = a.quantity;
          compareB = b.quantity;
          break;
        case 'threshold':
          compareA = a.low_stock_threshold;
          compareB = b.low_stock_threshold;
          break;
        default:
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });
    
    setFilteredInventory(result);
  }, [inventory, searchQuery, selectedCategory, sortBy, sortDirection, stockFilter]);

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
        notifications.show({
          title: 'Success',
          message: 'Item deleted successfully',
          color: 'green',
        });
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
    
    // Check if we have a farmer ID
    if (!currentFarmerId) {
      setError('Could not identify the farmer. Please ensure you are logged in.');
      setLoading(false);
      return;
    }

    // Add farmer ID to the payload
    const payload = {
      ...values,
      farmer: currentFarmerId
    };
    
    try {
      if (editingItem && editingItem.id) {
        // Update existing item
        const updatedItem = await inventoryService.updateInventoryItem(editingItem.id, payload);
        setInventory((current) =>
          current.map((item) => (item.id === editingItem.id ? updatedItem : item))
        );
        notifications.show({
          title: 'Success',
          message: 'Item updated successfully',
          color: 'green',
        });
        setOpened(false);
      } else {
        // Add new item
        const newItem = await inventoryService.addInventoryItem(payload);
        setInventory((current) => [...current, newItem]);
        notifications.show({
          title: 'Success',
          message: 'Item added successfully',
          color: 'green',
        });
        setOpened(false);
      }
    } catch (err: any) {
      console.error('Error saving inventory item:', err);
      
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

  // Stats calculation
  const totalItems = inventory.length;
  const lowStockCount = inventory.filter(item => item.is_low_stock).length;
  const categories = Array.from(new Set(inventory.map(item => item.category)));
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = inventory.filter(item => item.category === category).length;
    return acc;
  }, {} as {[key: string]: number});

  // Category breakdown for charts
  const categoryData = categories.map(category => ({
    name: category,
    count: categoryCounts[category],
    color: getCategoryColor(category),
  }));

  // Prepare category options for Select component
  const categoryOptions = categoryUnits 
    ? Object.entries(categoryUnits.categories).map(([value, label]) => ({ value, label }))
    : [];

  // Table rows
  const rows = filteredInventory.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td style={{ verticalAlign: 'middle' }}>
        <Group gap="xs">
          <ThemeIcon color={getCategoryColor(item.category)} variant="light" radius="xl" size="md">
            {getCategoryIcon(item.category)}
          </ThemeIcon>
          <Text fw={500}>{item.name}</Text>
        </Group>
      </Table.Td>
      <Table.Td style={{ verticalAlign: 'middle' }}>
        <Badge color={getCategoryColor(item.category)} variant="light">
          {item.category}
        </Badge>
      </Table.Td>
      <Table.Td style={{ verticalAlign: 'middle' }}>
        {item.is_low_stock ? (
          <Group gap={4}>
            <Tooltip label="Low Stock" position="top">
              <IconAlertTriangle size={16} color={theme.colors.red[6]} />
            </Tooltip>
            <Text c={item.is_low_stock ? "red" : "inherit"}>{item.quantity}</Text>
          </Group>
        ) : (
          <Text>{item.quantity}</Text>
        )}
      </Table.Td>
      <Table.Td style={{ verticalAlign: 'middle' }}>{item.unit}</Table.Td>
      <Table.Td style={{ verticalAlign: 'middle' }}>{item.low_stock_threshold}</Table.Td>
      <Table.Td style={{ verticalAlign: 'middle' }}>
        <Group gap={4}>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDotsVertical style={{ width: rem(16), height: rem(16) }} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item 
                leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />} 
                onClick={() => handleEditItem(item)}
              >
                Edit Item
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item 
                leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                color="red"
                onClick={() => handleDeleteItem(item.id)}
              >
                Delete Item
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  // Inventory cards
  const renderInventoryCards = () => {
    if (filteredInventory.length === 0) {
      return (
        <Paper withBorder p="xl" radius="md" shadow="sm">
          <Text ta="center" py="xl" c="dimmed">
            No inventory items found matching your search criteria.
          </Text>
        </Paper>
      );
    }

    return (
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
        {filteredInventory.map((item) => (
          <Card key={item.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section p="md" bg={`${getCategoryColor(item.category)}15`}>
              <Group justify="space-between">
                <Group>
                  <ThemeIcon color={getCategoryColor(item.category)} radius="xl" size="lg">
                    {getCategoryIcon(item.category)}
                  </ThemeIcon>
                  <Text fw={500} lineClamp={1} size="lg">{item.name}</Text>
                </Group>
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDotsVertical style={{ width: rem(16), height: rem(16) }} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item 
                      leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />} 
                      onClick={() => handleEditItem(item)}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item 
                      leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                      color="red"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Card.Section>
            
            <Box mt="md">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Category:</Text>
                <Badge color={getCategoryColor(item.category)} variant="light">
                  {item.category}
                </Badge>
              </Group>
              
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Quantity:</Text>
                <Group gap={4}>
                  {item.is_low_stock && (
                    <Tooltip label="Low Stock">
                      <IconAlertTriangle size={14} color={theme.colors.red[6]} />
                    </Tooltip>
                  )}
                  <Text fw={500} c={item.is_low_stock ? "red" : "inherit"}>
                    {item.quantity} {item.unit}
                  </Text>
                </Group>
              </Group>
              
              <Box mt="md">
                <Text size="xs" c="dimmed" mb={4}>Stock Level</Text>
                <Progress 
                  value={(item.quantity / (item.low_stock_threshold * 2)) * 100}
                  color={item.is_low_stock ? "red" : "green"}
                  size="sm"
                  radius="xl"
                />
              </Box>
              
              <Group justify="space-between" mt="md">
                <Text size="xs" c="dimmed">Threshold: {item.low_stock_threshold} {item.unit}</Text>
              </Group>
            </Box>
          </Card>
        ))}
      </SimpleGrid>
    );
  };

  // Category distribution chart
  const renderCategoryDistributionChart = () => {
    const total = categoryData.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <Paper withBorder p="md" radius="md" shadow="sm">
        <Title order={3} mb="md">Inventory by Category</Title>
        <Group align="flex-start" wrap="nowrap">
          <RingProgress
            size={180}
            thickness={20}
            roundCaps
            sections={categoryData.map(item => ({
              value: (item.count / total) * 100,
              color: item.color,
              tooltip: `${item.name}: ${item.count} items`
            }))}
          />
          <Box>
            {categoryData.map((category) => (
              <Group key={category.name} mb="xs">
                <Box w={14} h={14} bg={category.color} style={{ borderRadius: '4px' }} />
                <Text size="sm">
                  {category.name}: {category.count} items ({((category.count / total) * 100).toFixed(1)}%)
                </Text>
              </Group>
            ))}
          </Box>
        </Group>
      </Paper>
    );
  };

  return (
    <Container fluid>
      <LoadingOverlay visible={loading} />
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

      {/* Header Section */}
      <Group justify="space-between" mb="lg">
        <Group>
          <ThemeIcon size={44} radius="md" variant="light" color="blue">
            <IconBuildingWarehouse style={{ width: '70%', height: '70%' }} />
          </ThemeIcon>
          <div>
            <Title order={2}>Inventory Management</Title>
            <Text c="dimmed" size="sm">
              Track stock levels of seeds, fertilizers, pesticides, and other farm supplies
            </Text>
          </div>
        </Group>
        <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={handleAddItem}
          variant="gradient" 
          gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
        >
          Add Item
        </Button>
      </Group>

      {/* Summary Stats */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        <Paper withBorder p="md" radius="md" shadow="sm">
          <Group>
            <ThemeIcon variant="light" color="blue" size={48} radius="md">
              <IconPackage size={24} />
            </ThemeIcon>
            <div>
              <Text size="xl" fw={700}>{totalItems}</Text>
              <Text size="sm" c="dimmed">Total Items</Text>
            </div>
          </Group>
        </Paper>
        <Paper withBorder p="md" radius="md" shadow="sm">
          <Group>
            <ThemeIcon 
              variant="light" 
              color={lowStockCount > 0 ? "red" : "gray"} 
              size={48} 
              radius="md"
            >
              <IconAlertTriangle size={24} />
            </ThemeIcon>
            <div>
              <Text size="xl" fw={700} c={lowStockCount > 0 ? "red" : "inherit"}>{lowStockCount}</Text>
              <Text size="sm" c="dimmed">Items Low on Stock</Text>
            </div>
          </Group>
        </Paper>
        <Paper withBorder p="md" radius="md" shadow="sm">
          <Group>
            <ThemeIcon variant="light" color="green" size={48} radius="md">
              <IconCategory size={24} />
            </ThemeIcon>
            <div>
              <Text size="xl" fw={700}>{categories.length}</Text>
              <Text size="sm" c="dimmed">Unique Categories</Text>
            </div>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Filters and visualizations */}
      <SimpleGrid cols={{ base: 1, lg: 3 }} mb="xl" spacing="lg">
        <Paper withBorder p="md" radius="md" shadow="sm" style={{ gridColumn: 'span 2' }}>
          <Box mb="md">
            <Group justify="space-between" mb="md">
              <Group>
                <SegmentedControl
                  value={viewMode}
                  onChange={(value) => setViewMode(value as 'card' | 'table')}
                  data={[
                    {
                      value: 'card',
                      label: (
                        <Group gap={4}>
                          <IconBoxSeam size={16} />
                          <span>Cards</span>
                        </Group>
                      ),
                    },
                    {
                      value: 'table',
                      label: (
                        <Group gap={4}>
                          <IconListCheck size={16} />
                          <span>Table</span>
                        </Group>
                      ),
                    },
                  ]}
                />
                <SegmentedControl
                  value={stockFilter}
                  onChange={(value) => setStockFilter(value as 'all' | 'low')}
                  data={[
                    { value: 'all', label: 'All Items' },
                    { value: 'low', label: 'Low Stock' },
                  ]}
                />
              </Group>
              <Group>
                <Select
                  placeholder="Sort by"
                  data={[
                    { value: 'name', label: 'Name' },
                    { value: 'category', label: 'Category' },
                    { value: 'quantity', label: 'Quantity' },
                    { value: 'threshold', label: 'Threshold' },
                  ]}
                  value={sortBy}
                  onChange={(value) => setSortBy(value || 'name')}
                  size="sm"
                  rightSection={
                    <ActionIcon
                      size="sm"
                      onClick={() => 
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                      }
                    >
                      {sortDirection === 'asc' ? 
                        <IconSortAscending size={14} /> : 
                        <IconSortDescending size={14} />
                      }
                    </ActionIcon>
                  }
                />
              </Group>
            </Group>
            <Group mb="lg">
              <TextInput
                placeholder="Search inventory items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Filter by category"
                data={[
                  { value: '', label: 'All Categories' },
                  ...categoryOptions
                ]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                leftSection={<IconFilter size={16} />}
                clearable
                style={{ minWidth: '180px' }}
              />
            </Group>
          </Box>
          
          {viewMode === 'table' ? (
            <ScrollArea>
              <Table striped highlightOnHover verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>
                      <Group gap={4}>
                        Name
                        <ActionIcon size="xs" onClick={() => {
                          setSortBy('name');
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }}>
                          <IconArrowsSort size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Th>
                    <Table.Th>
                      <Group gap={4}>
                        Category
                        <ActionIcon size="xs" onClick={() => {
                          setSortBy('category');
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }}>
                          <IconArrowsSort size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Th>
                    <Table.Th>
                      <Group gap={4}>
                        Quantity
                        <ActionIcon size="xs" onClick={() => {
                          setSortBy('quantity');
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }}>
                          <IconArrowsSort size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Th>
                    <Table.Th>Unit</Table.Th>
                    <Table.Th>
                      <Group gap={4}>
                        Threshold
                        <ActionIcon size="xs" onClick={() => {
                          setSortBy('threshold');
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                        }}>
                          <IconArrowsSort size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredInventory.length > 0 ? rows : (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Text ta="center" py="xl" c="dimmed">
                          No inventory items found matching your criteria.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          ) : (
            renderInventoryCards()
          )}
        </Paper>

        {/* Category Distribution Chart */}
        <Paper withBorder p="md" radius="md" shadow="sm">
          <Box style={{ height: '100%' }}>
            {renderCategoryDistributionChart()}
          </Box>
        </Paper>
      </SimpleGrid>

      {/* Add/Edit Modal */}
      <Modal 
        opened={opened} 
        onClose={() => setOpened(false)} 
        title={
          <Group>
            <ThemeIcon color="blue" radius="xl">
              {editingItem ? <IconPencil size={18} /> : <IconPlus size={18} />}
            </ThemeIcon>
            <Text fw={600}>{editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</Text>
          </Group>
        }
        centered
        size="lg"
      >
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
            leftSection={form.values.category ? getCategoryIcon(form.values.category) : <IconCategory size={16} />}
          />
          
          <Grid mb="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Quantity"
                placeholder="Enter quantity"
                withAsterisk
                min={0}
                decimalScale={2}
                {...form.getInputProps('quantity')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Unit"
                placeholder="Select a unit"
                withAsterisk
                data={availableUnits}
                disabled={!form.values.category || availableUnits.length === 0}
                allowDeselect={false}
                comboboxProps={{ withinPortal: true }}
                {...form.getInputProps('unit')}
              />
            </Grid.Col>
          </Grid>
          <Grid mb="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Low Stock Threshold"
                description="Set a threshold for low stock alerts"
                placeholder="Enter threshold"
                min={0}
                decimalScale={2}
                leftSection={<IconAlertTriangle size={16} />}
                {...form.getInputProps('low_stock_threshold')}
              />
            </Grid.Col>
          </Grid>
          
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading}
              variant="gradient" 
              gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
            >
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}