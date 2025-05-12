import { NextResponse } from 'next/server';

// Get the backend URL from environment variables or use a default
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    
    console.log("Received request body structure:", Object.keys(body));
    
    // Transform the data to match what the Django backend expects
    // Handle both old format and new format
    let transformedData;
    
    if (body.image_base64 && body.bounds) {
      // New format - already structured correctly
      console.log("Using new format payload");
      transformedData = {
        image_base64: body.image_base64,
        bounds: body.bounds,
        preserve_detail: true // Add parameter to keep high detail in boundaries
      };
    } else if (body.image_data && body.map_bounds) {
      // Old format - transform to expected structure
      console.log("Using old format payload, converting to new format");
      transformedData = {
        image_base64: body.image_data,
        bounds: {
          north_east: {
            lat: body.map_bounds.north,
            lng: body.map_bounds.east
          },
          south_west: {
            lat: body.map_bounds.south,
            lng: body.map_bounds.west
          }
        },
        preserve_detail: true // Add parameter to keep high detail in boundaries
      };
    } else {
      // Invalid format
      console.error("Invalid request format", Object.keys(body));
      return new NextResponse(
        JSON.stringify({
          error: 'Invalid request format',
          details: 'Request must include either image_base64 and bounds, or image_data and map_bounds',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log("Sending transformed request to backend");
    
    try {
      // Forward the request to the Django backend
      const backendResponse = await fetch(`${BACKEND_URL}/api/detect-farm-boundaries/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      // If the backend request was not successful, return the error
      if (!backendResponse.ok) {
        console.error(`Backend response error: ${backendResponse.status} ${backendResponse.statusText}`);
        
        let errorText;
        try {
          errorText = await backendResponse.text();
          console.error("Backend error details:", errorText);
        } catch (textError) {
          errorText = "Could not parse error details";
          console.error("Error parsing backend response:", textError);
        }
        
        return new NextResponse(
          JSON.stringify({
            error: `Backend returned an error: ${backendResponse.status} ${backendResponse.statusText}`,
            details: errorText,
          }),
          {
            status: backendResponse.status,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Get the response from the backend
      const data = await backendResponse.json();
      console.log("Received data from backend:", 
                  Array.isArray(data) ? `Array with ${data.length} items` : typeof data);

      // Log detailed info about the first few boundaries to help debug visualization issues
      if (Array.isArray(data) && data.length > 0) {
        console.log(`First boundary type: ${data[0].type}`);
        console.log(`First boundary geometry type: ${data[0].geometry?.type}`);
        if (data[0].geometry?.coordinates) {
          console.log(`First boundary coordinate count: ${JSON.stringify(data[0].geometry.coordinates).length} chars`);
        }
      }

      // Return all boundaries without filtering
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error("Error fetching from backend:", fetchError);
      return new NextResponse(
        JSON.stringify({
          error: 'Error connecting to backend service',
          details: fetchError instanceof Error ? fetchError.message : String(fetchError),
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  } catch (error) {
    console.error('Error in detect-farm-boundaries route:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'An error occurred while processing the request',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 