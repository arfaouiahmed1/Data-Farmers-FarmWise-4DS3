// Marketplace types

// Base listing type
export interface BaseListing {
  id: string;
  title: string;
  description?: string;
  price: number;
  priceType: 'sale' | 'rent';
  currency: string;
  location: string;
  images: string[];
  mainImage?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  ownerName?: string;
  ownerImage?: string;
  isActive: boolean;
  featuredBadge?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Rental listings have a period
export interface RentalInfo {
  period: 'hour' | 'day' | 'week' | 'month' | 'year';
  minimumRental?: number;
  availableFrom?: string;
  availableTo?: string;
  securityDeposit?: number;
}

// Land listing
export interface LandListing extends BaseListing {
  type: 'land';
  size: {
    value: number;
    unit: 'sq_meters' | 'hectares' | 'acres';
  };
  boundary?: GeoJSON.Polygon;
  soilType?: string;
  currentUse?: string;
  previousUse?: string[];
  access: {
    water: boolean;
    electricity: boolean;
    road: boolean;
    irrigation?: boolean;
  };
  additionalFeatures?: string[];
  zoning?: string;
  predictedValue?: number;
  rentalInfo?: RentalInfo;
}

// Equipment listing
export interface EquipmentListing extends BaseListing {
  type: 'equipment';
  category: string;
  brand?: string;
  model?: string;
  manufactureYear?: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  specifications?: Record<string, any>;
  rentalInfo?: RentalInfo;
}

// Resource listing
export interface ResourceListing extends BaseListing {
  type: 'resource';
  category: string;
  quantity: {
    value: number;
    unit: string;
  };
  expiryDate?: string;
  certification?: string[];
  origin?: string;
}

// Union type for all listing types
export type Listing = LandListing | EquipmentListing | ResourceListing;

// Filter state
export interface FilterState {
  searchQuery: string;
  priceRange: [number, number];
  locationFilter: string | null;
  typeFilter: 'all' | 'land' | 'equipment' | 'resource';
  sortBy: 'newest' | 'price_low_high' | 'price_high_low';
  condition?: string[];
  sizeRange?: [number, number];
  availableNow?: boolean;
}

// Create listing forms
export interface CreateListingForm {
  title: string;
  description: string;
  price: number;
  priceType: 'sale' | 'rent';
  location: string;
  images: File[];
}

export interface CreateLandListingForm extends CreateListingForm {
  size: {
    value: number;
    unit: 'sq_meters' | 'hectares' | 'acres';
  };
  boundary?: GeoJSON.Polygon;
  soilType?: string;
  currentUse?: string;
  access: {
    water: boolean;
    electricity: boolean;
    road: boolean;
    irrigation?: boolean;
  };
  additionalFeatures?: string[];
  zoning?: string;
  rentalInfo?: {
    period: 'day' | 'week' | 'month' | 'year';
    minimumRental?: number;
    availableFrom?: Date;
    availableTo?: Date;
  };
}

export interface CreateEquipmentListingForm extends CreateListingForm {
  category: string;
  brand?: string;
  model?: string;
  manufactureYear?: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  specifications?: Record<string, any>;
  rentalInfo?: {
    period: 'hour' | 'day' | 'week' | 'month';
    minimumRental?: number;
    availableFrom?: Date;
    availableTo?: Date;
    securityDeposit?: number;
  };
}

export interface CreateResourceListingForm extends CreateListingForm {
  category: string;
  quantity: {
    value: number;
    unit: string;
  };
  expiryDate?: Date;
  certification?: string[];
  origin?: string;
} 