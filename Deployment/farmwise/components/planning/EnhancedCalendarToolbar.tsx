'use client';

import React from 'react';
import { Group, Button, ActionIcon, SegmentedControl, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconPlus } from '@tabler/icons-react';
import { ToolbarProps, View } from 'react-big-calendar';

interface EnhancedCalendarToolbarProps extends ToolbarProps<any> {
  onAddEvent?: () => void;
}

export function EnhancedCalendarToolbar({
  onNavigate,
  onView,
  view,
  date,
  views,
  onAddEvent
}: EnhancedCalendarToolbarProps) {
  const viewOptions = Object.keys(views).map(v => ({
    label: v.charAt(0).toUpperCase() + v.slice(1),
    value: v
  }));

  return (
    <Group wrap="nowrap" justify="space-between" mb="md">
      <Group gap="xs" wrap="nowrap">
        <Button
          variant="subtle"
          onClick={() => onNavigate('TODAY')}
          size="compact-sm"
          radius="xl"
          color="blue"
        >
          Today
        </Button>

        <Group gap={0}>
          <ActionIcon
            variant="subtle"
            onClick={() => onNavigate('PREV')}
            size="lg"
            radius="xl"
          >
            <IconChevronLeft size={20} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            onClick={() => onNavigate('NEXT')}
            size="lg"
            radius="xl"
          >
            <IconChevronRight size={20} />
          </ActionIcon>
        </Group>

        <Text size="lg" fw={500}>
          {new Date(date).toLocaleDateString('default', {
            month: 'long',
            year: 'numeric'
          })}
        </Text>
      </Group>

      <Group gap="md" wrap="nowrap">
        <SegmentedControl
          value={view}
          onChange={(newView) => onView(newView as View)}
          data={viewOptions}
          size="sm"
        />

        {onAddEvent && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={onAddEvent}
            radius="xl"
            variant="light"
          >
            Add Event
          </Button>
        )}
      </Group>
    </Group>
  );
}
