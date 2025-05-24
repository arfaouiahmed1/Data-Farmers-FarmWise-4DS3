// Function to get the current session with access token
// This is a placeholder. Replace with your actual authentication system.
// For example, if using NextAuth.js, you would import and use getServerSession

export interface Session {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
  };
  accessToken?: string;
  expires?: string;
}

// Function to get the current session with access token
// This implementation uses localStorage for client-side session management
// In production, you should use a more secure approach like HttpOnly cookies

export interface Session {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
  };
  accessToken?: string;
  expires?: string;
}

// Function to validate token with the backend
export async function validateToken(token: string): Promise<boolean> {
  try {
    // Make a request to a protected endpoint to check if the token is valid
    const response = await fetch('/api/auth/validate-token', {
      headers: {
        'Authorization': `Token ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

export async function getSession(): Promise<Session | null> {
  // For client-side session management using localStorage
  if (typeof window !== 'undefined') {
    try {
      // First check if we have a session in farmwise_session
      const sessionData = localStorage.getItem('farmwise_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Check if session is expired
        if (session.expires && new Date(session.expires) > new Date()) {
          // Session exists and is not expired, but let's make sure the token is still valid
          try {
            const isValid = await validateToken(session.accessToken || '');
            if (isValid) {
              return session;
            } else {
              // Token is invalid, remove the session
              console.warn('Session token is invalid, removing session');
              localStorage.removeItem('farmwise_session');
            }
          } catch (e) {
            // If validation fails, still return the session but log the error
            console.error('Error validating session token:', e);
            return session;
          }
        } else {
          // Remove expired session
          localStorage.removeItem('farmwise_session');
        }
      }

      // If no farmwise_session, check if we have a token from the main auth system
      const token = localStorage.getItem('token');
      if (token) {
        // Get user data if available
        const userStr = localStorage.getItem('user');
        let user = undefined;

        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            user = {
              id: userData.id?.toString(),
              name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username,
              email: userData.email,
            };
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }

        // Create a session using the token from the main auth system
        const session: Session = {
          user,
          accessToken: token,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        };

        // Store this session for future use
        localStorage.setItem('farmwise_session', JSON.stringify(session));
        return session;
      }
    } catch (error) {
      console.error('Error parsing session data:', error);
      localStorage.removeItem('farmwise_session');
    }
  }

  // No longer return a mock session by default
  return null;
}

// Function to set session data
export async function setSession(session: Session): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem('farmwise_session', JSON.stringify(session));
  }
}

// Function to check if the user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();

    if (!session?.accessToken) {
      return false;
    }

    // Optionally validate the token with the backend
    try {
      const isValid = await validateToken(session.accessToken);
      return isValid;
    } catch (e) {
      // If validation fails, still return true if we have a token
      // This prevents unnecessary logouts if the validation endpoint is temporarily unavailable
      console.warn('Token validation failed, but token exists:', e);
      return true;
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

// Function to get the current user ID
export async function getCurrentUserId(): Promise<string | undefined> {
  const session = await getSession();
  return session?.user?.id;
}

// Function to logout
export async function logout(): Promise<void> {
  // Clear all session data
  if (typeof window !== 'undefined') {
    localStorage.removeItem('farmwise_session');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Optionally redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}