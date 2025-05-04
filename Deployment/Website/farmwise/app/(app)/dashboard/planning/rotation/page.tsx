'use client';

import React, { useMemo, useState } from 'react';
import { Container, Title, Text, Paper, Table, Button, Group, Select, SimpleGrid, Stack, Badge, Alert, Divider, Box, Modal, ActionIcon } from '@mantine/core';
import { IconInfoCircle, IconPlant2, IconArrowRight, IconAlertTriangle, IconPencil, IconTrash, IconEye } from '@tabler/icons-react';
import { RotationEntryForm } from '@/components/planning/RotationEntryForm';
import type { RotationEntry } from '@/types/planning';

const initialRotationData: RotationEntry[] = [
  { id: 1, field: 'Field A', year: 2024, season: 'Spring', crop: 'Tomatoes', status: 'Harvested', family: 'Nightshade' },
  { id: 2, field: 'Field A', year: 2024, season: 'Summer', crop: 'Corn', status: 'Growing', family: 'Grass' },
  { id: 3, field: 'Field A', year: 2024, season: 'Fall', crop: 'Cover Crop (Rye)', status: 'Planned', family: 'Grass' },
  { id: 4, field: 'Field B', year: 2024, season: 'Spring', crop: 'Lettuce', status: 'Harvested', family: 'Aster' },
  { id: 5, field: 'Field B', year: 2024, season: 'Summer', crop: 'Soybeans', status: 'Growing', family: 'Legume' },
  { id: 6, field: 'Field B', year: 2024, season: 'Fall', crop: 'Fallow', status: 'Planned', family: 'None' },
  { id: 7, field: 'Field C', year: 2024, season: 'Spring/Summer', crop: 'Wheat', status: 'Harvested', family: 'Grass' },
  { id: 8, field: 'Field C', year: 2024, season: 'Fall', crop: 'Cover Crop (Clover)', status: 'Planned', family: 'Legume' },
  { id: 9, field: 'Field A', year: 2025, season: 'Spring', crop: 'Peppers', status: 'Planned', family: 'Nightshade' },
];

const groupRotationByField = (data: RotationEntry[]) => {
  return data.reduce((acc: { [field: string]: RotationEntry[] }, item: RotationEntry) => {
    if (!acc[item.field]) {
      acc[item.field] = [];
    }
    acc[item.field].push(item);
    acc[item.field].sort((a: RotationEntry, b: RotationEntry) => {
      if (a.year !== b.year) return a.year - b.year;
      const seasonOrder: { [key: string]: number } = { 'Spring': 1, 'Spring/Summer': 2, 'Summer': 3, 'Fall': 4, 'Winter': 5, 'Full Year': 6 };
      return (seasonOrder[a.season] || 99) - (seasonOrder[b.season] || 99);
    });
    return acc;
  }, {});
};

const checkRotationIssues = (allRotationsByField: { [field: string]: RotationEntry[] }) => {
  const issues: { [field: string]: string[] } = {};
  for (const field in allRotationsByField) {
    const fieldRotations = allRotationsByField[field];
    issues[field] = [];
    for (let i = 1; i < fieldRotations.length; i++) {
      const prev = fieldRotations[i - 1];
      const current = fieldRotations[i];
      if (prev.family && prev.family !== 'None' && prev.family === current.family && prev.family !== 'Cover Crop') {
        issues[field].push(`Potential issue in ${field}: Planting ${current.crop} (${current.family}) after ${prev.crop} (${prev.family}) - ${prev.year}/${prev.season} -> ${current.year}/${current.season}.`);
      }
      if (current.year === prev.year + 1 && prev.family && prev.family !== 'None' && prev.family === current.family && prev.family !== 'Cover Crop') {
        issues[field].push(`Potential issue in ${field} (Year Change): Planting ${current.crop} (${current.family}, ${current.year}) after ${prev.crop} (${prev.family}, ${prev.year}).`);
      }
    }
  }
  return issues;
};

