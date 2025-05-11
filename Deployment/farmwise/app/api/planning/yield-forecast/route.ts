import { NextRequest, NextResponse } from 'next/server';

// This would be replaced with actual ML model integration
// The ML model would be hosted in a backend service

interface YieldPredictionRequest {
  fieldId?: string;
  crop: string;
  soilMoisture?: number;
  fertilizerRate?: number;
  seedRate?: number;
  plantingDate?: string;
  pestPressure?: number;
  expectedTemperature?: number;
  expectedRainfall?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: YieldPredictionRequest = await request.json();
    
    // Validate request
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Required fields
    if (!body.crop) {
      return NextResponse.json(
        { error: 'Crop type is required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, we would:
    // 1. Connect to a Python backend service that hosts the ML model
    // 2. Send the parameters to the model
    // 3. Return the model's predictions
    
    // For now, we're returning mock data
    const mockPrediction = generateMockPrediction(body);
    
    return NextResponse.json({
      success: true,
      prediction: mockPrediction
    });
    
  } catch (error) {
    console.error('Error in yield prediction API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock function to generate yield prediction based on input parameters
function generateMockPrediction(params: YieldPredictionRequest) {
  // Base yield values by crop (bushels per acre)
  const baseYields: Record<string, number> = {
    'corn': 180,
    'soybeans': 55,
    'wheat': 75,
    'cotton': 1200, // lbs/acre
    'sorghum': 90,
    'potatoes': 350, // cwt/acre
    'rice': 7500, // lbs/acre
  };
  
  // Get base yield for the requested crop
  const baseYield = baseYields[params.crop.toLowerCase()] || 100;
  
  // Apply adjustments based on environmental factors
  let adjustedYield = baseYield;
  
  // Soil moisture adjustment
  if (params.soilMoisture !== undefined) {
    // Optimal soil moisture is typically 50-70%
    const moistureAdjustment = 
      params.soilMoisture < 30 ? -0.15 : // Too dry
      params.soilMoisture > 80 ? -0.10 : // Too wet
      params.soilMoisture > 50 && params.soilMoisture < 70 ? 0.05 : // Optimal
      0; // Neutral
    
    adjustedYield *= (1 + moistureAdjustment);
  }
  
  // Fertilizer rate adjustment
  if (params.fertilizerRate !== undefined) {
    // Different crops have different fertilizer requirements
    const optimalRate: Record<string, number> = {
      'corn': 180,
      'soybeans': 30, // Soybeans need less nitrogen due to nitrogen fixation
      'wheat': 120,
      'cotton': 100,
      'sorghum': 100,
      'potatoes': 200,
      'rice': 150,
    };
    
    const optimal = optimalRate[params.crop.toLowerCase()] || 150;
    const fertilizerEfficiency = Math.min(1.2, Math.max(0.7, params.fertilizerRate / optimal));
    
    // Diminishing returns after optimal rate
    const fertilizerAdjustment = 
      fertilizerEfficiency < 0.8 ? -0.2 * (1 - fertilizerEfficiency) : // Under-fertilized
      fertilizerEfficiency > 1.1 ? 0.02 : // Over-fertilized (small benefit)
      fertilizerEfficiency >= 0.95 && fertilizerEfficiency <= 1.05 ? 0.05 : // Optimal
      0.02; // Near optimal
    
    adjustedYield *= (1 + fertilizerAdjustment);
  }
  
  // Seed rate adjustment
  if (params.seedRate !== undefined) {
    // Simplified adjustment; in reality this would depend on plant spacing, variety, etc.
    const seedRateImpact = Math.random() * 0.08 - 0.04; // Random between -4% and +4%
    adjustedYield *= (1 + seedRateImpact);
  }
  
  // Pest pressure adjustment
  if (params.pestPressure !== undefined) {
    // Higher pest pressure reduces yield
    const pestAdjustment = -(params.pestPressure / 100) * 0.3; // Up to 30% reduction at 100% pest pressure
    adjustedYield *= (1 + pestAdjustment);
  }
  
  // Weather expectations
  if (params.expectedRainfall !== undefined) {
    // Simplified; different crops have different rainfall needs
    const rainfallAdjustment = Math.random() * 0.1 - 0.05; // Random between -5% and +5%
    adjustedYield *= (1 + rainfallAdjustment);
  }
  
  if (params.expectedTemperature !== undefined) {
    // Simplified; temperature impact varies by crop
    const temperatureAdjustment = Math.random() * 0.1 - 0.05; // Random between -5% and +5%
    adjustedYield *= (1 + temperatureAdjustment);
  }
  
  // Round to appropriate precision
  adjustedYield = Math.round(adjustedYield * 10) / 10;
  
  // Calculate confidence score (higher when more parameters are provided)
  let confidenceBase = 75; // Base confidence
  let parameterCount = 0;
  
  // Count number of parameters provided
  if (params.soilMoisture !== undefined) parameterCount++;
  if (params.fertilizerRate !== undefined) parameterCount++;
  if (params.seedRate !== undefined) parameterCount++;
  if (params.plantingDate !== undefined) parameterCount++;
  if (params.pestPressure !== undefined) parameterCount++;
  if (params.expectedTemperature !== undefined) parameterCount++;
  if (params.expectedRainfall !== undefined) parameterCount++;
  
  // Adjust confidence based on parameters provided
  const confidenceScore = Math.min(95, confidenceBase + (parameterCount * 3));
  
  // Generate key factors affecting yield
  const keyFactors = [];
  
  if (params.soilMoisture !== undefined) {
    const impact = params.soilMoisture > 40 && params.soilMoisture < 70 ? 'Positive' : 'Negative';
    keyFactors.push({
      factor: 'Soil Moisture',
      impact,
      description: impact === 'Positive' ? 'Optimal moisture levels for plant growth' : 'Suboptimal moisture may stress plants'
    });
  }
  
  if (params.fertilizerRate !== undefined) {
    const impact = params.fertilizerRate > 100 ? 'Positive' : 'Negative';
    keyFactors.push({
      factor: 'Fertilization',
      impact,
      description: impact === 'Positive' ? 'Good nutrient availability for crop development' : 'Insufficient nutrients may limit yield potential'
    });
  }
  
  if (params.pestPressure !== undefined) {
    const impact = params.pestPressure < 30 ? 'Positive' : 'Negative';
    keyFactors.push({
      factor: 'Pest & Disease',
      impact,
      description: impact === 'Positive' ? 'Low pest pressure expected' : 'High pest pressure may reduce yield'
    });
  }
  
  // Generate historical comparison (random for mock data)
  const historicalYield = adjustedYield * (Math.random() * 0.2 + 0.9); // 90-110% of predicted
  const percentChange = ((adjustedYield - historicalYield) / historicalYield) * 100;
  
  return {
    yield: adjustedYield,
    confidenceScore: Math.round(confidenceScore),
    keyFactors,
    historicalComparison: {
      previousYield: Math.round(historicalYield * 10) / 10,
      percentChange: Math.round(percentChange * 10) / 10
    },
    units: params.crop.toLowerCase() === 'cotton' || params.crop.toLowerCase() === 'rice' ? 'lbs/acre' : 
           params.crop.toLowerCase() === 'potatoes' ? 'cwt/acre' : 'bushels/acre',
  };
} 