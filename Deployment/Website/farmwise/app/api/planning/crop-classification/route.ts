import { NextRequest, NextResponse } from 'next/server';

// This would be replaced with actual ML model integration
// The ML model would be hosted in a backend service

interface ClassificationRequest {
  fieldId?: string;
  region?: string;
  soilType?: string;
  phLevel?: number;
  organicMatter?: number;
  previousCrop?: string;
  rainfall?: number;
  temperature?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ClassificationRequest = await request.json();
    
    // Validate request
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Required fields
    if ((!body.fieldId && (!body.region || !body.soilType))) {
      return NextResponse.json(
        { error: 'Either fieldId or region and soilType are required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, we would:
    // 1. Connect to a Python backend service that hosts the ML model
    // 2. Send the parameters to the model
    // 3. Return the model's predictions
    
    // For now, we're returning mock data
    const mockRecommendations = generateMockRecommendations(body);
    
    return NextResponse.json({
      success: true,
      recommendations: mockRecommendations
    });
    
  } catch (error) {
    console.error('Error in crop classification API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Define types for our adjustment objects
type CropAdjustment = Record<string, number>;
type SoilAdjustments = Record<string, CropAdjustment>;

type PhPreference = {
  min: number;
  max: number;
  optimal: number;
};
type PhPreferences = Record<string, PhPreference>;

// Mock function to generate recommendations based on input parameters
function generateMockRecommendations(params: ClassificationRequest) {
  // In a real implementation, this would call the ML model
  
  // Define crop options with base scores
  const cropOptions = [
    { crop: 'Corn', baseScore: 85 },
    { crop: 'Soybeans', baseScore: 82 },
    { crop: 'Wheat', baseScore: 78 },
    { crop: 'Cotton', baseScore: 75 },
    { crop: 'Sorghum', baseScore: 72 },
    { crop: 'Alfalfa', baseScore: 68 },
    { crop: 'Potatoes', baseScore: 65 },
    { crop: 'Rice', baseScore: 60 },
  ];
  
  // Adjust scores based on parameters
  const adjustedCrops = cropOptions.map(crop => {
    let adjustedScore = crop.baseScore;
    
    // Adjust based on soil type
    if (params.soilType) {
      const soilAdjustments: SoilAdjustments = {
        'clay-loam': { Corn: 5, Wheat: 3, Soybeans: 4 },
        'sandy-loam': { Potatoes: 10, Cotton: 5, Sorghum: 3 },
        'silty-clay': { Rice: 15, Corn: 2, Soybeans: 3 },
        'loamy-sand': { Potatoes: 8, Cotton: 7, Sorghum: 5 },
        'silt-loam': { Corn: 7, Soybeans: 5, Wheat: 4, Alfalfa: 8 },
      };
      
      const soilType = params.soilType as string;
      if (soilAdjustments[soilType] && soilAdjustments[soilType][crop.crop]) {
        adjustedScore += soilAdjustments[soilType][crop.crop] || 0;
      }
    }
    
    // Adjust based on pH level
    if (params.phLevel) {
      // Example: Corn prefers pH 5.8-7.0, Alfalfa prefers 6.5-7.5
      const phPreferences: PhPreferences = {
        Corn: { min: 5.8, max: 7.0, optimal: 6.5 },
        Soybeans: { min: 6.0, max: 7.0, optimal: 6.5 },
        Wheat: { min: 5.5, max: 7.5, optimal: 6.5 },
        Cotton: { min: 5.8, max: 8.0, optimal: 7.0 },
        Alfalfa: { min: 6.5, max: 7.5, optimal: 7.0 },
        Potatoes: { min: 5.0, max: 6.5, optimal: 5.8 },
        Rice: { min: 5.0, max: 6.5, optimal: 5.5 },
        Sorghum: { min: 5.5, max: 7.5, optimal: 6.5 },
      };
      
      if (phPreferences[crop.crop]) {
        const pref = phPreferences[crop.crop];
        if (params.phLevel < pref.min || params.phLevel > pref.max) {
          adjustedScore -= 10; // Outside range
        } else if (Math.abs(params.phLevel - pref.optimal) < 0.3) {
          adjustedScore += 5; // Near optimal
        }
      }
    }
    
    // Adjust based on organic matter
    if (params.organicMatter) {
      // Most crops benefit from organic matter between 3-5%
      if (params.organicMatter > 3 && params.organicMatter < 5) {
        adjustedScore += 3;
      } else if (params.organicMatter > 5) {
        adjustedScore += 1;
      } else if (params.organicMatter < 2) {
        adjustedScore -= 5;
      }
    }
    
    // Generate random compatibility factors for demonstration
    const factors = [
      { factor: 'Soil Type Compatibility', score: Math.floor(Math.random() * 30) + 70 },
      { factor: 'Climate Suitability', score: Math.floor(Math.random() * 30) + 70 },
      { factor: 'Water Requirements', score: Math.floor(Math.random() * 30) + 70 },
      { factor: 'Nutrient Needs', score: Math.floor(Math.random() * 30) + 70 },
    ];
    
    // Ensure score stays within 0-100 range
    adjustedScore = Math.min(98, Math.max(50, adjustedScore));
    
    return {
      crop: crop.crop,
      score: adjustedScore,
      factors
    };
  });
  
  // Sort by adjusted score and return top results
  return adjustedCrops
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
} 