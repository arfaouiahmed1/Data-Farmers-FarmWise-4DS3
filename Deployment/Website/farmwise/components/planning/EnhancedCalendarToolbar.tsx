import React from 'react';
import { Group, Button, SegmentedControl, ActionIcon, Tooltip } from '@mantine/core';
import { 
  IconPlus, 
  IconChevronLeft, 
  IconChevronRight, 
  IconCalendarEvent, 
  IconLayoutGrid, 
  IconLayoutList, 
  IconLayoutColumns 
} from '@tabler/icons-react';
import { ToolbarProps, View } from 'react-big-calendar';
import { FarmEvent } from '@/types/planning';

interface EnhancedCalendarToolbarProps extends ToolbarProps<FarmEvent, object> {
  onAddEvent?: () => void;
}

export function EnhancedCalendarToolbar({ 
  onNavigate, 
  onView, 
  label, 
  view, 
  views, 
  onAddEvent 
}: EnhancedCalendarToolbarProps) {
  
  // Map view names to more user-friendly labels
  const viewLabels: Record<string, string> = {
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Agenda'
  };
  
  // Create view options for the segmented control
  const viewOptions = Object.keys(views).map((name: string) => ({
    value: name,
    label: viewLabels[name] || name,
    icon: name === 'month' ? <IconLayoutGrid size={16} /> :
          name === 'week' ? <IconLayoutColumns size={16} /> :
          name === 'day' ? <IconCalendarEvent size={16} /> :
          <IconLayoutList size={16} />
  }));
  
  return (
    <Group justify="space-between" mb="md" wrap="nowrap">
      <Group gap="xs">
        <Tooltip label="Previous">
          <ActionIcon 
            variant="light" 
            onClick={() => onNavigate('PREV')}
            size="lg"
          >
            <IconChevronLeft size={18} />
          </ActionIcon>
        </Tooltip>
        
        <Tooltip label="Today">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onNavigate('TODAY')}
          >
            Today
          </Button>
        </Tooltip>
        
        <Tooltip label="Next">
          <ActionIcon 
            variant="light" 
            onClick={() => onNavigate('NEXT')}
            size="lg"
          >
            <IconChevronRight size={18} />
          </ActionIcon>
        </Tooltip>
        
        <span style={{ fontWeight: 500, fontSize: '1rem' }}>{label}</span>
      </Group>
      
      <Group gap="xs">
        <SegmentedControl
          data={viewOptions}
          value={view}
          onChange={(value) => onView(value as View)}
          size="sm"
        />
        
        {onAddEvent && (
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={onAddEvent}
            size="sm"
          >
            Add Event
          </Button>
        )}
      </Group>
    </Group>
  );
}
