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
  Loader,
  SegmentedControl,
  Box,
  Tooltip,
} from '@mantine/core';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconBrandGoogle,
  IconBrandFacebook,
  IconBrandWindows,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconAt,
  IconUser,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';
import authService from '../../api/auth';
import classes from './LoginPage.module.css';
import { useDebouncedValue } from '@mantine/hooks';
import { isValidEmail } from '@/app/utils/emailUtils';

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

type LoginMethod = 'username' | 'email';

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('username');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Identity checking state
  const [debouncedIdentity] = useDebouncedValue(usernameOrEmail, 500);
  const [isCheckingIdentity, setIsCheckingIdentity] = useState(false);
  const [identityExists, setIdentityExists] = useState(false);
  const [identityChecked, setIdentityChecked] = useState(false);
  
  const router = useRouter();
  
  // Check identity availability when debounced identity changes
  useEffect(() => {
    const checkIdentity = async () => {
      // Skip if it's too short
      if (debouncedIdentity.length < 3) {
        setIdentityChecked(false);
        setIdentityExists(false);
        return;
      }
      
      setIsCheckingIdentity(true);
      
      try {
        // Check if it's an email or username based on current login method or content
        const isEmail = loginMethod === 'email' || (loginMethod === 'username' && debouncedIdentity.includes('@') && isValidEmail(debouncedIdentity));
        
        if (isEmail) {
          const result = await authService.checkEmail(debouncedIdentity);
          setIdentityExists(result.exists);
        } else {
          const result = await authService.checkUsername(debouncedIdentity);
          setIdentityExists(result.exists);
        }
        
        setIdentityChecked(true);
      } catch (err) {
        console.error('Error checking identity:', err);
      } finally {
        setIsCheckingIdentity(false);
      }
    };
    
    checkIdentity();
  }, [debouncedIdentity, loginMethod]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!usernameOrEmail || !password) {
      setError('Please enter both username/email and password');
      return;
    }
    
    if (usernameOrEmail.length >= 3 && !identityExists && identityChecked) {
      const type = usernameOrEmail.includes('@') ? 'email' : 'username';
      setError(`No account exists with this ${type}`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // Determine if we're logging in with email or username
      const isEmail = usernameOrEmail.includes('@') && isValidEmail(usernameOrEmail);
      
      // If it's an email, we need to get the username first
      let username = usernameOrEmail;
      
      // For now, we'll use username for login
      // In a real app, you'd have a backend endpoint that accepts either username or email
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
              <SegmentedControl
                value={loginMethod}
                onChange={(value) => setLoginMethod(value as LoginMethod)}
                data={[
                  {
                    value: 'username',
                    label: (
                      <Center>
                        <IconUser size={16} />
                        <Box ml={10}>Username</Box>
                      </Center>
                    ),
                  },
                  {
                    value: 'email',
                    label: (
                      <Center>
                        <IconAt size={16} />
                        <Box ml={10}>Email</Box>
                      </Center>
                    ),
                  },
                ]}
                fullWidth
                mb="md"
              />
              
              <TextInput 
                label={
                  <Group gap={5}>
                    <span>{loginMethod === 'username' ? 'Username' : 'Email'}</span>
                    <Tooltip
                      label={loginMethod === 'username' ? 'Enter your username' : 'Enter your registered email'}
                      position="top-start"
                      withArrow
                    >
                      <IconInfoCircle size={16} style={{ display: 'block', opacity: 0.5 }} />
                    </Tooltip>
                  </Group>
                }
                placeholder={loginMethod === 'username' ? 'username' : 'you@example.com'} 
                required 
                type={loginMethod === 'email' ? 'email' : 'text'}
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.currentTarget.value)}
                rightSection={
                  isCheckingIdentity ? (
                    <Loader size="xs" />
                  ) : identityChecked && usernameOrEmail.length >= 3 ? (
                    identityExists ? (
                      <IconCheck size="1.1rem" style={{ color: 'green' }} />
                    ) : (
                      <IconX size="1.1rem" style={{ color: 'red' }} />
                    )
                  ) : null
                }
                error={usernameOrEmail.length >= 3 && !identityExists && identityChecked ? 
                  `${loginMethod === 'username' ? 'Username' : 'Email'} not found` : 
                  ''}
              />
              <PasswordInput 
                label={
                  <Group gap={5}>
                    <span>Password</span>
                    <Tooltip
                      label="Enter your password"
                      position="top-start"
                      withArrow
                    >
                      <IconInfoCircle size={16} style={{ display: 'block', opacity: 0.5 }} />
                    </Tooltip>
                  </Group>
                }
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
                disabled={
                  isSubmitting || 
                  (usernameOrEmail.length >= 3 && !identityExists && identityChecked) ||
                  !usernameOrEmail ||
                  !password
                }
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

// Helper component for SegmentedControl
function Center({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  );
} 