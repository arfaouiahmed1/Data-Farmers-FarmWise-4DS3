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
} from '@mantine/core';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IconArrowLeft } from '@tabler/icons-react';
import classes from './ForgotPasswordPage.module.css'; // We'll create this CSS module next

// Animation variant
const containerVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
};

export default function ForgotPasswordPage() {
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
          <TextInput label="Your email" placeholder="me@farmwise.ag" required />
          <Group justify="space-between" mt="lg" className={classes.controls}>
            <Anchor c="dimmed" size="sm" component={Link} href="/login" className={classes.control}>
              <Center inline>
                <IconArrowLeft style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                <Box ml={5}>Back to the login page</Box>
              </Center>
            </Anchor>
            <Button className={classes.control} variant="gradient" gradient={{ from: 'farmGreen', to: 'cyan' }}>
              Reset password
            </Button>
          </Group>
        </Paper>
      </Container>
    </motion.div>
  );
} 