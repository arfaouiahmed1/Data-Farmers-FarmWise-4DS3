'use client';

import { useState } from 'react';
import { Container, Title, Text, Group, Stack, Button, Alert, Stepper, Paper, Box } from '@mantine/core';
import { 
  IconAlertCircle, 
  IconArrowLeft, 
  IconPlant2, 
  IconSeeding, 
  IconTemperature, 
  IconDroplet,
  IconChartBar 
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { CropClassificationForm } from '@/components/planning/CropClassificationForm';
import { CropClassificationResult } from '@/components/planning/CropClassificationResult';
import { notifications } from '@mantine/notifications';

export default function CropClassificationPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [classificationResult, setClassificationResult] = useState<any>(null);

  // Hardcoded farmId for demo - in real app this would come from context/route
  const farmId = 1;

  const handleClassificationSuccess = (result: any) => {
    setClassificationResult(result);
    setActiveStep(1);
    notifications.show({
      title: 'Analysis Complete',
      message: 'Your field analysis has been completed successfully.',
      color: 'green',
    });
  };

  const stepContent = [
    {
      label: 'Field Analysis',
      description: 'Enter your field conditions and agricultural practices',
      icon: <IconSeeding size={18} />,
      content: <CropClassificationForm 
                farmId={farmId} 
                onSuccess={handleClassificationSuccess}
              />,
    },
    {
      label: 'Results & Recommendations',
      description: 'View AI-powered crop recommendations',
      icon: <IconChartBar size={18} />,
      content: classificationResult && (
        <Box mt="md">
          <CropClassificationResult result={classificationResult} />
        </Box>
      ),
    }
  ];

  return (
    <Container size="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Stack gap={0}>
            <Title order={2}>Crop Classification</Title>
            <Text c="dimmed" size="sm">
              Get AI-powered crop recommendations based on your field conditions
            </Text>
          </Stack>
          <Button 
            variant="light" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.back()}
          >
            Back
          </Button>
        </Group>

        <Paper p="md" radius="md" withBorder>
          <Stepper 
            active={activeStep} 
            onStepClick={setActiveStep}
            allowNextStepsSelect={false}
            size="sm"
          >
            {stepContent.map((step, index) => (
              <Stepper.Step
                key={index}
                label={step.label}
                description={step.description}
                icon={step.icon}
              >
                <Box mt="xl">
                  {step.content}
                </Box>
              </Stepper.Step>
            ))}
          </Stepper>
        </Paper>
      </Stack>
    </Container>
  );
}
