import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/utils/auth/auth-utils';

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

// Helper function to fetch with authorization (consistent with the other route file)
async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const session = await getSession();
    const token = session?.accessToken;

    // Require authentication token for non-GET requests
    if (!token && options.method && options.method !== 'GET') {
        throw new Error('Authentication token is required for this operation');
    }

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
            if (res.status === 401 || res.status === 403) {
                return NextResponse.json({
                    message: 'Authentication required or permission denied',
                    details: errorData
                }, { status: res.status });
            }
            return NextResponse.json({ message: `Failed to update product ${id}`, details: errorData }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error(`Error updating product ${id}:`, error);
        if (error.message && error.message.includes('Authentication token is required')) {
            return NextResponse.json({
                message: 'Authentication required',
                details: error.message
            }, { status: 401 });
        }
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
            if (res.status === 401 || res.status === 403) {
                return NextResponse.json({
                    message: 'Authentication required or permission denied',
                    details: errorData
                }, { status: res.status });
            }
            return NextResponse.json({ message: `Failed to delete product ${id}`, details: errorData }, { status: res.status });
        }
        // If res.ok and not 204 (e.g. DRF sometimes returns 200 with obj before delete), handle as success or adapt based on actual backend
        if (res.status === 204) {
             return NextResponse.json(null, { status: 204 });
        }
        const data = await res.json(); // Or simply return 204 if no body
        return NextResponse.json(data); // Or just status 200/204

    } catch (error: any) {
        console.error(`Error deleting product ${id}:`, error);
        if (error.message && error.message.includes('Authentication token is required')) {
            return NextResponse.json({
                message: 'Authentication required',
                details: error.message
            }, { status: 401 });
        }
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}