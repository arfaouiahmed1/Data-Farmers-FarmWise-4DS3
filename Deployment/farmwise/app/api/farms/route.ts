'use server';

import { NextRequest } from 'next/server';
import { API_ROUTES } from '../utils/routes';

export async function GET(request: NextRequest) {
  // Get the API URL from environment variable or use default
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  try {
    // Get the authorization header for passing to the backend
    const authHeader = request.headers.get('Authorization') || '';
    console.log('Farms API - Authorization header:', authHeader);
    
    // Forward the request to Django backend using the user-farms endpoint
    const response = await fetch(API_ROUTES.USER_FARMS, {
      headers: {
        'Authorization': authHeader,
      },
    });

    console.log('Backend farms response status:', response.status);
    
    // Parse the JSON response
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching farms:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 