'use client';

import { useState } from 'react';
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
import classes from '../Marketplace.module.css';

// Mock listing data
const mockListings = [
  {
    id: 'land-1',
    type: 'land',
    title: 'Fertile Farmland with Irrigation Access',
    price: 250000,
    priceType: 'sale',
    currency: 'TND',
    location: 'Sfax, Tunisia',
    size: '10 hectares',
    access: ['Water', 'Electricity', 'Road'],
    image: '/images/marketplace/land1.jpg',
    predictedValue: 245000,
    status: 'active',
    publishedDate: '2023-04-15',
    views: 128,
    inquiries: 5,
    featuredBadge: 'Hot Offer',
  },
  {
    id: 'equip-1',
    type: 'equipment',
    title: 'Modern Tractor with GPS',
    price: 3500,
    priceType: 'rent',
    period: 'week',
    currency: 'TND',
    location: 'Tunis, Tunisia',
    condition: 'Excellent',
    image: '/images/marketplace/tractor1.jpg',
    status: 'active',
    publishedDate: '2023-05-15',
    views: 76,
    inquiries: 3,
  },
  {
    id: 'resource-1',
    type: 'resource',
    title: 'Premium Organic Fertilizer',
    price: 1200,
    priceType: 'sale',
    currency: 'TND',
    location: 'Kairouan, Tunisia',
    quantity: '1 ton',
    image: '/images/marketplace/fertilizer1.jpg',
    status: 'active',
    publishedDate: '2023-05-10',
    views: 45,
    inquiries: 2,
    featuredBadge: 'Best Seller',
  },
  {
    id: 'land-2',
    type: 'land',
    title: 'Agricultural Land for Rent',
    price: 5000,
    priceType: 'rent',
    period: 'month',
    currency: 'TND',
    location: 'Sousse, Tunisia',
    size: '5 hectares',
    access: ['Water', 'Road'],
    image: '/images/marketplace/land2.jpg',
    predictedValue: 5200,
    status: 'draft',
    publishedDate: null,
    views: 0,
    inquiries: 0,
  },
  {
    id: 'equip-2',
    type: 'equipment',
    title: 'Combine Harvester',
    price: 120000,
    priceType: 'sale',
    currency: 'TND',
    location: 'Bizerte, Tunisia',
    condition: 'Good',
    image: '/images/marketplace/harvester1.jpg',
    status: 'sold',
    publishedDate: '2023-03-20',
    views: 92,
    inquiries: 4,
  },
];

