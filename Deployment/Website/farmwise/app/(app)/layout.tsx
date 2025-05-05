import React from 'react';

// This layout applies to routes within the (app) group (e.g., /onboarding, /Dashboard)
// It currently just renders children, meaning it won't have the public navbar.
// You could add an app-specific shell here later.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
} 