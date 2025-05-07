import React from 'react';
import { AdminShell } from '../../../components/Shell/AdminShell';

// This layout applies to all routes within /admin
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
} 