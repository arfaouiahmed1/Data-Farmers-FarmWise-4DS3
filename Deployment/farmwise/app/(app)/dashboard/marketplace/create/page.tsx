'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Group, 
  Paper, 
  Button, 
  TextInput, 
  Textarea, 
  NumberInput, 
  Select, 
  Radio, 
  Stack, 
  Text, 
  Card, 
  Stepper, 
  Tabs,
  Checkbox,
  SimpleGrid, 
  FileInput,
  Alert,
  Loader,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import { IconArrowLeft, IconMapPin, IconTractor, IconSeedingOff, IconUpload, IconExclamationCircle } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import classes from '../Marketplace.module.css';
import { createProduct, updateProduct, fetchProductById, fetchCategories } from '@/app/utils/api/marketplaceService';

export default function CreateListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const editType = searchParams.get('type');
  
  const [active, setActive] = useState(0);
  const [listingType, setListingType] = useState<string>(editType || 'land');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!editId);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{value: string, label: string}[]>([]);
  
  // Form for creating a new listing
  const form = useForm({
    initialValues: {
      // Common fields
      title: '',
      description: '',
      price: 0,
      priceType: 'sale',
      location: '',
      
      // Land specific fields
      landSize: 0,
      landUnit: 'hectares',
      soilType: '',
      hasWaterAccess: false,
      hasElectricityAccess: false,
      hasRoadAccess: false,
      
      // Equipment specific fields
      equipmentCategory: '',
      brand: '',
      model: '',
      condition: 'Good',
      
      // Resource specific fields
      resourceCategory: '',
      quantityValue: 0,
      quantityUnit: 'kg',
      
      // Rental specific fields
      rentalPeriod: 'month',
      minimumRental: 1,
      
      // Image URL (for now, later would be file upload)
      imageUrl: '',
    },
    
    validate: {
      title: (value) => (value.length < 3 ? 'Title must be at least 3 characters' : null),
      description: (value) => (value.length < 10 ? 'Description must be at least 10 characters' : null),
      price: (value) => (value <= 0 ? 'Price must be greater than 0' : null),
      location: (value) => (value.length < 3 ? 'Location is required' : null),
    },
  });
  
  // Load categories and existing listing data if editing
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        const categoriesData = await fetchCategories();
        if (categoriesData && Array.isArray(categoriesData)) {
          setCategories(categoriesData.map(cat => ({
            value: cat.id.toString(),
            label: cat.name
          })));
        }
        
        // If editing, load the product data
        if (editId) {
          setInitialLoading(true);
          try {
            const product = await fetchProductById(editId);
            if (product) {
              // Map the product data to the form fields
              form.setValues({
                title: product.title,
                description: product.description || '',
                price: product.price,
                priceType: product.priceType,
                location: product.location,
                imageUrl: product.mainImage || '',
                
                // Type-specific fields
                ...(product.type === 'land' && {
                  landSize: product.size?.value || 0,
                  landUnit: product.size?.unit || 'hectares',
                  soilType: product.soilType || '',
                  hasWaterAccess: product.access?.water || false,
                  hasElectricityAccess: product.access?.electricity || false,
                  hasRoadAccess: product.access?.road || false,
                }),
                
                ...(product.type === 'equipment' && {
                  equipmentCategory: product.category || '',
                  brand: product.brand || '',
                  model: product.model || '',
                  condition: product.condition || 'Good',
                }),
                
                ...(product.type === 'resource' && {
                  resourceCategory: product.category || '',
                  quantityValue: product.quantity?.value || 0,
                  quantityUnit: product.quantity?.unit || 'kg',
                }),
                
                ...(product.priceType === 'rent' && product.type === 'equipment' && product.rentalInfo && {
                  rentalPeriod: product.rentalInfo.period || 'month',
                  minimumRental: product.rentalInfo.minimumRental || 1,
                }),
              });
              
              setListingType(product.type);
            }
          } catch (err: any) {
            console.error('Failed to load product for editing:', err);
            setError('Failed to load product data. Please try again.');
            notifications.show({
              title: 'Error',
              message: 'Failed to load product data for editing',
              color: 'red',
            });
          } finally {
            setInitialLoading(false);
          }
        }
      } catch (err: any) {
        console.error('Failed to load categories:', err);
        setError('Failed to load categories. Please try again.');
      }
    };
    
    loadData();
  }, [editId, form]);
  
  const nextStep = () => {
    if (active === 0) {
      const validation = form.validate();
      if (validation.hasErrors) return;
    }
    setActive((current) => (current < 2 ? current + 1 : current));
  };
  
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));
  
  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      setError(null);
      
      // Map form values to product/listing data
      const productData = {
        // Common fields
        title: values.title,
        description: values.description,
        price: values.price,
        priceType: values.priceType,
        location: values.location,
        mainImage: values.imageUrl,
        
        // Type-specific fields based on the selected type
        type: listingType,
        
        // Land-specific fields
        ...(listingType === 'land' && {
          size: {
            value: values.landSize,
            unit: values.landUnit
          },
          soilType: values.soilType,
          access: {
            water: values.hasWaterAccess,
            electricity: values.hasElectricityAccess,
            road: values.hasRoadAccess,
            irrigation: false // Default value
          }
        }),
        
        // Equipment-specific fields
        ...(listingType === 'equipment' && {
          category: values.equipmentCategory,
          brand: values.brand,
          model: values.model,
          condition: values.condition,
          ...(values.priceType === 'rent' && {
            rentalInfo: {
              period: values.rentalPeriod,
              minimumRental: values.minimumRental
            }
          })
        }),
        
        // Resource-specific fields
        ...(listingType === 'resource' && {
          category: values.resourceCategory,
          quantity: {
            value: values.quantityValue,
            unit: values.quantityUnit
          }
        })
      };
      
      // Create or update the product
      if (editId) {
        await updateProduct(editId, productData);
        notifications.show({
          title: 'Success',
          message: 'Listing updated successfully',
          color: 'green',
        });
      } else {
        await createProduct(productData);
        notifications.show({
          title: 'Success',
          message: 'Listing created successfully',
          color: 'green',
        });
      }
      
      // Redirect to my listings page
      router.push('/dashboard/marketplace/my-listings');
    } catch (err: any) {
      console.error('Failed to save listing:', err);
      setError(err.message || 'Failed to save listing. Please try again.');
      notifications.show({
        title: 'Error',
        message: 'Failed to save listing',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Determine which fields to show based on the listing type
  const renderTypeSpecificFields = () => {
    switch (listingType) {
      case 'land':
        return (
          <>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <NumberInput
                label="Size"
                placeholder="Enter land size"
                min={0}
                required
                {...form.getInputProps('landSize')}
              />
              <Select
                label="Unit"
                data={[
                  { value: 'sq_meters', label: 'Square Meters' },
                  { value: 'hectares', label: 'Hectares' },
                  { value: 'acres', label: 'Acres' },
                ]}
                defaultValue="hectares"
                {...form.getInputProps('landUnit')}
              />
            </SimpleGrid>
            
            <TextInput
              label="Soil Type"
              placeholder="E.g., Loamy, Clay, Sandy"
              mt="md"
              {...form.getInputProps('soilType')}
            />
            
            <Title order={5} mt="md" mb="xs">Access & Utilities</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Checkbox
                label="Water Access"
                {...form.getInputProps('hasWaterAccess', { type: 'checkbox' })}
              />
              <Checkbox
                label="Electricity Access"
                {...form.getInputProps('hasElectricityAccess', { type: 'checkbox' })}
              />
              <Checkbox
                label="Road Access"
                {...form.getInputProps('hasRoadAccess', { type: 'checkbox' })}
              />
            </SimpleGrid>
          </>
        );
        
      case 'equipment':
        return (
          <>
            <Select
              label="Category"
              data={[
                { value: 'tractors', label: 'Tractors & Implements' },
                { value: 'harvesting', label: 'Harvesting Equipment' },
                { value: 'planting', label: 'Planting Equipment' },
                { value: 'irrigation', label: 'Irrigation Equipment' },
                { value: 'other', label: 'Other' },
              ]}
              placeholder="Select equipment category"
              required
              {...form.getInputProps('equipmentCategory')}
            />
            
            <SimpleGrid cols={{ base: 1, sm: 2 }} mt="md">
              <TextInput
                label="Brand"
                placeholder="E.g., John Deere, Massey Ferguson"
                {...form.getInputProps('brand')}
              />
              <TextInput
                label="Model"
                placeholder="E.g., 5075E, 1455"
                {...form.getInputProps('model')}
              />
            </SimpleGrid>
            
            <Select
              label="Condition"
              data={[
                { value: 'Excellent', label: 'Excellent' },
                { value: 'Good', label: 'Good' },
                { value: 'Fair', label: 'Fair' },
                { value: 'Poor', label: 'Poor' },
              ]}
              placeholder="Select condition"
              mt="md"
              {...form.getInputProps('condition')}
            />
          </>
        );
        
      case 'resource':
        return (
          <>
            <Select
              label="Category"
              data={[
                { value: 'seeds', label: 'Seeds' },
                { value: 'fertilizers', label: 'Fertilizers' },
                { value: 'pesticides', label: 'Pesticides & Herbicides' },
                { value: 'feed', label: 'Animal Feed' },
                { value: 'other', label: 'Other' },
              ]}
              placeholder="Select resource category"
              required
              {...form.getInputProps('resourceCategory')}
            />
            
            <SimpleGrid cols={{ base: 1, sm: 2 }} mt="md">
              <NumberInput
                label="Quantity"
                placeholder="Amount"
                min={0}
                required
                {...form.getInputProps('quantityValue')}
              />
              <Select
                label="Unit"
                data={[
                  { value: 'kg', label: 'Kilograms (kg)' },
                  { value: 'g', label: 'Grams (g)' },
                  { value: 'L', label: 'Liters (L)' },
                  { value: 'units', label: 'Units' },
                ]}
                placeholder="Select unit"
                {...form.getInputProps('quantityUnit')}
              />
            </SimpleGrid>
          </>
        );
        
      default:
        return null;
    }
  };
  
  const renderRentalFields = () => {
    if (form.values.priceType !== 'rent') return null;
    
    return (
      <>
        <Title order={5} mt="md" mb="xs">Rental Details</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Select
            label="Rental Period"
            data={[
              { value: 'hour', label: 'Per Hour' },
              { value: 'day', label: 'Per Day' },
              { value: 'week', label: 'Per Week' },
              { value: 'month', label: 'Per Month' },
              { value: 'year', label: 'Per Year' },
            ]}
            placeholder="Select period"
            required
            {...form.getInputProps('rentalPeriod')}
          />
          <NumberInput
            label="Minimum Rental Duration"
            placeholder="Minimum number of periods"
            min={1}
            {...form.getInputProps('minimumRental')}
          />
        </SimpleGrid>
        
        <DatePickerInput
          label="Available From"
          placeholder="Select date"
          mt="md"
        />
      </>
    );
  };
  
  // Show loading state if loading initial data
  if (initialLoading) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" shadow="md" ta="center">
          <Loader size="md" />
          <Text mt="md">Loading listing data...</Text>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container size="md" py="xl">
      <Group mb="xl">
        <Button 
          component={Link} 
          href="/dashboard/marketplace/my-listings" 
          variant="subtle" 
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to My Listings
        </Button>
        <Title className={classes.pageTitle}>
          {editId ? 'Edit Listing' : 'Create New Listing'}
        </Title>
      </Group>
      
      {error && (
        <Alert icon={<IconExclamationCircle />} title="Error" color="red" mb="lg">
          {error}
        </Alert>
      )}
      
      <Stepper active={active} onStepClick={setActive} mb="xl">
        <Stepper.Step
          label="Basic Info"
          description="Title, description, price"
        >
          <Paper p="md" shadow="xs" mt="md">
            <form onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
              <Stack>
                <TextInput
                  label="Title"
                  placeholder="Enter a descriptive title for your listing"
                  required
                  {...form.getInputProps('title')}
                />
                
                <Textarea
                  label="Description"
                  placeholder="Provide details about what you're selling"
                  minRows={4}
                  required
                  {...form.getInputProps('description')}
                />
                
                <TextInput
                  label="Image URL"
                  placeholder="Enter URL for the main product image"
                  {...form.getInputProps('imageUrl')}
                />
                
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <NumberInput
                    label="Price"
                    placeholder="Enter price"
                    min={0}
                    required
                    {...form.getInputProps('price')}
                  />
                  
                  <Radio.Group
                    label="Price Type"
                    {...form.getInputProps('priceType')}
                  >
                    <Group mt="xs">
                      <Radio value="sale" label="For Sale" />
                      <Radio value="rent" label="For Rent" />
                    </Group>
                  </Radio.Group>
                </SimpleGrid>
                
                <TextInput
                  label="Location"
                  placeholder="Enter city, region or address"
                  required
                  {...form.getInputProps('location')}
                />
                
                <Group justify="flex-end" mt="md">
                  <Button type="submit">Continue</Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        </Stepper.Step>
        
        <Stepper.Step
          label="Listing Type"
          description="Select type and details"
        >
          <Paper p="md" shadow="xs" mt="md">
            <form onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
              <Stack>
                <Radio.Group
                  label="Listing Type"
                  value={listingType}
                  onChange={setListingType}
                  required
                >
                  <Group mt="xs">
                    <Radio value="land" label="Land" icon={<IconMapPin size={14} />} />
                    <Radio value="equipment" label="Equipment" icon={<IconTractor size={14} />} />
                    <Radio value="resource" label="Resource" icon={<IconSeedingOff size={14} />} />
                  </Group>
                </Radio.Group>
                
                {renderTypeSpecificFields()}
                
                {form.values.priceType === 'rent' && renderRentalFields()}
                
                <Group justify="space-between" mt="md">
                  <Button variant="outline" onClick={prevStep}>Back</Button>
                  <Button type="submit">Continue</Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        </Stepper.Step>
        
        <Stepper.Step
          label="Review & Submit"
          description="Confirm listing details"
        >
          <Paper p="md" shadow="xs" mt="md">
            <Stack>
              <Title order={4}>Review Your Listing</Title>
              
              <Card withBorder>
                <Card.Section>
                  {form.values.imageUrl ? (
                    <img 
                      src={form.values.imageUrl} 
                      alt={form.values.title} 
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ height: '200px', background: '#f1f1f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text c="dimmed">No image provided</Text>
                    </div>
                  )}
                </Card.Section>
                
                <Stack mt="md" spacing="xs">
                  <Group position="apart">
                    <Text fw={700} size="xl">{form.values.title}</Text>
                    <Badge>{listingType.charAt(0).toUpperCase() + listingType.slice(1)}</Badge>
                  </Group>
                  
                  <Text c="dimmed">{form.values.location}</Text>
                  
                  <Text fw={700} size="lg" c="blue">
                    {form.values.price} TND 
                    {form.values.priceType === 'rent' && ' / ' + form.values.rentalPeriod}
                  </Text>
                  
                  <Text>{form.values.description}</Text>
                  
                  {listingType === 'land' && (
                    <Text>Size: {form.values.landSize} {form.values.landUnit}</Text>
                  )}
                  
                  {listingType === 'equipment' && (
                    <Stack spacing={0}>
                      <Text>Category: {form.values.equipmentCategory}</Text>
                      {form.values.brand && <Text>Brand: {form.values.brand}</Text>}
                      {form.values.model && <Text>Model: {form.values.model}</Text>}
                      <Text>Condition: {form.values.condition}</Text>
                    </Stack>
                  )}
                  
                  {listingType === 'resource' && (
                    <Text>Quantity: {form.values.quantityValue} {form.values.quantityUnit}</Text>
                  )}
                </Stack>
              </Card>
              
              <Group justify="space-between" mt="md">
                <Button variant="outline" onClick={prevStep}>Back</Button>
                <Button 
                  onClick={() => form.onSubmit(handleSubmit)()} 
                  loading={loading}
                  color="green"
                >
                  {editId ? 'Update Listing' : 'Create Listing'}
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stepper.Step>
      </Stepper>
    </Container>
  );
} 