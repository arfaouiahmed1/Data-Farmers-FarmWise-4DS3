import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Group,
  Text,
  Button,
  Modal,
  Stack,
  Badge,
  ActionIcon,
  Menu,
  Tooltip,
  useMantineTheme,
  Divider
} from '@mantine/core';
import { Calendar, dateFnsLocalizer, EventProps, View } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
  IconPlus, 
  IconPencil, 
  IconTrash, 
  IconCalendarEvent, 
  IconPlant2, 
  IconTractor, 
  IconSunFilled, 
  IconCloudRain, 
  IconInfoCircle 
} from '@tabler/icons-react';
import { EnhancedCalendarToolbar } from './EnhancedCalendarToolbar';
import type { FarmEvent } from '@/types/planning';

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

interface EnhancedCalendarProps {
  events: FarmEvent[];
  onAddEvent?: () => void;
  onEditEvent?: (event: FarmEvent) => void;
  onDeleteEvent?: (eventId: number | string) => void;
  onViewEvent?: (event: FarmEvent) => void;
}

export function EnhancedCalendar({ 
  events, 
  onAddEvent, 
  onEditEvent, 
  onDeleteEvent, 
  onViewEvent 
}: EnhancedCalendarProps) {
  const theme = useMantineTheme();
  const [selectedEvent, setSelectedEvent] = useState<FarmEvent | null>(null);
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);
  const [currentView, setCurrentView] = useState<View>('month');

  // Handle event click
  const handleSelectEvent = useCallback((event: FarmEvent) => {
    setSelectedEvent(event);
    setDetailsModalOpened(true);
  }, []);

  // Handle view change
  const handleViewChange = useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  // Get icon based on event type
  const getEventIcon = (type?: string) => {
    switch(type) {
      case 'planting': return <IconPlant2 size={16} />;
      case 'harvesting': return <IconSunFilled size={16} />;
      case 'fertilization': return <IconCloudRain size={16} />;
      case 'equipment': return <IconTractor size={16} />;
      default: return <IconCalendarEvent size={16} />;
    }
  };

  // Customize event appearance
  const eventStyleGetter = useCallback((event: FarmEvent) => {
    let className = '';
    
    switch(event.type) {
      case 'planting': className = 'planting-event'; break;
      case 'harvesting': className = 'harvesting-event'; break;
      case 'fertilization': className = 'fertilization-event'; break;
      case 'scouting': className = 'scouting-event'; break;
      case 'equipment': className = 'equipment-event'; break;
      case 'irrigation': className = 'irrigation-event'; break;
    }

    const style = {
      opacity: 0.9,
      fontSize: '0.875rem',
      display: 'block',
    };

    return { style, className };
  }, []);

  // Custom event component
  const EventComponent = ({ event }: EventProps<FarmEvent>) => (
    <Tooltip label={`${event.title} (${format(event.start, 'MMM d')} - ${format(event.end, 'MMM d')})`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {getEventIcon(event.type)}
        <span>{event.title}</span>
      </div>
    </Tooltip>
  );

  // Custom agenda event component
  const AgendaEventComponent = ({ event }: { event: FarmEvent }) => (
    <Group wrap="nowrap" align="center">
      <Box style={{ 
        width: 12, 
        height: 12, 
        borderRadius: '50%', 
        backgroundColor: event.type === 'planting' ? theme.colors.green[6] :
                        event.type === 'harvesting' ? theme.colors.orange[6] :
                        event.type === 'fertilization' ? theme.colors.violet[6] :
                        event.type === 'scouting' ? theme.colors.yellow[6] :
                        event.type === 'equipment' ? theme.colors.blue[6] :
                        event.type === 'irrigation' ? theme.colors.cyan[6] :
                        theme.colors.gray[6]
      }} />
      <Text size="sm">{event.title}</Text>
      {event.resource && (
        <Badge size="xs" variant="outline">
          {event.resource}
        </Badge>
      )}
    </Group>
  );

  return (
    <>
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
          onView={handleViewChange}
          view={currentView}
          components={{
            toolbar: (props) => <EnhancedCalendarToolbar {...props} onAddEvent={onAddEvent} />,
            event: EventComponent,
            agenda: {
              event: AgendaEventComponent,
            }
          }}
          popup
          selectable
        />
      </Paper>

      {/* Event Details Modal */}
      <Modal
        opened={detailsModalOpened}
        onClose={() => setDetailsModalOpened(false)}
        title={
          <Group gap="xs">
            {getEventIcon(selectedEvent?.type)}
            <Text fw={600}>{selectedEvent?.title || 'Event Details'}</Text>
          </Group>
        }
        size="md"
      >
        {selectedEvent && (
          <Stack>
            <Group gap="xs">
              <Badge color={
                selectedEvent.type === 'planting' ? 'green' :
                selectedEvent.type === 'harvesting' ? 'orange' :
                selectedEvent.type === 'fertilization' ? 'violet' :
                selectedEvent.type === 'scouting' ? 'yellow' :
                selectedEvent.type === 'equipment' ? 'blue' :
                selectedEvent.type === 'irrigation' ? 'cyan' :
                'gray'
              }>
                {selectedEvent.type || 'Event'}
              </Badge>
              {selectedEvent.allDay && <Badge variant="outline">All Day</Badge>}
            </Group>
            
            <Group align="flex-start">
              <IconCalendarEvent size={18} style={{ marginTop: 2 }} />
              <div>
                <Text size="sm" fw={500}>Date & Time</Text>
                <Text size="sm">
                  {format(selectedEvent.start, 'PPP')}
                  {!selectedEvent.allDay && ` at ${format(selectedEvent.start, 'p')}`}
                </Text>
                <Text size="sm">
                  {selectedEvent.start.toDateString() !== selectedEvent.end.toDateString() && 
                    `to ${format(selectedEvent.end, 'PPP')}`}
                  {!selectedEvent.allDay && ` at ${format(selectedEvent.end, 'p')}`}
                </Text>
              </div>
            </Group>
            
            {selectedEvent.resource && (
              <Group align="flex-start">
                <IconTractor size={18} style={{ marginTop: 2 }} />
                <div>
                  <Text size="sm" fw={500}>Resource</Text>
                  <Text size="sm">{selectedEvent.resource}</Text>
                </div>
              </Group>
            )}
            
            {selectedEvent.description && (
              <Group align="flex-start">
                <IconInfoCircle size={18} style={{ marginTop: 2 }} />
                <div>
                  <Text size="sm" fw={500}>Description</Text>
                  <Text size="sm">{selectedEvent.description}</Text>
                </div>
              </Group>
            )}
            
            <Divider my="sm" />
            
            <Group justify="flex-end" gap="xs">
              {onViewEvent && (
                <Button variant="default" onClick={() => onViewEvent(selectedEvent)}>
                  View Details
                </Button>
              )}
              {onEditEvent && (
                <Button 
                  variant="outline" 
                  leftSection={<IconPencil size={16} />} 
                  onClick={() => {
                    onEditEvent(selectedEvent);
                    setDetailsModalOpened(false);
                  }}
                >
                  Edit
                </Button>
              )}
              {onDeleteEvent && (
                <Button 
                  color="red" 
                  leftSection={<IconTrash size={16} />} 
                  onClick={() => {
                    onDeleteEvent(selectedEvent.id);
                    setDetailsModalOpened(false);
                  }}
                >
                  Delete
                </Button>
              )}
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
}
