'use client';

import { useState, useEffect } from 'react';
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
  Table,
  Avatar,
  Loader,
  Alert,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { 
  IconArrowLeft, 
  IconMapPin, 
  IconUser, 
  IconPhone, 
  IconMessage, 
  IconCalendar,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import { fetchProductById } from '@/app/utils/api/marketplaceService';
import { notifications } from '@mantine/notifications';
import classes from '../Marketplace.module.css';

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadListing = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProductById(listingId);
        setListing(data);
      } catch (err: any) {
        console.error('Failed to load listing:', err);
        setError(err.message || 'Failed to load listing');
        notifications.show({
          title: 'Error',
          message: 'Failed to load listing details',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    if (listingId) {
      loadListing();
    }
  }, [listingId]);
  
  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };
  
  const handleContact = () => {
    notifications.show({
      title: 'Contact Feature',
      message: 'Contact functionality will be implemented soon',
      color: 'blue',
    });
  };
  
  if (loading) {
    return (
      <Container fluid px="md">
        <Group justify="center" mt="xl">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }
  
  if (error || !listing) {
    return (
      <Container fluid px="md">
        <Group mb="md">
          <ActionIcon variant="subtle" onClick={() => router.back()}>
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Text c="dimmed" size="sm">Back to listings</Text>
        </Group>
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error || 'Listing not found'}
        </Alert>
      </Container>
    );
  }
  
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
              {listing.images && listing.images.length > 0 ? (
                <Carousel
                  withIndicators
                  height={400}
                  slideSize="100%"
                  slideGap="md"
                  loop
                  align="start"
                  slidesToScroll={1}
                >
                  {listing.images.map((img: string, index: number) => (
                    <Carousel.Slide key={index}>
                      <Image
                        src={img}
                        height={400}
                        alt={`${listing.title} - Image ${index + 1}`}
                        fallbackSrc="https://placehold.co/600x400?text=FarmWise"
                      />
                    </Carousel.Slide>
                  ))}
                </Carousel>
              ) : (
                <Image
                  src={listing.mainImage || '/images/marketplace/placeholder.jpg'}
                  height={400}
                  alt={listing.title}
                  fallbackSrc="https://placehold.co/600x400?text=FarmWise"
                />
              )}
            </Card.Section>
            
            <Group justify="space-between" mt="md" mb="xs">
              <Title order={2}>{listing.title}</Title>
            </Group>
            
            <Group mb="md">
              <Badge color="blue" size="lg">
                {listing.priceType === 'sale' ? 'For Sale' : 'For Rent'}
              </Badge>
              <Badge color="gray" size="lg">
                <Group gap={4}>
                  <IconMapPin size={14} />
                  <Text>{listing.location}</Text>
                </Group>
              </Badge>
              <Badge color="green" size="lg">
                {listing.type?.charAt(0).toUpperCase() + listing.type?.slice(1)}
              </Badge>
            </Group>
            
            <Group justify="space-between" mb="md">
              <Stack gap={0}>
                <Text size="xl" fw={700} c="var(--farmGreen)">
                  {formatPrice(listing.price)} {listing.currency || 'TND'}
                </Text>
                <Text size="sm" c="dimmed">
                  {listing.priceType === 'rent' ? 'per rental period' : 'total price'}
                </Text>
              </Stack>
            </Group>
            
            <Paper p="md" radius="md" withBorder>
              <Title order={3} mb="sm">Description</Title>
              <Text mb="lg">{listing.description}</Text>
              
              <Title order={3} mb="sm">Details</Title>
              <Table>
                <Table.Tbody>
                  <Table.Tr>
                    <Table.Td fw={500}>Listed Date</Table.Td>
                    <Table.Td>{new Date(listing.createdAt).toLocaleDateString()}</Table.Td>
                  </Table.Tr>
                  {listing.category && (
                    <Table.Tr>
                      <Table.Td fw={500}>Category</Table.Td>
                      <Table.Td>{listing.category}</Table.Td>
                    </Table.Tr>
                  )}
                  {listing.quantity && (
                    <Table.Tr>
                      <Table.Td fw={500}>Quantity</Table.Td>
                      <Table.Td>{listing.quantity.value} {listing.quantity.unit}</Table.Td>
                    </Table.Tr>
                  )}
                  {listing.size && (
                    <Table.Tr>
                      <Table.Td fw={500}>Size</Table.Td>
                      <Table.Td>{listing.size.value} {listing.size.unit}</Table.Td>
                    </Table.Tr>
                  )}
                  {listing.condition && (
                    <Table.Tr>
                      <Table.Td fw={500}>Condition</Table.Td>
                      <Table.Td>{listing.condition}</Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Paper>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group mb="md">
              <Avatar 
                src={listing.ownerImage} 
                size="lg" 
                radius="xl"
                alt={listing.ownerName}
              />
              <Stack gap={0}>
                <Text fw={500}>{listing.ownerName}</Text>
                <Text size="sm" c="dimmed">Seller</Text>
              </Stack>
            </Group>
            
            <Stack gap="sm">
              <Button 
                fullWidth 
                leftSection={<IconMessage size={16} />}
                onClick={handleContact}
                style={{ backgroundColor: 'var(--farmGreen)' }}
              >
                Contact Seller
              </Button>
              <Button 
                fullWidth 
                variant="outline" 
                leftSection={<IconPhone size={16} />}
                onClick={handleContact}
                style={{ borderColor: 'var(--farmGreen)', color: 'var(--farmGreen)' }}
              >
                Call Seller
              </Button>
            </Stack>
            
            <Paper p="sm" radius="md" withBorder mt="md">
              <Group gap="xs">
                <IconCalendar size={16} />
                <Text size="sm">
                  Listed on {new Date(listing.createdAt).toLocaleDateString()}
                </Text>
              </Group>
            </Paper>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
