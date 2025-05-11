import { Progress, Box, Text, Stack } from '@mantine/core';
import { PasswordValidationResult } from '@/app/utils/passwordUtils';

interface PasswordStrengthIndicatorProps {
  passwordValidation: PasswordValidationResult;
}

export default function PasswordStrengthIndicator({ passwordValidation }: PasswordStrengthIndicatorProps) {
  const { score, strength, feedback, color } = passwordValidation;
  
  // Create a label based on the strength
  let label = 'Password Strength: ';
  switch (strength) {
    case 'weak':
      label += 'Weak';
      break;
    case 'medium':
      label += 'Medium';
      break;
    case 'strong':
      label += 'Strong';
      break;
    case 'very-strong':
      label += 'Very Strong';
      break;
  }
  
  return (
    <Stack gap="xs">
      <Box>
        <Text size="sm" fw={500} mb={4}>{label}</Text>
        <Progress value={score} color={color} size="sm" radius="sm" />
      </Box>
      
      {feedback.length > 0 && (
        <Box>
          {feedback.map((item, index) => (
            <Text component="div" size="xs" c="dimmed" key={index} mb={4}>• {item}</Text>
          ))}
        </Box>
      )}
    </Stack>
  );
} 