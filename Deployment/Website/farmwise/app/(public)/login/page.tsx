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
  Notification,
} from '@mantine/core';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconBrandGoogle,
  IconBrandFacebook,
  IconBrandWindows,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import authService from '../../api/auth';
import classes from './LoginPage.module.css';

// Animation variant
const containerVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
};

const notificationVariant = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      await authService.login({ username, password });
      // Successful login, redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <form onSubmit={handleLogin}>
            <AnimatePresence>
              {error && (
                <motion.div
                  variants={notificationVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Notification 
                    icon={<IconAlertCircle size="1.1rem" />}
                    color="red" 
                    withCloseButton 
                    onClose={() => setError('')}
                    mb="md"
                  >
                    {error}
                  </Notification>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Stack>
              <TextInput 
                label="Username" 
                placeholder="username" 
                required 
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
              />
              <PasswordInput 
                label="Password" 
                placeholder="Your password" 
                required 
                mt="md" 
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
              />
              <Group justify="space-between" mt="lg">
                {/* Add Checkbox for remember me if needed */}
                <Anchor component={Link} href="/forgot-password" size="sm">
                  Forgot password?
                </Anchor>
              </Group>
              <Button 
                fullWidth 
                mt="xl" 
                variant="gradient" 
                gradient={{ from: 'farmGreen', to: 'cyan' }}
                type="submit"
                loading={isSubmitting}
              >
                Sign in
              </Button>
            </Stack>
          </form>

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