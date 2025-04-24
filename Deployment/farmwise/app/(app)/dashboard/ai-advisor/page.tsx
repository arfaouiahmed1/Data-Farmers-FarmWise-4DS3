'use client';

import React from 'react';
import { Container, Text, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

// This page might not be directly used anymore if the chat is only in the modal.
// You could keep it as a placeholder, redirect, or add different content.
export default function AiAdvisorPage() {
  return (
    <Container>
        <Alert title="AI Advisor Access" color="blue" icon={<IconInfoCircle/>}>
            The AI Advisor chat is now accessed via the floating button in the bottom-right corner.
        </Alert>
      {/* Or return null; */}
    </Container>
  );
} 