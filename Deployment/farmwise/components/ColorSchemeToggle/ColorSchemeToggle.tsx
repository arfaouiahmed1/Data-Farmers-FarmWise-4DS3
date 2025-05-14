'use client';

import { useEffect, useState } from 'react';
import { Button, Group, useMantineColorScheme, Tooltip, ActionIcon } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import classes from '../Header/Header.module.css';

export function ColorSchemeToggle() {
  const { setColorScheme, colorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = colorScheme === 'dark';
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  // Return null on the server or before mounting to prevent hydration mismatch
  if (!mounted) {
    return null; // Render nothing until mounted on the client
  }

  return (
    <Tooltip label={label}>
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <ActionIcon
          onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
          variant="filled"
          color="farmGreen"
          size="lg"
          radius="md"
          aria-label={label}
          className={classes.iconButton}
        >
          {/* Render the correct icon only when mounted */}
          {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
        </ActionIcon>
      </motion.div>
    </Tooltip>
  );
}
