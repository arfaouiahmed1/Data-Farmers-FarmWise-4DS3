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
  Checkbox,
  Notification,
} from '@mantine/core';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import authService from '../../api/auth';
import classes from './SignupPage.module.css';

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
  
  const router = useRouter();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariant}
    >
      <Container size={460} my={40}>
        <Title ta="center" className={classes.title}>
          Create your FarmWise Account
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Already have an account?{' '}
          <Anchor size="sm" component={Link} href="/login">
            Sign in
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <AnimatePresence>
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
                  title="Registration successful!"
                  withCloseButton={false}
                >
                  Your account has been created. Redirecting to onboarding...
                </Notification>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSignup}
                variants={notificationVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
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
                
                <Stack>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <TextInput 
                      label="First Name" 
                      placeholder="John" 
                      style={{ flex: 1 }}
                      value={firstName}
                      onChange={(e) => setFirstName(e.currentTarget.value)}
                    />
                    <TextInput 
                      label="Last Name" 
                      placeholder="Doe" 
                      style={{ flex: 1 }}
                      value={lastName}
                      onChange={(e) => setLastName(e.currentTarget.value)}
                    />
                  </div>
                  <TextInput 
                    label="Username" 
                    placeholder="johndoe" 
                    required 
                    value={username}
                    onChange={(e) => setUsername(e.currentTarget.value)}
                  />
                  <TextInput 
                    label="Email" 
                    placeholder="you@farmwise.ag" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                  />
                  <PasswordInput 
                    label="Password" 
                    placeholder="Your password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                  />
                  <PasswordInput 
                    label="Confirm Password" 
                    placeholder="Confirm your password" 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                  />
                  <Checkbox 
                    label="I accept terms and conditions" 
                    mt="lg" 
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.currentTarget.checked)}
                  />
                  <Button 
                    fullWidth 
                    mt="xl" 
                    variant="gradient" 
                    gradient={{ from: 'farmGreen', to: 'cyan' }}
                    type="submit"
                    loading={isSubmitting}
                  >
                    Sign up
                  </Button>
                </Stack>
              </motion.form>
            )}
          </AnimatePresence>
        </Paper>
      </Container>
    </motion.div>
  );
} 