import { NextRequest, NextResponse } from 'next/server';
import { API_ROUTES } from '../../utils/routes';
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
    
    // Get token from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Token ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.replace('Token ', '');
    
    console.log('Forwarding request to backend API:', API_ROUTES.CROP_CLASSIFICATION);    try {
      // Log the full URL being requested
      console.log('Full API URL:', API_ROUTES.CROP_CLASSIFICATION);
      console.log('Token available:', !!token);
      console.log('Request body:', JSON.stringify(body));
      
      // Add a timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        // Forward the request to Django backend
        const backendResponse = await fetch(API_ROUTES.CROP_CLASSIFICATION, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId); // Clear the timeout if fetch completes
        
        console.log('Received backend response with status:', backendResponse.status);
        
        // Handle different response status codes
        if (backendResponse.status === 401) {
          console.log('Authentication error');
          return NextResponse.json(
            { error: 'Authentication failed. Please log in again.' },
            { status: 401 }
          );
        }
          // Log the full response body for debugging
        try {
          const responseText = await backendResponse.text();
          console.log('Raw response body:', responseText);
          
          // Return empty data with success status if response is empty but status is 200-299
          if (!responseText && backendResponse.ok) {
            return NextResponse.json(
              { success: true, message: 'Operation completed successfully but no data returned' },
              { status: 200 }
            );
          }
            // Check if response starts with HTML (Django error page)
          if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            console.error('Received HTML error page from backend');
            
            // Extract error message if possible
            let errorMessage = 'Backend server error';
            let errorDetails = 'The server returned an HTML error page instead of JSON. This usually indicates a server-side exception.';
            try {
              // Try to extract useful error information from HTML
              const titleMatch = responseText.match(/<title>(.*?)<\/title>/);
              if (titleMatch && titleMatch[1]) {
                errorMessage = `Backend error: ${titleMatch[1]}`;
              }
              
              // Try to extract more detailed error information
              const errorMatch = responseText.match(/<pre class="exception_value">(.*?)<\/pre>/);
              if (errorMatch && errorMatch[1]) {
                errorDetails = `Error details: ${errorMatch[1]}`;
              }
              
              // Try to extract error trace
              const traceMatch = responseText.match(/<div id="traceback">([\s\S]*?)<\/div>/);
              if (traceMatch) {
                console.error('Error trace from backend:', traceMatch[1].replace(/<[^>]*>/g, '').trim());
              }
              
            } catch (e) {
              console.error('Error extracting information from HTML error page:', e);
            }
            
            return NextResponse.json(
              { 
                error: errorMessage,
                details: errorDetails
              },
              { status: 500 }
            );
          }
          
          // Try to parse as JSON
          try {
            const responseData = JSON.parse(responseText);
            return NextResponse.json(responseData, { status: backendResponse.status });
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            return NextResponse.json(
              { 
                error: 'Invalid JSON response from backend',
                rawResponse: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
              },
              { status: 500 }
            );
          }
        } catch (parseError) {
          console.error('Error processing response body:', parseError);
          return NextResponse.json(
            { error: 'Error processing backend response' },
            { status: 500 }
          );
        }      } catch (error) {
        clearTimeout(timeoutId);
        const fetchError = error as Error;
        if (fetchError.name === 'AbortError') {
          console.error('Request timed out');
          return NextResponse.json(
            { error: 'Request timed out. The server is taking too long to respond.' },
            { status: 504 }
          );
        }
        throw fetchError; // Re-throw other fetch errors to be caught by the outer catch
      }
        /* 
       We've already handled the response parsing in the try block above.
       This code is now unreachable, but we're keeping a comment here 
       to show that we've intentionally removed it.
      */    } catch (error) {
      const backendError = error as Error;
      console.error('Error communicating with backend:', backendError);
      console.error('Backend error details:', backendError.message);
      return NextResponse.json(
        { 
          error: 'Error communicating with the classification service',
          details: backendError.message
        },
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