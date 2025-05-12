import { NextRequest, NextResponse } from 'next/server';

// Constants for validation
const MAX_NITROGEN = 500;
const MAX_PHOSPHORUS = 300;
const MAX_POTASSIUM = 400;
const MIN_PH = 0;
const MAX_PH = 14;

// Validation helper function
function validateSoilValues(data: any) {
  const errors: string[] = [];

  // Validate nitrogen
  if (data.soilNitrogen !== null) {
    if (typeof data.soilNitrogen === 'number') {
      if (data.soilNitrogen < 0) {
        errors.push("Nitrogen value must be positive");
      } else if (data.soilNitrogen > MAX_NITROGEN) {
        errors.push(`Nitrogen value must be less than ${MAX_NITROGEN} PPM`);
      }
    }
  }

  // Validate phosphorus
  if (data.soilPhosphorus !== null) {
    if (typeof data.soilPhosphorus === 'number') {
      if (data.soilPhosphorus < 0) {
        errors.push("Phosphorus value must be positive");
      } else if (data.soilPhosphorus > MAX_PHOSPHORUS) {
        errors.push(`Phosphorus value must be less than ${MAX_PHOSPHORUS} PPM`);
      }
    }
  }

  // Validate potassium
  if (data.soilPotassium !== null) {
    if (typeof data.soilPotassium === 'number') {
      if (data.soilPotassium < 0) {
        errors.push("Potassium value must be positive");
      } else if (data.soilPotassium > MAX_POTASSIUM) {
        errors.push(`Potassium value must be less than ${MAX_POTASSIUM} PPM`);
      }
    }
  }

  // Validate pH - must be within the pH scale (0-14)
  if (data.soilPh !== null) {
    if (typeof data.soilPh === 'number') {
      if (data.soilPh < MIN_PH) {
        errors.push(`pH value must be at least ${MIN_PH}`);
      } else if (data.soilPh > MAX_PH) {
        errors.push(`pH value must be no greater than ${MAX_PH}`);
      }
    }
  }

  return errors;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const data = await request.json();
    
    // Basic validation for required fields
    if (!data.farmName || !data.farmName.trim()) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: ["Your farm needs a name to grow! Please give it one."]
        }, 
        { status: 400 }
      );
    }
    
    // Validate the soil values
    const validationErrors = validateSoilValues(data);
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationErrors 
        }, 
        { status: 400 }
      );
    }
    
    // Get the Authorization header from the request
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Map frontend field names to backend field names
    const backendData = {
      farm_name: data.farmName,
      farm_address: data.farmAddress,
      soil_type: data.soilType,
      irrigation_type: data.irrigationType,
      farming_method: data.farmingMethod,
      farmer_experience: data.farmerExperience,
      soil_nitrogen: data.soilNitrogen,
      soil_phosphorus: data.soilPhosphorus,
      soil_potassium: data.soilPotassium,
      soil_ph: data.soilPh,
      has_water_access: data.hasWaterAccess,
      has_road_access: data.hasRoadAccess,
      has_electricity: data.hasElectricity,
      storage_capacity: data.storageCapacity,
      year_established: data.yearEstablished,
      boundary: data.farmBoundary,
      farmBoundary: data.farmBoundary
    };
    
    // Forward the request to the Django backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    console.log('Sending data to backend:', JSON.stringify(backendData));
    
    // Try the primary endpoint first
    let backendResponse: Response | null = null;
    try {
      backendResponse = await fetch(`${apiUrl}/core/farm/onboarding/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(backendData)
      });
    } catch (error) {
      console.error('Error with primary endpoint:', error);
    }
    
    // If that endpoint fails, try the secondary endpoint
    if (!backendResponse || !backendResponse.ok) {
      const statusText = backendResponse ? `status ${backendResponse.status}` : 'unknown error';
      console.log(`Primary endpoint failed with ${statusText}, trying alternative endpoint`);
      let secondaryResponse: Response | null = null;
      
      try {
        secondaryResponse = await fetch(`${apiUrl}/api/complete-onboarding/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify(backendData)
        });
      } catch (error) {
        console.error('Error with secondary endpoint:', error);
      }
      
      // If both regular endpoints fail, try the debug endpoint as a final fallback
      if (!secondaryResponse || !secondaryResponse.ok) {
        const statusText = secondaryResponse ? `status ${secondaryResponse.status}` : 'unknown error';
        console.log(`Secondary endpoint failed with ${statusText}, trying debug endpoint`);
        
        try {
          const debugResponse = await fetch(`${apiUrl}/core/debug/onboarding/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authHeader
            },
            body: JSON.stringify(backendData)
          });
          
          const debugResponseData = await debugResponse.json();
          
          if (debugResponse.ok) {
            console.log('Debug endpoint created farm successfully');
            
            return NextResponse.json({
              success: true,
              message: 'Farm created successfully via debug endpoint',
              farm_id: debugResponseData.farm_id || debugResponseData.id,
              farm_name: debugResponseData.farm_name || data.farmName
            });
          } else {
            console.error('Debug endpoint also failed:', debugResponseData);
            return NextResponse.json(
              { error: 'All endpoints failed to create farm', details: debugResponseData }, 
              { status: 500 }
            );
          }
        } catch (debugError) {
          console.error('Error with debug endpoint:', debugError);
          return NextResponse.json(
            { error: 'All farm creation endpoints failed', message: 'Please try again or contact support' }, 
            { status: 500 }
          );
        }
      }
      
      try {
        const responseData = await secondaryResponse.json();
        
        return NextResponse.json(responseData, { status: secondaryResponse.status });
      } catch (jsonError) {
        console.error('Error parsing secondary response:', jsonError);
        return NextResponse.json(
          { error: 'Failed to parse secondary endpoint response', message: 'Server returned invalid data' }, 
          { status: 500 }
        );
      }
    }
    
    // If primary endpoint succeeds
    try {
      const responseData = await backendResponse.json();
      
      return NextResponse.json(responseData, { status: backendResponse.status });
    } catch (jsonError) {
      console.error('Error parsing primary response:', jsonError);
      return NextResponse.json(
        { error: 'Failed to parse primary endpoint response', message: 'Server returned invalid data' }, 
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in complete-onboarding API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
} 