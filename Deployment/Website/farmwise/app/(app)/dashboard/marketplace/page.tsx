'use client';

import { useState } from 'react';
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
} from '@mantine/core';
import { IconSearch, IconPlus, IconMapPin, IconTractor, IconBuildingWarehouse, IconSeedingOff } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockListings } from './data/mock-listings';
import classes from './Marketplace.module.css';

export default function MarketplacePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  
  // Filter listings based on active tab and search query
  const filteredListings = mockListings.filter(listing => {
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

  return (
    <Container fluid px="md">
      <Group justify="space-between" mb="lg">
        <Title className={classes.pageTitle}>FarmWise Marketplace</Title>
        <Group>
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

      {filteredListings.length === 0 ? (
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
                      {listing.priceType === 'rent' && listing.type === 'equipment' && (
                        <Text size="sm" c="dimmed">/{listing.rentalInfo?.period}</Text>
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