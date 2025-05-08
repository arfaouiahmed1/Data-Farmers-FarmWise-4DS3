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
      boundary: data.farmBoundary
    };
    
    // Forward the request to the Django backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Use a different endpoint based on what the backend expects
    console.log('Sending data to backend:', JSON.stringify(backendData));
    
    const backendResponse = await fetch(`${apiUrl}/core/farm/onboarding/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(backendData)
    });
    
    // If that endpoint fails, try the secondary endpoint
    if (!backendResponse.ok && backendResponse.status === 404) {
      console.log('Primary endpoint not found, trying alternative endpoint');
      const secondaryResponse = await fetch(`${apiUrl}/api/complete-onboarding/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(backendData)
      });
      
      const responseData = await secondaryResponse.json();
      
      // Explicitly mark onboarding as completed if farm creation was successful
      if (secondaryResponse.ok) {
        try {
          console.log('Farm created successfully, marking onboarding as completed');
          await fetch(`${apiUrl}/core/complete-onboarding/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authHeader
            }
          });
        } catch (completeError) {
          console.error('Error marking onboarding as completed:', completeError);
          // Continue anyway since the farm was created successfully
        }
      }
      
      return NextResponse.json(responseData, { status: secondaryResponse.status });
    }
    
    // Parse the response from the backend
    const responseData = await backendResponse.json();
    
    // Explicitly mark onboarding as completed if farm creation was successful
    if (backendResponse.ok) {
      try {
        console.log('Farm created successfully, marking onboarding as completed');
        await fetch(`${apiUrl}/core/complete-onboarding/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          }
        });
      } catch (completeError) {
        console.error('Error marking onboarding as completed:', completeError);
        // Continue anyway since the farm was created successfully
      }
    }
    
    // Forward the response status and data
    return NextResponse.json(
      responseData, 
      { status: backendResponse.status }
    );
    
  } catch (error) {
    console.error('Error in complete-onboarding API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
} 