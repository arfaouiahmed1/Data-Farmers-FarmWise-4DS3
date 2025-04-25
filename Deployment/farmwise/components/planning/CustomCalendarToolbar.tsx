'use client';

import React from 'react';
import { Button, ButtonGroup, Group, Text, Title, Select, ActionIcon, Tooltip } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconCalendarEvent, IconLayoutGrid, IconList, IconCalendar } from '@tabler/icons-react';
import { ToolbarProps, View } from 'react-big-calendar';
import { FarmEvent } from '@/types/planning'; // Assuming FarmEvent is the event type

// Map view names to icons and labels if needed
const viewIcons: { [key: string]: React.ReactNode } = {
    month: <IconCalendar size={16} />,
    week: <IconLayoutGrid size={16} />,
    day: <IconCalendarEvent size={16} />,
    agenda: <IconList size={16} />,
};

const viewLabels: { [key: string]: string } = {
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Agenda',
};

// Define the type for the ToolbarProps with your specific event type
// Note: react-big-calendar types might require generics.
// If ToolbarProps doesn't accept FarmEvent directly, use `any` or a base event type.
type CustomToolbarProps = ToolbarProps<FarmEvent, object>;

export function CustomCalendarToolbar(props: CustomToolbarProps) {
    const { label, localizer: { messages }, onNavigate, onView, views, view } = props;

    const navigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
        onNavigate(action);
    };

    const changeView = (newView: string) => {
        onView(newView as View);
    };

    return (
        <Group justify="space-between" mb="md" wrap="wrap"> 
            <Group gap="xs">
                 <Tooltip label={messages.today}>
                    <ActionIcon variant="default" onClick={() => navigate('TODAY')} size="lg">
                        <IconCalendar size={18} />
                    </ActionIcon>
                 </Tooltip>
                <Tooltip label={messages.previous}>
                    <ActionIcon variant="default" onClick={() => navigate('PREV')} size="lg">
                        <IconChevronLeft size={18} />
                    </ActionIcon>
                </Tooltip>
                 <Tooltip label={messages.next}>
                     <ActionIcon variant="default" onClick={() => navigate('NEXT')} size="lg">
                        <IconChevronRight size={18} />
                    </ActionIcon>
                 </Tooltip>
            </Group>

            <Title order={5} ta="center" style={{ flexGrow: 1 }}>{label}</Title> 

            <ButtonGroup>
                {(views as string[]).map((viewName) => (
                    <Button
                        key={viewName}
                        variant={view === viewName ? 'filled' : 'default'} 
                        onClick={() => changeView(viewName)}
                        leftSection={viewIcons[viewName]}
                        size="sm"
                    >
                       {viewLabels[viewName] || viewName}
                    </Button>
                ))}
            </ButtonGroup>
        </Group>
    );
} 