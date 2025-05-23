import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/utils/auth/auth-utils';

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const session = await getSession();
    const token = session?.accessToken;
    if (!token) {
        throw new Error('Authentication token is missing for product activation.');
    }
    const headers = new Headers(options.headers || {});
    headers.append('Authorization', `Token ${token}`);
    // Content-Type might not be needed for a POST without a body,
    // but DRF custom actions might expect it or handle its absence.
    // If issues arise, explicitly set Content-Type: application/json if backend expects it.
    return fetch(url, { ...options, headers });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        const res = await fetchWithAuth(`${DJANGO_API_URL}/api/marketplace/products/${id}/activate/`, {
            method: 'POST',
        });
        if (!res.ok) {
            const errorData = await res.text();
            console.error(`Django API error (POST activate product ${id}):`, res.status, errorData);
            if (res.status === 401 || res.status === 403) {
                return NextResponse.json({ message: 'Authentication required. Please ensure session handling is implemented.', details: errorData }, { status: res.status });
            }
            return NextResponse.json({ message: `Failed to activate product ${id}`, details: errorData }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
        console.error(`Error activating product ${id}:`, error);
        if (error.message.includes('Authentication token is missing')) {
            return NextResponse.json({ message: error.message }, { status: 401 });
        }
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}