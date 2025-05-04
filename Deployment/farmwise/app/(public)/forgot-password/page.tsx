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
} from '@mantine/core';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { IconArrowLeft, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import classes from './ForgotPasswordPage.module.css';

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // In a real application, you would make an API call to send a password reset email
      // For demonstration purposes, we'll simulate a successful response after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set success message and clear email field
      setSuccess(true);
      setEmail('');
      
      // Redirect to login page after showing success for a few seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError('An error occurred. Please try again later.');
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
      <Container size={460} my={30}>
        <Title className={classes.title} ta="center">
          Forgot your password?
        </Title>
        <Text c="dimmed" fz="sm" ta="center">
          Enter your email to get a reset link
        </Text>

        <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
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
                >
                  We've sent a password reset link to your email address. You'll be redirected to the login page shortly.
                </Notification>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                variants={notificationVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
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
                        mb="md"
                      >
                        {error}
                      </Notification>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <TextInput
                  label="Your email"
                  placeholder="me@farmwise.ag"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  error={error && !email ? 'Email is required' : null}
                />
                
                <Group justify="space-between" mt="lg" className={classes.controls}>
                  <Anchor c="dimmed" size="sm" component={Link} href="/login" className={classes.control}>
                    <Center inline>
                      <IconArrowLeft style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                      <Box ml={5}>Back to the login page</Box>
                    </Center>
                  </Anchor>
                  <Button 
                    className={classes.control} 
                    variant="gradient" 
                    gradient={{ from: 'farmGreen', to: 'cyan' }}
                    type="submit"
                    loading={isSubmitting}
                  >
                    Reset password
                  </Button>
                </Group>
              </motion.form>
            )}
          </AnimatePresence>
        </Paper>
      </Container>
    </motion.div>
  );
} 