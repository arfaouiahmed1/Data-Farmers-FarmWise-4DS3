import { NextRequest, NextResponse } from 'next/server';

// Placeholder for session management - replace with your actual session logic
async function getSession(): Promise<{ accessToken: string | null } | null> {
    // In a real scenario, you would fetch the session and token here.
    // For example, using next-auth: import { getServerSession } from 'next-auth/next';
    // const session = await getServerSession(authOptions); // authOptions would be your NextAuth config
    // return { accessToken: session?.accessToken || null };
    console.warn('Using placeholder getSession. Implement actual session handling.');
    return { accessToken: null }; // Or a test token if your backend requires auth for GET
}

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

// Helper function to fetch with authorization
async function fetchWithAuth(url: string, options: RequestInit = {}) {
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
}

// GET /api/marketplace/products - List products
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const sellerId = searchParams.get('sellerId');

    let apiUrl = `${DJANGO_API_URL}/api/marketplace/products/`;
    const queryParams = new URLSearchParams();
    if (categoryId) queryParams.append('category_id', categoryId);
    if (sellerId) queryParams.append('seller_id', sellerId);

    if (queryParams.toString()) {
        apiUrl += `?${queryParams.toString()}`;
    }

    try {
        // For listing products, token might be optional if public
        const res = await fetchWithAuth(apiUrl, { method: 'GET' }); 
        if (!res.ok) {
            const errorData = await res.text();
            console.error('Django API error (GET products):', res.status, errorData);
            return NextResponse.json({ message: 'Failed to fetch products', details: errorData }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/marketplace/products - Create a new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // For creating products, token is likely required
        const res = await fetchWithAuth(`${DJANGO_API_URL}/api/marketplace/products/`, {
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