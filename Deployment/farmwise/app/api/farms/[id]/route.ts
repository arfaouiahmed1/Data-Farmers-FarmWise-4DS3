'use server';

import { NextRequest } from 'next/server';
import { API_ROUTES } from '../../utils/routes';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const farmId = params.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  try {
    // Get the authorization header for passing to the backend
    const authHeader = request.headers.get('Authorization') || '';
    
    // Forward the request to Django backend using the farm detail endpoint
    const response = await fetch(API_ROUTES.FARM_DETAIL(parseInt(farmId)), {
      headers: {
        'Authorization': authHeader,
      },
    });

    // Log backend response for debugging
    const responseText = await response.clone().text();
    console.log(`Backend farm/${farmId} response status:`, response.status);
    console.log(`Backend farm/${farmId} response body:`, responseText);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch farm with id ${farmId}`, backend: responseText }), 
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Parse the JSON response
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(`Error fetching farm ${farmId}:`, error);
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
