'use client';
import React, { useState, useEffect } from 'react';
import { Title, Text, Container, Paper, Alert, Button, FileInput, Group, Loader, Stack, Image as MantineImage } from '@mantine/core';
import { IconBug, IconUpload, IconPhoto, IconX, IconCheck } from '@tabler/icons-react';

interface PredictionResult {
  predicted_class: string;
  confidence: number;
  class_index: number;
}

export default function DiseaseDetectionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log('selectedFile state changed:', selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    console.log('isLoading state changed:', isLoading);
  }, [isLoading]);

  const handleFileChange = (file: File | null) => {
    console.log('handleFileChange called with file:', file);
    setSelectedFile(file);
    setPrediction(null);
    setError(null);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async () => {
    console.log('handleSubmit function called. Current selectedFile:', selectedFile, 'isLoading:', isLoading);
    if (!selectedFile) {
      setError('Please select an image file first.');
      console.log('handleSubmit: No selected file, exiting.');
      return;
    }

    console.log('handleSubmit: Proceeding with file submission.');
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // Assuming your Django backend is running on port 8000 and Next.js dev on 3000
      // In production, these would be on the same domain or use a configured proxy
      const response = await fetch('/api/detect-disease/', { // Updated to relative path assuming proxy or same origin
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header when using FormData with fetch,
        // the browser will set it correctly with the boundary.
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to process the request.' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: PredictionResult = await response.json();
      setPrediction(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      console.error('Disease detection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid>
      <Title order={2} mb="lg">
        <IconBug size={28} style={{ marginRight: '8px', verticalAlign: 'bottom' }} />
        Disease Detection
      </Title>
      <Text c="dimmed" mb="xl">
        Upload an image of a plant to detect potential diseases using AI analysis.
      </Text>

      <Paper withBorder p="xl" radius="md" shadow="sm">
        <Stack gap="lg">
          <FileInput
            label="Upload Plant Image"
            placeholder="Click to select an image"
            accept="image/png,image/jpeg,image/jpg"
            value={selectedFile}
            onChange={handleFileChange}
            leftSection={<IconPhoto size={18} />}
            disabled={isLoading}
          />

          {previewUrl && (
            <MantineImage
              src={previewUrl}
              alt="Selected plant preview"
              maw={300}
              mah={300}
              radius="md"
              fit="contain"
              style={{ alignSelf: 'center' }}
            />
          )}

          <Button 
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            leftSection={isLoading ? <Loader size="sm" type="dots" /> : <IconUpload size={18} />}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Plant Disease'}
          </Button>

          {error && (
            <Alert title="Error" color="red" icon={<IconX />} withCloseButton onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {prediction && (
            <Alert 
              title="Disease Analysis Result" 
              color={prediction.predicted_class.toLowerCase().includes('healthy') ? "teal" : "orange"}
              icon={prediction.predicted_class.toLowerCase().includes('healthy') ? <IconCheck /> : <IconBug />}
              mt="lg"
              p="lg"
              radius="md"
              variant="light"
              withCloseButton={false}
            >
              {
                (() => {
                  const parts = prediction.predicted_class.split('___');
                  const rawPlantName = parts[0].replace(/_/g, ' ');
                  const rawConditionName = parts[1] ? parts[1].replace(/_/g, ' ') : 'Condition information not available';

                  const formatDisplayName = (name: string): string => {
                    if (!name) return '';
                    return name
                      .split(' ')
                      .map(word => {
                        if (word.includes('-')) {
                          return word
                            .split('-')
                            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                            .join('-');
                        }
                        if (word.startsWith('(') && word.endsWith(')') && word.length > 2) {
                            const content = word.substring(1, word.length - 1);
                            const capitalizedContent = content
                                .split(' ')
                                .map(cw => cw.charAt(0).toUpperCase() + cw.slice(1).toLowerCase())
                                .join(' ');
                            return `(${capitalizedContent})`;
                        }
                        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                      })
                      .join(' ');
                  };

                  const plantType = formatDisplayName(rawPlantName);
                  const condition = formatDisplayName(rawConditionName);
                  const isHealthy = prediction.predicted_class.toLowerCase().includes('healthy');

                  return (
                    <Stack gap="md">
                      <Group >
                        <Text fw={500} size="sm">Plant Type:</Text>
                        <Text size="sm">{plantType}</Text>
                      </Group>
                      <Group >
                        <Text fw={500} size="sm">Detected Condition:</Text>
                        <Text size="sm" c={isHealthy ? 'teal' : 'orange'} fw={600}>{condition}</Text>
                      </Group>
                      <Group >
                        <Text fw={500} size="sm">Confidence Score:</Text>
                        <Text size="sm">{(prediction.confidence * 100).toFixed(2)}%</Text>
                      </Group>
                      
                      <Text size="sm" mt="xs">
                        {isHealthy
                          ? "The model analysis suggests this plant is healthy."
                          : "The model analysis suggests a potential issue. Consider further inspection or consulting with an agricultural expert."
                        }
                      </Text>
                      
                      <Paper withBorder p="xs" mt="sm" radius="sm" bg="var(--mantine-color-body)"> 
                        <Text size="xs" c="dimmed">Raw Model Output:</Text>
                        <Text size="xs" c="dimmed" ff="monospace">{prediction.predicted_class}</Text>
                      </Paper>

                    </Stack>
                  );
                })()
              }
            </Alert>
          )}
        </Stack>
      </Paper>
    </Container>
  );
} 