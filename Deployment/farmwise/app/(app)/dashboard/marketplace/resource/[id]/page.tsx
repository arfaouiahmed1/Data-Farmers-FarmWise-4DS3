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
  NumberInput,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { 
  IconArrowLeft, 
  IconHeart, 
  IconHeartFilled, 
  IconShare, 
  IconMapPin, 
  IconCalendar,
  IconInfoCircle,
  IconPhone,
  IconMessage,
  IconCertificate, 
  IconPlant2,
  IconTruckDelivery,
  IconShoppingCart,
  IconClock,
  IconLeaf,
  IconPackage,
  IconScale,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import classes from '../../Marketplace.module.css';

// Mock resource data
const mockResource = {
  id: 'resource-1',
  type: 'resource',
  title: 'Premium Organic Fertilizer',
  description: 'This high-quality organic fertilizer is perfect for all types of crops. Made from 100% natural ingredients, it enriches soil with essential nutrients while improving soil structure. Our fertilizer is certified organic and free from harmful chemicals.',
  price: 1200,
  priceType: 'sale',
  currency: 'TND',
  location: 'Kairouan, Tunisia',
  fullAddress: 'Zone Industrielle, Kairouan, Tunisia',
  category: 'Fertilizers',
  quantity: {
    value: 1000,
    unit: 'kg',
  },
  availability: 5000,
  minPurchase: 500,
  expiryDate: '2025-12-31',
  certification: ['Organic Certified', 'Eco-Friendly', 'ECOCERT'],
  origin: 'Tunisia',
  manufacturer: 'AgriNutrients Plus',
  composition: {
    'Nitrogen (N)': '8%',
    'Phosphorus (P)': '6%',
    'Potassium (K)': '7%',
    'Organic Matter': '65%',
    'Humic Acid': '12%'
  },
  suitableFor: ['Vegetables', 'Fruits', 'Grains', 'Flowers'],
  applicationRate: '5-10 kg per hectare',
  images: [
    '/images/marketplace/fertilizer1.jpg',
    '/images/marketplace/fertilizer2.jpg', 
    '/images/marketplace/fertilizer3.jpg',
  ],
  createdAt: '2023-05-10T08:30:00Z',
  updatedAt: '2023-05-15T11:22:00Z',
  ownerId: 'user-789',
  ownerName: 'Leila Mansour',
  ownerImage: '/images/avatars/user-3.jpg',
  ownerPhone: '+216 33 567 890',
  ownerJoinDate: '2022-02-05',
  isActive: true,
  featuredBadge: 'Best Seller',
  shippingInfo: {
    available: true,
    cost: 50,
    freeThreshold: 2500,
    deliveryTime: '2-3 business days',
    methods: ['Truck Delivery', 'Pickup']
  }
};

// Mock similar listings
const similarListings = [
  {
    id: 'resource-2',
    title: 'High-Yield Wheat Seeds',
    price: 800,
    priceType: 'sale',
    currency: 'TND',
    location: 'Nabeul, Tunisia',
    quantity: '50 kg',
    image: '/images/marketplace/seeds1.jpg',
  },
  {
    id: 'resource-3',
    title: 'Natural Pesticide Solution',
    price: 450,
    priceType: 'sale',
    currency: 'TND',
    location: 'Sfax, Tunisia',
    quantity: '20 L',
    image: '/images/marketplace/pesticide1.jpg',
  },
];

export default function ResourceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const resourceId = params.id as string;
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [quantity, setQuantity] = useState(mockResource.minPurchase);
  
  // In a real app, you would fetch data based on the ID
  const resource = mockResource; // This would be fetched from an API
  
  // Helper function to format price
  const formatPrice = (price: number) => {
    return price.toLocaleString() + ' ' + resource.currency;
  };
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  const handleContact = () => {
    // Implementation for contacting the owner
    alert('Contact functionality will be implemented');
  };
  
  const handlePurchase = () => {
    // Implementation for purchasing the resource
    alert(`Purchase ${quantity}${resource.quantity.unit} functionality will be implemented`);
  };
  
  // Calculate total cost
  const calculateTotalCost = () => {
    if (!resource.price || !quantity) return 0;
    const pricePerUnit = resource.price / resource.quantity.value;
    return pricePerUnit * quantity;
  };
  
  // Calculate shipping cost
  const calculateShippingCost = () => {
    if (!resource.shippingInfo?.available) return 0;
    const totalProductCost = calculateTotalCost();
    if (totalProductCost >= resource.shippingInfo.freeThreshold) return 0;
    return resource.shippingInfo.cost;
  };
  
  // Calculate final total
  const calculateFinalTotal = () => {
    return calculateTotalCost() + calculateShippingCost();
  };
  
  // Check if resource is still in stock
  const isInStock = resource.availability > 0;
  
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
                {resource.images.map((img, index) => (
                  <Carousel.Slide key={index}>
                    <Image
                      src={img}
                      height={400}
                      alt={`${resource.title} - Image ${index + 1}`}
                      fallbackSrc="https://placehold.co/600x400?text=FarmWise"
                    />
                  </Carousel.Slide>
                ))}
              </Carousel>
            </Card.Section>
            
            <Group justify="space-between" mt="md" mb="xs">
              <Title order={2}>{resource.title}</Title>
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
                For Sale
              </Badge>
              <Badge color="gray" size="lg">
                <Group gap={4}>
                  <IconMapPin size={14} />
                  <Text>{resource.location}</Text>
                </Group>
              </Badge>
              <Badge color="teal" size="lg">
                <Group gap={4}>
                  <IconPackage size={14} />
                  <Text>{resource.quantity.value} {resource.quantity.unit}</Text>
                </Group>
              </Badge>
              {resource.featuredBadge && (
                <Badge color="orange" size="lg">
                  {resource.featuredBadge}
                </Badge>
              )}
            </Group>
            
            <Flex justify="space-between" mb="md">
              <Stack gap={0}>
                <Text size="xl" fw={700}>{formatPrice(resource.price)}</Text>
                <Text size="sm" c="dimmed">
                  {formatPrice(resource.price / resource.quantity.value)} per {resource.quantity.unit}
                </Text>
              </Stack>
              
              <Badge 
                size="lg" 
                color={isInStock ? 'green' : 'red'}
              >
                {isInStock ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </Flex>
            
            <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'overview')}>
              <Tabs.List>
                <Tabs.Tab value="overview">Overview</Tabs.Tab>
                <Tabs.Tab value="details">Details</Tabs.Tab>
                <Tabs.Tab value="delivery">Delivery</Tabs.Tab>
                <Tabs.Tab value="seller">Seller</Tabs.Tab>
              </Tabs.List>
              
              <Tabs.Panel value="overview" pt="md">
                <Card p="md" radius="md" withBorder>
                  <Title order={3} mb="sm">Description</Title>
                  <Text mb="lg">{resource.description}</Text>
                  
                  <Title order={3} mb="sm">General Information</Title>
                  <Grid mb="lg">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Table>
                        <Table.Tbody>
                          <Table.Tr>
                            <Table.Td fw={500}>Category</Table.Td>
                            <Table.Td>{resource.category}</Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td fw={500}>Quantity</Table.Td>
                            <Table.Td>{resource.quantity.value} {resource.quantity.unit}</Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td fw={500}>Manufacturer</Table.Td>
                            <Table.Td>{resource.manufacturer}</Table.Td>
                          </Table.Tr>
                        </Table.Tbody>
                      </Table>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Table>
                        <Table.Tbody>
                          <Table.Tr>
                            <Table.Td fw={500}>Origin</Table.Td>
                            <Table.Td>{resource.origin}</Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td fw={500}>Minimum Purchase</Table.Td>
                            <Table.Td>{resource.minPurchase} {resource.quantity.unit}</Table.Td>
                          </Table.Tr>
                          <Table.Tr>
                            <Table.Td fw={500}>Expiry Date</Table.Td>
                            <Table.Td>{new Date(resource.expiryDate).toLocaleDateString()}</Table.Td>
                          </Table.Tr>
                        </Table.Tbody>
                      </Table>
                    </Grid.Col>
                  </Grid>
                  
                  <Title order={3} mb="sm">Certifications</Title>
                  <Group mb="lg">
                    {resource.certification.map((cert, index) => (
                      <Badge key={index} color="green" size="lg" leftSection={<IconCertificate size={14} />}>
                        {cert}
                      </Badge>
                    ))}
                  </Group>
                  
                  <Title order={3} mb="sm">Suitable For</Title>
                  <Group mb="lg">
                    {resource.suitableFor.map((crop, index) => (
                      <Badge key={index} color="cyan" size="lg" leftSection={<IconPlant2 size={14} />}>
                        {crop}
                      </Badge>
                    ))}
                  </Group>
                </Card>
              </Tabs.Panel>
              
              <Tabs.Panel value="details" pt="md">
                <Card p="md" radius="md" withBorder>
                  <Title order={3} mb="sm">Composition</Title>
                  <Table mb="lg">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Component</Table.Th>
                        <Table.Th>Value</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {Object.entries(resource.composition).map(([component, value], index) => (
                        <Table.Tr key={index}>
                          <Table.Td fw={500}>{component}</Table.Td>
                          <Table.Td>{value}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                  
                  <Title order={3} mb="sm">Usage Information</Title>
                  <Table mb="lg">
                    <Table.Tbody>
                      <Table.Tr>
                        <Table.Td fw={500}>Recommended Application Rate</Table.Td>
                        <Table.Td>{resource.applicationRate}</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td fw={500}>Best Used For</Table.Td>
                        <Table.Td>{resource.suitableFor.join(', ')}</Table.Td>
                      </Table.Tr>
                      <Table.Tr>
                        <Table.Td fw={500}>Storage Requirements</Table.Td>
                        <Table.Td>Store in a cool, dry place away from direct sunlight</Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                  
                  <Alert icon={<IconInfoCircle size={16} />} title="Usage Tips" color="blue" mb="md">
                    For best results, apply this fertilizer during the early growth stages. 
                    It's recommended to incorporate it into the soil before planting or side-dress 
                    existing crops, followed by light irrigation.
                  </Alert>
                  
                  <Alert icon={<IconAlertCircle size={16} />} title="Safety Information" color="yellow">
                    While this product is organic and safe for most applications, keep out of reach of children
                    and pets. Wear gloves when handling and wash hands thoroughly after use.
                  </Alert>
                </Card>
              </Tabs.Panel>
              
              <Tabs.Panel value="delivery" pt="md">
                <Card p="md" radius="md" withBorder>
                  <Title order={3} mb="sm">Shipping & Delivery</Title>
                  
                  <Alert icon={<IconTruckDelivery size={16} />} title="Delivery Information" color="blue" mb="md">
                    We offer delivery services throughout Tunisia. Delivery time may vary depending on your location.
                    Free shipping is available on orders above {formatPrice(resource.shippingInfo.freeThreshold)}.
                  </Alert>
                  
                  <Grid mb="lg">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Paper withBorder p="md" radius="md">
                        <Group mb="sm">
                          <IconTruckDelivery size={20} color={resource.shippingInfo.available ? 'green' : 'red'} />
                          <Text fw={700}>Delivery</Text>
                        </Group>
                        <Table>
                          <Table.Tbody>
                            <Table.Tr>
                              <Table.Td>Availability</Table.Td>
                              <Table.Td>{resource.shippingInfo.available ? 'Available' : 'Not Available'}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                              <Table.Td>Cost</Table.Td>
                              <Table.Td>
                                {resource.shippingInfo.cost === 0 
                                  ? 'Free Shipping' 
                                  : formatPrice(resource.shippingInfo.cost)}
                              </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                              <Table.Td>Free Shipping</Table.Td>
                              <Table.Td>On orders above {formatPrice(resource.shippingInfo.freeThreshold)}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                              <Table.Td>Delivery Time</Table.Td>
                              <Table.Td>{resource.shippingInfo.deliveryTime}</Table.Td>
                            </Table.Tr>
                          </Table.Tbody>
                        </Table>
                      </Paper>
                    </Grid.Col>
                    
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Paper withBorder p="md" radius="md">
                        <Group mb="sm">
                          <IconPackage size={20} />
                          <Text fw={700}>Pickup</Text>
                        </Group>
                        <Text mb="md">
                          You can also pick up your order directly from our warehouse in Kairouan.
                          Pickup is available Monday to Friday, 8:00 AM to 5:00 PM.
                        </Text>
                        <Text fw={500}>{resource.fullAddress}</Text>
                      </Paper>
                    </Grid.Col>
                  </Grid>
                  
                  <Title order={3} mb="sm">Return Policy</Title>
                  <Text mb="md">
                    We accept returns within 7 days of delivery if the product packaging is unopened and undamaged.
                    Please contact us before returning any product. Shipping costs for returns are the 
                    responsibility of the buyer unless the product is defective.
                  </Text>
                </Card>
              </Tabs.Panel>
              
              <Tabs.Panel value="seller" pt="md">
                <Card p="md" radius="md" withBorder>
                  <Group mb="lg">
                    <Avatar src={resource.ownerImage} radius="xl" size="xl" />
                    <Stack gap={5}>
                      <Text fw={700} size="lg">{resource.ownerName}</Text>
                      <Group gap={4}>
                        <IconCalendar size={14} />
                        <Text size="sm" c="dimmed">Member since {new Date(resource.ownerJoinDate).toLocaleDateString()}</Text>
                      </Group>
                      <Text size="sm">Agricultural Supplier</Text>
                    </Stack>
                  </Group>
                  
                  <Alert title="Verified Seller" color="green" mb="md">
                    This supplier has been verified by FarmWise. Identity and business documents have been checked.
                  </Alert>
                  
                  <Title order={4} mb="sm">About the Seller</Title>
                  <Text mb="md">
                    {resource.ownerName} is a reliable supplier of agricultural resources with over 10 years 
                    of experience in the field. They specialize in organic fertilizers, seeds, and pesticides.
                    All products are sourced from trusted manufacturers and undergo quality checks.
                  </Text>
                  
                  <Button fullWidth mb="sm" leftSection={<IconPhone size={16} />} onClick={handleContact}>
                    Contact Seller
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
              <Title order={4} mb="md">Purchase Options</Title>
              
              {!isInStock ? (
                <Alert color="red" title="Out of Stock" icon={<IconAlertCircle size={16} />} mb="md">
                  This product is currently out of stock. Please check back later or contact the seller for more information.
                </Alert>
              ) : (
                <>
                  <Group mb="md">
                    <Text>Available: {resource.availability} {resource.quantity.unit}</Text>
                    <Text>Minimum: {resource.minPurchase} {resource.quantity.unit}</Text>
                  </Group>
                  
                  <Group mb="lg" align="flex-end">
                    <Text>Quantity ({resource.quantity.unit}):</Text>
                    <NumberInput
                      value={quantity}
                      onChange={(val) => setQuantity(typeof val === 'number' ? val : resource.minPurchase)}
                      min={resource.minPurchase}
                      max={resource.availability}
                      step={50}
                      style={{ width: '120px' }}
                      rightSection={<IconScale size={16} />}
                    />
                  </Group>
                  
                  <Paper p="md" withBorder mb="md">
                    <Group justify="space-between">
                      <Text>Price per {resource.quantity.unit}</Text>
                      <Text>{formatPrice(resource.price / resource.quantity.value)}</Text>
                    </Group>
                    
                    <Group justify="space-between" mt="xs">
                      <Text>Quantity</Text>
                      <Text>{quantity} {resource.quantity.unit}</Text>
                    </Group>
                    
                    <Divider my="md" />
                    
                    <Group justify="space-between">
                      <Text>Subtotal</Text>
                      <Text>{formatPrice(calculateTotalCost())}</Text>
                    </Group>
                    
                    <Group justify="space-between" mt="xs">
                      <Group gap={4}>
                        <IconTruckDelivery size={16} />
                        <Text>Shipping</Text>
                      </Group>
                      <Text>
                        {calculateShippingCost() === 0 ? 'Free' : formatPrice(calculateShippingCost())}
                      </Text>
                    </Group>
                    
                    <Divider my="md" />
                    
                    <Group justify="space-between">
                      <Text fw={700}>Total</Text>
                      <Text fw={700} size="lg">{formatPrice(calculateFinalTotal())}</Text>
                    </Group>
                  </Paper>
                  
                  <Button 
                    fullWidth 
                    onClick={handlePurchase} 
                    mb="xs"
                    leftSection={<IconShoppingCart size={16} />}
                  >
                    Add to Cart
                  </Button>
                  
                  <Button 
                    variant="light" 
                    color="green" 
                    fullWidth 
                    onClick={handleContact}
                    leftSection={<IconMessage size={16} />}
                  >
                    Contact for Bulk Pricing
                  </Button>
                </>
              )}
              
              <Divider my="md" label="Or" labelPosition="center" />
              
              <Button variant="outline" fullWidth leftSection={<IconLeaf size={16} />}>
                View Similar Products
              </Button>
            </Card>
            
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Group mb="md" align="center">
                <IconClock size={20} />
                <Title order={4}>Delivery Information</Title>
              </Group>
              
              <Group mb="xs">
                <IconTruckDelivery size={16} />
                <Text size="sm">
                  {resource.shippingInfo.deliveryTime}
                </Text>
              </Group>
              
              <Group mb="md">
                <IconPackage size={16} />
                <Text size="sm">
                  Pickup available at {resource.location}
                </Text>
              </Group>
              
              <Text size="xs" c="dimmed">
                * Exact delivery time depends on your location and may vary.
              </Text>
            </Card>
            
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Title order={4} mb="md">Similar Products</Title>
              <Stack gap="md">
                {similarListings.map((listing) => (
                  <Card key={listing.id} component={Link} href={`/dashboard/marketplace/resource/${listing.id}`} p="xs" withBorder>
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
                href="/dashboard/marketplace?type=resource"
              >
                View All Similar Products
              </Button>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
} 