import { NextRequest, NextResponse } from 'next/server';

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000';

/**
 * Validates a token by making a request to a protected endpoint
 * @param req The incoming request with the token in the Authorization header
 * @returns A response indicating if the token is valid
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ valid: false, message: 'No authorization header provided' }, { status: 401 });
    }

    // Extract the token
    let token: string | null = null;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (authHeader.startsWith('Token ')) {
      token = authHeader.substring(6);
    }

    if (!token) {
      return NextResponse.json({ valid: false, message: 'Invalid authorization header format' }, { status: 401 });
    }

    // Make a request to a protected endpoint in the Django backend
    const response = await fetch(`${DJANGO_API_URL}/core/profile/`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });

    if (response.ok) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ 
        valid: false, 
        message: 'Invalid token',
        status: response.status
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json({ 
      valid: false, 
      message: 'Error validating token',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
