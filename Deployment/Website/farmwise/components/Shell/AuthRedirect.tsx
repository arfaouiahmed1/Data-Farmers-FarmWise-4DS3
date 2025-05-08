'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import authService from '../../app/api/auth';

// Define publicly accessible routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/about', '/pricing', '/contact', '/help', '/terms', '/privacy'];
const onboardingPath = '/onboarding';

// Helper function to check if a path is public
const isPublicPath = (path: string | null): boolean => {
  if (!path) return false;
  
  // Exact matches (like '/' or '/login')
  if (publicRoutes.includes(path)) return true;
  
  // Check for paths that start with public route patterns
  return (
    path.startsWith('/pricing') || 
    path.startsWith('/about') || 
    path.startsWith('/help') || 
    path.startsWith('/blog') ||
    path.startsWith('/docs')
  );
};

export function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't run on the server
    if (typeof window === 'undefined') return;

    // Function to check and handle redirects
    const checkAndRedirect = async () => {
      try {
        // Force refresh user data to ensure we have the latest onboarding status
        // This helps prevent redirect loops when onboarding status has changed
        if (authService.isAuthenticated()) {
          try {
            await authService.refreshUserData();
          } catch (refreshError) {
            console.error('Error refreshing user data:', refreshError);
          }
        }

        const isAuthenticated = authService.isAuthenticated();
        const isPublicRoute = isPublicPath(pathname);
        const isOnboardingRoute = pathname === onboardingPath;

        console.log('Auth check - Path:', pathname, 'Public:', isPublicRoute, 'Auth:', isAuthenticated, 'Needs onboarding:', authService.needsOnboarding());

        // The home page and other public routes should always be accessible
        if (isPublicRoute) {
          // No redirects for public routes - they're accessible to everyone
          return;
        }

        // If not authenticated and trying to access a protected route, redirect to login
        if (!isAuthenticated && !isPublicRoute) {
          router.push('/login');
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
        if (!isPublicPath(pathname)) {
          router.push('/login');
        }
      }
    };

    // Run the check
    checkAndRedirect();

    // Add event listener for local storage changes
    const handleStorageChange = () => {
      checkAndRedirect();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router, pathname]);

  return null; // This component doesn't render anything
} 