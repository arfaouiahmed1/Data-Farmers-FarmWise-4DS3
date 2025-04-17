'use client';

import { createTheme, MantineColorsTuple } from '@mantine/core';

// Custom green color
const farmGreen: MantineColorsTuple = [
  '#eefaf1',
  '#e1f1e4',
  '#c4e3cb',
  '#a5d5b0',
  '#8aca9a',
  '#77c48b',
  '#6cc084',
  '#5aa972',
  '#4c9765',
  '#3b8456'
];

// Custom brown color
const soilBrown: MantineColorsTuple = [
  '#f8f4f0',
  '#eae2d9',
  '#d8c6b8',
  '#c6a995',
  '#b68f78',
  '#aa7d66',
  '#a3745c',
  '#8f634e',
  '#7f5745',
  '#704a39'
];

export const theme = createTheme({
  primaryColor: 'farmGreen',
  colors: {
    farmGreen,
    soilBrown,
  },
  fontFamily: 'Inter, sans-serif', // Set default font
  headings: {
    fontFamily: 'Poppins, sans-serif', // Set heading font
  },
  defaultRadius: 'lg', // Set default radius to large for more rounded corners
  // Add other theme overrides if needed
});
