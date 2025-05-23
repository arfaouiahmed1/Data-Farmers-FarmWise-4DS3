import { NextRequest, NextResponse } from 'next/server';

// Function to get the token from the request (e.g., from a session or a header)
async function getTokenFromRequest(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7); // Extract token after 'Bearer '
  }
  if (authHeader?.startsWith('Token ')) {
    return authHeader.substring(6); // Extract token after 'Token '
  }

  console.error("getTokenFromRequest: No Authorization header with token found.");
  return null;
}

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

// Helper function to fetch with authorization
async function fetchWithAuth(url: string, token: string | null, options: RequestInit = {}) {
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.append('Authorization', `Token ${token}`);
    }

    if (!(options.body instanceof FormData) && options.method !== 'GET' && options.method !== 'HEAD') {
        headers.append('Content-Type', 'application/json');
    }

    return fetch(url, { ...options, headers });
}

// GET /api/marketplace/products - List products
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const sellerId = searchParams.get('sellerId');
    const token = await getTokenFromRequest(request);

    // Require authentication token
    if (!token) {
        return NextResponse.json(
            { message: 'Authentication required', details: 'No valid authentication token provided' },
            { status: 401 }
        );
    }

    let apiUrl = `${DJANGO_API_URL}/api/marketplace/products/`;
    const queryParams = new URLSearchParams();
    if (categoryId) queryParams.append('category_id', categoryId);
    if (sellerId) queryParams.append('seller_id', sellerId);

    if (queryParams.toString()) {
        apiUrl += `?${queryParams.toString()}`;
    }

    try {
        const res = await fetchWithAuth(apiUrl, token, { method: 'GET' });
        if (!res.ok) {
            const errorData = await res.text();
            console.error('Django API error (GET products):', res.status, errorData);
            return NextResponse.json({ message: 'Failed to fetch products from backend', details: errorData }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ message: 'Internal server error while fetching products', details: error.message }, { status: 500 });
    }
}

// POST /api/marketplace/products - Create a new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const token = await getTokenFromRequest(request);

        // For creating products, token is likely required
        const res = await fetchWithAuth(`${DJANGO_API_URL}/api/marketplace/products/`, token, {
            method: 'POST',
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.text();
            console.error('Django API error (POST product):', res.status, errorData);
            return NextResponse.json({ message: 'Failed to create product', details: errorData }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data, { status: res.status }); // Usually 201 Created
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}