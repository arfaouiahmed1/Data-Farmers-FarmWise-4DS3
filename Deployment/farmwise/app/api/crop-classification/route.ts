'use server';

import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  // Get the API URL from environment variable or use default
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  try {
    const data = await request.json();
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization') || '';
    console.log('Authorization header:', authHeader); // Debug auth header
    console.log('Submitting data to backend:', data); // Log the data being sent
    
    // Forward the request to Django backend
    const response = await fetch(`${API_URL}/api/crop-classification/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header
        'Authorization': authHeader,
      },
      body: JSON.stringify(data),
    });

    // Log the response status for debugging
    console.log('Backend response status:', response.status);
    
    // Get the response data
    const responseData = await response.json();
    console.log('Backend response data:', responseData);

    // Return the response with the same status
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in crop classification:', error);
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

export async function GET(request: NextRequest) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization') || '';
    console.log('GET Authorization header:', authHeader); // Debug auth header
    
    // Forward the request to Django backend
    const response = await fetch(`${API_URL}/api/crop-classification/`, {
      headers: {
        'Authorization': authHeader,
      },
    });

    // Log the response status for debugging
    console.log('GET Backend response status:', response.status);
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching crop classifications:', error);
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
