export interface CropClassification {
    id: number;
    farm: number;
    soil_n: number;
    soil_p: number;
    soil_k: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
    area: number;
    fertilizer_amount: number;
    pesticide_amount: number;
    governorate: string;
    district?: string;
    irrigation: string;
    fertilizer_type: string;
    planting_season: string;
    growing_season: string;
    harvest_season: string;
    recommended_crop: {
        id: number;
        name: string;
    } | null;
    confidence_score: number | null;
    created_at: string;
    updated_at: string;
}

export interface CropClassificationInput {
    farm: number;
    soil_n: number;
    soil_p: number;
    soil_k: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
    area: number;
    fertilizer_amount: number;
    pesticide_amount: number;
    governorate: string;
    district?: string;
    irrigation: string;
    fertilizer_type: string;
    planting_season: string;
    growing_season: string;
    harvest_season: string;
}
