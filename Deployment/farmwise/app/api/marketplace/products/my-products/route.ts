import { NextRequest, NextResponse } from 'next/server';

// Placeholder for session management - replace with your actual session logic
async function getSession(): Promise<{ accessToken: string | null } | null> {
    console.warn('Using placeholder getSession in my-products/route.ts. Implement actual session handling.');
    // For this route, a token is essential.
    // Example: return { accessToken: "your_test_token" }; 
    return { accessToken: null }; // This will likely cause the backend to return 401/403 without a real token
}

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

// Helper function to fetch with authorization
async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const session = await getSession();
    const token = session?.accessToken;

    if (!token) {
        // Handle missing token for routes that absolutely require authentication
        throw new Error('Authentication token is missing. Please implement getSession.');
    }

    const headers = new Headers(options.headers || {});
    headers.append('Authorization', `Token ${token}`);
    if (!(options.body instanceof FormData) && options.method !== 'GET' && options.method !== 'HEAD') {
        headers.append('Content-Type', 'application/json');
    }
    return fetch(url, { ...options, headers });
}

// GET /api/marketplace/products/my-products - List products for the current user
export async function GET(request: NextRequest) {
    try {
        const res = await fetchWithAuth(`${DJANGO_API_URL}/api/marketplace/products/my_products/`, { 
            method: 'GET' 
        });
        
        if (!res.ok) {
            const errorData = await res.text();
            console.error('Django API error (GET my_products):', res.status, errorData);
            // If the placeholder token is null, this will likely be a 401 or 403 error.
            if (res.status === 401 || res.status === 403) {
                 return NextResponse.json({ message: 'Authentication required to fetch your products. Please ensure session handling is implemented.', details: errorData }, { status: res.status });
            }
            return NextResponse.json({ message: 'Failed to fetch your products', details: errorData }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching my_products:', error);
        if (error.message.includes('Authentication token is missing')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
} 