'use client';

import React, { useState } from 'react';
import {
    Container, Title, Text, Paper, Button, Modal,
    Group, Stack, Badge, Tabs, Select, Alert
} from '@mantine/core';
import { IconCalendarStats, IconPlant2, IconAlertCircle } from '@tabler/icons-react';
import type { FarmEvent } from '@/types/planning';
import { EventForm } from '@/components/planning/EventForm';
import { CropRecommendations } from '@/components/planning/CropRecommendations';
import { EnhancedCalendar } from '@/components/planning/EnhancedCalendar';

// Mock crop types for the demo
const cropTypes = [
  { value: 'corn', label: 'Corn' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'soybeans', label: 'Soybeans' },
  { value: 'potatoes', label: 'Potatoes' },
];

const now = new Date();

// Sample crop events showing the lifecycle
const getCropEvents = (selectedCrop: string): FarmEvent[] => {
  const events: FarmEvent[] = [
    {
      id: '1',
      title: `Plant ${selectedCrop}`,
      start: new Date(now.getFullYear(), now.getMonth(), 2),
      end: new Date(now.getFullYear(), now.getMonth(), 4),
      type: 'planting',
      description: `Plant ${selectedCrop} according to recommended spacing and depth.`
    },
    {
      id: '2',
      title: `First Fertilization - ${selectedCrop}`,
      start: new Date(now.getFullYear(), now.getMonth(), 15),
      end: new Date(now.getFullYear(), now.getMonth(), 15),
      type: 'fertilization',
      description: 'Apply starter fertilizer based on soil test results.'
    },
    {
      id: '3',
      title: 'Irrigation Check',
      start: new Date(now.getFullYear(), now.getMonth(), 20),
      end: new Date(now.getFullYear(), now.getMonth(), 20),
      type: 'irrigation',
      description: 'Monitor soil moisture and adjust irrigation schedule.'
    },
    {
      id: '4',
      title: `Pest Monitoring - ${selectedCrop}`,
      start: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      type: 'monitoring',
      description: 'Check for common pests and diseases.'
    },
    {
      id: '5',
      title: `Second Fertilization - ${selectedCrop}`,
      start: new Date(now.getFullYear(), now.getMonth() + 2, 1),
      end: new Date(now.getFullYear(), now.getMonth() + 2, 1),
      type: 'fertilization',
      description: 'Apply growth-stage specific nutrients.'
    },
    {
      id: '6',
      title: `Harvest ${selectedCrop}`,
      start: new Date(now.getFullYear(), now.getMonth() + 3, 15),
      end: new Date(now.getFullYear(), now.getMonth() + 3, 20),
      type: 'harvesting',
      description: `Harvest ${selectedCrop} at optimal maturity.`
    }
  ];
  return events;
};

export default function CropCalendarPage() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [formModalOpened, setFormModalOpened] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<FarmEvent | null>(null);
  const [events, setEvents] = useState<FarmEvent[]>([]);

  // Update events when crop changes
  React.useEffect(() => {
    if (selectedCrop) {
      setEvents(getCropEvents(selectedCrop));
    } else {
      setEvents([]);
    }
  }, [selectedCrop]);

  const modalTitle = currentEvent ? 'Edit Event' : 'Add New Event';

  const handleAddEventClick = () => {
    setCurrentEvent(null);
    setFormModalOpened(true);
  };

  const handleEditEvent = (event: FarmEvent) => {
    setCurrentEvent(event);
    setFormModalOpened(true);
  };

  const handleDeleteEvent = (eventId: string | number) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  const handleSaveEvent = (eventData: FarmEvent) => {
    if (currentEvent && currentEvent.id) {
      setEvents(events.map(event => (event.id === eventData.id ? eventData : event)));
    } else {
      // Generate a unique string ID
      const newId = String(Date.now());
      setEvents([...events, { ...eventData, id: newId }]);
    }
    setFormModalOpened(false);
    setCurrentEvent(null);
  };

  return (
    <Container size="xl" py="lg">
      <Group justify="space-between" align="center" mb="xl">
        <Title order={3}>
          <Group gap="xs">
            <IconCalendarStats size={24} stroke={1.5} />
            <Text>Crop Calendar</Text>
          </Group>
        </Title>
      </Group>

      <Paper withBorder p="md" radius="md" mb="xl">
        <Stack>
          <Group>
            <Select
              label="Select Crop"
              placeholder="Choose a crop to see its calendar"
              data={cropTypes}
              value={selectedCrop}
              onChange={setSelectedCrop}
              style={{ minWidth: 200 }}
            />
            <Button 
              onClick={handleAddEventClick} 
              disabled={!selectedCrop}
              mt={24}
            >
              Add Custom Event
            </Button>
          </Group>
          
          {!selectedCrop && (
            <Alert icon={<IconAlertCircle size="1rem" />} color="blue">
              Select a crop to view its recommended calendar events including planting, fertilization, irrigation, and harvest schedules.
            </Alert>
          )}
        </Stack>
      </Paper>

      <Tabs value={activeTab} onChange={(value) => value && setActiveTab(value)} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="calendar" leftSection={<IconCalendarStats size="0.8rem" />}>
            Calendar View
          </Tabs.Tab>
          <Tabs.Tab value="recommendations" leftSection={<IconPlant2 size="0.8rem" />}>
            Crop Recommendations
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="calendar">
          {selectedCrop ? (
            <EnhancedCalendar
              events={events}
              onAddEvent={handleAddEventClick}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          ) : (
            <Paper withBorder p="xl" radius="md">
              <Stack gap="md" align="center">
                <IconPlant2 size={48} stroke={1.5} />
                <Text size="xl" fw={500}>No Crop Selected</Text>
                <Text c="dimmed" ta="center">
                  Select a crop from the dropdown above to view its recommended calendar events and manage your farming schedule.
                </Text>
              </Stack>
            </Paper>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="recommendations">
          <CropRecommendations />
        </Tabs.Panel>
      </Tabs>

      {/* Event Form Modal */}
      <EventForm
        opened={formModalOpened}
        onClose={() => setFormModalOpened(false)}
        onSubmit={handleSaveEvent}
        initialValues={currentEvent}
        title={modalTitle}
      />
    </Container>
  );
}