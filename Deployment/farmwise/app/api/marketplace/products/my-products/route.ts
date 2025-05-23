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

  console.error("getTokenFromRequest (my-products): No Authorization header with token found.");
  return null;
}

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

// Helper function to fetch with authorization
async function fetchWithAuth(url: string, token: string | null, options: RequestInit = {}) {
    const headers = new Headers(options.headers || {});

    if (!token) {
        throw new Error('Authentication token is required for this endpoint');
    }

    headers.append('Authorization', `Token ${token}`);
    if (!(options.body instanceof FormData) && options.method !== 'GET' && options.method !== 'HEAD') {
        headers.append('Content-Type', 'application/json');
    }
    return fetch(url, { ...options, headers });
}

// GET /api/marketplace/products/my-products - List products for the current user
export async function GET(request: NextRequest) {
    try {
        const token = await getTokenFromRequest(request);

        // Require authentication token
        if (!token) {
            return NextResponse.json(
                { message: 'Authentication required', details: 'No valid authentication token provided' },
                { status: 401 }
            );
        }

        const res = await fetchWithAuth(`${DJANGO_API_URL}/api/marketplace/products/my_products/`, token, {
            method: 'GET'
        });

        if (!res.ok) {
            const errorData = await res.text();
            console.error('Django API error (GET my_products):', res.status, errorData);
            return NextResponse.json(
                { message: 'Failed to fetch my products from backend', details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching my_products:', error);
        return NextResponse.json(
            { message: 'Internal server error while fetching my products', details: error.message },
            { status: 500 }
        );
    }
}