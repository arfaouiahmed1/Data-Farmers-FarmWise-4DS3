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
  Checkbox,
  Notification,
  Loader,
  Group,
  Tooltip,
  Popover,
  ThemeIcon,
  Divider,
  SimpleGrid,
  Box,
} from '@mantine/core';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';
import {
  IconAlertCircle,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconAt,
  IconUser,
  IconId,
  IconLock,
  IconUserPlus,
  IconArrowRight,
  IconBrandGoogle,
  IconBrandFacebook,
} from '@tabler/icons-react';
import authService from '../../api/auth';
import classes from './SignupPage.module.css';
import '@/styles/auth-common.css';
import PasswordStrengthIndicator from '@/components/Auth/PasswordStrengthIndicator';
import { validatePassword } from '@/app/utils/passwordUtils';
import { validateEmail, isValidEmail } from '@/app/utils/emailUtils';
import { useDebouncedValue } from '@mantine/hooks';

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
      staggerChildren: 0.08,
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

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Username checking state
  const [debouncedUsername] = useDebouncedValue(username, 500);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const [usernameChecked, setUsernameChecked] = useState(false);

  // Email checking state
  const [debouncedEmail] = useDebouncedValue(email, 500);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailValidation, setEmailValidation] = useState({ isValid: true, isDisposable: false, feedback: '' });

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState(validatePassword(''));

  const router = useRouter();

  // Check username availability when debounced username changes
  useEffect(() => {
    const checkUsername = async () => {
      // Clear previous states if username is empty
      if (!debouncedUsername || debouncedUsername.length === 0) {
        setUsernameChecked(false);
        setUsernameExists(false);
        return;
      }

      // Set checked but invalid if too short
      if (debouncedUsername.length < 3) {
        setUsernameChecked(true);
        setUsernameExists(false);
        return;
      }

      setIsCheckingUsername(true);
      try {
        const result = await authService.checkUsername(debouncedUsername);
        setUsernameExists(result.exists);
        setUsernameChecked(true);
      } catch (err) {
        console.error('Error checking username:', err);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkUsername();
  }, [debouncedUsername]);

  // Check email when debounced email changes
  useEffect(() => {
    const checkEmail = async () => {
      // Clear previous states if email is empty
      if (!debouncedEmail || debouncedEmail.length === 0) {
        setEmailChecked(false);
        setEmailExists(false);
        setEmailValidation({ isValid: true, isDisposable: false, feedback: '' });
        return;
      }

      // First, validate the email format
      const validation = validateEmail(debouncedEmail);
      setEmailValidation(validation);

      // Don't check with server if format is invalid
      if (!validation.isValid || debouncedEmail.length < 5) {
        setEmailChecked(true);
        setEmailExists(false);
        return;
      }

      setIsCheckingEmail(true);
      try {
        const result = await authService.checkEmail(debouncedEmail);
        setEmailExists(result.exists);
        setEmailChecked(true);
      } catch (err) {
        console.error('Error checking email:', err);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    // Don't wait for debounce if email is clearly invalid
    if (debouncedEmail && !isValidEmail(debouncedEmail)) {
      setEmailValidation(validateEmail(debouncedEmail));
    }

    checkEmail();
  }, [debouncedEmail]);

  // Update password validation when password changes
  useEffect(() => {
    setPasswordValidation(validatePassword(password));
  }, [password]);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form inputs
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (usernameExists) {
      setError('Username is already taken. Please choose another one.');
      return;
    }

    if (!emailValidation.isValid) {
      setError('Please enter a valid email address');
      return;
    }

    if (emailExists) {
      setError('Email is already registered. Please use another email or try to login.');
      return;
    }

    if (emailValidation.isDisposable) {
      setError('Please use a permanent email address, not a disposable one');
      return;
    }

    if (!passwordValidation.isValid) {
      setError('Please choose a stronger password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await authService.register({
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName
      });

      // Show success message
      setSuccess(true);

      // Redirect to onboarding after a short delay
      setTimeout(() => {
        router.push('/onboarding');
      }, 2000);

    } catch (err: any) {
      const responseData = err.response?.data;
      let errorMessage = 'Registration failed. Please try again.';

      // Extract detailed error messages from the API response
      if (responseData) {
        if (responseData.username) {
          errorMessage = `Username: ${responseData.username.join(', ')}`;
        } else if (responseData.email) {
          errorMessage = `Email: ${responseData.email.join(', ')}`;
        } else if (responseData.password) {
          errorMessage = `Password: ${responseData.password.join(', ')}`;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get appropriate error message for email field
  const getEmailErrorMessage = () => {
    if (email.length === 0) return null;

    if (!emailValidation.isValid) return 'Invalid email format';
    if (emailValidation.isDisposable) return 'Please use a permanent email address';
    if (emailChecked && emailExists) return 'Email already registered';

    return null;
  };

  // Get appropriate error message for username field
  const getUsernameErrorMessage = () => {
    if (username.length === 0) return null;
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (usernameChecked && usernameExists) return 'Username already taken';

    return null;
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
            <IconUserPlus stroke={1.5} />
          </ThemeIcon>

          <Title ta="center" className="auth-title">
            Create your FarmWise Account
          </Title>
          <Text className="auth-subtitle" ta="center">
            Already have an account?{' '}
            <Anchor size="sm" component={Link} href="/login" className="auth-link">
              Sign in
            </Anchor>
          </Text>
        </Box>

        <Paper withBorder shadow="md" className="auth-form-wrapper" radius="lg" bg="var(--mantine-color-body)">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                variants={notificationVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Notification
                  icon={<IconCheck size="1.1rem" />}
                  color="teal"
                  title="Account created successfully!"
                  withCloseButton={false}
                  className="auth-notification"
                >
                  Welcome to FarmWise! Redirecting you to onboarding...
                </Notification>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSignup}
                variants={formVariant}
                initial="hidden"
                animate="visible"
              >
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

                <motion.div variants={itemVariant}>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
                    <TextInput
                      label="First name"
                      placeholder="Your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.currentTarget.value)}
                      radius="md"
                      className="auth-input"
                      leftSection={
                        <ThemeIcon variant="subtle" color="gray" size="sm" radius="xl">
                          <IconId size="1rem" />
                        </ThemeIcon>
                      }
                    />
                    <TextInput
                      label="Last name"
                      placeholder="Your last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.currentTarget.value)}
                      radius="md"
                      className="auth-input"
                      leftSection={
                        <ThemeIcon variant="subtle" color="gray" size="sm" radius="xl">
                          <IconId size="1rem" />
                        </ThemeIcon>
                      }
                    />
                  </SimpleGrid>
                </motion.div>

                <motion.div variants={itemVariant}>
                  <TextInput
                    required
                    label={
                      <Group gap={5}>
                        <span>Username</span>
                        <Tooltip
                          label="Choose a unique username (min. 3 characters)"
                          position="top-start"
                          withArrow
                        >
                          <IconInfoCircle size={16} style={{ display: 'block', opacity: 0.5 }} />
                        </Tooltip>
                      </Group>
                    }
                    placeholder="your_username"
                    value={username}
                    onChange={(e) => setUsername(e.currentTarget.value)}
                    error={getUsernameErrorMessage()}
                    radius="md"
                    className="auth-input"
                    leftSection={
                      <ThemeIcon variant="subtle" color="gray" size="sm" radius="xl">
                        <IconUser size="1rem" />
                      </ThemeIcon>
                    }
                    rightSection={
                      isCheckingUsername ? (
                        <Loader size="xs" />
                      ) : usernameChecked && username.length >= 3 ? (
                        !usernameExists ? (
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
                  />
                </motion.div>

                <motion.div variants={itemVariant}>
                  <TextInput
                    required
                    mt="md"
                    label={
                      <Group gap={5}>
                        <span>Email</span>
                        <Tooltip
                          label="Enter a valid email address"
                          position="top-start"
                          withArrow
                        >
                          <IconInfoCircle size={16} style={{ display: 'block', opacity: 0.5 }} />
                        </Tooltip>
                      </Group>
                    }
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    error={getEmailErrorMessage()}
                    radius="md"
                    className="auth-input"
                    leftSection={
                      <ThemeIcon variant="subtle" color="gray" size="sm" radius="xl">
                        <IconAt size="1rem" />
                      </ThemeIcon>
                    }
                    rightSection={
                      isCheckingEmail ? (
                        <Loader size="xs" />
                      ) : emailChecked ? (
                        emailValidation.isValid && !emailExists && !emailValidation.isDisposable ? (
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
                  />
                </motion.div>

                <motion.div variants={itemVariant}>
                  <Popover width="target" position="bottom" shadow="md" withArrow>
                    <Popover.Target>
                      <div>
                        <PasswordInput
                          required
                          mt="md"
                          label={
                            <Group gap={5}>
                              <span>Password</span>
                              <Tooltip
                                label="Password must be at least 8 characters"
                                position="top-start"
                                withArrow
                              >
                                <IconInfoCircle size={16} style={{ display: 'block', opacity: 0.5 }} />
                              </Tooltip>
                            </Group>
                          }
                          placeholder="Your strong password"
                          value={password}
                          onChange={(e) => setPassword(e.currentTarget.value)}
                          radius="md"
                          className="auth-input"
                          leftSection={
                            <ThemeIcon variant="subtle" color="gray" size="sm" radius="xl">
                              <IconLock size="1rem" />
                            </ThemeIcon>
                          }
                          rightSection={
                            password.length > 0 ? (
                              passwordValidation.isValid ? (
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
                        />
                      </div>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <PasswordStrengthIndicator passwordValidation={passwordValidation} />
                    </Popover.Dropdown>
                  </Popover>
                </motion.div>

                <motion.div variants={itemVariant}>
                  <PasswordInput
                    required
                    mt="md"
                    label="Confirm password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                    error={confirmPassword.length > 0 && password !== confirmPassword ? 'Passwords do not match' : null}
                    radius="md"
                    className="auth-input"
                    leftSection={
                      <ThemeIcon variant="subtle" color="gray" size="sm" radius="xl">
                        <IconLock size="1rem" />
                      </ThemeIcon>
                    }
                    rightSection={
                      confirmPassword.length > 0 ? (
                        password === confirmPassword ? (
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
                  />
                </motion.div>

                <motion.div variants={itemVariant}>
                  <Checkbox
                    mt="xl"
                    mb="xl"
                    label={
                      <Text size="sm">
                        I agree to the{' '}
                        <Anchor href="#" target="_blank" className="auth-link">
                          Terms of Service
                        </Anchor>{' '}
                        and{' '}
                        <Anchor href="#" target="_blank" className="auth-link">
                          Privacy Policy
                        </Anchor>
                      </Text>
                    }
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.currentTarget.checked)}
                    required
                    className="auth-checkbox"
                  />
                </motion.div>

                <motion.div variants={itemVariant}>
                  <Button
                    fullWidth
                    radius="md"
                    type="submit"
                    loading={isSubmitting}
                    className="auth-button"
                    rightSection={<IconArrowRight size={18} />}
                    disabled={
                      isSubmitting ||
                      usernameExists ||
                      emailExists ||
                      !emailValidation.isValid ||
                      emailValidation.isDisposable ||
                      !passwordValidation.isValid ||
                      password !== confirmPassword ||
                      !password ||
                      !username ||
                      !email ||
                      !termsAccepted
                    }
                  >
                    Create account
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>

          {!success && (
            <>
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
            </>
          )}
        </Paper>
      </motion.div>
    </Container>
  );
}