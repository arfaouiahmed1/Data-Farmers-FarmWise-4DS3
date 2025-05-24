'use client';

import { useState, useEffect } from 'react';
import {
  Title,
  Grid,
  Card,
  Text,
  Group,
  Stack,
  Button,
  ActionIcon,
  Tabs,
  Paper,
  Image,
  Badge,
  TextInput,
  Select,
  RangeSlider,
  Container,
  SimpleGrid,
  Overlay,
  Box,
  Loader,
} from '@mantine/core';
import { IconSearch, IconPlus, IconMapPin, IconTractor, IconBuildingWarehouse, IconSeedingOff, IconRefresh, IconDatabase } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchProducts } from '@/app/utils/api/marketplaceService';
import { createSampleMarketplaceData } from '@/app/utils/api/createSampleData';
import { isAuthenticated } from '@/app/utils/auth/auth-utils';
import classes from './Marketplace.module.css';
import { Listing } from './types';
import { notifications } from '@mantine/notifications';

export default function MarketplacePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    // Load listings from API
  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated
        const isAuth = await isAuthenticated();
        if (!isAuth) {
          console.warn('User is not authenticated. Redirecting to login page.');
          window.location.href = '/login';
          return;
        }

        // In a real implementation, you would pass filters to the API
        const data = await fetchProducts();
        setListings(data);
        console.log('Loaded listings:', data.length);
      } catch (err: any) {
        console.error('Failed to load listings:', err);

        // Check if this is an authentication error
        if (err.message && (
          err.message.includes('Authentication required') ||
          err.message.includes('Invalid token') ||
          err.message.includes('401')
        )) {
          setError('Authentication error. Please log in again.');
          notifications.show({
            title: 'Authentication Error',
            message: 'Please log in again to access the marketplace.',
            color: 'red',
          });

          // Redirect to login page after a short delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          setError(err.message || 'Failed to load listings');
          notifications.show({
            title: 'Error',
            message: 'Failed to load marketplace listings.',
            color: 'orange',
          });
        }

        // Set empty array to show no listings available message
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  // Filter listings based on active tab and search query
  const filteredListings = listings.filter(listing => {
    // Filter by category
    if (activeTab !== 'all' && listing.type !== activeTab) return false;

    // Filter by search query
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !listing.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // Filter by price
    if (listing.price < priceRange[0] || listing.price > priceRange[1]) return false;

    // Filter by location
    if (locationFilter && !listing.location.includes(locationFilter)) return false;

    return true;
  });

  // Get correct icon based on listing type
  const getListingIcon = (type: string) => {
    switch (type) {
      case 'land': return <IconMapPin size={18} />;
      case 'equipment': return <IconTractor size={18} />;
      case 'resource': return <IconSeedingOff size={18} />;
      default: return <IconMapPin size={18} />;
    }
  };

  // Get listing path
  const getListingPath = (listing: any) => `/dashboard/marketplace/${listing.type}/${listing.id}`;

  // Refresh function
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setListings(data);
      notifications.show({
        title: 'Success',
        message: 'Marketplace data refreshed successfully',
        color: 'green',
      });
    } catch (err: any) {
      console.error('Failed to refresh listings:', err);
      setError(err.message || 'Failed to refresh listings');
      notifications.show({
        title: 'Error',
        message: 'Failed to refresh marketplace data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create sample data function
  const handleCreateSampleData = async () => {
    try {
      setLoading(true);
      const result = await createSampleMarketplaceData();

      // Only refresh if at least one product was created successfully
      if (result.success) {
        // Refresh the listings after creating sample data
        const data = await fetchProducts();
        setListings(data);

        if (result.count > 0) {
          // Show success message with count
          notifications.show({
            title: 'Success',
            message: `Created ${result.count} sample listings. Refreshed marketplace data.`,
            color: 'green',
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to create sample data:', err);
      notifications.show({
        title: 'Error',
        message: 'Failed to create sample data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid px="md">
      <Group justify="space-between" mb="lg">
        <Title className={classes.pageTitle}>FarmWise Marketplace</Title>
        <Group>
          <Button
            variant="outline"
            leftSection={<IconDatabase size={16} />}
            onClick={handleCreateSampleData}
            loading={loading}
            color="green"
          >
            Create Sample Data
          </Button>
          <Button
            variant="outline"
            leftSection={<IconRefresh size={16} />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            component={Link}
            href="/dashboard/marketplace/create"
            leftSection={<IconPlus size={16} />}
            variant="filled"
          >
            Add Listing
          </Button>
        </Group>
      </Group>

      <Paper shadow="xs" p="md" mb="lg">
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              placeholder="Search by title or location..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Select
              placeholder="Filter by location"
              data={[
                { value: 'Tunis', label: 'Tunis' },
                { value: 'Sfax', label: 'Sfax' },
                { value: 'Sousse', label: 'Sousse' },
                { value: 'Bizerte', label: 'Bizerte' },
                { value: 'Kairouan', label: 'Kairouan' },
                { value: 'Nabeul', label: 'Nabeul' },
              ]}
              value={locationFilter}
              onChange={(value) => setLocationFilter(value)}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Group align="center">
              <Text size="sm">Price (TND): </Text>
              <Text size="sm" fw={500}>{priceRange[0]}</Text>
              <RangeSlider
                min={0}
                max={500000}
                step={1000}
                minRange={1000}
                value={priceRange}
                onChange={setPriceRange}
                style={{ flex: 1 }}
              />
              <Text size="sm" fw={500}>{priceRange[1] === 500000 ? priceRange[1].toLocaleString() + '+' : priceRange[1].toLocaleString()}</Text>
            </Group>
          </Grid.Col>
        </Grid>
      </Paper>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
        <Tabs.List>
          <Tabs.Tab value="all">All Listings</Tabs.Tab>
          <Tabs.Tab value="land" leftSection={<IconMapPin size={16} />}>Land</Tabs.Tab>
          <Tabs.Tab value="equipment" leftSection={<IconTractor size={16} />}>Equipment</Tabs.Tab>
          <Tabs.Tab value="resource" leftSection={<IconBuildingWarehouse size={16} />}>Resources</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {loading ? (
        <Paper p="xl" ta="center">
          <Loader size="md" />
          <Text mt="md">Loading marketplace listings...</Text>
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
          <Text size="lg" fw={500}>No listings found matching your criteria</Text>
          <Text size="sm" c="dimmed">Try adjusting your filters or search query</Text>
          <Button mt="md" onClick={() => {
            setSearchQuery('');
            setPriceRange([0, 500000]);
            setLocationFilter(null);
            setActiveTab('all');
          }}>
            Clear Filters
          </Button>
        </Paper>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} mt="md">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className={classes.listingCard} component={Link} href={getListingPath(listing)}>
              <Card.Section pos="relative">
                <Image
                  src={listing.mainImage || listing.images[0] || '/images/marketplace/placeholder.jpg'}
                  height={160}
                  alt={listing.title}
                  fallbackSrc="https://placehold.co/600x400?text=FarmWise"
                />
                {listing.featuredBadge && (
                  <Badge className={classes.featuredBadge} color="orange">
                    {listing.featuredBadge}
                  </Badge>
                )}
              </Card.Section>

              <Stack mt="md" gap="xs">
                <Text fw={700} lineClamp={1}>{listing.title}</Text>

                <Group gap="xs">
                  {getListingIcon(listing.type)}
                  <Text size="sm" c="dimmed">{listing.type.charAt(0).toUpperCase() + listing.type.slice(1)}</Text>

                  <Text size="sm" c="dimmed">•</Text>

                  <Group gap={4}>
                    <IconMapPin size={14} />
                    <Text size="sm" c="dimmed">{listing.location}</Text>
                  </Group>
                </Group>

                {listing.type === 'land' && (
                  <Text size="sm" c="dimmed">Size: {listing.size.value} {listing.size.unit}</Text>
                )}

                {listing.type === 'equipment' && (
                  <Text size="sm" c="dimmed">Condition: {listing.condition}</Text>
                )}

                {listing.type === 'resource' && (
                  <Text size="sm" c="dimmed">Quantity: {listing.quantity.value} {listing.quantity.unit}</Text>
                )}

                <Group justify="space-between" align="center">
                  <Stack gap={0}>
                    <Group gap={4}>
                      <Text fw={700} size="lg">{listing.price.toLocaleString()} {listing.currency}</Text>
                      {listing.priceType === 'rent' && listing.type === 'equipment' && listing.rentalInfo && (
                        <Text size="sm" c="dimmed">/{listing.rentalInfo.period}</Text>
                      )}
                    </Group>

                    {listing.type === 'land' && listing.predictedValue && (
                      <Text size="xs" c={listing.predictedValue > listing.price ? "green.7" : "red.7"}>
                        Estimated value: {listing.predictedValue.toLocaleString()} {listing.currency}
                      </Text>
                    )}
                  </Stack>

                  <Badge color={listing.priceType === 'sale' ? 'blue' : 'green'}>
                    {listing.priceType === 'sale' ? 'For Sale' : 'For Rent'}
                  </Badge>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}