import React from 'react';
import { ClientShell } from '../../components/Shell/ClientShell'; // Adjust path if needed

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <ClientShell>{children}</ClientShell>;
} 