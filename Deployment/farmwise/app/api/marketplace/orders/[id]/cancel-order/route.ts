import { NextRequest, NextResponse } from 'next/server';

// Placeholder for session management
async function getSession(): Promise<{ accessToken: string | null } | null> {
    console.warn('Using placeholder getSession in cancel-order/route.ts. Implement actual session handling.');
    return { accessToken: null }; // Requires a real token
}

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const session = await getSession();
    const token = session?.accessToken;
    if (!token) {
        throw new Error('Authentication token is missing for cancelling order.');
    }
    const headers = new Headers(options.headers || {});
    headers.append('Authorization', `Token ${token}`);
    // For POST without body, Content-Type might not be strictly needed by backend,
    // but if issues, add: headers.append('Content-Type', 'application/json');
    return fetch(url, { ...options, headers });
}

// POST /api/marketplace/orders/{id}/cancel-order - Cancel an order
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        const res = await fetchWithAuth(`${DJANGO_API_URL}/api/marketplace/orders/${id}/cancel_order/`, {
            method: 'POST',
            // No body needed for this action based on backend design
        });
        if (!res.ok) {
            const errorData = await res.text();
            console.error(`Django API error (POST cancel_order ${id}):`, res.status, errorData);
            if (res.status === 401 || res.status === 403) {
                return NextResponse.json({ message: 'Authentication required or not authorized. Please ensure session handling is implemented.', details: errorData }, { status: res.status });
            }
            return NextResponse.json({ message: `Failed to cancel order ${id}`, details: errorData }, { status: res.status });
        }
        const data = await res.json(); // Django backend returns {status: 'order cancelled'}
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error(`Error cancelling order ${id}:`, error);
        if (error.message.includes('Authentication token is missing')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
} 