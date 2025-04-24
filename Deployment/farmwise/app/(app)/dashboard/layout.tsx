import React from 'react';
import { DashboardShell } from '../../../components/Shell/DashboardShell'; // Adjust path if necessary

// This layout applies to all routes within /Dashboard
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
} 