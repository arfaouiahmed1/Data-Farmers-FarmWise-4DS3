import React from 'react';
import { 
  Card, 
  Text, 
  Group, 
  Badge, 
  Progress, 
  useMantineTheme, 
  ThemeIcon,
  Stack,
  Divider,
  Tooltip
} from '@mantine/core';
import { 
  IconPlant2, 
  IconDroplet, 
  IconCash, 
  IconChartBar, 
  IconCalendarStats,
  IconHeartbeat
} from '@tabler/icons-react';

// Define types for the component props
interface CropData {
  id: number;
  crop_name: string;
  planting_date: string;
  expected_harvest_date: string;
  growth_stage: string | null;
  health_status: string | null;
  watering_frequency: string | null;
  predicted_yield: number | null;
  yield_confidence: number | null;
  projected_revenue: number | null;
  notes: string | null;
}

interface CropHealthCardProps {
  cropData: CropData;
}

// Helper function to format dates
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString();
};

// Helper function to get color based on health status
const getHealthColor = (status: string | null) => {
  if (!status) return 'gray';
  
  const statusMap: {[key: string]: string} = {
    'Excellent': 'green',
    'Good': 'teal',
    'Fair': 'yellow',
    'Poor': 'orange',
    'Critical': 'red'
  };
  
  return statusMap[status] || 'gray';
};

// Helper function to get growth stage info
const getGrowthStageInfo = (stage: string | null) => {
  if (!stage) return { label: 'Not set', color: 'gray' };
  
  const stageMap: {[key: string]: {label: string, color: string}} = {
    'Planting': { label: 'Planting', color: 'indigo' },
    'Germination': { label: 'Germination', color: 'blue' },
    'Vegetative': { label: 'Vegetative Growth', color: 'teal' },
    'Flowering': { label: 'Flowering', color: 'cyan' },
    'Fruiting': { label: 'Fruiting', color: 'green' },
    'Harvest': { label: 'Harvest Ready', color: 'yellow' },
    'Post-Harvest': { label: 'Post-Harvest', color: 'gray' }
  };
  
  return stageMap[stage] || { label: stage, color: 'gray' };
};

// Helper function to format watering frequency
const formatWateringFrequency = (frequency: string | null) => {
  if (!frequency) return 'Not set';
  
  const frequencyMap: {[key: string]: string} = {
    'Daily': 'Daily',
    'Every_2_Days': 'Every 2 Days',
    'Every_3_Days': 'Every 3 Days',
    'Weekly': 'Weekly',
    'Biweekly': 'Biweekly',
    'As_Needed': 'As Needed'
  };
  
  return frequencyMap[frequency] || frequency;
};

const CropHealthCard: React.FC<CropHealthCardProps> = ({ cropData }) => {
  const theme = useMantineTheme();
  const healthColor = getHealthColor(cropData.health_status);
  const growthStage = getGrowthStageInfo(cropData.growth_stage);
  
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section withBorder p="md" bg={theme.colors.dark[6]}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size="lg" color="green" variant="light">
              <IconPlant2 />
            </ThemeIcon>
            <Text fw={700} size="lg">{cropData.crop_name}</Text>
          </Group>
          <Badge color={healthColor} size="lg">
            {cropData.health_status || 'Unknown'} Health
          </Badge>
        </Group>
      </Card.Section>
      
      <Stack gap="xs" mt="md">
        <Group justify="space-between">
          <Group>
            <IconCalendarStats size={18} />
            <Text fw={500}>Planting Date:</Text>
          </Group>
          <Text>{formatDate(cropData.planting_date)}</Text>
        </Group>
        
        <Group justify="space-between">
          <Group>
            <IconCalendarStats size={18} />
            <Text fw={500}>Expected Harvest:</Text>
          </Group>
          <Text>{formatDate(cropData.expected_harvest_date)}</Text>
        </Group>
        
        <Divider my="xs" />
        
        <Group justify="space-between">
          <Badge color={growthStage.color} size="lg" variant="outline">
            {growthStage.label}
          </Badge>
          
          <Group>
            <IconDroplet size={18} />
            <Text>{formatWateringFrequency(cropData.watering_frequency)}</Text>
          </Group>
        </Group>
        
        <Divider my="xs" />
        
        {cropData.predicted_yield && (
          <Stack gap="xs">
            <Group justify="space-between">
              <Group>
                <IconChartBar size={18} />
                <Text fw={500}>Predicted Yield:</Text>
              </Group>
              <Text>{cropData.predicted_yield} tons</Text>
            </Group>
            
            <Group gap="xs">
              <Text size="sm">Confidence:</Text>
              <Tooltip label={`${cropData.yield_confidence}% confidence in prediction`}>
                <Progress 
                  value={cropData.yield_confidence || 0} 
                  color={cropData.yield_confidence && cropData.yield_confidence > 70 ? "green" : "orange"}
                  size="sm"
                  style={{ width: '100%' }}
                />
              </Tooltip>
            </Group>
          </Stack>
        )}
        
        {cropData.projected_revenue && (
          <Group justify="space-between" mt="xs">
            <Group>
              <IconCash size={18} />
              <Text fw={500}>Projected Revenue:</Text>
            </Group>
            <Text fw={700} c="green">
              ${cropData.projected_revenue.toLocaleString()}
            </Text>
          </Group>
        )}
        
        {cropData.notes && (
          <>
            <Divider my="xs" />
            <Text size="sm" c="dimmed" fw={500}>Notes:</Text>
            <Text size="sm">{cropData.notes}</Text>
          </>
        )}
      </Stack>
    </Card>
  );
};

export default CropHealthCard; 