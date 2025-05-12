'use client';

import React from 'react';
import { Container, Text, Alert, Title, Paper, Space } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { AiChatInterface } from '@/components/AiChat/AiChatInterface';

// This page might not be directly used anymore if the chat is only in the modal.
// You could keep it as a placeholder, redirect, or add different content.
export default function AiAdvisorPage() {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="md">AI Advisor</Title>
      <Text mb="xl" size="lg">
        Get instant answers to your farming questions with our AI-powered advisor, now using Google's Gemini 2.0 Flash model for more dynamic and helpful responses.
      </Text>
      
      <Paper withBorder shadow="md" radius="md" p={0}>
        <AiChatInterface isFullScreen={false} />
      </Paper>
      
      <Space h="xl" />
      <Text size="sm" c="dimmed">
        Note: The AI advisor is designed to provide general guidance. For specific recommendations tailored to your region and situation, always consult with local agricultural extension services.
      </Text>
    </Container>
  );
} 