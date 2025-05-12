/**
 * API utilities for making authenticated requests
 */
import { API_ROUTES } from '../api/utils/routes';

/**
 * Get the authentication token from localStorage
 * @returns The authentication token or null if not found
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

/**
 * Get headers with authentication token for API requests
 * @returns Headers object with Content-Type and Authorization (if token exists)
 */
export function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  
  return headers;
}

/**
 * Get the current user data from localStorage
 * @returns The user data or null if not found/logged in
 */
export function getCurrentUser(): any | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }
  return null;
}

/**
 * Get the current user's farms
 * Returns a promise that resolves to an array of farms
 */
export async function getUserFarms(): Promise<any[]> {
  try {
    // Try to fetch user farms from the API
    const response = await fetch('/api/farms', {
      headers: getAuthHeaders(),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data || [];
    } else {
      console.error('Failed to fetch user farms:', response.status);
      
      // For now, return empty array
      return [];
    }
  } catch (error) {
    console.error('Error fetching user farms:', error);
    return [];
  }
}

/**
 * Get detailed information about a specific farm
 * @param farmId - The ID of the farm to fetch
 * @returns Promise resolving to the farm details or null if error
 */
export async function getFarmDetails(farmId: number): Promise<any | null> {
  try {
    if (!farmId) return null;
    
    const response = await fetch(`/api/farms/${farmId}`, {
      headers: getAuthHeaders(),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Failed to fetch farm details:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching farm details:', error);
    return null;
  }
}

/**
 * Ensure URL has correct prefix for Next.js API routes
 * @param url - The URL to normalize
 * @returns Normalized URL with proper prefix
 */
function normalizeUrl(url: string): string {
  // If already a full URL or starts with / (absolute path), return as is
  if (url.startsWith('http') || url.startsWith('/')) {
    return url;
  }
  
  // Otherwise, ensure it starts with /api/
  if (!url.startsWith('api/')) {
    return `/api/${url}`;
  }
  
  // If it already starts with api/ but not with /api/, add the leading slash
  return `/${url}`;
}

/**
 * Make an authenticated API request
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Response from the API
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };
  
  // Normalize the URL to ensure correct format
  const normalizedUrl = normalizeUrl(url);
  
  return fetch(normalizedUrl, {
    ...options,
    headers,
  });
}

/**
 * Make an authenticated GET request
 * @param url - The URL to fetch
 * @returns Response from the API
 */
export async function authGet(url: string): Promise<Response> {
  return fetchWithAuth(url, { method: 'GET' });
}

/**
 * Make an authenticated POST request
 * @param url - The URL to post to
 * @param data - The data to send
 * @returns Response from the API
 */
export async function authPost(url: string, data: any): Promise<Response> {
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Make an authenticated PUT request
 * @param url - The URL to put to
 * @param data - The data to send
 * @returns Response from the API
 */
export async function authPut(url: string, data: any): Promise<Response> {
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Make an authenticated DELETE request
 * @param url - The URL to delete from
 * @returns Response from the API
 */
export async function authDelete(url: string): Promise<Response> {
  return fetchWithAuth(url, { method: 'DELETE' });
}