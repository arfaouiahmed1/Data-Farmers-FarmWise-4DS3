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
  Tabs,
  Alert,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { 
  IconArrowLeft, 
  IconHeart, 
  IconHeartFilled, 
  IconShare, 
  IconMapPin, 
  IconCalendar,
  IconClock, 
  IconInfoCircle,
  IconTractor,
  IconCalendarEvent,
  IconPhone,
  IconMessage,
  IconStar,
  IconStarFilled,
  IconStarHalfFilled,
  IconBrandProducthunt,
  IconTag,
} from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import classes from '../../Marketplace.module.css';

// Mock equipment data
const mockEquipment = {
  id: 'equip-1',
  type: 'equipment',
  title: 'Modern Tractor with GPS',
  description: 'This John Deere 5075E utility tractor is perfect for small to medium farms. It comes equipped with GPS guidance system, air-conditioned cabin, and front loader attachment. The equipment has been well-maintained and serviced regularly.',
  price: 3500,
  priceType: 'rent',
  period: 'week',
  currency: 'TND',
  location: 'Tunis, Tunisia',
  fullAddress: 'Rue de la Ferme 123, Tunis, Tunisia',
  category: 'Tractors & Implements',
  brand: 'John Deere',
  model: '5075E',
  manufactureYear: 2019,
  condition: 'Excellent',
  specifications: {
    engine: '75 HP Diesel Engine',
    transmission: '12F/12R PowrReverser™',
    weight: '3,600 kg',
    dimensions: '4.3m x 2.1m x 2.6m',
    features: ['GPS Guidance', 'Air Conditioning', 'Front Loader', 'Rear PTO']
  },
  rentalInfo: {
    period: 'week',
    minimumRental: 1,
    availableFrom: '2023-06-01',
    availableTo: '2023-12-31',
    securityDeposit: 10000
  },
  images: [
    '/images/marketplace/tractor1.jpg',
    '/images/marketplace/tractor2.jpg', 
    '/images/marketplace/tractor3.jpg',
    '/images/marketplace/tractor4.jpg'
  ],
  createdAt: '2023-05-15T10:30:00Z',
  updatedAt: '2023-05-20T14:22:00Z',
  ownerId: 'user-456',
  ownerName: 'Slim Abidi',
  ownerImage: '/images/avatars/user-2.jpg',
  ownerPhone: '+216 22 987 654',
  ownerJoinDate: '2022-03-10',
  ownerRating: 4.8,
  reviewCount: 23,
  isActive: true,
  featuredBadge: 'Top Rated',
};

// Mock similar listings
const similarListings = [
  {
    id: 'equip-2',
    title: 'Combine Harvester',
    price: 5000,
    priceType: 'rent',
    period: 'week',
    currency: 'TND',
    location: 'Bizerte, Tunisia',
    condition: 'Good',
    image: '/images/marketplace/harvester1.jpg',
  },
  {
    id: 'equip-3',
    title: 'Seed Drill',
    price: 1200,
    priceType: 'rent',
    period: 'week',
    currency: 'TND',
    location: 'Sfax, Tunisia',
    condition: 'Very Good',
    image: '/images/marketplace/seeddrill1.jpg',
  },
];

