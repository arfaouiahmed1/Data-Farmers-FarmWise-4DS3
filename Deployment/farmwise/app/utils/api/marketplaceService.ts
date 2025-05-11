import { getSession } from "../auth/auth-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000';

// Helper to fetch with authentication
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const session = await getSession();
  const token = session?.accessToken;

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.append('Authorization', `Token ${token}`);
  }
  if (!(options.body instanceof FormData) && options.method !== 'GET' && options.method !== 'HEAD') {
    headers.append('Content-Type', 'application/json');
  }

  return fetch(url, { ...options, headers });
};

// Mapping functions to convert between backend and frontend data models
export const mapProductToListing = (product: any) => {
  // Determine listing type based on category
  let listingType = 'resource'; // Default
  if (product.category_name.toLowerCase().includes('land') || 
      product.category_name.toLowerCase().includes('farm')) {
    listingType = 'land';
  } else if (product.category_name.toLowerCase().includes('equipment') || 
             product.category_name.toLowerCase().includes('machinery') ||
             product.category_name.toLowerCase().includes('tool')) {
    listingType = 'equipment';
  }

  // Base listing properties
  const listing = {
    id: product.id.toString(),
    type: listingType,
    title: product.name,
    description: product.description,
    price: product.price,
    priceType: 'sale', // Default, can be customized if backend adds this field
    currency: 'TND', // Default, can be customized if backend adds this field
    location: product.location_text || 'Tunisia',
    images: product.image_url ? [product.image_url] : [],
    mainImage: product.image_url,
    createdAt: product.date_posted,
    updatedAt: product.date_posted,
    ownerId: product.seller.id.toString(),
    ownerName: `${product.seller.first_name} ${product.seller.last_name}`.trim() || product.seller.username,
    ownerImage: '/images/avatars/default.jpg', // Default avatar
    isActive: product.is_active,
    featuredBadge: '',
    status: product.is_active ? 'active' : 'deactivated',
  };

  // Add type-specific properties
  if (listingType === 'land') {
    return {
      ...listing,
      size: {
        value: product.quantity,
        unit: product.unit === 'acre' ? 'acres' : (product.unit === 'hectare' ? 'hectares' : 'sq_meters')
      },
      access: {
        water: true,
        electricity: true,
        road: true,
        irrigation: false
      }
    };
  } else if (listingType === 'equipment') {
    return {
      ...listing,
      category: product.category_name,
      brand: '',
      model: '',
      condition: 'Good',
    };
  } else {
    return {
      ...listing,
      category: product.category_name,
      quantity: {
        value: product.quantity,
        unit: product.unit
      }
    };
  }
};

export const mapListingToProduct = (listing: any) => {
  return {
    name: listing.title,
    description: listing.description,
    price: listing.price,
    category: listing.category || listing.category_id,
    image_url: listing.mainImage || (listing.images && listing.images.length > 0 ? listing.images[0] : ''),
    location_text: listing.location,
    quantity: listing.type === 'land' ? listing.size.value : 
              listing.type === 'resource' ? listing.quantity.value : 1,
    unit: listing.type === 'land' ? (listing.size.unit === 'acres' ? 'acre' : 
                                     listing.size.unit === 'hectares' ? 'hectare' : 'sq_meters') :
          listing.type === 'resource' ? listing.quantity.unit : 'unit',
    is_active: listing.isActive || true
  };
};

// Products / Listings API calls
export const fetchProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    
    const url = `${API_BASE_URL}/api/marketplace/products/?${queryParams.toString()}`;
    const response = await fetchWithAuth(url);
    
    if (!response.ok) throw new Error('Failed to fetch products');
    
    const data = await response.json();
    return data.map(mapProductToListing);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchMyProducts = async () => {
  try {
    const url = `${API_BASE_URL}/api/marketplace/products/my_products/`;
    const response = await fetchWithAuth(url);
    
    if (!response.ok) throw new Error('Failed to fetch my products');
    
    const data = await response.json();
    return data.map(mapProductToListing);
  } catch (error) {
    console.error('Error fetching my products:', error);
    throw error;
  }
};

