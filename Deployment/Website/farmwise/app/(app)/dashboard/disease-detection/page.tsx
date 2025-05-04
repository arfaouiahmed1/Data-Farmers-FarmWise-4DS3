'use client';
import React from 'react';
import { Title, Text, Container, Paper, Alert, Button } from '@mantine/core';
import { IconBug, IconInfoCircle, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';

export default function DiseaseDetectionPage() {
  return (
    <Container fluid>
      <Title order={2} mb="lg">
        <IconBug size={28} style={{ marginRight: '8px', verticalAlign: 'bottom' }} />
        Disease & Weed Detection
      </Title>
      <Text c="dimmed" mb="xl">
        Upload images of plants to detect potential diseases or identify weeds using AI analysis.
      </Text>

      <Paper withBorder p="xl" radius="md" shadow="sm">
         <Alert variant="light" color="red" title="Analysis Tools" icon={<IconInfoCircle />} mb="lg">
           Use the image analysis tools to identify potential diseases or weeds in your crops. 
           You can upload images directly for AI-powered detection.
         </Alert>
         
         <Text mb="md">
           The primary tools for disease and weed analysis, including image upload and results, 
           are located within the "Plant Health Center" tab on the main dashboard.
         </Text>

         <Button 
            component={Link} 
            href="/dashboard#health-disease" // Link to the specific tab if possible, otherwise just /dashboard
            variant="light"
            color="red"
            rightSection={<IconArrowRight size={16} />}
         >
            Go to Plant Health Center Analysis
         </Button>

        {/* Optionally, add a history or summary of past detections here */}
      </Paper>
    </Container>
  );
} 