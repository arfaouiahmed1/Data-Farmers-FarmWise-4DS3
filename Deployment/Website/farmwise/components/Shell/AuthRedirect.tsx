'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import authService from '../../app/api/auth';

const publicRoutes = ['/login', '/signup', '/forgot-password'];
const onboardingPath = '/onboarding';

export function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't run on the server
    if (typeof window === 'undefined') return;

    // Function to check and handle redirects
    const checkAndRedirect = () => {
      try {
        const isAuthenticated = authService.isAuthenticated();
        const isPublicRoute = publicRoutes.includes(pathname || '');
        const isOnboardingRoute = pathname === onboardingPath;

        // If not authenticated and not on a public route, redirect to login
        if (!isAuthenticated && !isPublicRoute) {
          router.push('/login');
          return;
        }

        // If authenticated and on a public route, redirect to dashboard
        if (isAuthenticated && isPublicRoute) {
          router.push('/dashboard');
          return;
        }

        // If authenticated, check if onboarding is needed
        if (isAuthenticated && !isOnboardingRoute) {
          const needsOnboarding = authService.needsOnboarding();
          
          if (needsOnboarding) {
            // Redirect to onboarding page if not already there
            router.push('/onboarding');
            return;
          }
        }
        
        // If on onboarding page but onboarding is already completed
        if (isAuthenticated && isOnboardingRoute && !authService.needsOnboarding()) {
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error in auth redirect:', error);
        // In case of error, stay on the current page or redirect to a safe page
        if (!publicRoutes.includes(pathname || '')) {
          router.push('/login');
        }
      }
    };

    // Run check immediately
    checkAndRedirect();

    // Also set up interval to periodically check (optional)
    // const intervalId = setInterval(checkAndRedirect, 60000); // Check every minute
    // return () => clearInterval(intervalId);
  }, [router, pathname]);

  // This component doesn't render anything
  return null;
} 