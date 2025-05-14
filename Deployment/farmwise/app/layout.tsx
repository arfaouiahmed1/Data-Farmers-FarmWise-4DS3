import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/dates/styles.css';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import '@/styles/custom-calendar.css';
import '@/styles/global-styles.css'; // Import new global styles

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
  // Use the enhanced theme directly from theme.ts
  // No need to override here as we've already defined these in the theme file

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
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
