import { getSession } from "../auth/auth-utils";

// Use Next.js API routes instead of calling Django directly
const API_BASE_URL = '';

// Helper to fetch with authentication - use Next.js API routes
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const session = await getSession(); // Get session, which includes the accessToken
  const headers = new Headers(options.headers || {});

  if (!session?.accessToken) {
    // If we don't have a token and this is a write operation, throw an error
    if (options.method && options.method !== 'GET' && options.method !== 'HEAD') {
      throw new Error('Authentication required for this operation');
    }
    console.warn('No authentication token available for request to:', url);
  } else {
    // Use Token prefix instead of Bearer to match Django's TokenAuthentication
    headers.append('Authorization', `Token ${session.accessToken}`);
  }

  if (!(options.body instanceof FormData) && options.method !== 'GET' && options.method !== 'HEAD') {
    headers.append('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });

  // Handle authentication errors
  if (response.status === 401) {
    // Token might be invalid, clear it
    if (typeof window !== 'undefined') {
      console.warn('Authentication token is invalid or expired. Clearing session data.');
      localStorage.removeItem('farmwise_session');

      // Check if we should also clear the main token
      const responseText = await response.text();
      if (responseText.includes('Invalid token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login page if this is a critical operation
        if (options.method && options.method !== 'GET') {
          window.location.href = '/login';
        }
      }
    }

    throw new Error('Authentication required. Please log in again.');
  }

  return response;
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

    const url = `/api/marketplace/products?${queryParams.toString()}`;

    // Check if we have a valid token before making the request
    const session = await getSession();
    if (!session?.accessToken) {
      console.warn('No authentication token available for fetchProducts. Redirecting to login.');
      if (typeof window !== 'undefined') {
        // Clear any potentially invalid tokens
        localStorage.removeItem('farmwise_session');
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login page
        window.location.href = '/login';
        return []; // Return empty array while redirecting
      }
    }

    const response = await fetchWithAuth(url);

    if (!response.ok) {
      let errorText;
      try {
        // Try to parse as JSON first
        const errorJson = await response.json();
        errorText = JSON.stringify(errorJson);
      } catch {
        // If not JSON, get as text
        errorText = await response.text();
      }

      if (response.status === 401) {
        console.error('Authentication error fetching products. Token may be invalid.');
        // Clear any potentially invalid tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('farmwise_session');
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          // Redirect to login page
          window.location.href = '/login';
        }
      }

      throw new Error(`Failed to fetch products: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.map(mapProductToListing);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchMyProducts = async () => {
  try {
    const url = `/api/marketplace/products/my-products`;
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch my products: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.map(mapProductToListing);
  } catch (error) {
    console.error('Error fetching my products:', error);
    throw error;
  }
};

export const fetchProductById = async (id: string) => {
  try {
    const url = `/api/marketplace/products/${id}`;
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch product: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return mapProductToListing(data);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

export const createProduct = async (product: any) => {
  try {
    const url = `/api/marketplace/products`;
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(mapListingToProduct(product))
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create product: ${response.status} ${errorText}`);
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
    const url = `/api/marketplace/products/${id}`;
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(mapListingToProduct(product))
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update product: ${response.status} ${errorText}`);
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
    const url = `/api/marketplace/products/${id}`;
    const response = await fetchWithAuth(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete product: ${response.status} ${errorText}`);
    }

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
    const url = `/api/marketplace/categories`;
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch categories: ${response.status} ${errorText}`);
    }

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