export default function EquipmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const equipmentId = params.id as string;
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedDates, setSelectedDates] = useState<[Date | null, Date | null]>([null, null]);
  const [rentalDuration, setRentalDuration] = useState(1);
  
  // In a real app, you would fetch data based on the ID
  const equipment = mockEquipment; // This would be fetched from an API
  
  // Helper function to format price
  const formatPrice = (price: number) => {
    return price.toLocaleString() + ' ' + equipment.currency;
  };
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  const handleRent = () => {
    // Implementation for renting the equipment
    alert('Rental functionality will be implemented');
  };
  
  const handleContact = () => {
    // Implementation for contacting the owner
    alert('Contact functionality will be implemented');
  };
  
  // Function to render star rating
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <Group gap={2}>
        {[...Array(fullStars)].map((_, i) => (
          <IconStarFilled key={`full-${i}`} size={16} color="#FFD700" />
        ))}
        {halfStar && <IconStarHalfFilled size={16} color="#FFD700" />}
        {[...Array(emptyStars)].map((_, i) => (
          <IconStar key={`empty-${i}`} size={16} color="#FFD700" />
        ))}
        <Text size="sm" span>({equipment.reviewCount})</Text>
      </Group>
    );
  };
  
  // Calculate total rental cost
  const calculateTotalCost = () => {
    if (!equipment.price) return 0;
    return equipment.price * rentalDuration;
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
                {equipment.images.map((img, index) => (
                  <Carousel.Slide key={index}>
                    <Image
                      src={img}
                      height={400}
                      alt={`${equipment.title} - Image ${index + 1}`}
                      fallbackSrc="https://placehold.co/600x400?text=FarmWise"
                    />
                  </Carousel.Slide>
                ))}
              </Carousel>
            </Card.Section>
            
            <Group justify="space-between" mt="md" mb="xs">
              <Title order={2}>{equipment.title}</Title>
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
              <Badge color={equipment.priceType === 'sale' ? 'blue' : 'green'} size="lg">
                {equipment.priceType === 'sale' ? 'For Sale' : 'For Rent'}
              </Badge>
              <Badge color="gray" size="lg">
                <Group gap={4}>
                  <IconMapPin size={14} />
                  <Text>{equipment.location}</Text>
                </Group>
              </Badge>
              <Badge color="gray" size="lg">
                <Group gap={4}>
                  <IconTag size={14} />
                  <Text>{equipment.condition}</Text>
                </Group>
              </Badge>
              {equipment.featuredBadge && (
                <Badge color="orange" size="lg">
                  {equipment.featuredBadge}
                </Badge>
              )}
            </Group>
            
            <Flex justify="space-between" mb="md">
              <Stack gap={0}>
                <Group gap={4} align="baseline">
                  <Text size="xl" fw={700}>{formatPrice(equipment.price)}</Text>
                  {equipment.priceType === 'rent' && (
                    <Text size="sm" c="dimmed">/{equipment.period}</Text>
                  )}
                </Group>
                {equipment.priceType === 'rent' && equipment.rentalInfo?.minimumRental && (
                  <Text size="sm" c="dimmed">
                    Minimum rental: {equipment.rentalInfo.minimumRental} {equipment.rentalInfo.minimumRental === 1 ? equipment.period : equipment.period + 's'}
                  </Text>
                )}
              </Stack>
            </Flex>
            
            <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')}>
              <Tabs.List>
                <Tabs.Tab value="overview">Overview</Tabs.Tab>
                <Tabs.Tab value="specifications">Specifications</Tabs.Tab>
                <Tabs.Tab value="rental">Rental Details</Tabs.Tab>
                <Tabs.Tab value="seller">About Seller</Tabs.Tab>
              </Tabs.List>
              
              <Tabs.Panel value="overview" pt="md">
                <Card p="md" radius="md" withBorder>
                  <Title order={3} mb="sm">Equipment Description</Title>
                  <Text mb="lg">{equipment.description}</Text>
                  
                  <Title order={3} mb="sm">General Information</Title>
                  <Grid mb="lg">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Table>
                        <Table.Tbody>
                          <Table.Tr>
                            <Table.Td fw={500}>Brand</Table.Td>
                            <Table.Td>{equipment.brand}</Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td fw={500}>Model</Table.Td>
                            <Table.Td>{equipment.model}</Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td fw={500}>Year</Table.Td>
                            <Table.Td>{equipment.manufactureYear}</Table.Td>
                          </Table.Tr>
                        </Table.Tbody>
                      </Table>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Table>
                        <Table.Tbody>
                          <Table.Tr>
                            <Table.Td fw={500}>Condition</Table.Td>
                            <Table.Td>{equipment.condition}</Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td fw={500}>Category</Table.Td>
                            <Table.Td>{equipment.category}</Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td fw={500}>Location</Table.Td>
                            <Table.Td>{equipment.fullAddress}</Table.Td>
                          </Table.Tr>
                        </Table.Tbody>
                      </Table>
                    </Grid.Col>
                  </Grid>
                  
                  {equipment.priceType === 'rent' && equipment.rentalInfo && (
                    <>
                      <Title order={3} mb="sm">Availability</Title>
                      <Group gap="md" mb="md">
                        <Card withBorder p="xs">
                          <Group gap={8}>
                            <IconCalendarEvent size={18} />
                            <Text fw={500}>Available From</Text>
                          </Group>
                          <Text>{new Date(equipment.rentalInfo.availableFrom).toLocaleDateString()}</Text>
                        </Card>
                        
                        <Card withBorder p="xs">
                          <Group gap={8}>
                            <IconCalendarEvent size={18} />
                            <Text fw={500}>Available Until</Text>
                          </Group>
                          <Text>{new Date(equipment.rentalInfo.availableTo).toLocaleDateString()}</Text>
                        </Card>
                        
                        <Card withBorder p="xs">
                          <Group gap={8}>
                            <IconClock size={18} />
                            <Text fw={500}>Minimum Rental</Text>
                          </Group>
                          <Text>{equipment.rentalInfo.minimumRental} {equipment.period}(s)</Text>
                        </Card>
                      </Group>
                    </>
                  )}
                </Card>
              </Tabs.Panel>
              
              <Tabs.Panel value="specifications" pt="md">
                <Card p="md" radius="md" withBorder>
                  <Title order={3} mb="sm">Technical Specifications</Title>
                  <Table>
                    <Table.Tbody>
                      {Object.entries(equipment.specifications).map(([key, value]) => {
                        // Format the key for display
                        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
                        
                        if (Array.isArray(value)) {
                          return (
                            <Table.Tr key={key}>
                              <Table.Td fw={500}>{formattedKey}</Table.Td>
                              <Table.Td>{value.join(', ')}</Table.Td>
                            </Table.Tr>
                          );
                        } else {
                          return (
                            <Table.Tr key={key}>
                              <Table.Td fw={500}>{formattedKey}</Table.Td>
                              <Table.Td>{value}</Table.Td>
                            </Table.Tr>
                          );
                        }
                      })}
                    </Table.Tbody>
                  </Table>
                </Card>
              </Tabs.Panel>
              
              <Tabs.Panel value="rental" pt="md">
                <Card p="md" radius="md" withBorder>
                  <Title order={3} mb="sm">Rental Information</Title>
                  
                  <Alert icon={<IconInfoCircle size={16} />} title="Rental Policy" color="blue" mb="md">
                    Equipment must be returned in the same condition. Any damage will be assessed and charged accordingly.
                    Delivery and pickup can be arranged for an additional fee.
                  </Alert>
                  
                  <Grid mb="lg">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Table>
                        <Table.Tbody>
                          <Table.Tr>
                            <Table.Td fw={500}>Rental Rate</Table.Td>
                            <Table.Td>{formatPrice(equipment.price)} per {equipment.period}</Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td fw={500}>Minimum Duration</Table.Td>
                            <Table.Td>{equipment.rentalInfo?.minimumRental} {equipment.period}(s)</Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td fw={500}>Available From</Table.Td>
                            <Table.Td>{new Date(equipment.rentalInfo?.availableFrom || '').toLocaleDateString()}</Table.Td>
                          </Table.Tr>
                        </Table.Tbody>
                      </Table>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Table>
                        <Table.Tbody>
                          <Table.Tr>
                            <Table.Td fw={500}>Available Until</Table.Td>
                            <Table.Td>{new Date(equipment.rentalInfo?.availableTo || '').toLocaleDateString()}</Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td fw={500}>Security Deposit</Table.Td>
                            <Table.Td>{formatPrice(equipment.rentalInfo?.securityDeposit || 0)}</Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td fw={500}>Payment Terms</Table.Td>
                            <Table.Td>50% upfront, 50% on delivery</Table.Td>
                          </Table.Tr>
                        </Table.Tbody>
                      </Table>
                    </Grid.Col>
                  </Grid>
                  
                  <Divider my="md" />
                  
                  <Title order={4} mb="md">Cost Calculation</Title>
                  <Paper p="md" withBorder>
                    <Group justify="space-between">
                      <Text>Rental Duration</Text>
                      <Box>
                        <Group>
                          <Button 
                            size="xs" 
                            variant="outline" 
                            onClick={() => setRentalDuration(Math.max(equipment.rentalInfo?.minimumRental || 1, rentalDuration - 1))}
                          >
                            -
                          </Button>
                          <Text fw={500}>{rentalDuration} {rentalDuration === 1 ? equipment.period : equipment.period + 's'}</Text>
                          <Button 
                            size="xs" 
                            variant="outline" 
                            onClick={() => setRentalDuration(rentalDuration + 1)}
                          >
                            +
                          </Button>
                        </Group>
                      </Box>
                    </Group>
                    
                    <Divider my="md" />
                    
                    <Group justify="space-between">
                      <Text>Equipment Rental</Text>
                      <Text>{formatPrice(equipment.price)} x {rentalDuration}</Text>
                    </Group>
                    
                    <Group justify="space-between" mt="xs">
                      <Text>Security Deposit (Refundable)</Text>
                      <Text>{formatPrice(equipment.rentalInfo?.securityDeposit || 0)}</Text>
                    </Group>
                    
                    <Divider my="md" />
                    
                    <Group justify="space-between">
                      <Text fw={700}>Total Cost</Text>
                      <Text fw={700} size="lg">{formatPrice(calculateTotalCost())}</Text>
                    </Group>
                    
                    <Button fullWidth mt="md" onClick={handleRent} leftSection={<IconTractor size={16} />}>
                      Rent This Equipment
                    </Button>
                  </Paper>
                </Card>
              </Tabs.Panel>
              
              <Tabs.Panel value="seller" pt="md">
                <Card p="md" radius="md" withBorder>
                  <Group mb="lg">
                    <Avatar src={equipment.ownerImage} radius="xl" size="xl" />
                    <Stack gap={5}>
                      <Text fw={700} size="lg">{equipment.ownerName}</Text>
                      <Group>
                        {renderRating(equipment.ownerRating)}
                      </Group>
                      <Group gap={4}>
                        <IconCalendar size={14} />
                        <Text size="sm" c="dimmed">Member since {new Date(equipment.ownerJoinDate).toLocaleDateString()}</Text>
                      </Group>
                      <Text size="sm">{equipment.reviewCount} verified rentals</Text>
                    </Stack>
                  </Group>
                  
                  <Alert title="Verified Owner" color="green" mb="md">
                    This equipment owner has been verified by FarmWise. Identity and business documents have been checked.
                  </Alert>
                  
                  <Button fullWidth mb="sm" leftSection={<IconPhone size={16} />} onClick={handleContact}>
                    Contact Owner
                  </Button>
                  
                  <Button variant="outline" fullWidth leftSection={<IconMessage size={16} />}>
                    Send Message
                  </Button>
                </Card>
              </Tabs.Panel>
            </Tabs>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Title order={4} mb="md">Quick Rental</Title>
              <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="md">
                Reserve this equipment now with just a few clicks.
              </Alert>
              
              <Paper p="md" withBorder mb="md">
                <Group justify="space-between">
                  <Text>Rental Duration</Text>
                  <Box>
                    <Group>
                      <Button 
                        size="xs" 
                        variant="outline" 
                        onClick={() => setRentalDuration(Math.max(equipment.rentalInfo?.minimumRental || 1, rentalDuration - 1))}
                      >
                        -
                      </Button>
                      <Text fw={500}>{rentalDuration} {rentalDuration === 1 ? equipment.period : equipment.period + 's'}</Text>
                      <Button 
                        size="xs" 
                        variant="outline" 
                        onClick={() => setRentalDuration(rentalDuration + 1)}
                      >
                        +
                      </Button>
                    </Group>
                  </Box>
                </Group>
                
                <Divider my="md" />
                
                <Group justify="space-between">
                  <Text fw={700}>Total Cost</Text>
                  <Text fw={700} size="lg">{formatPrice(calculateTotalCost())}</Text>
                </Group>
              </Paper>
              
              <Button fullWidth mb="xs" leftSection={<IconCalendarEvent size={16} />} onClick={handleRent}>
                Reserve Now
              </Button>
              
              <Text size="xs" c="dimmed" ta="center">
                * Security deposit of {formatPrice(equipment.rentalInfo?.securityDeposit || 0)} required
              </Text>
            </Card>
            
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Title order={4} mb="md">Similar Equipment</Title>
              <Stack gap="md">
                {similarListings.map((listing) => (
                  <Card key={listing.id} component={Link} href={`/dashboard/marketplace/equipment/${listing.id}`} p="xs" withBorder>
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
                href="/dashboard/marketplace?type=equipment"
              >
                View All Similar Equipment
              </Button>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
} 