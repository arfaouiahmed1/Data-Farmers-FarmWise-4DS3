'use client';

import { useState } from 'react';
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import { IconArrowLeft, IconMapPin, IconTractor, IconSeedingOff, IconUpload } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import classes from '../Marketplace.module.css';

export default function CreateListingPage() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [listingType, setListingType] = useState<string>('land');
  
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
    },
    
    validate: {
      title: (value) => (value.length < 3 ? 'Title must be at least 3 characters' : null),
      description: (value) => (value.length < 10 ? 'Description must be at least 10 characters' : null),
      price: (value) => (value <= 0 ? 'Price must be greater than 0' : null),
      location: (value) => (value.length < 3 ? 'Location is required' : null),
    },
  });
  
  const nextStep = () => {
    if (active === 0) {
      const errors = form.validate().hasErrors;
      if (errors) return;
    }
    setActive((current) => (current < 2 ? current + 1 : current));
  };
  
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));
  
  const handleSubmit = (values: typeof form.values) => {
    console.log('Form submitted:', values);
    router.push('/dashboard/marketplace?success=listing-created');
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
  
  // Render rental-specific fields if the price type is 'rent'
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
  
  return (
    <Container fluid px="md">
      <Group mb="xl">
        <Button variant="subtle" leftSection={<IconArrowLeft size={18} />} component={Link} href="/dashboard/marketplace">
          Back to Marketplace
        </Button>
        <Title className={classes.pageTitle}>Add New Listing</Title>
      </Group>
      
      <Paper shadow="xs" p="md" withBorder>
        <Stepper active={active} onStepClick={setActive} mb="xl">
          <Stepper.Step
            label="Basic Information"
            description="Type, title, price"
          >
            <Card withBorder p="md" radius="md">
              <Title order={4} mb="md">Listing Type</Title>
              <Tabs value={listingType} onChange={(value) => setListingType(value || 'land')}>
                <Tabs.List>
                  <Tabs.Tab value="land" leftSection={<IconMapPin size={16} />}>
                    Land
                  </Tabs.Tab>
                  <Tabs.Tab value="equipment" leftSection={<IconTractor size={16} />}>
                    Equipment
                  </Tabs.Tab>
                  <Tabs.Tab value="resource" leftSection={<IconSeedingOff size={16} />}>
                    Resources
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>
              
              <Title order={4} mt="lg" mb="md">Basic Information</Title>
              <TextInput
                label="Title"
                placeholder="Enter a descriptive title"
                required
                {...form.getInputProps('title')}
              />
              
              <Textarea
                label="Description"
                placeholder="Provide detailed information about what you're offering"
                minRows={4}
                mt="md"
                required
                {...form.getInputProps('description')}
              />
              
              <SimpleGrid cols={{ base: 1, sm: 2 }} mt="md">
                <NumberInput
                  label="Price (TND)"
                  placeholder="Enter price"
                  min={0}
                  required
                  {...form.getInputProps('price')}
                />
                
                <Radio.Group
                  label="Price Type"
                  required
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
                placeholder="City, Region"
                mt="md"
                required
                {...form.getInputProps('location')}
              />
              
              {renderRentalFields()}
            </Card>
          </Stepper.Step>
          
          <Stepper.Step
            label="Details & Images"
            description="Specific information"
          >
            <Card withBorder p="md" radius="md">
              <Title order={4} mb="md">{listingType.charAt(0).toUpperCase() + listingType.slice(1)} Details</Title>
              {renderTypeSpecificFields()}
              
              <Title order={4} mt="lg" mb="md">Upload Images</Title>
              <FileInput
                label="Upload Images"
                placeholder="Select up to 5 images"
                accept="image/*"
                multiple
                clearable
                leftSection={<IconUpload size={16} />}
              />
              <Text size="xs" c="dimmed" mt={5}>
                You can upload up to 5 images (JPEG, PNG). Max 5MB each.
              </Text>
            </Card>
          </Stepper.Step>
          
          <Stepper.Step
            label="Review & Submit"
            description="Confirm details"
          >
            <Card withBorder p="md" radius="md">
              <Title order={4} mb="md">Review Your Listing</Title>
              <Text mb="md">
                Please review your information below. Once you submit, your listing will be published to the marketplace.
              </Text>
              
              <Paper withBorder p="md" radius="md">
                <Stack gap="sm">
                  <Group>
                    <Text fw={500} w={120}>Type:</Text>
                    <Text>{listingType.charAt(0).toUpperCase() + listingType.slice(1)}</Text>
                  </Group>
                  <Group>
                    <Text fw={500} w={120}>Title:</Text>
                    <Text>{form.values.title}</Text>
                  </Group>
                  <Group>
                    <Text fw={500} w={120}>Price:</Text>
                    <Text>
                      {form.values.price} TND 
                      {form.values.priceType === 'rent' && ` / ${form.values.rentalPeriod}`}
                    </Text>
                  </Group>
                  <Group>
                    <Text fw={500} w={120}>Description:</Text>
                    <Text style={{ flex: 1 }}>{form.values.description}</Text>
                  </Group>
                  <Group>
                    <Text fw={500} w={120}>Location:</Text>
                    <Text>{form.values.location}</Text>
                  </Group>
                </Stack>
              </Paper>
              
              <Checkbox
                label="I confirm that all information provided is accurate and I agree to the terms of service"
                mt="lg"
                required
              />
            </Card>
          </Stepper.Step>
        </Stepper>
        
        <Group justify="space-between" mt="xl">
          {active > 0 ? (
            <Button variant="default" onClick={prevStep}>
              Back
            </Button>
          ) : (
            <Button variant="default" component={Link} href="/dashboard/marketplace">
              Cancel
            </Button>
          )}
          
          {active < 2 ? (
            <Button onClick={nextStep}>
              Next Step
            </Button>
          ) : (
            <Button onClick={() => form.onSubmit(handleSubmit)()}>
              Submit Listing
            </Button>
          )}
        </Group>
      </Paper>
    </Container>
  );
} 