export default function MyListingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>('all');
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  
  // Filter listings based on active tab, search query, and status filter
  const filteredListings = mockListings.filter(listing => {
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
  const getFormattedPrice = (listing: any) => {
    return (
      <>
        {listing.price.toLocaleString()} {listing.currency}
        {listing.priceType === 'rent' && <Text component="span" size="xs"> /{listing.period}</Text>}
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
  
  // Handle viewing a listing
  const handleView = (listing: any) => {
    router.push(`/dashboard/marketplace/${listing.type}/${listing.id}`);
  };
  
  // Handle editing a listing
  const handleEdit = (listing: any) => {
    router.push(`/dashboard/marketplace/edit/${listing.id}`);
  };
  
  // Handle deleting a listing
  const handleDelete = (listing: any) => {
    setSelectedListing(listing);
    open();
  };
  
  // Confirm delete
  const confirmDelete = () => {
    // In a real app, we would call the API to delete the listing
    console.log('Deleting listing:', selectedListing.id);
    close();
    // Then refresh the list
  };
  
  // Handle status change
  const handleStatusChange = (listing: any, newStatus: string) => {
    // In a real app, we would call the API to update the listing status
    console.log('Changing status of listing:', listing.id, 'to', newStatus);
  };
  
  return (
    <Container fluid px="md">
      <div className={classes.myListingsHeader}>
        <Group>
          <Button variant="subtle" leftSection={<IconArrowLeft size={18} />} component={Link} href="/dashboard/marketplace">
            Back to Marketplace
          </Button>
          <Title className={classes.pageTitle}>My Listings</Title>
        </Group>
        
        <Button 
          component={Link} 
          href="/dashboard/marketplace/create" 
          leftSection={<IconPlus size={16} />}
        >
          Add New Listing
        </Button>
      </div>
      
      <Paper shadow="xs" p="md" mb="lg">
        <Group>
          <TextInput
            placeholder="Search listings..."
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          
          <Select
            placeholder="Filter by status"
            data={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'draft', label: 'Draft' },
              { value: 'sold', label: 'Sold' },
              { value: 'rented', label: 'Rented' },
              { value: 'expired', label: 'Expired' },
              { value: 'deactivated', label: 'Deactivated' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
          />
        </Group>
      </Paper>
      
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
        <Tabs.List>
          <Tabs.Tab value="all">All Listings</Tabs.Tab>
          <Tabs.Tab value="land" leftSection={<IconMapPin size={16} />}>Land</Tabs.Tab>
          <Tabs.Tab value="equipment" leftSection={<IconTractor size={16} />}>Equipment</Tabs.Tab>
          <Tabs.Tab value="resource" leftSection={<IconSeedingOff size={16} />}>Resources</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      
      {filteredListings.length === 0 ? (
        <Paper className={classes.emptyState} p="xl" ta="center">
          <IconAlertCircle size={40} color="gray" />
          <Title order={3} mt="md">No listings found</Title>
          <Text c="dimmed">
            {searchQuery || statusFilter !== 'all' || activeTab !== 'all'
              ? 'Try changing your search criteria'
              : 'You haven\'t created any listings yet'}
          </Text>
          {(searchQuery || statusFilter !== 'all' || activeTab !== 'all') && (
            <Button 
              mt="md"
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setActiveTab('all');
              }}
            >
              Clear Filters
            </Button>
          )}
          {!(searchQuery || statusFilter !== 'all' || activeTab !== 'all') && (
            <Button 
              mt="md"
              component={Link}
              href="/dashboard/marketplace/create"
              leftSection={<IconPlus size={16} />}
            >
              Create Your First Listing
            </Button>
          )}
        </Paper>
      ) : (
        <Table mt="md" highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Listing</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Price</Table.Th>
              <Table.Th>Location</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Published</Table.Th>
              <Table.Th>Views</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredListings.map((listing) => (
              <Table.Tr key={listing.id}>
                <Table.Td>
                  <Group gap="sm">
                    <Image 
                      src={listing.image} 
                      width={50} 
                      height={40} 
                      radius="md"
                      fallbackSrc="https://placehold.co/50x40?text=FarmWise"
                    />
                    <div>
                      <Text fw={500} lineClamp={1}>{listing.title}</Text>
                      {listing.featuredBadge && (
                        <Badge size="xs" color="orange">{listing.featuredBadge}</Badge>
                      )}
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap={6}>
                    {getListingTypeIcon(listing.type)}
                    <Text>{listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>{getFormattedPrice(listing)}</Table.Td>
                <Table.Td>{listing.location}</Table.Td>
                <Table.Td>{getStatusBadge(listing.status)}</Table.Td>
                <Table.Td>{listing.publishedDate || '-'}</Table.Td>
                <Table.Td>{listing.views}</Table.Td>
                <Table.Td>
                  <Group gap={8} justify="center">
                    <ActionIcon 
                      variant="subtle" 
                      color="blue" 
                      onClick={() => handleView(listing)}
                      aria-label="View listing"
                    >
                      <IconEye size={18} />
                    </ActionIcon>
                    <ActionIcon 
                      variant="subtle" 
                      color="green" 
                      onClick={() => handleEdit(listing)}
                      aria-label="Edit listing"
                    >
                      <IconEdit size={18} />
                    </ActionIcon>
                    <Menu position="bottom-end" withArrow>
                      <Menu.Target>
                        <ActionIcon variant="subtle" aria-label="More options">
                          <IconDotsVertical size={18} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Label>Actions</Menu.Label>
                        <Menu.Item
                          leftSection={<IconEye size={14} />}
                          onClick={() => handleView(listing)}
                        >
                          View Listing
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={() => handleEdit(listing)}
                        >
                          Edit Listing
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={() => handleDelete(listing)}
                        >
                          Delete Listing
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Label>Change Status</Menu.Label>
                        {listing.status !== 'active' && (
                          <Menu.Item
                            leftSection={<IconCheck size={14} />}
                            onClick={() => handleStatusChange(listing, 'active')}
                          >
                            Mark as Active
                          </Menu.Item>
                        )}
                        {listing.status !== 'sold' && listing.priceType === 'sale' && (
                          <Menu.Item
                            leftSection={<IconTag size={14} />}
                            onClick={() => handleStatusChange(listing, 'sold')}
                          >
                            Mark as Sold
                          </Menu.Item>
                        )}
                        {listing.status !== 'rented' && listing.priceType === 'rent' && (
                          <Menu.Item
                            leftSection={<IconTag size={14} />}
                            onClick={() => handleStatusChange(listing, 'rented')}
                          >
                            Mark as Rented
                          </Menu.Item>
                        )}
                        {listing.status !== 'deactivated' && (
                          <Menu.Item
                            leftSection={<IconX size={14} />}
                            onClick={() => handleStatusChange(listing, 'deactivated')}
                          >
                            Deactivate
                          </Menu.Item>
                        )}
                        {listing.status === 'deactivated' && (
                          <Menu.Item
                            leftSection={<IconRefresh size={14} />}
                            onClick={() => handleStatusChange(listing, 'active')}
                          >
                            Reactivate
                          </Menu.Item>
                        )}
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
      <Modal opened={opened} onClose={close} title="Confirm Deletion" centered>
        <Stack>
          <Text>
            Are you sure you want to delete the listing:{' '}
            <Text span fw={700}>{selectedListing?.title}</Text>?
          </Text>
          <Text size="sm" c="dimmed">
            This action cannot be undone. The listing will be permanently removed from the marketplace.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button color="red" onClick={confirmDelete}>Delete</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
} 