export default function RotationSchedulePage() {
  const [rotationEntries, setRotationEntries] = useState<RotationEntry[]>(initialRotationData);
  const [selectedYear, setSelectedYear] = useState<string | null>(new Date().getFullYear().toString());
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<RotationEntry | null>(null);
  const [formModalOpened, setFormModalOpened] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<RotationEntry> | null>(null);
  const [modalTitle, setModalTitle] = useState('Add Rotation Entry');

  const groupedData = useMemo(() => groupRotationByField(rotationEntries), [rotationEntries]);
  const rotationIssues = useMemo(() => checkRotationIssues(groupedData), [groupedData]);

  const availableYears = useMemo(() => {
    const years = new Set(rotationEntries.map(e => e.year.toString()));
    return Array.from(years).sort().reverse();
  }, [rotationEntries]);

  const filteredFields = useMemo(() => {
    return Object.keys(groupedData).filter(field =>
      !selectedYear || groupedData[field].some((entry: RotationEntry) => entry.year.toString() === selectedYear)
    );
  }, [groupedData, selectedYear]);

  const handleSelectEntry = (entry: RotationEntry) => {
    setSelectedEntry(entry);
    setDetailsModalOpened(true);
  };

  const handleAddEntryClick = () => {
    setCurrentEntry(null);
    setModalTitle('Add Rotation Entry');
    setDetailsModalOpened(false);
    setFormModalOpened(true);
  };

  const handleEditEntryClick = (entry: RotationEntry) => {
    setCurrentEntry(entry);
    setModalTitle('Edit Rotation Entry');
    setDetailsModalOpened(false);
    setFormModalOpened(true);
  };

  const handleDeleteEntry = (entryId: number | string) => {
    if (window.confirm('Are you sure you want to delete this rotation entry?')) {
      setRotationEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
      setDetailsModalOpened(false);
      setSelectedEntry(null);
      console.log(`Deleted rotation entry with ID: ${entryId}`);
    }
  };

  const handleSaveEntry = (entryData: RotationEntry) => {
    setRotationEntries(prevEntries => {
      if (currentEntry && currentEntry.id) {
        console.log('Updating rotation entry:', entryData);
        return prevEntries.map(entry => (entry.id === entryData.id ? entryData : entry));
      } else {
        console.log('Adding new rotation entry:', entryData);
        return [...prevEntries, entryData];
      }
    });
    setFormModalOpened(false);
    setCurrentEntry(null);
    console.log('Adding API call here for actual save/update');
  };

  return (
    <Container size="xl">
      <Group justify="space-between" align="flex-start" mb="lg">
        <Title order={2}>Crop Rotation Plan</Title>
        <Group>
          <Select
            label="Filter by Year"
            placeholder="All Years"
            data={availableYears}
            value={selectedYear}
            onChange={setSelectedYear}
            clearable
          />
          <Button onClick={handleAddEntryClick} mt="xl">Add Rotation Entry</Button>
        </Group>
      </Group>

      <Alert icon={<IconInfoCircle size="1rem" />} title="Rotation Planning" color="blue" variant="light" mb="lg">
        Effective crop rotation helps manage soil fertility, control pests and diseases, and improve long-term soil health.
        Click on an entry for details or to edit/delete.
      </Alert>

      <Paper shadow="xs" p="md">
        <Stack gap="xl">
          {filteredFields.length > 0 ? filteredFields.map((field) => {
            const fieldRotations = selectedYear
              ? groupedData[field].filter((entry: RotationEntry) => entry.year.toString() === selectedYear)
              : groupedData[field];

            if (fieldRotations.length === 0 && selectedYear) return null;

            const fieldIssues: string[] = rotationIssues[field] || [];

            return (
              <Box key={field}>
                <Title order={4} mb="sm">{field}</Title>
                <Paper withBorder p="md" radius="sm">
                  <Text size="sm" c="dimmed" mb="xs">Rotation Sequence {selectedYear ? `(${selectedYear})` : '(All Years)'}</Text>
                  <Group wrap="wrap" gap="xs" mb="md">
                    {fieldRotations.map((entry: RotationEntry, index: number) => (
                      <React.Fragment key={entry.id}>
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => handleSelectEntry(entry)}
                          leftSection={<IconPlant2 size={14}/>}
                          color={entry.status === 'Planned' ? 'gray' : entry.status === 'Growing' ? 'green' : 'blue'}
                          px="xs"
                        >
                          {entry.crop} ({entry.season} {entry.year})
                        </Button>
                        {index < fieldRotations.length - 1 && <IconArrowRight size={16} color="gray" />}
                      </React.Fragment>
                    ))}
                  </Group>
                  {fieldIssues.length > 0 && (
                    <>
                      <Divider my="xs" />
                      <Alert variant="outline" color="orange" title="Potential Rotation Considerations" icon={<IconAlertTriangle />} mt="sm" radius="xs">
                        <Stack gap="xs">
                          {fieldIssues.map((issue: string, idx: number) => <Text key={idx} size="xs">- {issue}</Text>)}
                        </Stack>
                      </Alert>
                    </>
                  )}
                </Paper>
              </Box>
            );
          }) : (
            <Text c="dimmed" ta="center">No rotation data found{selectedYear ? ` for ${selectedYear}`: ''}. Add entries to get started.</Text>
          )}
        </Stack>
      </Paper>

      <Modal
        opened={detailsModalOpened}
        onClose={() => setDetailsModalOpened(false)}
        title={`Details: ${selectedEntry?.crop} (${selectedEntry?.field} - ${selectedEntry?.year})`}
      >
        {selectedEntry && (
          <Stack>
            <Text><strong>Field:</strong> {selectedEntry.field}</Text>
            <Text><strong>Year:</strong> {selectedEntry.year}</Text>
            <Text><strong>Season:</strong> {selectedEntry.season}</Text>
            <Text><strong>Crop:</strong> {selectedEntry.crop}</Text>
            <Text><strong>Family:</strong> {selectedEntry.family || 'N/A'}</Text>
            <Text><strong>Status:</strong> <Badge color={selectedEntry.status === 'Planned' ? 'gray' : selectedEntry.status === 'Growing' ? 'green' : 'blue'} variant="light">{selectedEntry.status}</Badge></Text>
            <Group justify="flex-end" mt="md">
              <Button variant="outline" leftSection={<IconPencil size={14}/>} onClick={() => handleEditEntryClick(selectedEntry)}>Edit</Button>
              <Button color="red" leftSection={<IconTrash size={14}/>} onClick={() => handleDeleteEntry(selectedEntry.id)}>Delete</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <RotationEntryForm
        opened={formModalOpened}
        onClose={() => setFormModalOpened(false)}
        onSubmit={handleSaveEntry}
        initialValues={currentEntry}
        title={modalTitle}
      />
    </Container>
  );
} 