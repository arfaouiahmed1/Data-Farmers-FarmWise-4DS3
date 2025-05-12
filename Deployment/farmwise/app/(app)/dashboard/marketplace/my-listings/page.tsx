'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Group, 
  Button, 
  Paper, 
  Card, 
  Text, 
  Image, 
  Badge, 
  ActionIcon, 
  Menu, 
  Table, 
  Tabs, 
  Flex,
  Modal,
  Stack,
  SimpleGrid,
  Select,
  Switch,
  Divider,
  TextInput,
  Loader,
  Grid,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconArrowLeft, 
  IconDotsVertical, 
  IconEdit, 
  IconTrash, 
  IconEye, 
  IconPlus, 
  IconSearch,
  IconMapPin,
  IconTractor,
  IconSeedingOff,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconRefresh,
  IconTag,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { notifications } from '@mantine/notifications';
import { 
  fetchMyProducts, 
  deleteProduct, 
  activateProduct, 
  deactivateProduct 
} from '@/app/utils/api/marketplaceService';
import { Listing } from '../types';
import classes from '../Marketplace.module.css';

export default function MyListingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>('all');
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Load user's listings from API
  useEffect(() => {
    const loadMyListings = async () => {
      try {
        setLoading(true);
        const data = await fetchMyProducts();
        setListings(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load your listings:', err);
        setError(err.message || 'Failed to load your listings');
        notifications.show({
          title: 'Error',
          message: 'Failed to load your marketplace listings',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadMyListings();
  }, []);
  
  // Filter listings based on active tab, search query, and status filter
  const filteredListings = listings.filter(listing => {
    // Filter by tab (listing type)
    if (activeTab !== 'all' && listing.type !== activeTab) return false;
    
    // Filter by search query
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Filter by status
    if (statusFilter !== 'all' && listing.status !== statusFilter) return false;
    
    return true;
  });
  
  // Get icon based on listing type
  const getListingTypeIcon = (type: string) => {
    switch (type) {
      case 'land':
        return <IconMapPin size={16} />;
      case 'equipment':
        return <IconTractor size={16} />;
      case 'resource':
        return <IconSeedingOff size={16} />;
      default:
        return null;
    }
  };
  
  // Get formatted price
  const getFormattedPrice = (listing: Listing) => {
    return (
      <>
        {listing.price.toLocaleString()} {listing.currency}
        {listing.priceType === 'rent' && listing.type === 'equipment' && listing.rentalInfo && (
          <Text component="span" size="xs"> /{listing.rentalInfo.period}</Text>
        )}
      </>
    );
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge color="green">Active</Badge>;
      case 'draft':
        return <Badge color="gray">Draft</Badge>;
      case 'sold':
        return <Badge color="blue">Sold</Badge>;
      case 'rented':
        return <Badge color="cyan">Rented</Badge>;
      case 'expired':
        return <Badge color="orange">Expired</Badge>;
      case 'deactivated':
        return <Badge color="red">Deactivated</Badge>;
      default:
        return null;
    }
  };
  
  const handleView = (listing: Listing) => {
    router.push(`/dashboard/marketplace/${listing.type}/${listing.id}`);
  };
  
  const handleEdit = (listing: Listing) => {
    router.push(`/dashboard/marketplace/create?edit=${listing.id}&type=${listing.type}`);
  };
  
  const handleDelete = (listing: Listing) => {
    setSelectedListing(listing);
    open();
  };
  
  const confirmDelete = async () => {
    if (!selectedListing) return;
    
    try {
      setProcessingId(selectedListing.id);
      await deleteProduct(selectedListing.id);
      setListings(prev => prev.filter(l => l.id !== selectedListing.id));
      notifications.show({
        title: 'Success',
        message: 'Listing successfully deleted',
        color: 'green',
      });
      close();
    } catch (err: any) {
      console.error('Failed to delete listing:', err);
      notifications.show({
        title: 'Error',
        message: err.message || 'Failed to delete listing',
        color: 'red',
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleStatusChange = async (listing: Listing, activate: boolean) => {
    try {
      setProcessingId(listing.id);
      if (activate) {
        await activateProduct(listing.id);
        notifications.show({
          title: 'Success',
          message: 'Listing successfully activated',
          color: 'green',
        });
      } else {
        await deactivateProduct(listing.id);
        notifications.show({
          title: 'Success',
          message: 'Listing successfully deactivated',
          color: 'green',
        });
      }
      
      // Update listing status in the state
      setListings(prev => 
        prev.map(l => 
          l.id === listing.id 
            ? { ...l, isActive: activate, status: activate ? 'active' : 'deactivated' } 
            : l
        )
      );
    } catch (err: any) {
      console.error(`Failed to ${activate ? 'activate' : 'deactivate'} listing:`, err);
      notifications.show({
        title: 'Error',
        message: err.message || `Failed to ${activate ? 'activate' : 'deactivate'} listing`,
        color: 'red',
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  return (
    <Container fluid px="md">
      <Group justify="space-between" mb="lg">
        <Group>
          <Button 
            component={Link} 
            href="/dashboard/marketplace" 
            variant="subtle" 
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to Marketplace
          </Button>
          <Title className={classes.pageTitle}>My Listings</Title>
        </Group>
        <Button 
          component={Link} 
          href="/dashboard/marketplace/create" 
          leftSection={<IconPlus size={16} />}
          variant="filled"
        >
          Add New Listing
        </Button>
      </Group>
      
      <Paper shadow="xs" p="md" mb="lg">
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              placeholder="Search in your listings..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Select
              placeholder="Filter by status"
              data={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'deactivated', label: 'Deactivated' },
                { value: 'draft', label: 'Draft' },
                { value: 'sold', label: 'Sold' },
                { value: 'rented', label: 'Rented' },
                { value: 'expired', label: 'Expired' },
              ]}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Group justify="flex-end">
              <Button 
                variant="subtle" 
                leftSection={<IconRefresh size={16} />}
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Paper>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
        <Tabs.List>
          <Tabs.Tab value="all">All Listing Types</Tabs.Tab>
          <Tabs.Tab value="land" leftSection={<IconMapPin size={16} />}>Land</Tabs.Tab>
          <Tabs.Tab value="equipment" leftSection={<IconTractor size={16} />}>Equipment</Tabs.Tab>
          <Tabs.Tab value="resource" leftSection={<IconSeedingOff size={16} />}>Resources</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {loading ? (
        <Paper p="xl" ta="center">
          <Loader size="md" />
          <Text mt="md">Loading your listings...</Text>
        </Paper>
      ) : error ? (
        <Paper p="xl" ta="center">
          <Text size="lg" fw={500} c="red">Error: {error}</Text>
          <Button mt="md" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Paper>
      ) : filteredListings.length === 0 ? (
        <Paper p="xl" ta="center">
          <Text size="lg" fw={500}>You don't have any listings matching your filters</Text>
          {statusFilter !== 'all' || searchQuery || activeTab !== 'all' ? (
            <Button mt="md" onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setActiveTab('all');
            }}>
              Clear Filters
            </Button>
          ) : (
            <Button 
              component={Link} 
              href="/dashboard/marketplace/create" 
              mt="md"
              variant="filled"
              leftSection={<IconPlus size={16} />}
            >
              Create Your First Listing
            </Button>
          )}
        </Paper>
      ) : (
        <Table verticalSpacing="md" mt="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Listing</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Price</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredListings.map((listing) => (
              <Table.Tr key={listing.id}>
                <Table.Td>
                  <Group>
                    <Image
                      src={listing.mainImage || listing.images[0] || '/images/marketplace/placeholder.jpg'}
                      width={60}
                      height={40}
                      radius="sm"
                      alt={listing.title}
                      fallbackSrc="https://placehold.co/600x400?text=FarmWise"
                    />
                    <Stack gap={0}>
                      <Text fw={500} lineClamp={1}>{listing.title}</Text>
                      <Text size="xs" c="dimmed">{listing.location}</Text>
                    </Stack>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {getListingTypeIcon(listing.type)}
                    <Text size="sm">{listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text fw={500}>{getFormattedPrice(listing)}</Text>
                </Table.Td>
                <Table.Td>
                  {getStatusBadge(listing.status || (listing.isActive ? 'active' : 'deactivated'))}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon 
                      variant="subtle" 
                      color="blue" 
                      onClick={() => handleView(listing)}
                      title="View listing"
                    >
                      <IconEye size={18} />
                    </ActionIcon>
                    <ActionIcon 
                      variant="subtle" 
                      color="green" 
                      onClick={() => handleEdit(listing)}
                      title="Edit listing"
                    >
                      <IconEdit size={18} />
                    </ActionIcon>
                    <ActionIcon 
                      variant="subtle" 
                      color="red" 
                      onClick={() => handleDelete(listing)}
                      title="Delete listing"
                      loading={processingId === listing.id}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                    <Menu position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <IconDotsVertical size={18} />
                        </ActionIcon>
                      </Menu.Target>
                      
                      <Menu.Dropdown>
                        {listing.isActive || listing.status === 'active' ? (
                          <Menu.Item 
                            leftSection={<IconX size={14} />}
                            color="orange"
                            onClick={() => handleStatusChange(listing, false)}
                            disabled={processingId === listing.id}
                          >
                            Deactivate
                          </Menu.Item>
                        ) : (
                          <Menu.Item 
                            leftSection={<IconCheck size={14} />}
                            color="green"
                            onClick={() => handleStatusChange(listing, true)}
                            disabled={processingId === listing.id}
                          >
                            Activate
                          </Menu.Item>
                        )}
                        <Menu.Item leftSection={<IconTag size={14} />}>Mark as Sold</Menu.Item>
                        <Menu.Divider />
                        <Menu.Item 
                          leftSection={<IconTrash size={14} />} 
                          color="red"
                          onClick={() => handleDelete(listing)}
                          disabled={processingId === listing.id}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      
      {/* Delete confirmation modal */}
      <Modal
        opened={opened}
        onClose={close}
        title="Confirm Deletion"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete the listing "{selectedListing?.title}"? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button 
              color="red" 
              onClick={confirmDelete}
              loading={processingId === selectedListing?.id}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
} 