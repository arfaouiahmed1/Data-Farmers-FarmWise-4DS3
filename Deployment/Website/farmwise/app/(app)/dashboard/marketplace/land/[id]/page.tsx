'use client';

import { useState } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  Image, 
  Text, 
  Group, 
  Badge, 
  Button, 
  ActionIcon, 
  Title, 
  Stack, 
  Paper, 
  Divider,
  Table,
  Avatar,
  Flex,
  Box,
  Timeline,
  Tabs,
  Indicator,
  Chip,
  Alert,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { 
  IconArrowLeft, 
  IconHeart, 
  IconHeartFilled, 
  IconShare, 
  IconMapPin, 
  IconRuler, 
  IconDroplet, 
  IconBolt, 
  IconRoad, 
  IconToolsKitchen2, 
  IconUser, 
  IconPhone, 
  IconMessage, 
  IconCalendar,
  IconInfoCircle,
  IconMoneybag,
  IconAlertCircle,
  IconChartBar,
} from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import classes from '../../Marketplace.module.css';

// Mock land data for the detailed view
const mockLand = {
  id: 'land-1',
  type: 'land',
  title: 'Fertile Farmland with Irrigation Access',
  description: 'This prime agricultural land is perfect for growing a variety of crops. It features excellent irrigation access, fertile soil with good drainage, and convenient location just 5km from main highway. The property has been used for tomato and corn cultivation in the past 5 years with excellent yields. Electricity connection is available at the property boundary, and there is easy access to the main road.',
  price: 250000,
  priceType: 'sale',
  currency: 'TND',
  location: 'Sfax, Tunisia',
  fullAddress: 'Route de Tunis, Km 8, Sfax, Tunisia',
  size: {
    value: 10,
    unit: 'hectares'
  },
  access: {
    water: true,
    electricity: true,
    road: true,
    irrigation: true
  },
  soilType: 'Loamy soil with good drainage',
  currentUse: 'Corn cultivation',
  previousUse: ['Tomatoes', 'Wheat', 'Vegetables'],
  additionalFeatures: ['Storage shed', 'Fenced perimeter', 'Natural windbreak trees'],
  images: [
    '/images/marketplace/land1.jpg',
    '/images/marketplace/land2.jpg', 
    '/images/marketplace/land3.jpg',
    '/images/marketplace/land4.jpg'
  ],
  predictedValue: 245000,
  valuationDetails: {
    landBaseValue: 200000,
    accessFactor: 25000,
    locationFactor: 15000,
    soilQualityFactor: 5000,
  },
  createdAt: '2023-04-15T10:30:00Z',
  updatedAt: '2023-05-10T14:22:00Z',
  ownerId: 'user-123',
  ownerName: 'Ahmed Moussa',
  ownerImage: '/images/avatars/user-1.jpg',
  ownerPhone: '+216 55 123 456',
  ownerJoinDate: '2022-01-15',
  isActive: true,
  featuredBadge: 'Hot Offer',
  coordinates: {
    latitude: 34.7478469,
    longitude: 10.7631185
  },
  boundary: {
    type: 'Polygon',
    coordinates: [
      [
        [10.761, 34.746],
        [10.767, 34.746],
        [10.767, 34.749],
        [10.761, 34.749],
        [10.761, 34.746]
      ]
    ]
  }
};

// Mock similar listings
const similarListings = [
  {
    id: 'land-2',
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
  },
  {
    id: 'land-3',
    title: 'Farm Land with Olive Trees',
    price: 180000,
    priceType: 'sale',
    currency: 'TND',
    location: 'Sfax, Tunisia',
    size: '7 hectares',
    access: ['Water', 'Electricity', 'Road'],
    image: '/images/marketplace/land3.jpg',
    predictedValue: 185000,
  },
];

