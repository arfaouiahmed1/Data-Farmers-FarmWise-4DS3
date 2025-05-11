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
  Progress,
  Table,
  Notification
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
  IconCheck,
  IconX,
  IconBuildingWarehouse,
  IconCategory,
  IconEngine,
  IconBoxSeam,
  IconPackage,
  IconBottle,
  IconBolt,
  IconSeeding,
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
  const theme = useMantineTheme();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [opened, setOpened] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [statusFilter, setStatusFilter] = useState<'all' | 'maintenance'>('all');

  const EQUIPMENT_TYPES: EquipmentType[] = ['Tractor', 'Harvester', 'Seeder', 'Sprayer', 'Trailer', 'Tillage', 'Other'];
  const EQUIPMENT_STATUSES: EquipmentStatus[] = ['Operational', 'Maintenance Needed', 'Out of Service'];

  // Define form with proper field types to match backend expectations
  const form = useForm<{
    name: string;
    type: EquipmentType;
    purchaseDate: Date | null;
    status: EquipmentStatus;
    nextMaintenance: Date | null;
    notes: string;
  }>({
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
        setError(null);
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
        setFilteredEquipment(updatedData);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        setError('Failed to load equipment data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  // Filter and sort equipment based on search, category, and sort options
  useEffect(() => {
    let result = [...equipment];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.type.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (selectedType) {
      result = result.filter(item => item.type === selectedType);
    }

    // Apply status filter
    if (statusFilter === 'maintenance') {
      result = result.filter(item => item.status === 'Maintenance Needed');
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case 'name':
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          break;
        case 'type':
          compareA = a.type.toLowerCase();
          compareB = b.type.toLowerCase();
          break;
        case 'status':
          compareA = a.status.toLowerCase();
          compareB = b.status.toLowerCase();
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
    
    setFilteredEquipment(result);
  }, [equipment, searchQuery, selectedType, sortBy, sortDirection, statusFilter]);

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
      
      // Safely convert dates to ISO format string
      const formData = {
        name: values.name,
        type: values.type,
        purchaseDate: values.purchaseDate ? values.purchaseDate.toISOString().split('T')[0] : null,
        status: values.status,
        nextMaintenance: values.nextMaintenance ? values.nextMaintenance.toISOString().split('T')[0] : null,
        notes: values.notes,
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

  // Stats calculation
  const totalEquipment = equipment.length;
  const maintenanceNeededCount = equipment.filter(e => e.status === 'Maintenance Needed').length;
  const outOfServiceCount = equipment.filter(e => e.status === 'Out of Service').length;
  const types = Array.from(new Set(equipment.map(item => item.type)));
  const typeCounts = types.reduce((acc, type) => {
    acc[type] = equipment.filter(item => item.type === type).length;
    return acc;
  }, {} as {[key: string]: number});

  // Type breakdown for charts
  const typeData = types.map(type => ({
    name: type,
    count: typeCounts[type],
    color: typeColors[type],
  }));

  // Type options for Select component
  const typeOptions = EQUIPMENT_TYPES.map(type => ({ value: type, label: type }));

  // Equipment table rows
  const rows = filteredEquipment.map((item) => {
    const statusProps = getStatusProps(item.status);
    return (
      <Table.Tr key={item.id}>
        <Table.Td style={{ verticalAlign: 'middle' }}>
          <Group gap="xs">
            <ThemeIcon color={typeColors[item.type]} variant="light" radius="xl" size="md">
              {getTypeIcon(item.type)}
            </ThemeIcon>
            <Text fw={500}>{item.name}</Text>
          </Group>
        </Table.Td>
        <Table.Td style={{ verticalAlign: 'middle' }}>
          <Badge color={typeColors[item.type]} variant="light">
            {item.type}
          </Badge>
        </Table.Td>
        <Table.Td style={{ verticalAlign: 'middle' }}>
          <Badge color={statusProps.color} variant="light" leftSection={statusProps.icon}>
            {item.status}
          </Badge>
        </Table.Td>
        <Table.Td style={{ verticalAlign: 'middle' }}>
          {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'N/A'}
        </Table.Td>
        <Table.Td style={{ verticalAlign: 'middle' }}>
          {item.nextMaintenance ? new Date(item.nextMaintenance).toLocaleDateString() : 'N/A'}
        </Table.Td>
        <Table.Td style={{ verticalAlign: 'middle' }}>
          <Group gap={4}>
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
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />} onClick={() => handleDeleteItem(item.id!)}>
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  // Equipment cards
  const renderEquipmentCards = () => {
    if (filteredEquipment.length === 0) {
      return (
        <Paper withBorder p="xl" radius="md" shadow="sm">
          <Text ta="center" py="xl" c="dimmed">
            No equipment items found matching your search criteria.
          </Text>
        </Paper>
      );
    }

    return (
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
        {filteredEquipment.map((item) => {
          const statusProps = getStatusProps(item.status);
          return (
            <Card key={item.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section p="md" bg={`${typeColors[item.type]}15`}>
                <Group justify="space-between">
                  <Group>
                    <ThemeIcon color={typeColors[item.type]} size="md" radius="md">
                      {getTypeIcon(item.type)}
                    </ThemeIcon>
                    <Text fw={500}>{item.type}</Text>
                  </Group>
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
                      <Menu.Divider />
                      <Menu.Item color="red" leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />} onClick={() => handleDeleteItem(item.id!)}>
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Card.Section>
              
              <Box mt="md">
                <Group justify="space-between" mb="xs">
                  <Text fw={500}>{item.name}</Text>
                  <Badge color={statusProps.color} variant="light" leftSection={statusProps.icon}>
                    {item.status}
                  </Badge>
                </Group>
                
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
              </Box>
            </Card>
          );
        })}
      </SimpleGrid>
    );
  };

  // Type distribution chart
  const renderTypeDistributionChart = () => {
    const total = typeData.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <Paper withBorder p="md" radius="md" shadow="sm">
        <Title order={3} mb="md">Equipment by Type</Title>
        <Group align="flex-start" wrap="nowrap">
          <RingProgress
            size={180}
            thickness={20}
            roundCaps
            sections={typeData.map(item => ({
              value: (item.count / total) * 100,
              color: item.color,
              tooltip: `${item.name}: ${item.count} items`
            }))}
          />
          <Box>
            {typeData.map((type) => (
              <Group key={type.name} mb="xs">
                <ColorSwatch color={type.color} size={16} />
                <Text size="sm">{type.name}: {type.count} items</Text>
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
            <IconTractor style={{ width: '70%', height: '70%' }} />
          </ThemeIcon>
          <div>
            <Title order={2}>Equipment Management</Title>
            <Text c="dimmed" size="sm">
              Track farm equipment, manage maintenance schedules, and monitor operational status
            </Text>
          </div>
        </Group>
        <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={handleAddItem}
          variant="gradient" 
          gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
        >
          Add Equipment
        </Button>
      </Group>

      {/* Summary Stats */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        <Paper withBorder p="md" radius="md" shadow="sm">
          <Group>
            <ThemeIcon variant="light" color="blue" size={48} radius="md">
              <IconTractor size={24} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Total Equipment</Text>
              <Text size="xl" fw={700}>{totalEquipment}</Text>
            </div>
          </Group>
        </Paper>
        <Paper withBorder p="md" radius="md" shadow="sm">
          <Group>
            <ThemeIcon 
              variant="light" 
              color={maintenanceNeededCount > 0 ? "orange" : "gray"} 
              size={48} 
              radius="md"
            >
              <IconTool size={24} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Needs Maintenance</Text>
              <Text size="xl" fw={700} c={maintenanceNeededCount > 0 ? "orange" : "inherit"}>{maintenanceNeededCount}</Text>
            </div>
          </Group>
        </Paper>
        <Paper withBorder p="md" radius="md" shadow="sm">
          <Group>
            <ThemeIcon 
              variant="light" 
              color={outOfServiceCount > 0 ? "red" : "gray"} 
              size={48} 
              radius="md"
            >
              <IconEngineOff size={24} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Out of Service</Text>
              <Text size="xl" fw={700} c={outOfServiceCount > 0 ? "red" : "inherit"}>{outOfServiceCount}</Text>
            </div>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Filters and visualizations */}
      <SimpleGrid cols={{ base: 1, lg: 3 }} mb="xl" spacing="lg">
        <Paper withBorder p="md" radius="md" shadow="sm" style={{ gridColumn: 'span 2' }}>
          <Box mb="md">
            <Group justify="space-between" mb="md">              <Group>
                <SegmentedControl
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as 'all' | 'maintenance')}
                  data={[
                    { label: 'All Equipment', value: 'all' },
                    { label: 'Needs Maintenance', value: 'maintenance' },
                  ]}
                />
              </Group>
              <Group>
                <SegmentedControl
                  value={viewMode}
                  onChange={(value) => setViewMode(value as 'card' | 'table')}
                  data={[
                    { label: 'Cards', value: 'card' },
                    { label: 'Table', value: 'table' },
                  ]}
                />
                <Menu shadow="md">
                  <Menu.Target>
                    <Button variant="light" rightSection={<IconChevronDown size={16} />}>
                      {sortDirection === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                      Sort by
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Sort by</Menu.Label>
                    <Menu.Item 
                      leftSection={sortBy === 'name' ? <IconCheck size={14} /> : null} 
                      onClick={() => setSortBy('name')}
                    >
                      Name
                    </Menu.Item>
                    <Menu.Item 
                      leftSection={sortBy === 'type' ? <IconCheck size={14} /> : null}
                      onClick={() => setSortBy('type')}
                    >
                      Type
                    </Menu.Item>
                    <Menu.Item 
                      leftSection={sortBy === 'status' ? <IconCheck size={14} /> : null}
                      onClick={() => setSortBy('status')}
                    >
                      Status
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Label>Direction</Menu.Label>
                    <Menu.Item 
                      leftSection={sortDirection === 'asc' ? <IconCheck size={14} /> : null}
                      onClick={() => setSortDirection('asc')}
                    >
                      Ascending
                    </Menu.Item>
                    <Menu.Item 
                      leftSection={sortDirection === 'desc' ? <IconCheck size={14} /> : null}
                      onClick={() => setSortDirection('desc')}
                    >
                      Descending
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>
            <Group mb="lg">
              <TextInput
                placeholder="Search equipment items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Filter by type"
                data={[
                  { value: '', label: 'All Types' },
                  ...typeOptions
                ]}
                value={selectedType}
                onChange={setSelectedType}
                leftSection={<IconFilter size={16} />}
                clearable
                style={{ minWidth: '180px' }}
              />
            </Group>
          </Box>
          
          {viewMode === 'table' ? (
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Purchase Date</Table.Th>
                    <Table.Th>Next Maintenance</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            </ScrollArea>
          ) : (
            renderEquipmentCards()
          )}
        </Paper>

        {/* Type Distribution Chart */}
        <Paper withBorder p="md" radius="md" shadow="sm">
          <Box style={{ height: '100%' }}>
            {renderTypeDistributionChart()}
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
            <Text fw={600}>{editingItem ? 'Edit Equipment' : 'Add Equipment'}</Text>
          </Group>
        }
        centered
        size="lg"
      >
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
          <Grid mb="md">
            <Grid.Col span={6}>
              <DatePickerInput
                label="Purchase Date"
                placeholder="Select date"
                valueFormat="YYYY-MM-DD"
                clearable
                {...form.getInputProps('purchaseDate')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Status"
                placeholder="Select status"
                data={EQUIPMENT_STATUSES}
                required
                {...form.getInputProps('status')}
              />
            </Grid.Col>
          </Grid>
          <Grid mb="md">
            <Grid.Col span={12}>
              <DatePickerInput
                label="Next Maintenance Date"
                placeholder="Select date"
                valueFormat="YYYY-MM-DD"
                clearable
                {...form.getInputProps('nextMaintenance')}
              />
            </Grid.Col>
          </Grid>
          <Textarea
            label="Notes (Optional)"
            placeholder="Add any relevant notes, e.g., maintenance details, issues..."
            {...form.getInputProps('notes')}
            mb="xl"
            autosize
            minRows={2}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setOpened(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}