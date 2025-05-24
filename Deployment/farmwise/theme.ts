'use client';

import { createTheme, MantineColorsTuple } from '@mantine/core';

// Primary brand color - enhanced farmGreen with better contrast
const farmGreen: MantineColorsTuple = [
  '#f0faf4', // Lighter background shade
  '#e1f1e4',
  '#c4e3cb',
  '#a5d5b0',
  '#8aca9a',
  '#6cbe84', // Adjusted for better contrast
  '#5cb476', // Primary button color
  '#4a9c64', // Hover state
  '#3d8453', // Active state
  '#2f6b42'  // Darker shade for text on light backgrounds
];

// Secondary brand color - enhanced soilBrown
const soilBrown: MantineColorsTuple = [
  '#f9f5f2', // Lighter background shade
  '#eee4dc',
  '#dcc8bb',
  '#c8ab99',
  '#b48e7b',
  '#a67b67', // Adjusted for better contrast
  '#9b6f5c', // Primary button color
  '#865c4a', // Hover state
  '#75503f', // Active state
  '#614235'  // Darker shade for text on light backgrounds
];

// Accent blue for data visualizations and highlights
const dataBlue: MantineColorsTuple = [
  '#edf6ff',
  '#d8e9ff',
  '#b1d2ff',
  '#88baff',
  '#63a2ff',
  '#4a8eff',
  '#3b83ff', // Primary accent color
  '#2e6cdf',
  '#2359c4',
  '#1747a3'
];

// Accent gold for warnings and special highlights
const harvestGold: MantineColorsTuple = [
  '#fff8e1',
  '#ffecb3',
  '#ffe082',
  '#ffd54f',
  '#ffca28',
  '#ffc107',
  '#ffb300', // Primary accent color
  '#ffa000',
  '#ff8f00',
  '#ff6f00'
];

export const theme = createTheme({
  primaryColor: 'farmGreen',
  colors: {
    farmGreen,
    soilBrown,
    dataBlue,
    harvestGold,
  },
  fontFamily: 'Inter, sans-serif',
  headings: {
    fontFamily: 'Poppins, sans-serif',
    sizes: {
      h1: { fontSize: '2.5rem', lineHeight: 1.2, fontWeight: 700 },
      h2: { fontSize: '2rem', lineHeight: 1.3, fontWeight: 700 },
      h3: { fontSize: '1.5rem', lineHeight: 1.4, fontWeight: 600 },
      h4: { fontSize: '1.25rem', lineHeight: 1.4, fontWeight: 600 },
      h5: { fontSize: '1.1rem', lineHeight: 1.4, fontWeight: 600 },
      h6: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 600 },
    },
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
  defaultRadius: 'md',
  radius: {
    xs: '0.125rem',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  other: {
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDuration: '200ms',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        padding: 'lg',
      },
      styles: {
        root: {
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        },
      },
    },
    Tabs: {
      defaultProps: {
        color: 'farmGreen',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'md',
      },
    },
    FileInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'md',
      },
    },
    NumberInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});
