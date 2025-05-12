'use client';

import React, { useState, useEffect } from 'react';
import { AppShell, useMantineTheme } from '@mantine/core';
// import { MantineProvider } from '@mantine/core'; // Removed redundant provider import
// import { theme } from '../../theme'; // Removed theme import
import { AppHeader } from '../Header/Header'; // Adjust path relative to components/Shell
import classes from '../Header/Header.module.css'; // Import header CSS for the blur class
import { useWindowScroll } from '@mantine/hooks'; // Import useWindowScroll hook

interface ClientShellProps {
  children: React.ReactNode;
}

export function ClientShell({ children }: ClientShellProps) {
  const [scroll] = useWindowScroll(); // Use hook to get scroll position
  const [headerBlurred, setHeaderBlurred] = useState(false); // State for blur
  const theme = useMantineTheme(); // Get theme for color access

  useEffect(() => {
    // Set blurred state based on scroll position
    setHeaderBlurred(scroll.y > 10); 
  }, [scroll]);

  return (
    // <MantineProvider theme={theme}> // Removed redundant provider
      <AppShell
        padding="md"
        header={{ height: 60 }}
        // Add navbar/aside props here later if needed
      >
        <AppShell.Header 
          className={headerBlurred ? classes.headerBlurred : ''}
          style={{
            // Optionally set background color directly for transition
            // backgroundColor: headerBlurred 
            //    ? theme.fn.rgba(theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white, 0.85) 
            //    : 'transparent',
            // transition: 'background-color 0.3s ease' 
          }}
        >
          <AppHeader />
        </AppShell.Header>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    // </MantineProvider> // Removed redundant provider
  );
} 