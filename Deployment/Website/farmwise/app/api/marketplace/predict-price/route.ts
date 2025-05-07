import { NextRequest, NextResponse } from 'next/server';

// Simple land valuation model
// In a real implementation, this would be a more sophisticated machine learning model
function predictLandPrice(data: LandData): PredictionResult {
  // Base price per unit based on region (in TND)
  const regionBasePrice: { [key: string]: number } = {
    'Tunis': 25000,
    'Sfax': 18000,
    'Sousse': 20000,
    'Bizerte': 16000,
    'Kairouan': 12000,
    'Nabeul': 19000,
    'Monastir': 21000,
    'Gabès': 14000,
    'Médenine': 11000,
    'Gafsa': 10000,
    'default': 15000
  };

  // Get the base price for the region or use default
  const basePrice = regionBasePrice[data.region] || regionBasePrice.default;
  
  // Calculate the base value based on size and unit
  let baseValue = 0;
  
  switch (data.unit) {
    case 'hectares':
      baseValue = basePrice * data.size * 10000; // 1 hectare = 10,000 sq meters
      break;
    case 'acres':
      baseValue = basePrice * data.size * 4046.86; // 1 acre = 4,046.86 sq meters
      break;
    case 'sq_meters':
    default:
      baseValue = basePrice * data.size;
      break;
  }
  
  // Adjust for access to utilities
  const accessMultiplier = 1.0 + 
    (data.waterAccess ? 0.1 : 0) + 
    (data.electricityAccess ? 0.08 : 0) + 
    (data.roadAccess ? 0.12 : 0) + 
    (data.irrigationAccess ? 0.15 : 0);
  
  // Adjust for soil quality
  const soilMultiplier = getSoilMultiplier(data.soilType);
  
  // Adjust for distance to city center (inverse relationship)
  const distanceMultiplier = Math.max(0.7, 1 - (data.distanceToCity / 100) * 0.5);
  
  // Calculate the final predicted price
  const predictedPrice = baseValue * accessMultiplier * soilMultiplier * distanceMultiplier;
  
  // Generate valuation details
  const valuationDetails = {
    landBaseValue: Math.round(baseValue),
    accessFactor: Math.round(baseValue * (accessMultiplier - 1)),
    soilQualityFactor: Math.round(baseValue * (soilMultiplier - 1)),
    locationFactor: Math.round(baseValue * (distanceMultiplier - 1)),
  };
  
  return {
    predictedPrice: Math.round(predictedPrice),
    valuationDetails,
    confidence: 85 // Hypothetical confidence score
  };
}

// Helper function to get soil quality multiplier
function getSoilMultiplier(soilType: string | undefined): number {
  if (!soilType) return 1.0;
  
  const soilTypeLower = soilType.toLowerCase();
  
  if (soilTypeLower.includes('loam')) return 1.25;
  if (soilTypeLower.includes('clay')) return 1.15;
  if (soilTypeLower.includes('silt')) return 1.18;
  if (soilTypeLower.includes('sandy')) return 1.05;
  if (soilTypeLower.includes('fertile')) return 1.3;
  
  return 1.1; // Default for unknown soil types
}

// Types
interface LandData {
  size: number;
  unit: 'sq_meters' | 'hectares' | 'acres';
  region: string;
  waterAccess: boolean;
  electricityAccess: boolean;
  roadAccess: boolean;
  irrigationAccess?: boolean;
  soilType?: string;
  distanceToCity: number; // in kilometers
}

interface PredictionResult {
  predictedPrice: number;
  valuationDetails: {
    landBaseValue: number;
    accessFactor: number;
    soilQualityFactor: number;
    locationFactor: number;
  };
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as LandData;
    
    // Validate required fields
    if (!data.size || !data.unit || !data.region || data.distanceToCity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Predict the land price
    const prediction = predictLandPrice(data);
    
    return NextResponse.json({
      success: true,
      prediction
    });
    
  } catch (error) {
    console.error('Error in land price prediction:', error);
    return NextResponse.json(
      { error: 'Failed to process the prediction' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // For documentation purposes
  return NextResponse.json({
    message: 'Land price prediction API. Please use POST method with required data.',
    requiredFields: {
      size: 'number',
      unit: 'sq_meters | hectares | acres',
      region: 'string',
      waterAccess: 'boolean',
      electricityAccess: 'boolean',
      roadAccess: 'boolean',
      distanceToCity: 'number (km)'
    },
    optionalFields: {
      irrigationAccess: 'boolean',
      soilType: 'string'
    }
  });
} 