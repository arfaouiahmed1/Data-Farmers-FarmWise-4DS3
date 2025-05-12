/**
 * API routes configuration
 * Contains all the backend API endpoints used in the application
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const API_ROUTES = {
  // Auth routes
  LOGIN: `${API_BASE_URL}/core/login/`,
  REGISTER: `${API_BASE_URL}/core/register/`,
  PROFILE: `${API_BASE_URL}/core/profile/`,
  
  // Farm routes
  FARMS: `${API_BASE_URL}/core/farms/`,
  USER_FARMS: `${API_BASE_URL}/core/user-farms/`,
  FARM_DETAIL: (id: number) => `${API_BASE_URL}/core/farms/${id}/`,
  
  // Crop classification
  CROP_CLASSIFICATION: `${API_BASE_URL}/api/crop-classification/`,
  CROP_CLASSIFICATION_DETAIL: (id: number) => `${API_BASE_URL}/api/crop-classification/${id}/`,
}; 