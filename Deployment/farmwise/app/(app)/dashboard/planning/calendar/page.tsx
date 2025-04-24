'use client';

import React, { useState } from 'react';
import { Container, Title, Text, Paper, Button, Modal, Group, Stack } from '@mantine/core';
import { Calendar, dateFnsLocalizer, EventProps } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Import CSS

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
const mockEvents = [
  {
    id: 1,
    title: 'Plant Corn - Field A',
    start: new Date(now.getFullYear(), now.getMonth(), 2),
    end: new Date(now.getFullYear(), now.getMonth(), 4),
    resource: 'Planting Team', // Example custom field
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
    start: new Date(now.getFullYear(), now.getMonth() + 1, 5), // Next month example
    end: new Date(now.getFullYear(), now.getMonth() + 1, 10),
    type: 'harvesting',
  },
];

// Define interface for our event structure
interface FarmEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: string;
  type?: string;
}

export default function CropCalendarPage() {
  const [events, setEvents] = useState<FarmEvent[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<FarmEvent | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const handleSelectEvent = (event: FarmEvent) => {
    setSelectedEvent(event);
    setModalOpened(true);
  };

  const handleAddEvent = () => {
    // TODO: Implement logic to open a form/modal for adding new events
    alert('Add New Event functionality to be implemented.');
  };

  // Optional: Custom styling for events
  const eventStyleGetter = (event: FarmEvent, start: Date, end: Date, isSelected: boolean) => {
    let backgroundColor = '#3174ad'; // Default blue
    if (event.type === 'planting') backgroundColor = '#2f9e44'; // Green
    if (event.type === 'harvesting') backgroundColor = '#e67700'; // Orange
    if (event.type === 'fertilization') backgroundColor = '#7048e8'; // Violet
    if (event.type === 'scouting') backgroundColor = '#fcc419'; // Yellow

    const style = {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
    };
    return {
        style: style
    };
  };

  return (
    <Container size="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Crop Calendar</Title>
        <Button onClick={handleAddEvent}>Add Event</Button>
      </Group>

      <Paper shadow="xs" p="md" style={{ height: '70vh' }}>
        {/* Adjust height as needed */}
        <Calendar<FarmEvent> // Specify event type
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter} // Apply custom styles
          views={['month', 'week', 'day', 'agenda']} // Configure available views
        />
      </Paper>

      {/* Modal to display event details */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={selectedEvent?.title || 'Event Details'}
      >
        {selectedEvent && (
          <Stack>
            <Text><strong>Starts:</strong> {format(selectedEvent.start, 'Pp')}</Text>
            <Text><strong>Ends:</strong> {format(selectedEvent.end, 'Pp')}</Text>
            {selectedEvent.resource && <Text><strong>Resource:</strong> {selectedEvent.resource}</Text>}
            {selectedEvent.type && <Text><strong>Type:</strong> {selectedEvent.type}</Text>}
            {/* Add more event details here */}
          </Stack>
        )}
      </Modal>
    </Container>
  );
} 