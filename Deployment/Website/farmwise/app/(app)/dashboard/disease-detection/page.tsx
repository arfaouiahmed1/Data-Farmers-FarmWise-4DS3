'use client';
import React, { useState, useRef } from 'react';
import { Title, Text, Container, Paper, Alert, Button, Group, Loader, Stack, Image as MantineImage, Progress, Badge, Grid } from '@mantine/core';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Direct file input handler
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.log("No file selected");
      return;
    }
    
    const file = files[0];
    console.log("File selected:", file.name, file.size, file.type);
    
    setSelectedFile(file);
    setPrediction(null);
    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
  };
  
  // Reset the form
  const resetForm = () => {
    setSelectedFile(null);
    setPrediction(null);
    setError(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle analysis button click
  const handleAnalyze = async () => {
    console.log("Analyze button clicked");
    
    if (!selectedFile) {
      setError('Please select an image file first.');
      console.log("No file selected for analysis");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    
    console.log("Preparing to send request with file:", selectedFile.name);
    
    try {
      // Make the API call with explicit URL
      const API_URL = '/api/detect-disease/';
      console.log("Sending POST request to:", API_URL);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        let errorMessage = `Server returned status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log("Received result:", result);
      setPrediction(result);
    } catch (err) {
      console.error("Error during analysis:", err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format the disease class name for display
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
          {/* Standard HTML input for more direct control */}
          <div>
            <Text fw={500} mb="xs">Upload Plant Image</Text>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileInputChange}
              disabled={isLoading}
              style={{ 
                width: '100%', 
                padding: '8px',
                border: '1px solid #ced4da',
                borderRadius: '4px'
              }}
            />
          </div>

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

          <Group>
            <Button 
              onClick={handleAnalyze}
              disabled={!selectedFile || isLoading}
              color="green"
              leftSection={isLoading ? <Loader size="sm" type="dots" color="white" /> : <IconBug size={18} />}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Plant Disease'}
            </Button>
            
            <Button 
              onClick={resetForm}
              variant="outline"
              disabled={isLoading || (!selectedFile && !prediction && !error)}
            >
              Reset
            </Button>
          </Group>

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

                  const plantType = formatDisplayName(rawPlantName);
                  const condition = formatDisplayName(rawConditionName);
                  const isHealthy = prediction.predicted_class.toLowerCase().includes('healthy');
                  const confidencePercent = (prediction.confidence * 100).toFixed(1);
                  const confidenceValue = parseFloat(confidencePercent);
                  
                  // Disease-specific information and recommendations
                  const diseaseInfo: {
                    description: string;
                    severity: string;
                    treatment: string[];
                    prevention: string[];
                  } = {
                    description: '',
                    severity: '',
                    treatment: [],
                    prevention: []
                  };
                  
                  // Add information for common diseases
                  if (prediction.predicted_class.toLowerCase().includes('common_rust')) {
                    diseaseInfo.description = 'Common rust is a fungal disease that produces red to brown pustules on leaves, reducing photosynthesis and yield.';
                    diseaseInfo.severity = confidenceValue > 90 ? 'High' : confidenceValue > 70 ? 'Medium' : 'Low';
                    diseaseInfo.treatment = [
                      'Apply foliar fungicides containing pyraclostrobin, azoxystrobin, or propiconazole',
                      'Begin applications when disease first appears',
                      'Follow up with additional treatments as needed every 7-14 days'
                    ];
                    diseaseInfo.prevention = [
                      'Plant resistant hybrids when available',
                      'Ensure good air circulation with proper plant spacing',
                      'Rotate crops to reduce disease pressure'
                    ];
                  } 
                  else if (prediction.predicted_class.toLowerCase().includes('early_blight')) {
                    diseaseInfo.description = 'Early blight is a fungal disease characterized by dark spots with concentric rings, typically on older leaves first.';
                    diseaseInfo.severity = confidenceValue > 85 ? 'High' : confidenceValue > 65 ? 'Medium' : 'Low';
                    diseaseInfo.treatment = [
                      'Apply copper-based fungicides or products containing chlorothalonil',
                      'Remove and destroy infected leaves',
                      'Ensure plants are well-fertilized to boost resistance'
                    ];
                    diseaseInfo.prevention = [
                      'Practice crop rotation (3-4 year cycle)',
                      'Provide adequate plant spacing for air circulation',
                      'Use mulch to prevent soil splash onto leaves'
                    ];
                  }
                  else if (prediction.predicted_class.toLowerCase().includes('late_blight')) {
                    diseaseInfo.description = 'Late blight is a destructive disease causing water-soaked lesions that rapidly enlarge and can destroy entire fields in favorable conditions.';
                    diseaseInfo.severity = confidenceValue > 80 ? 'High' : confidenceValue > 60 ? 'Medium' : 'Low';
                    diseaseInfo.treatment = [
                      'Apply fungicides containing chlorothalonil, mancozeb, or copper',
                      'Remove infected plants immediately to prevent spread',
                      'Increase frequency of applications during wet weather'
                    ];
                    diseaseInfo.prevention = [
                      'Plant resistant varieties',
                      'Avoid overhead irrigation',
                      'Destroy all infected plant material at the end of the season'
                    ];
                  }
                  else if (prediction.predicted_class.toLowerCase().includes('bacterial_spot')) {
                    diseaseInfo.description = 'Bacterial spot causes water-soaked lesions on leaves and scabby spots on fruits, reducing yield and quality.';
                    diseaseInfo.severity = confidenceValue > 85 ? 'High' : confidenceValue > 70 ? 'Medium' : 'Low';
                    diseaseInfo.treatment = [
                      'Apply copper-based bactericides at first sign of disease',
                      'Remove infected leaves and fruits',
                      'Avoid working with plants when wet'
                    ];
                    diseaseInfo.prevention = [
                      'Use disease-free seeds and transplants',
                      'Practice crop rotation',
                      'Avoid overhead irrigation'
                    ];
                  }
                  else if (isHealthy) {
                    diseaseInfo.description = 'No signs of common diseases detected. The plant appears to be in good health.';
                    diseaseInfo.severity = 'None';
                    diseaseInfo.treatment = [
                      'Continue regular maintenance and monitoring'
                    ];
                    diseaseInfo.prevention = [
                      'Maintain proper watering and fertilization schedule',
                      'Monitor regularly for early signs of pests or diseases',
                      'Follow good agricultural practices for the specific crop'
                    ];
                  }
                  else {
                    // Generic recommendations for unspecified diseases
                    diseaseInfo.description = `The analysis indicates a potential issue that may affect plant health and productivity.`;
                    diseaseInfo.severity = confidenceValue > 80 ? 'Medium-High' : 'Medium';
                    diseaseInfo.treatment = [
                      'Consider consulting a local agricultural extension for specific advice',
                      'Monitor the affected areas for spread or changes',
                      'Apply appropriate treatments based on further diagnosis'
                    ];
                    diseaseInfo.prevention = [
                      'Implement crop rotation for future plantings',
                      'Ensure proper plant spacing and air circulation',
                      'Maintain optimal growing conditions'
                    ];
                  }

                  // Severity color indicators
                  const severityColor = isHealthy ? 'teal' : 
                    diseaseInfo.severity === 'High' ? 'red' : 
                    diseaseInfo.severity === 'Medium' ? 'orange' : 'yellow';

                  return (
                    <Paper withBorder p="md" radius="md">
                      <Grid>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                          <Stack gap="md">
                            <Text fw={700} size="lg">Plant Information</Text>
                            <Group>
                              <Text fw={500} size="sm">Plant Type:</Text>
                              <Text size="sm">{plantType}</Text>
                            </Group>
                            <Group>
                              <Text fw={500} size="sm">Detected Condition:</Text>
                              <Text 
                                size="sm" 
                                c={isHealthy ? 'teal' : 'red'} 
                                fw={600}
                              >
                                {condition}
                              </Text>
                            </Group>
                            <Group>
                              <Text fw={500} size="sm">Confidence:</Text>
                              <Group gap={5}>
                                <Text size="sm">{confidencePercent}%</Text>
                                <Progress 
                                  value={confidenceValue} 
                                  size="sm" 
                                  w={80}
                                  color={confidenceValue > 90 ? 'green' : confidenceValue > 70 ? 'blue' : 'gray'} 
                                />
                              </Group>
                            </Group>
                            <Group>
                              <Text fw={500} size="sm">Severity:</Text>
                              <Badge color={severityColor}>
                                {diseaseInfo.severity}
                              </Badge>
                            </Group>
                          </Stack>
                        </Grid.Col>
                        
                        <Grid.Col span={{ base: 12, md: 8 }}>
                          <Stack gap="md">
                            <Text fw={700} size="lg">Analysis Details</Text>
                            
                            <Stack gap="xs">
                              <Text fw={500} size="sm">Description:</Text>
                              <Text size="sm" c="dimmed">{diseaseInfo.description}</Text>
                            </Stack>
                            
                            {!isHealthy && (
                              <Stack gap="xs">
                                <Text fw={500} size="sm">Recommended Treatment:</Text>
                                <Stack gap={5}>
                                  {diseaseInfo.treatment.map((item, idx) => (
                                    <Group key={idx} gap="xs" align="flex-start">
                                      <Text size="sm" c="dimmed">•</Text>
                                      <Text size="sm" c="dimmed">{item}</Text>
                                    </Group>
                                  ))}
                                </Stack>
                              </Stack>
                            )}
                            
                            <Stack gap="xs">
                              <Text fw={500} size="sm">Prevention Measures:</Text>
                              <Stack gap={5}>
                                {diseaseInfo.prevention.map((item, idx) => (
                                  <Group key={idx} gap="xs" align="flex-start">
                                    <Text size="sm" c="dimmed">•</Text>
                                    <Text size="sm" c="dimmed">{item}</Text>
                                  </Group>
                                ))}
                              </Stack>
                            </Stack>
                            
                            <Paper withBorder p="xs" mt="sm" radius="sm" bg="var(--mantine-color-body)"> 
                              <Text size="xs" c="dimmed">Raw Model Output:</Text>
                              <Text size="xs" c="dimmed" ff="monospace">{prediction.predicted_class}</Text>
                            </Paper>
                          </Stack>
                        </Grid.Col>
                      </Grid>
                    </Paper>
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