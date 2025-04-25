'use client';

import React, { useState } from 'react';
import {
    Container, Title, Text, Paper, Button, Modal,
    Group, Stack, Box, ActionIcon, Divider // Import ActionIcon if needed, using Button with icons for now
} from '@mantine/core';
import { Calendar, dateFnsLocalizer, EventProps } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/custom-calendar.css'; // Import custom styles
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react'; // Import icons
import type { FarmEvent } from '@/types/planning';
import { EventForm } from '@/components/planning/EventForm';
import { CustomCalendarToolbar } from '@/components/planning/CustomCalendarToolbar';

// Setup the localizer by providing the required functions
const locales = {
  'en-US': enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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
  },
  {
    id: 2,
    title: 'Fertilize Wheat - Field B',
    start: new Date(now.getFullYear(), now.getMonth(), 8, 9, 0, 0),
    end: new Date(now.getFullYear(), now.getMonth(), 8, 12, 0, 0),
    resource: 'Fertilizer Spreader',
    type: 'fertilization',
  },
  {
    id: 3,
    title: 'Scout for Pests - All Fields',
    start: new Date(now.getFullYear(), now.getMonth(), 15),
    end: new Date(now.getFullYear(), now.getMonth(), 15),
    allDay: true,
    resource: 'Agronomist',
    type: 'scouting',
  },
   {
    id: 4,
    title: 'Harvest Soybeans - Field C',
    start: new Date(now.getFullYear(), now.getMonth() + 1, 5),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 10),
    type: 'harvesting',
  },
];

export default function CropCalendarPage() {
  const [events, setEvents] = useState<FarmEvent[]>(initialMockEvents);
  const [selectedEvent, setSelectedEvent] = useState<FarmEvent | null>(null);
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);
  const [formModalOpened, setFormModalOpened] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<FarmEvent> | null>(null);
  const [modalTitle, setModalTitle] = useState('Add New Event');

  const handleSelectEvent = (event: FarmEvent) => {
    setSelectedEvent(event);
    setDetailsModalOpened(true);
  };

  const handleAddEventClick = () => {
    setCurrentEvent(null);
    setModalTitle('Add New Event');
    setDetailsModalOpened(false);
    setFormModalOpened(true);
  };

  const handleEditEventClick = (event: FarmEvent) => {
    setCurrentEvent(event);
    setModalTitle('Edit Event');
    setDetailsModalOpened(false);
    setFormModalOpened(true);
  };

  const handleDeleteEvent = (eventId: number | string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(event => event.id !== eventId));
      setDetailsModalOpened(false);
      setSelectedEvent(null);
      console.log(`Deleted event with ID: ${eventId}`);
    }
  };

  const handleSaveEvent = (eventData: FarmEvent) => {
    if (currentEvent && currentEvent.id) {
      setEvents(events.map(event => (event.id === eventData.id ? eventData : event)));
      console.log('Updated event:', eventData);
    } else {
      setEvents([...events, { ...eventData }]);
      console.log('Added new event:', eventData);
    }
    setFormModalOpened(false);
    setCurrentEvent(null);
  };

  // Refine event styling
  const eventStyleGetter = (event: FarmEvent, start: Date, end: Date, isSelected: boolean) => {
    let backgroundColor = '#3174ad'; // Default blue
    let borderColor = '#195a91'; // Darker blue

    if (event.type === 'planting') { backgroundColor = '#40c057'; borderColor = '#2f9e44'; } // Green
    if (event.type === 'harvesting') { backgroundColor = '#fd7e14'; borderColor = '#e67700'; } // Orange
    if (event.type === 'fertilization') { backgroundColor = '#7950f2'; borderColor = '#7048e8'; } // Violet
    if (event.type === 'scouting') { backgroundColor = '#fab005'; borderColor = '#f59f00'; } // Yellow
    // Add more types and colors if needed

    const style = {
        backgroundColor: isSelected ? borderColor : backgroundColor,
        borderRadius: '4px', // Slightly smaller radius
        opacity: 0.9, // Slightly less opaque
        color: 'white',
        border: `1px solid ${borderColor}`,
        display: 'block',
        padding: '2px 4px', // Add small padding
        fontSize: '0.8rem', // Slightly smaller font
    };
    return {
        style: style
    };
  };

  return (
    <Container size="xl" py="lg">
      <Group justify="space-between" align="center" mb="xl">
        <Title order={3}>Crop Calendar</Title>
        <Button onClick={handleAddEventClick} leftSection={<IconPlus size={16} />}>Add Event</Button>
      </Group>

      <Paper shadow="sm" p="md" withBorder>
        <Calendar<FarmEvent>
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '70vh' }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          components={{
              toolbar: CustomCalendarToolbar
          }}
        />
      </Paper>

      <Modal
        opened={detailsModalOpened}
        onClose={() => setDetailsModalOpened(false)}
        title={selectedEvent?.title || 'Event Details'}
      >
        {selectedEvent && (
          <Stack>
            <Text><strong>Starts:</strong> {format(selectedEvent.start, 'Pp')}</Text>
            <Text><strong>Ends:</strong> {format(selectedEvent.end, 'Pp')}</Text>
            {selectedEvent.resource && <Text><strong>Resource:</strong> {selectedEvent.resource}</Text>}
            {selectedEvent.type && <Text><strong>Type:</strong> {selectedEvent.type}</Text>}
          </Stack>
        )}
      </Modal>
    </Container>
  );
} 