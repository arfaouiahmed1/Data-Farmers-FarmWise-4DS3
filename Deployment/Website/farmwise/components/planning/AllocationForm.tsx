'use client';

import React from 'react';
import { useForm } from '@mantine/form';
import { TextInput, Button, Modal, Stack, Group, Select, Textarea } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { AllocationEntry } from '@/types/planning';

interface AllocationFormProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: AllocationEntry) => void;
    initialValues?: Partial<AllocationEntry> | null;
    title: string;
    defaultType?: 'equipment' | 'labor' | 'material'; // Optional default type based on tab
}

export function AllocationForm({ opened, onClose, onSubmit, initialValues, title, defaultType }: AllocationFormProps) {
    const form = useForm<Partial<AllocationEntry>>({
        initialValues: {
            task: initialValues?.task || '',
            startDate: initialValues?.startDate || undefined,
            endDate: initialValues?.endDate || undefined,
            resourceType: initialValues?.resourceType || defaultType || 'equipment',
            resourceName: initialValues?.resourceName || '',
            field: initialValues?.field || '',
            notes: initialValues?.notes || '',
        },

        validate: {
            task: (value) => (value && value.trim().length > 0 ? null : 'Task description is required'),
            startDate: (value) => (value ? null : 'Start date is required'),
            endDate: (value, values) => {
                if (!value) return 'End date is required';
                if (values.startDate && value instanceof Date && values.startDate instanceof Date && value < values.startDate) {
                    return 'End date must be on or after start date';
                }
                return null;
            },
            resourceType: (value) => (value ? null : 'Resource type is required'),
            resourceName: (value) => (value && value.trim().length > 0 ? null : 'Resource name is required'),
            // Field and Notes are optional
        },
    });

    const handleSubmit = (values: Partial<AllocationEntry>) => {
        // Ensure dates are actual Date objects if needed, DatePickerInput usually handles this
        const entryData: AllocationEntry = {
            id: initialValues?.id ?? Date.now(), // Generate temporary ID
            task: values.task || '',
            startDate: values.startDate || new Date(), // Should not happen due to validation
            endDate: values.endDate || new Date(), // Should not happen due to validation
            resourceType: values.resourceType || 'equipment', // Should not happen
            resourceName: values.resourceName || '',
            field: values.field,
            notes: values.notes,
        };

        // Double check required fields (though validation should catch this)
        if (!entryData.task || !entryData.startDate || !entryData.endDate || !entryData.resourceType || !entryData.resourceName) {
            console.error("Missing required allocation fields", entryData);
             // Add user-facing error feedback if needed
            return;
        }

        onSubmit(entryData);
        form.reset();
        onClose();
    };

    // Example resource names - these should likely come from a database/inventory
    const resourceNameOptions = {
        equipment: ['Tractor JD 7R', 'Planter Kinze 3600', 'Sprayer Hagie STS12', 'Combine Case IH 9250'],
        labor: ['Crew Alpha', 'Crew Beta', 'Agronomist Sarah', 'Intern John'],
        material: ['Seed Corn XY (50kg)', 'Herbicide Gly (20L)', 'Fertilizer NPK (100kg)', 'Cover Crop Seed Mix (25kg)'],
    };

    return (
        <Modal opened={opened} onClose={onClose} title={title} size="lg">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <TextInput
                        required
                        label="Task Description"
                        placeholder="e.g., Plowing Field A, Scouting, Material Transport"
                        {...form.getInputProps('task')}
                    />
                    <Group grow>
                         <DatePickerInput
                            required
                            label="Start Date"
                            placeholder="Pick start date"
                            valueFormat="YYYY-MM-DD"
                            {...form.getInputProps('startDate')}
                         />
                         <DatePickerInput
                            required
                            label="End Date"
                            placeholder="Pick end date"
                            valueFormat="YYYY-MM-DD"
                            minDate={form.values.startDate || undefined}
                            {...form.getInputProps('endDate')}
                        />
                    </Group>
                    <Select
                        required
                        label="Resource Type"
                        data={[
                            { value: 'equipment', label: 'Equipment' },
                            { value: 'labor', label: 'Labor' },
                            { value: 'material', label: 'Material' },
                        ]}
                        {...form.getInputProps('resourceType')}
                    />
                     <Select
                        required
                        label="Resource Name"
                        placeholder={`Select ${form.values.resourceType}`}
                        data={resourceNameOptions[form.values.resourceType || 'equipment']} // Dynamically change options
                        {...form.getInputProps('resourceName')}
                        searchable
                    />
                     <TextInput
                        label="Field (Optional)"
                        placeholder="e.g., Field A, Section 3"
                        {...form.getInputProps('field')}
                    />
                     <Textarea
                        label="Notes (Optional)"
                        placeholder="Any specific instructions or details..."
                        {...form.getInputProps('notes')}
                        rows={3}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Allocation</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 