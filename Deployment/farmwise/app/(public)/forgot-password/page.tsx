'use client';

import {
  Paper,
  TextInput,
  Button,
  Title,
  Text,
  Container,
  Group,
  Anchor,
  Center,
  Box,
  rem,
  Notification,
  ThemeIcon,
} from '@mantine/core';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { IconArrowLeft, IconCheck, IconAlertCircle, IconAt, IconKey, IconArrowRight } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import authService from '../../api/auth';
import classes from './ForgotPasswordPage.module.css';
import '@/styles/auth-common.css';
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [emailValidation, setEmailValidation] = useState({ isValid: true, feedback: '' });
  const router = useRouter();

  // Update email validation on change
  useEffect(() => {
    // Skip validation if email is empty
    if (!email || email.length === 0) {
      setEmailValidation({ isValid: true, feedback: '' });
      return;
    }

    // Validate email format
    const isValid = isValidEmail(email);
    setEmailValidation({
      isValid,
      feedback: isValid ? '' : 'Please enter a valid email address'
    });
  }, [email]);

  // Get appropriate error message for email field
  const getEmailErrorMessage = () => {
    if (email.length === 0) return null;
    if (!emailValidation.isValid) return emailValidation.feedback;
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!emailValidation.isValid) {
      setError(emailValidation.feedback);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await authService.forgotPassword({ email });

      // Set success message and clear email field
      setSuccess(true);
      setEmail('');

      // Redirect to login page after showing success for a few seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'An error occurred. Please try again.';
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
            <IconKey stroke={1.5} />
          </ThemeIcon>

          <Title className="auth-title" ta="center">
            Forgot your password?
          </Title>
          <Text className="auth-subtitle" ta="center">
            Enter your email to get a reset link
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
                  title="Email sent!"
                  withCloseButton={false}
                  className="auth-notification"
                >
                  We've sent a password reset link to your email address. You'll be redirected to the login page shortly.
                </Notification>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                variants={formVariant}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
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
                  <TextInput
                    label="Your email"
                    placeholder="you@example.com"
                    required
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
                  />
                </motion.div>

                <motion.div variants={itemVariant}>
                  <Group justify="space-between" mt="lg" className="auth-controls">
                    <Anchor size="sm" component={Link} href="/login" className="auth-link">
                      <Center inline>
                        <IconArrowLeft style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                        <Box ml={5}>Back to login</Box>
                      </Center>
                    </Anchor>
                    <Button
                      className="auth-button"
                      type="submit"
                      loading={isSubmitting}
                      radius="md"
                      rightSection={<IconArrowRight size={18} />}
                      disabled={isSubmitting || !email || !emailValidation.isValid}
                    >
                      Reset password
                    </Button>
                  </Group>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </Paper>
      </motion.div>
    </Container>
  );
}