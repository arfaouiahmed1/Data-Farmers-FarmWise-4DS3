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
  Notification,
  Loader,
  SegmentedControl,
  Box,
  Tooltip,
  rem,
  ThemeIcon,
  PaperProps,
  Avatar,
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
  IconLock,
  IconLogin,
  IconArrowRight,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';
import authService from '../../api/auth';
import classes from './LoginPage.module.css';
import '@/styles/auth-common.css';
import { useDebouncedValue } from '@mantine/hooks';
import { isValidEmail } from '@/app/utils/emailUtils';

// Animation variants
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

const formVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
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

      // Determine if input is an email
      const isEmail = debouncedIdentity.includes('@');

      // If it looks like an email but is invalid, don't check with server
      if (isEmail && !isValidEmail(debouncedIdentity)) {
        setIdentityChecked(true);
        setIdentityExists(false);
        return;
      }

      setIsCheckingIdentity(true);

      try {
        // Check if it's an email or username based on current login method or content
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
  }, [debouncedIdentity]);

  // Get appropriate error message for identity field
  const getIdentityErrorMessage = () => {
    if (usernameOrEmail.length === 0) return '';
    if (usernameOrEmail.length > 0 && usernameOrEmail.length < 3) return 'Too short (minimum 3 characters)';

    if (usernameOrEmail.includes('@')) {
      if (!isValidEmail(usernameOrEmail)) return 'Invalid email format';
      if (identityChecked && !identityExists) return 'Email not found';
    } else {
      if (identityChecked && !identityExists) return 'Username not found';
    }

    return '';
  };

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
      // Determine if input is email or username based on format
      const isEmail = usernameOrEmail.includes('@') && isValidEmail(usernameOrEmail);

      // Send the appropriate credential type
      const loginData = {
        [isEmail ? 'email' : 'username']: usernameOrEmail,
        password
      };

      // Send login request
      await authService.login(loginData);

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
    <Container className="auth-container">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariant}
        className={classes.wrapper}
      >
        <Box className="auth-header">
          <ThemeIcon size={56} radius="xl" className="auth-icon-wrapper">
            <IconLogin stroke={1.5} />
          </ThemeIcon>

          <Title ta="center" className="auth-title">
            Welcome back
          </Title>
          <Text className="auth-subtitle" ta="center">
            Don't have an account yet?{' '}
            <Anchor size="sm" component={Link} href="/signup" className="auth-link">
              Create account
            </Anchor>
          </Text>
        </Box>

        <Paper withBorder shadow="md" className="auth-form-wrapper" radius="lg" bg="var(--mantine-color-body)">
          <form onSubmit={handleLogin} name="login-form" id="login-form" method="post" autoComplete="on">
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
                    radius="md"
                    className="auth-notification"
                  >
                    {error}
                  </Notification>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              variants={formVariant}
              initial="hidden"
              animate="visible"
            >
              <Stack gap="md">
                <motion.div variants={itemVariant}>
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
                    radius="md"
                    className="auth-segmented-control"
                  />
                </motion.div>

                <motion.div variants={itemVariant}>
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
                    placeholder={loginMethod === 'username' ? 'Your username' : 'you@example.com'}
                    required
                    type={loginMethod === 'email' ? 'email' : 'text'}
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.currentTarget.value)}
                    leftSection={
                      <ThemeIcon variant="subtle" color="gray" size="sm" radius="xl">
                        {loginMethod === 'username' ? <IconUser size="1rem" /> : <IconAt size="1rem" />}
                      </ThemeIcon>
                    }
                    rightSection={
                      isCheckingIdentity ? (
                        <Loader size="xs" />
                      ) : identityChecked && usernameOrEmail.length >= 3 ? (
                        identityExists ? (
                          <ThemeIcon color="green" size="sm" radius="xl" variant="light">
                            <IconCheck size="0.8rem" />
                          </ThemeIcon>
                        ) : (
                          <ThemeIcon color="red" size="sm" radius="xl" variant="light">
                            <IconX size="0.8rem" />
                          </ThemeIcon>
                        )
                      ) : null
                    }
                    radius="md"
                    className="auth-input"
                    error={getIdentityErrorMessage()}
                    autoComplete={loginMethod === 'username' ? 'username' : 'email'}
                    name={loginMethod === 'username' ? 'username' : 'email'}
                    id={loginMethod === 'username' ? 'username' : 'email'}
                  />
                </motion.div>

                <motion.div variants={itemVariant}>
                  <PasswordInput
                    label="Password"
                    placeholder="Your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                    leftSection={
                      <ThemeIcon variant="subtle" color="gray" size="sm" radius="xl">
                        <IconLock size="1rem" />
                      </ThemeIcon>
                    }
                    radius="md"
                    className="auth-input"
                    autoComplete="current-password"
                    name="password"
                    id="password"
                  />
                </motion.div>

                <motion.div variants={itemVariant}>
                  <Group justify="space-between" mt="xs">
                    <Text size="xs">
                      <Anchor component={Link} href="/forgot-password" className="auth-link">
                        Forgot your password?
                      </Anchor>
                    </Text>
                  </Group>
                </motion.div>

                <motion.div variants={itemVariant}>
                  <Button
                    fullWidth
                    radius="md"
                    type="submit"
                    loading={isSubmitting}
                    rightSection={<IconArrowRight size={18} />}
                    className="auth-button"
                    disabled={
                      isSubmitting ||
                      (usernameOrEmail.length >= 3 && !identityExists && identityChecked) ||
                      !usernameOrEmail ||
                      !password
                    }
                  >
                    Sign in
                  </Button>
                </motion.div>
              </Stack>
            </motion.div>

            <Divider label="Or continue with" labelPosition="center" className="auth-divider" />

            <Group grow>
              <Button
                variant="outline"
                leftSection={<IconBrandGoogle stroke={1.5} />}
                radius="md"
                className="auth-social-button"
              >
                Google
              </Button>
              <Button
                variant="outline"
                leftSection={<IconBrandFacebook stroke={1.5} />}
                radius="md"
                className="auth-social-button"
              >
                Facebook
              </Button>
            </Group>
          </form>
        </Paper>
      </motion.div>
    </Container>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <Group justify="center" gap={10}>
      {children}
    </Group>
  );
}