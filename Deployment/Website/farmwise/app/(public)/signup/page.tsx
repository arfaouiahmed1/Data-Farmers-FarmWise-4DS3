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
} from '@mantine/core';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import classes from './SignupPage.module.css'; // We'll create this CSS module next

// Animation variant
const containerVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
};

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = () => {
    // In a real app, you would register the user here
    // For now, we're just navigating to the onboarding page
    router.push('/onboarding');
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
          <Stack>
              <TextInput label="Name" placeholder="Your name" required />
              <TextInput label="Email" placeholder="you@farmwise.ag" required mt="md" />
              <PasswordInput label="Password" placeholder="Your password" required mt="md" />
              <PasswordInput label="Confirm Password" placeholder="Confirm your password" required mt="md" />
              <Checkbox label="I accept terms and conditions" mt="lg" required/>
              <Button 
                fullWidth 
                mt="xl" 
                variant="gradient" 
                gradient={{ from: 'farmGreen', to: 'cyan' }}
                onClick={handleSignup}
              >
                Sign up
              </Button>
          </Stack>
        </Paper>
      </Container>
    </motion.div>
  );
} 