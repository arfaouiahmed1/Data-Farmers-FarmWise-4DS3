import { LandListing, EquipmentListing, ResourceListing } from '../types';

// Sample land listing
export const landListing: LandListing = {
  id: 'land-sample-001',
  type: 'land',
  title: 'Premium Agricultural Land with Irrigation System',
  description: 'Fertile farmland with excellent soil quality, complete irrigation system, and good road access. Perfect for growing olives, vegetables or grains. Located just 10km from Sousse with easy access to markets.',
  price: 285000,
  priceType: 'sale',
  currency: 'TND',
  location: 'Sousse, Tunisia',
  images: [
    '/images/marketplace/land1.jpg',
    '/images/marketplace/land2.jpg',
    '/images/marketplace/land3.jpg'
  ],
  mainImage: '/images/marketplace/land1.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ownerId: 'user-123',
  ownerName: 'Ahmed Ben Salem',
  ownerImage: '/images/avatars/user-1.jpg',
  isActive: true,
  featuredBadge: 'Premium',
  coordinates: {
    latitude: 35.8245,
    longitude: 10.6417
  },
  size: {
    value: 12.5,
    unit: 'hectares'
  },
  soilType: 'Loamy soil with good drainage',
  currentUse: 'Olive cultivation',
  previousUse: ['Wheat', 'Vegetables'],
  access: {
    water: true,
    electricity: true,
    road: true,
    irrigation: true
  },
  additionalFeatures: [
    'Natural spring',
    'Storage shed',
    'Fenced perimeter',
    'Solar-powered pump system'
  ],
  zoning: 'Agricultural',
  predictedValue: 292000
};

// Sample equipment listing
export const equipmentListing: EquipmentListing = {
  id: 'equipment-sample-001',
  type: 'equipment',
  title: 'John Deere 5075E Tractor with Attachments',
  description: 'Well-maintained John Deere 5075E utility tractor with 75 HP engine, perfect for small to medium farms. Includes front loader and plowing attachments. Low hours (750) and excellent condition with regular maintenance.',
  price: 4200,
  priceType: 'rent',
  currency: 'TND',
  location: 'Tunis, Tunisia',
  images: [
    '/images/marketplace/tractor1.jpg',
    '/images/marketplace/tractor2.jpg'
  ],
  mainImage: '/images/marketplace/tractor1.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ownerId: 'user-456',
  ownerName: 'Karim Bouazizi',
  ownerImage: '/images/avatars/user-2.jpg',
  isActive: true,
  featuredBadge: 'Top Rated',
  category: 'Tractors & Implements',
  brand: 'John Deere',
  model: '5075E',
  manufactureYear: 2018,
  condition: 'Excellent',
  specifications: {
    engine: '75 HP Diesel Engine',
    transmission: '12F/12R PowrReverser™',
    weight: '3,600 kg',
    dimensions: '4.3m x 2.1m x 2.6m',
    features: ['GPS Guidance', 'Air Conditioning', 'Front Loader', 'Rear PTO']
  },
  rentalInfo: {
    period: 'week',
    minimumRental: 1,
    availableFrom: new Date().toISOString(),
    availableTo: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
    securityDeposit: 10000
  }
};

// Sample resource listing
export const resourceListing: ResourceListing = {
  id: 'resource-sample-001',
  type: 'resource',
  title: 'Organic Olive Tree Fertilizer (ECOCERT Certified)',
  description: 'Premium organic fertilizer specially formulated for olive trees. ECOCERT certified, this nutrient-rich blend enhances soil fertility and olive production. Made from 100% natural ingredients with no synthetic chemicals.',
  price: 950,
  priceType: 'sale',
  currency: 'TND',
  location: 'Kairouan, Tunisia',
  images: [
    '/images/marketplace/fertilizer1.jpg',
    '/images/marketplace/fertilizer2.jpg'
  ],
  mainImage: '/images/marketplace/fertilizer1.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ownerId: 'user-789',
  ownerName: 'Leila Mansour',
  ownerImage: '/images/avatars/user-3.jpg',
  isActive: true,
  featuredBadge: 'Organic',
  category: 'Fertilizers',
  quantity: {
    value: 1000,
    unit: 'kg'
  },
  expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
  certification: ['Organic', 'ECOCERT', 'Non-GMO'],
  origin: 'Tunisia'
};

// Combined listings array
export const mockListings = [
  landListing,
  equipmentListing,
  resourceListing
]; 