export const fetchProductById = async (id: string) => {
  try {
    const url = `${API_BASE_URL}/api/marketplace/products/${id}/`;
    const response = await fetchWithAuth(url);
    
    if (!response.ok) throw new Error('Failed to fetch product');
    
    const data = await response.json();
    return mapProductToListing(data);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

export const createProduct = async (product: any) => {
  try {
    const url = `${API_BASE_URL}/api/marketplace/products/`;
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(mapListingToProduct(product))
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create product');
    }
    
    const data = await response.json();
    return mapProductToListing(data);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, product: any) => {
  try {
    const url = `${API_BASE_URL}/api/marketplace/products/${id}/`;
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(mapListingToProduct(product))
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to update product');
    }
    
    const data = await response.json();
    return mapProductToListing(data);
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const url = `${API_BASE_URL}/api/marketplace/products/${id}/`;
    const response = await fetchWithAuth(url, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete product');
    
    return true;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

export const activateProduct = async (id: string) => {
  try {
    const url = `${API_BASE_URL}/api/marketplace/products/${id}/activate/`;
    const response = await fetchWithAuth(url, {
      method: 'POST'
    });
    
    if (!response.ok) throw new Error('Failed to activate product');
    
    return await response.json();
  } catch (error) {
    console.error(`Error activating product ${id}:`, error);
    throw error;
  }
};

export const deactivateProduct = async (id: string) => {
  try {
    const url = `${API_BASE_URL}/api/marketplace/products/${id}/deactivate/`;
    const response = await fetchWithAuth(url, {
      method: 'POST'
    });
    
    if (!response.ok) throw new Error('Failed to deactivate product');
    
    return await response.json();
  } catch (error) {
    console.error(`Error deactivating product ${id}:`, error);
    throw error;
  }
};

// Categories API calls
export const fetchCategories = async () => {
  try {
    const url = `${API_BASE_URL}/api/marketplace/categories/`;
    const response = await fetchWithAuth(url);
    
    if (!response.ok) throw new Error('Failed to fetch categories');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Orders API calls
export const fetchMyOrders = async () => {
  try {
    const url = `${API_BASE_URL}/api/marketplace/orders/`;
    const response = await fetchWithAuth(url);
    
    if (!response.ok) throw new Error('Failed to fetch orders');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const fetchOrderById = async (id: string) => {
  try {
    const url = `${API_BASE_URL}/api/marketplace/orders/${id}/`;
    const response = await fetchWithAuth(url);
    
    if (!response.ok) throw new Error('Failed to fetch order');
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

export const createOrder = async (order: any) => {
  try {
    const url = `${API_BASE_URL}/api/marketplace/orders/`;
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(order)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create order');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const cancelOrder = async (id: string) => {
  try {
    const url = `${API_BASE_URL}/api/marketplace/orders/${id}/cancel_order/`;
    const response = await fetchWithAuth(url, {
      method: 'POST'
    });
    
    if (!response.ok) throw new Error('Failed to cancel order');
    
    return await response.json();
  } catch (error) {
    console.error(`Error cancelling order ${id}:`, error);
    throw error;
  }
};

export const updateOrderStatus = async (id: string, status: string) => {
  try {
    const url = `${API_BASE_URL}/api/marketplace/orders/${id}/update-status/`;
    const response = await fetchWithAuth(url, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) throw new Error('Failed to update order status');
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating order status ${id}:`, error);
    throw error;
  }
};

// Price prediction API (placeholder for future implementation)
export const predictPrice = async (listingData: any) => {
  try {
    const url = `${API_BASE_URL}/api/marketplace/predict-price/`;
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(listingData)
    });
    
    if (!response.ok) throw new Error('Failed to predict price');
    
    return await response.json();
  } catch (error) {
    console.error('Error predicting price:', error);
    throw error;
  }
}; 