import { NextRequest, NextResponse } from 'next/server';
import { API_ROUTES } from '../../utils/routes';
import { getAuthToken } from '../../../utils/api';
import { CropClassificationInput } from '@/types/cropClassification';

export async function POST(request: NextRequest) {
  try {
    const body: CropClassificationInput = await request.json();
    
    console.log('Received crop classification request:', body);
    
    // Validate request
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Required fields
    if (!body.farm) {
      return NextResponse.json(
        { error: 'Farm is required' },
        { status: 400 }
      );
    }
    
    // Get token for authentication
    const token = getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log('Forwarding request to backend API:', API_ROUTES.CROP_CLASSIFICATION);
    
    try {
      // Forward the request to Django backend
      const backendResponse = await fetch(API_ROUTES.CROP_CLASSIFICATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(body)
      });
      
      console.log('Received backend response with status:', backendResponse.status);
      
      // Get the response data
      const responseData = await backendResponse.json();
      console.log('Backend response data:', responseData);
      
      // Return the backend response with the same status
      return NextResponse.json(
        responseData,
        { status: backendResponse.status }
      );
    } catch (backendError) {
      console.error('Error communicating with backend:', backendError);
      return NextResponse.json(
        { error: 'Error communicating with the classification service' },
        { status: 502 }
      );
    }
    
  } catch (error) {
    console.error('Error in crop classification API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// API implementation now directly forwards requests to the Django backend
// This eliminates the need for mock data and local processing