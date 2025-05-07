import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/carousel/styles.css';
import './globals.css'; // Import global styles
// --- Add Leaflet and Geoman CSS imports ---
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

import React from 'react';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { theme } from '../theme'; // Corrected import path
import { AuthRedirect } from '../components/Shell/AuthRedirect';
// ClientShell import is no longer needed here directly
// import { ClientShell } from '../components/Shell/ClientShell';

export const metadata = {
  title: 'FarmWise - Intelligent Farming Solutions',
  description: 'Empowering Data Farmers with AI-driven insights for modern agriculture.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
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
      </head>
      <body>
        <AuthRedirect />
        <MantineProvider theme={theme} defaultColorScheme="auto">
          {/* ClientShell is removed from here */}
          {children}
        </MantineProvider>

        {/* Removed Global Style for Scroll Padding */}
        {/* <style jsx global>{`
          html {
            scroll-padding-top: 70px; 
            scroll-behavior: smooth; 
          }
        `}</style> */}
      </body>
    </html>
  );
}
