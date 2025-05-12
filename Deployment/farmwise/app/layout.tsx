import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/dates/styles.css'; // Import Mantine dates styles
import './globals.css'; // Import global styles
// --- Add Leaflet and Geoman CSS imports ---
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import '@/styles/custom-calendar.css'; // Import custom calendar styles

import React from 'react';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { theme } from '../theme'; // Corrected import path
import { AuthRedirect } from '../components/Shell/AuthRedirect';
// ClientShell import is no longer needed here directly
// import { ClientShell } from '../components/Shell/ClientShell';

export const metadata = {
  title: 'FarmWise',
  description: 'Empowering Data Farmers with AI-driven insights for modern agriculture.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Enhance the theme for better dashboard visibility
  const enhancedTheme = {
    ...theme,
    components: {
      ...theme.components,
      Container: {
        defaultProps: {
          p: 'xs',
        },
      },
      Card: {
        defaultProps: {
          padding: 'xs',
        },
      },
      Paper: {
        defaultProps: {
          p: 'xs',
        },
      },
    },
    spacing: {
      ...theme.spacing,
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
    },
    fontSizes: {
      ...theme.fontSizes,
      xs: '0.7rem',
      sm: '0.8rem',
      md: '0.9rem',
    },
  };

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Poppins:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <style>
          {`
            html, body {
              height: 100%;
              margin: 0;
              padding: 0;
              overflow: auto;
            }
          `}
        </style>
      </head>
      <body>
        <AuthRedirect />
        <MantineProvider theme={enhancedTheme} defaultColorScheme="light">
          {/* ClientShell is removed from here */}
          {children}
        </MantineProvider>

        {/* Global Style for Scroll Padding - moved to regular style tag */}
        <style>
          {`
            html {
              scroll-padding-top: 70px; 
              scroll-behavior: smooth; 
            }
          `}
        </style>
      </body>
    </html>
  );
}
