import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Get the authentication token from the cookie/header
    const token = req.cookies.get('authToken')?.value || req.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Get the boundary data
    const boundary = data.boundary;
    const farmId = data.farmId;
    
    if (!boundary) {
      return NextResponse.json({ error: 'No boundary data provided' }, { status: 400 });
    }
    
    // Prepare the request to the backend
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const apiUrl = farmId 
      ? `${baseUrl}/api/farm/update-boundary/${farmId}/` 
      : `${baseUrl}/api/farm/update-boundary/`;
    
    // Call the backend API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ boundary }),
    });
    
    // Handle response
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: `Error updating farm boundary: ${response.status} ${response.statusText}`,
        details: errorText
      }, { status: response.status });
    }
    
    // Return success response
    const responseData = await response.json();
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error in update-farm-boundary API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 