export default function LandDetailPage() {
  const router = useRouter();
  const params = useParams();
  const landId = params.id as string;
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // In a real app, you would fetch data based on the ID
  const land = mockLand; // This would be fetched from an API
  
  // Helper function to format price
  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };
  
  const priceDifference = land.predictedValue ? land.predictedValue - land.price : 0;
  const priceDifferencePercentage = land.predictedValue 
    ? ((land.predictedValue - land.price) / land.price * 100).toFixed(1) 
    : '0';
  
  const isPriceGood = priceDifference >= 0;
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  const handleContact = () => {
    // Implementation for contacting the owner
    alert('Contact functionality will be implemented');
  };
  
  const handleMakeOffer = () => {
    // Implementation for making an offer
    alert('Offer functionality will be implemented');
  };
  
  return (
    <Container fluid px="md">
      <Group mb="md">
        <ActionIcon variant="subtle" onClick={() => router.back()}>
          <IconArrowLeft size={18} />
        </ActionIcon>
        <Text c="dimmed" size="sm">Back to listings</Text>
      </Group>
      
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Card.Section>
              <Carousel
                withIndicators
                height={400}
                slideSize="100%"
                slideGap="md"
                loop
                align="start"
                slidesToScroll={1}
              >
                {land.images.map((img, index) => (
                  <Carousel.Slide key={index}>
                    <Image
                      src={img}
                      height={400}
                      alt={`${land.title} - Image ${index + 1}`}
                      fallbackSrc="https://placehold.co/600x400?text=FarmWise"
                    />
                  </Carousel.Slide>
                ))}
              </Carousel>
            </Card.Section>
            
            <Group justify="space-between" mt="md" mb="xs">
              <Title order={2}>{land.title}</Title>
              <Group>
                <ActionIcon 
                  variant="subtle" 
                  color="red" 
                  onClick={toggleFavorite}
                  aria-label="Toggle favorite"
                >
                  {isFavorite ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
                </ActionIcon>
                <ActionIcon 
                  variant="subtle" 
                  aria-label="Share"
                >
                  <IconShare size={20} />
                </ActionIcon>
              </Group>
            </Group>
            
            <Group mb="md">
              <Badge color="blue" size="lg">
                {land.priceType === 'sale' ? 'For Sale' : 'For Rent'}
              </Badge>
              <Badge color="gray" size="lg">
                <Group gap={4}>
                  <IconMapPin size={14} />
                  <Text>{land.location}</Text>
                </Group>
              </Badge>
              <Badge color="gray" size="lg">
                <Group gap={4}>
                  <IconRuler size={14} />
                  <Text>{land.size.value} {land.size.unit}</Text>
                </Group>
              </Badge>
              {land.featuredBadge && (
                <Badge color="orange" size="lg">
                  {land.featuredBadge}
                </Badge>
              )}
            </Group>
            
            <Flex justify="space-between" mb="md">
              <Stack gap={0}>
                <Text size="xl" fw={700}>{formatPrice(land.price)}</Text>
                <Text size="sm" c={isPriceGood ? "green.7" : "red.7"}>
                  Model valuation: {formatPrice(land.predictedValue || 0)}
                  {priceDifference !== 0 && (
                    <> ({isPriceGood ? '+' : ''}{priceDifferencePercentage}%)</>
                  )}
                </Text>
              </Stack>
            </Flex>
            
            <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')}>
              <Tabs.List>
                <Tabs.Tab value="overview">Overview</Tabs.Tab>
                <Tabs.Tab value="details">Details</Tabs.Tab>
                <Tabs.Tab value="valuation">Valuation</Tabs.Tab>
                <Tabs.Tab value="map">Map</Tabs.Tab>
              </Tabs.List>
              
              <Tabs.Panel value="overview" pt="md">
                <Card p="md" radius="md" withBorder>
                  <Title order={3} mb="sm">Property Description</Title>
                  <Text mb="lg">{land.description}</Text>
                  
                  <Title order={3} mb="sm">Features & Access</Title>
                  <Grid mb="lg">
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                      <Paper p="sm" radius="md" withBorder className={land.access.water ? undefined : classes.featureDisabled}>
                        <Group gap="sm">
                          <IconDroplet size={24} color={land.access.water ? 'blue' : 'gray'} />
                          <Text fw={500}>Water Access</Text>
                        </Group>
                      </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                      <Paper p="sm" radius="md" withBorder className={land.access.electricity ? undefined : classes.featureDisabled}>
                        <Group gap="sm">
                          <IconBolt size={24} color={land.access.electricity ? 'yellow' : 'gray'} />
                          <Text fw={500}>Electricity</Text>
                        </Group>
                      </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                      <Paper p="sm" radius="md" withBorder className={land.access.road ? undefined : classes.featureDisabled}>
                        <Group gap="sm">
                          <IconRoad size={24} color={land.access.road ? 'green' : 'gray'} />
                          <Text fw={500}>Road Access</Text>
                        </Group>
                      </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                      <Paper p="sm" radius="md" withBorder className={land.access.irrigation ? undefined : classes.featureDisabled}>
                        <Group gap="sm">
                          <IconToolsKitchen2 size={24} color={land.access.irrigation ? 'cyan' : 'gray'} />
                          <Text fw={500}>Irrigation</Text>
                        </Group>
                      </Paper>
                    </Grid.Col>
                  </Grid>
                  
                  <Title order={3} mb="sm">Additional Information</Title>
                  <Table>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td fw={500}>Soil Type</Table.Td>
                        <Table.Td>{land.soilType}</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td fw={500}>Current Use</Table.Td>
                        <Table.Td>{land.currentUse}</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td fw={500}>Previous Use</Table.Td>
                        <Table.Td>{land.previousUse.join(', ')}</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td fw={500}>Full Address</Table.Td>
                        <Table.Td>{land.fullAddress}</Table.Td>
                      </Table.Tr>
                      {land.additionalFeatures && (
                        <Table.Tr>
                          <Table.Td fw={500}>Additional Features</Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              {land.additionalFeatures.map((feature, idx) => (
                                <Chip key={idx} checked={false}>{feature}</Chip>
                              ))}
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      )}
                    </Table.Tbody>
                  </Table>
                </Card>
              </Tabs.Panel>
              
              <Tabs.Panel value="details" pt="md">
                <Card p="md" radius="md" withBorder>
                  <Title order={3} mb="sm">Property Details</Title>
                  <Table>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td fw={500}>Property ID</Table.Td>
                        <Table.Td>{land.id}</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td fw={500}>Property Type</Table.Td>
                        <Table.Td>Agricultural Land</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td fw={500}>Size</Table.Td>
                        <Table.Td>{land.size.value} {land.size.unit}</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td fw={500}>Listed Date</Table.Td>
                        <Table.Td>{new Date(land.createdAt).toLocaleDateString()}</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td fw={500}>Last Updated</Table.Td>
                        <Table.Td>{new Date(land.updatedAt).toLocaleDateString()}</Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                  
                  <Divider my="md" />
                  
                  <Title order={3} mb="sm">Location Information</Title>
                  <Table>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td fw={500}>Address</Table.Td>
                        <Table.Td>{land.fullAddress}</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td fw={500}>Region</Table.Td>
                        <Table.Td>{land.location}</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td fw={500}>Coordinates</Table.Td>
                        <Table.Td>Lat: {land.coordinates.latitude}, Long: {land.coordinates.longitude}</Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                </Card>
              </Tabs.Panel>
              
              <Tabs.Panel value="valuation" pt="md">
                <Card p="md" radius="md" withBorder>
                  <Group mb="md">
                    <IconMoneybag size={24} />
                    <Title order={3}>AI-Powered Land Valuation</Title>
                  </Group>
                  
                  <Alert icon={<IconInfoCircle size={16} />} title="About This Valuation" color="blue" mb="md">
                    Our AI model analyzes location, size, soil quality, access to utilities, and recent market data to estimate land value.
                  </Alert>
                  
                  <Stack gap="md">
                    <Box>
                      <Title order={3} mb="md">Estimated Value</Title>
                      <Paper p="lg" radius="md" withBorder>
                        <Grid>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Stack align="center" gap="xs" mb="md">
                              <Text c="dimmed" size="sm">AI Estimated Value</Text>
                              <Text fw={700} size="xl" style={{ fontSize: '32px' }}>
                                {formatPrice(land.predictedValue || 0)} TND
                              </Text>
                              <Badge 
                                color={isPriceGood ? "green" : "red"} 
                                size="lg" 
                                radius="sm"
                              >
                                {isPriceGood ? 'Good Value' : 'Potentially Overpriced'}
                              </Badge>
                            </Stack>
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Stack align="center" gap="xs" mb="md">
                              <Text c="dimmed" size="sm">Listing Price</Text>
                              <Text fw={700} size="xl" style={{ fontSize: '32px' }}>
                                {formatPrice(land.price)} TND
                              </Text>
                              <Text size="sm" c={isPriceGood ? "green.7" : "red.7"} fw={500}>
                                {isPriceGood 
                                  ? `${priceDifferencePercentage}% below estimate` 
                                  : `${Math.abs(Number(priceDifferencePercentage))}% above estimate`
                                }
                              </Text>
                            </Stack>
                          </Grid.Col>
                        </Grid>
                        
                        <Divider my="md" />
                        
                        <Group justify="space-between" p="sm" style={{ backgroundColor: isPriceGood ? 'rgba(0, 180, 0, 0.05)' : 'rgba(255, 0, 0, 0.05)', borderRadius: 'var(--mantine-radius-md)' }}>
                          <Group>
                            <ActionIcon 
                              color={isPriceGood ? "green" : "red"} 
                              variant="light"
                              radius="xl"
                              size="lg"
                            >
                              {isPriceGood 
                                ? <IconInfoCircle size={20} /> 
                                : <IconAlertCircle size={20} />
                              }
                            </ActionIcon>
                            <Text fw={500}>
                              {isPriceGood 
                                ? 'This property may be a good investment' 
                                : 'This property may be overpriced'
                              }
                            </Text>
                          </Group>
                          <Text fw={700}>
                            {isPriceGood ? '+' : ''}{formatPrice(priceDifference)} TND
                          </Text>
                        </Group>
                        
                        <Text size="xs" c="dimmed" mt="sm" ta="center">
                          Valuation accuracy: High (based on 24 similar properties)
                        </Text>
                      </Paper>
                    </Box>
                    
                    <Box>
                      <Title order={4} mb="xs">Value Composition</Title>
                      <Paper p="md" radius="md" withBorder>
                        <Table>
                          <Table.Tbody>
                            {Object.entries(land.valuationDetails).map(([key, value]) => {
                              const label = key
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, str => str.toUpperCase());
                              
                              return (
                                <Table.Tr key={key}>
                                  <Table.Td>{label}</Table.Td>
                                  <Table.Td>{formatPrice(value)}</Table.Td>
                                </Table.Tr>
                              );
                            })}
                          </Table.Tbody>
                        </Table>
                      </Paper>
                    </Box>
                    
                    <Box>
                      <Title order={4} mb="xs">Market Analysis</Title>
                      <Paper p="md" radius="md" withBorder>
                        <Text mb="md">
                          Based on our analysis of 24 similar properties in the area, this listing is priced{' '}
                          <Text span fw={700} c={isPriceGood ? "green.7" : "red.7"}>
                            {isPriceGood ? 'below' : 'above'} the average market value by {Math.abs(Number(priceDifferencePercentage))}%
                          </Text>.
                        </Text>
                        <Group mb="xs">
                          <IconChartBar size={18} />
                          <Text fw={500}>Price per Hectare Comparison</Text>
                        </Group>
                        <Text size="sm" mb="md">
                          This property: {formatPrice(land.price / land.size.value)} per hectare
                          <br />
                          Area average: {formatPrice(land.predictedValue ? land.predictedValue / land.size.value : 0)} per hectare
                        </Text>
                      </Paper>
                    </Box>
                    
                    <Box>
                      <Alert icon={<IconAlertCircle size={16} />} title="Valuation Disclaimer" color="yellow">
                        This AI valuation is an estimate based on available data and should be used as a reference only. 
                        For an official valuation, consult with a certified appraiser.
                      </Alert>
                    </Box>
                  </Stack>
                </Card>
              </Tabs.Panel>
              
              <Tabs.Panel value="map" pt="md">
                <Card p="md" radius="md" withBorder>
                  <Title order={3} mb="sm">Property Location</Title>
                  <div className={classes.mapContainer}>
                    {/* Replace with an actual map component */}
                    <Box
                      style={{
                        height: '300px',
                        backgroundColor: '#edf2f7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Text c="dimmed">Map Component would render here with the property boundary</Text>
                    </Box>
                  </div>
                  <Table>
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td fw={500}>Address</Table.Td>
                        <Table.Td>{land.fullAddress}</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td fw={500}>Coordinates</Table.Td>
                        <Table.Td>
                          <Group gap={8}>
                            <Text>Lat: {land.coordinates.latitude}</Text>
                            <Text>Long: {land.coordinates.longitude}</Text>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                </Card>
              </Tabs.Panel>
            </Tabs>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Group mb="md">
                <Avatar src={land.ownerImage} radius="xl" size="lg" />
                <Stack gap={0}>
                  <Text fw={500}>{land.ownerName}</Text>
                  <Group gap={4}>
                    <IconCalendar size={14} />
                    <Text size="xs" c="dimmed">Member since {new Date(land.ownerJoinDate).toLocaleDateString()}</Text>
                  </Group>
                </Stack>
              </Group>
              
              <Button fullWidth mb="sm" leftSection={<IconPhone size={16} />} onClick={handleContact}>
                Contact Seller
              </Button>
              
              <Button variant="outline" fullWidth leftSection={<IconMessage size={16} />} onClick={handleMakeOffer}>
                Make an Offer
              </Button>
            </Card>
            
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Title order={4} mb="md">Similar Properties</Title>
              <Stack gap="md">
                {similarListings.map((listing) => (
                  <Card key={listing.id} component={Link} href={`/dashboard/marketplace/land/${listing.id}`} p="xs" withBorder>
                    <Group>
                      <Image
                        src={listing.image}
                        width={80}
                        height={60}
                        radius="md"
                        alt={listing.title}
                      />
                      <Stack gap={0} style={{ flex: 1 }}>
                        <Text lineClamp={1} fw={500}>{listing.title}</Text>
                        <Group gap={4}>
                          <IconMapPin size={12} />
                          <Text size="xs" c="dimmed">{listing.location}</Text>
                        </Group>
                        <Text fw={700} mt={4}>
                          {listing.price.toLocaleString()} TND
                          {listing.priceType === 'rent' && <Text span size="xs" c="dimmed"> /{listing.period}</Text>}
                        </Text>
                      </Stack>
                    </Group>
                  </Card>
                ))}
              </Stack>
              
              <Button
                variant="subtle"
                fullWidth 
                mt="md"
                component={Link}
                href="/dashboard/marketplace?type=land"
              >
                View All Similar Properties
              </Button>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
} 