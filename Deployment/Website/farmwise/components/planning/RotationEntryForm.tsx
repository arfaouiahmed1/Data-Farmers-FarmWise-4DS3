'use client';

import React from 'react';
import { useForm } from '@mantine/form';
import { TextInput, Button, Modal, Stack, Group, Select, NumberInput } from '@mantine/core';
// Import from shared types file
import type { RotationEntry } from '@/types/planning';

// Remove local interface definition
/*
export interface RotationEntry {
    id: number | string; // Allow string for potential future UUIDs
    field: string;
    year: number;
    season: string;
    crop: string;
    status: string;
    family: string;
}
*/

interface RotationEntryFormProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: RotationEntry) => void;
    initialValues?: Partial<RotationEntry> | null;
    title: string;
}

export function RotationEntryForm({ opened, onClose, onSubmit, initialValues, title }: RotationEntryFormProps) {
    const form = useForm<Partial<RotationEntry>>({
        initialValues: {
            field: initialValues?.field || '',
            year: initialValues?.year || new Date().getFullYear(),
            season: initialValues?.season || '',
            crop: initialValues?.crop || '',
            status: initialValues?.status || 'Planned',
            family: initialValues?.family || '',
        },

        validate: {
            field: (value) => (value && value.trim().length > 0 ? null : 'Field name is required'),
            year: (value) => (value && value > 1900 && value < 2200 ? null : 'Valid year is required'),
            season: (value) => (value && value.trim().length > 0 ? null : 'Season is required'),
            crop: (value) => (value && value.trim().length > 0 ? null : 'Crop name is required'),
            status: (value) => (value ? null : 'Status is required'),
            // Family might be optional or derived
        },
    });

    const handleSubmit = (values: Partial<RotationEntry>) => {
        const entryData: RotationEntry = {
            id: initialValues?.id ?? Date.now(), // Generate temporary ID
            field: values.field || '',
            year: values.year || new Date().getFullYear(),
            season: values.season || '',
            crop: values.crop || '',
            status: values.status || 'Planned',
            family: values.family || 'Unknown', // Default family if needed
        };

        if (!entryData.field || !entryData.year || !entryData.season || !entryData.crop || !entryData.status) {
            console.error("Missing required rotation entry fields");
            // Add user-facing error feedback
            return;
        }

        onSubmit(entryData);
        form.reset();
        onClose();
    };

    // Example lists - potentially fetch from API or config
    const fieldOptions = ['Field A', 'Field B', 'Field C', 'Field D']; // Example
    const seasonOptions = ['Spring', 'Summer', 'Fall', 'Winter', 'Spring/Summer', 'Full Year'];
    const statusOptions = ['Planned', 'Growing', 'Harvested', 'Fallow'];
    // Crop families might be a more complex selection or auto-populated based on crop

    return (
        <Modal opened={opened} onClose={onClose} title={title} size="md">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <Select
                        required
                        label="Field"
                        placeholder="Select field name"
                        data={fieldOptions}
                        {...form.getInputProps('field')}
                        searchable
                    />
                    <NumberInput
                        required
                        label="Year"
                        placeholder="Enter year"
                        min={2000}
                        max={2100}
                        step={1}
                        {...form.getInputProps('year')}
                    />
                    <Select
                        required
                        label="Season"
                        placeholder="Select season"
                        data={seasonOptions}
                        {...form.getInputProps('season')}
                        searchable
                    />
                    <TextInput
                        required
                        label="Crop"
                        placeholder="e.g., Corn, Wheat, Cover Crop (Rye)"
                        {...form.getInputProps('crop')}
                    />
                    {/* Consider a Select for known crops or enhancing this */}
                    <TextInput
                        label="Crop Family"
                        placeholder="e.g., Grass, Legume, Nightshade (Optional)"
                        {...form.getInputProps('family')}
                    />
                     <Select
                        required
                        label="Status"
                        placeholder="Select status"
                        data={statusOptions}
                        {...form.getInputProps('status')}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Entry</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
} 