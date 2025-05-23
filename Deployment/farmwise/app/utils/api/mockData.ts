// Mock data for development when Django backend is not available
export const mockProducts = [
  {
    id: 1,
    name: "Organic Wheat Seeds",
    description: "High-quality organic wheat seeds perfect for your farm. Excellent germination rate and disease resistance.",
    price: 150,
    category_name: "Seeds & Resources",
    image_url: "/images/marketplace/wheat-seeds.jpg",
    location_text: "Tunis, Tunisia",
    quantity: 50,
    unit: "kg",
    date_posted: "2024-01-15T10:00:00Z",
    is_active: true,
    seller: {
      id: 2,
      first_name: "Ahmed",
      last_name: "Ben Ali",
      username: "ahmed_farmer"
    }
  },
  {
    id: 2,
    name: "John Deere Tractor - 6M Series",
    description: "Well-maintained John Deere 6M series tractor. Perfect for medium-sized farms. Low hours, excellent condition.",
    price: 45000,
    category_name: "Farm Equipment",
    image_url: "/images/marketplace/tractor.jpg",
    location_text: "Sfax, Tunisia",
    quantity: 1,
    unit: "unit",
    date_posted: "2024-01-10T14:30:00Z",
    is_active: true,
    seller: {
      id: 3,
      first_name: "Fatima",
      last_name: "Mahmoud",
      username: "fatima_agri"
    }
  },
  {
    id: 3,
    name: "Fertile Agricultural Land",
    description: "10 hectares of prime agricultural land with water access and irrigation system. Perfect for crop farming.",
    price: 80000,
    category_name: "Agricultural Land",
    image_url: "/images/marketplace/farmland.jpg",
    location_text: "Kairouan, Tunisia",
    quantity: 10,
    unit: "hectare",
    date_posted: "2024-01-08T09:15:00Z",
    is_active: true,
    seller: {
      id: 4,
      first_name: "Mohamed",
      last_name: "Trabelsi",
      username: "mohamed_land"
    }
  },
  {
    id: 4,
    name: "Organic Fertilizer",
    description: "Premium organic fertilizer made from composted materials. Perfect for organic farming operations.",
    price: 25,
    category_name: "Fertilizers & Chemicals",
    image_url: "/images/marketplace/fertilizer.jpg",
    location_text: "Bizerte, Tunisia",
    quantity: 100,
    unit: "bag",
    date_posted: "2024-01-12T16:45:00Z",
    is_active: true,
    seller: {
      id: 5,
      first_name: "Amal",
      last_name: "Khelifi",
      username: "amal_organic"
    }
  },
  {
    id: 5,
    name: "Irrigation System Kit",
    description: "Complete drip irrigation system for 2 hectares. Includes pipes, emitters, and control unit.",
    price: 1200,
    category_name: "Irrigation Equipment",
    image_url: "/images/marketplace/irrigation.jpg",
    location_text: "Monastir, Tunisia",
    quantity: 1,
    unit: "set",
    date_posted: "2024-01-05T11:20:00Z",
    is_active: true,
    seller: {
      id: 6,
      first_name: "Youssef",
      last_name: "Bouazizi",
      username: "youssef_irrigation"
    }
  }
];

export const mockCategories = [
  { id: 1, name: "Seeds & Resources" },
  { id: 2, name: "Farm Equipment" },
  { id: 3, name: "Agricultural Land" },
  { id: 4, name: "Fertilizers & Chemicals" },
  { id: 5, name: "Irrigation Equipment" },
  { id: 6, name: "Livestock" },
  { id: 7, name: "Farm Tools" }
];
