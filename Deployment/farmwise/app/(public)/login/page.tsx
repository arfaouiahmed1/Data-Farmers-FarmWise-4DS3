'use client';

import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Container,
  Anchor,
  Stack,
  Group,
  Divider,
  ActionIcon,
} from '@mantine/core';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  IconBrandGoogle,
  IconBrandFacebook,
  IconBrandWindows,
} from '@tabler/icons-react';
import classes from './LoginPage.module.css'; // We'll create this CSS module next

// Animation variant
const containerVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
};

export default function LoginPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariant}
    >
      <Container size={420} my={40}>
        <Title ta="center" className={classes.title}>
          Welcome back!
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Do not have an account yet?{' '}
          <Anchor size="sm" component={Link} href="/signup">
            Create account
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Stack>
              <TextInput label="Email" placeholder="you@farmwise.ag" required />
              <PasswordInput label="Password" placeholder="Your password" required mt="md" />
              <Group justify="space-between" mt="lg">
              {/* Add Checkbox for remember me if needed */}
              <Anchor component={Link} href="/forgot-password" size="sm">
                  Forgot password?
              </Anchor>
              </Group>
              <Button fullWidth mt="xl" variant="gradient" gradient={{ from: 'farmGreen', to: 'cyan' }}>
              Sign in with Email
              </Button>
          </Stack>

          <Divider label="Or continue with" labelPosition="center" my="lg" />

          <Group justify="center" gap="md" mb="md" mt="md">
              <ActionIcon size="lg" variant="default" radius="xl" aria-label="Sign in with Google">
                <IconBrandGoogle size={22} />
              </ActionIcon>
              <ActionIcon size="lg" variant="default" radius="xl" aria-label="Sign in with Facebook">
                <IconBrandFacebook size={22} />
              </ActionIcon>
              <ActionIcon size="lg" variant="default" radius="xl" aria-label="Sign in with Microsoft">
                <IconBrandWindows size={22} />
              </ActionIcon>
          </Group>
        </Paper>
      </Container>
    </motion.div>
  );
} 