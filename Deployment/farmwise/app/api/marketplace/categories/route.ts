import { NextRequest, NextResponse } from 'next/server';
import { mockCategories } from '../../../utils/api/mockData';

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

// For public category listing, auth might not be strictly needed,
// but including the helper for consistency if other methods are added.
async function getSession(): Promise<{ accessToken: string | null } | null> {
    console.warn('Using placeholder getSession in categories/route.ts. May not be needed for GET.');
    return { accessToken: null }; 
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const session = await getSession();
    const token = session?.accessToken;
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.append('Authorization', `Token ${token}`);
    }
    // Content-Type for GET is not usually needed
    if (!(options.body instanceof FormData) && options.method !== 'GET' && options.method !== 'HEAD') {
        headers.append('Content-Type', 'application/json');
    }
    return fetch(url, { ...options, headers });
}

// GET /api/marketplace/categories - List product categories
export async function GET(request: NextRequest) {
    try {
        const res = await fetchWithAuth(`${DJANGO_API_URL}/api/marketplace/categories/`, {
            method: 'GET',
        });
        if (!res.ok) {
            const errorData = await res.text();
            console.error('Django API error (GET categories):', res.status, errorData);
            return NextResponse.json({ message: 'Failed to fetch product categories', details: errorData }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching product categories:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/marketplace/categories - Create a new category (example, if needed later)
// export async function POST(request: NextRequest) {
//     // This would require admin/staff authentication
//     try {
//         const body = await request.json();
//         const res = await fetchWithAuth(`${DJANGO_API_URL}/api/marketplace/categories/`, {
//             method: 'POST',
//             body: JSON.stringify(body),
//         });

//         if (!res.ok) {
//             const errorData = await res.text();
//             return NextResponse.json({ message: 'Failed to create category', details: errorData }, { status: res.status });
//         }
//         const data = await res.json();
//         return NextResponse.json(data, { status: res.status });
//     } catch (error) {
//         console.error('Error creating category:', error);
//         return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//     }
// } 