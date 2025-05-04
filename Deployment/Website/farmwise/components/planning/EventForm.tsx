'use client';

import React from 'react';
import { useForm } from '@mantine/form';
import { TextInput, Button, Modal, Stack, Group, Textarea, Select, Checkbox } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
// Import from the new types file
import type { FarmEvent } from '@/types/planning';

interface EventFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: FarmEvent) => void; // Use the imported type
  initialValues?: Partial<FarmEvent> | null; // Allow partial initial values
  title: string;
}

export function EventForm({ opened, onClose, onSubmit, initialValues, title }: EventFormProps) {
  const form = useForm<Partial<FarmEvent>>({ // Use partial type for form
    initialValues: {
      title: initialValues?.title || '',
      start: initialValues?.start || new Date(),
      end: initialValues?.end || new Date(),
      allDay: initialValues?.allDay || false,
      resource: initialValues?.resource || '',
      type: initialValues?.type || '',
      // Add other relevant fields here
    },

    validate: {
      title: (value: any) => (value.trim().length > 0 ? null : 'Title is required'),
      start: (value: any) => (value ? null : 'Start date is required'),
      end: (value: any, values: any) => (value ? (value >= values.start ? null : 'End date must be after start date') : 'End date is required'),
    },
  });

  const handleSubmit = (values: Partial<FarmEvent>) => { // Form values are partial
    // Convert form values to the FarmEvent structure if necessary
    const eventData: FarmEvent = {
      id: initialValues?.id ?? Date.now(), // Use existing ID or generate a new one
      title: values.title || '', // Provide default empty string
      start: values.start || new Date(), // Provide default date
      end: values.end || new Date(),   // Provide default date
      allDay: values.allDay,
      resource: values.resource,
      type: values.type,
    };

    // Validate required fields before submitting, although form validation should handle this
    if (!eventData.title || !eventData.start || !eventData.end) {
        console.error("Missing required event fields");
        // Optionally show an error message to the user
        return; 
    }

    onSubmit(eventData as FarmEvent); // Assert type as FarmEvent
    form.reset(); // Reset form after submission
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            required
            label="Event Title"
            placeholder="e.g., Plant Corn"
            {...form.getInputProps('title')}
          />
          <DateTimePicker
            required
            label="Start Date & Time"
            placeholder="Pick date and time"
            {...form.getInputProps('start')}
            disabled={form.values.allDay} // Disable if allDay is checked
            clearable
          />
          <DateTimePicker
            required
            label="End Date & Time"
            placeholder="Pick date and time"
            {...form.getInputProps('end')}
            minDate={form.values.start} // Ensure end date is not before start date
            disabled={form.values.allDay} // Disable if allDay is checked
            clearable
          />
           <Checkbox
            label="All Day Event"
            {...form.getInputProps('allDay', { type: 'checkbox' })}
            onChange={(event) => {
              form.setFieldValue('allDay', event.currentTarget.checked);
              // Optionally clear time or set default time if unchecked
            }}
          />
          <TextInput
            label="Resource"
            placeholder="e.g., Tractor, Team A"
            {...form.getInputProps('resource')}
          />
           <Select
            label="Event Type"
            placeholder="Select type"
            data={[
                { value: 'planting', label: 'Planting' },
                { value: 'harvesting', label: 'Harvesting' },
                { value: 'fertilization', label: 'Fertilization' },
                { value: 'scouting', label: 'Scouting' },
                { value: 'irrigation', label: 'Irrigation' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'other', label: 'Other' },
            ]}
            {...form.getInputProps('type')}
            clearable
          />
          {/* Add more form fields as needed */}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Event</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
} 