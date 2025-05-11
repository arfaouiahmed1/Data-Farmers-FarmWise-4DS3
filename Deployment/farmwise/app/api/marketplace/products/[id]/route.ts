import { NextRequest, NextResponse } from 'next/server';

// Placeholder for session management - replace with your actual session logic
async function getSession(): Promise<{ accessToken: string | null } | null> {
    console.warn('Using placeholder getSession in [id]/route.ts. Implement actual session handling.');
    // Example: return { accessToken: "your_test_token_if_needed" }; 
    return { accessToken: null }; 
}

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

// Helper function to fetch with authorization (consistent with the other route file)
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

// GET /api/marketplace/products/{id} - Get a specific product
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        const res = await fetchWithAuth(`${DJANGO_API_URL}/api/marketplace/products/${id}/`, { 
            method: 'GET' 
        });
        if (!res.ok) {
            const errorData = await res.text();
            return NextResponse.json({ message: `Failed to fetch product ${id}`, details: errorData }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/marketplace/products/{id} - Update a product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        const body = await request.json();
        const res = await fetchWithAuth(`${DJANGO_API_URL}/api/marketplace/products/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.text();
            return NextResponse.json({ message: `Failed to update product ${id}`, details: errorData }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`Error updating product ${id}:`, error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/marketplace/products/{id} - Delete a product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        const res = await fetchWithAuth(`${DJANGO_API_URL}/api/marketplace/products/${id}/`, {
            method: 'DELETE',
        });

        if (!res.ok) {
            const errorData = await res.text();
            // Django DELETE often returns 204 No Content on success, check for that
            if (res.status === 204) {
                return NextResponse.json(null, { status: 204 });    
            }
            return NextResponse.json({ message: `Failed to delete product ${id}`, details: errorData }, { status: res.status });
        }
        // If res.ok and not 204 (e.g. DRF sometimes returns 200 with obj before delete), handle as success or adapt based on actual backend
        if (res.status === 204) { 
             return NextResponse.json(null, { status: 204 });
        }
        const data = await res.json(); // Or simply return 204 if no body
        return NextResponse.json(data); // Or just status 200/204

    } catch (error) {
        console.error(`Error deleting product ${id}:`, error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
} 