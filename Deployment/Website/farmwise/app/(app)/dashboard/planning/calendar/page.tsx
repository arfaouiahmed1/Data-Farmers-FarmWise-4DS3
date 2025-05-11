'use client';

import React, { useState } from 'react';
import {
    Container, Title, Text, Paper, Button, Modal,
    Group, Stack, Box, Tabs, Badge, Divider
} from '@mantine/core';
import { IconCalendarStats, IconFilter, IconPlus } from '@tabler/icons-react';
import type { FarmEvent } from '@/types/planning';
import { EventForm } from '@/components/planning/EventForm';
import { CropRecommendations } from '@/components/planning/CropRecommendations';
import { EnhancedCalendar } from '@/components/planning/EnhancedCalendar';

// Mock Event Data (Replace with actual data source)
const now = new Date();
const initialMockEvents: FarmEvent[] = [
  {
    id: 1,
    title: 'Plant Corn - Field A',
    start: new Date(now.getFullYear(), now.getMonth(), 2),
    end: new Date(now.getFullYear(), now.getMonth(), 4),
    resource: 'Planting Team',
    type: 'planting',
    description: 'Plant corn seeds at 1.5 inch depth with 30 inch row spacing.'
  },
  {
    id: 2,
    title: 'Fertilize Wheat - Field B',
    start: new Date(now.getFullYear(), now.getMonth(), 8, 9, 0, 0),
    end: new Date(now.getFullYear(), now.getMonth(), 8, 12, 0, 0),
    resource: 'Fertilizer Spreader',
    type: 'fertilization',
    description: 'Apply nitrogen fertilizer at 40 lbs/acre.'
  },
  {
    id: 3,
    title: 'Scout for Pests - All Fields',
    start: new Date(now.getFullYear(), now.getMonth(), 15),
    end: new Date(now.getFullYear(), now.getMonth(), 15),
    allDay: true,
    resource: 'Agronomist',
    type: 'scouting',
    description: 'Check for aphids, corn borers, and other common pests.'
  },
   {
    id: 4,
    title: 'Harvest Soybeans - Field C',
    start: new Date(now.getFullYear(), now.getMonth() + 1, 5),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 10),
    type: 'harvesting',
    description: 'Harvest soybeans when moisture content is between 13-15%.'
  },
  {
    id: 5,
    title: 'Tractor Maintenance',
    start: new Date(now.getFullYear(), now.getMonth(), 20),
    end: new Date(now.getFullYear(), now.getMonth(), 20),
    resource: 'John Deere 8R',
    type: 'equipment',
    description: 'Regular maintenance: oil change, filter replacement, and general inspection.'
  },
  {
    id: 6,
    title: 'Irrigation - Field D',
    start: new Date(now.getFullYear(), now.getMonth(), 12),
    end: new Date(now.getFullYear(), now.getMonth(), 12),
    resource: 'Center Pivot System',
    type: 'irrigation',
    description: 'Apply 0.75 inches of water.'
  },
];

export default function CropCalendarPage() {
  const [events, setEvents] = useState<FarmEvent[]>(initialMockEvents);
  const [formModalOpened, setFormModalOpened] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<FarmEvent> | null>(null);
  const [modalTitle, setModalTitle] = useState('Add New Event');
  const [activeTab, setActiveTab] = useState<string>('calendar');

  const handleAddEventClick = () => {
    setCurrentEvent(null);
    setModalTitle('Add New Event');
    setFormModalOpened(true);
  };

  const handleEditEvent = (event: FarmEvent) => {
    setCurrentEvent(event);
    setModalTitle('Edit Event');
    setFormModalOpened(true);
  };

  const handleDeleteEvent = (eventId: number | string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(event => event.id !== eventId));
      console.log(`Deleted event with ID: ${eventId}`);
    }
  };

  const handleSaveEvent = (eventData: FarmEvent) => {
    if (currentEvent && currentEvent.id) {
      setEvents(events.map(event => (event.id === eventData.id ? eventData : event)));
      console.log('Updated event:', eventData);
    } else {
      // Generate a unique ID for new events
      const newId = Math.max(...events.map(e => typeof e.id === 'number' ? e.id : 0)) + 1;
      setEvents([...events, { ...eventData, id: newId }]);
      console.log('Added new event:', eventData);
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
            <Text>Farm Calendar</Text>
          </Group>
        </Title>
      </Group>

      <Tabs value={activeTab} onChange={(value) => value && setActiveTab(value)} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="calendar">Calendar</Tabs.Tab>
          <Tabs.Tab value="recommendations">Planting Recommendations</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="calendar">
          <EnhancedCalendar
            events={events}
            onAddEvent={handleAddEventClick}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
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