import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clear any malformed tokens on app start
  const clearMalformedTokens = () => {
    const token = localStorage.getItem('token');
    // Check for mock tokens, short tokens, or tokens that don't look like JWTs
    if (token === 'mock-jwt-token' || 
        (token && token.length < 50) || 
        (token && !token.includes('.')) ||
        (token && token.split('.').length !== 3)) {
      console.log('Clearing malformed token:', token?.substring(0, 20) + '...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return true; // Token was cleared
    }
    return false; // Token is valid format
  };

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      // First clear any malformed tokens
      clearMalformedTokens();
      
      const token = localStorage.getItem('token');
      
      // If no valid token, just set loading to false
      if (!token) {
        setLoading(false);
        return;
      }
      
      if (token) {
        try {
          // Verify token with backend
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.log('Token verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Real login function
  const login = async (email, password, skipPasswordCheck = false, token = null) => {
    setLoading(true);
    
    try {
      // If token provided (from email verification), use it directly
      if (skipPasswordCheck && token) {
        // Verify the provided token
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setLoading(false);
          return { success: true, user: data.user };
        }
      }
      
      // Try real API login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setLoading(false);
        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        setLoading(false);
        return { 
          success: false, 
          error: errorData.message || 'Login failed',
          requiresVerification: errorData.requiresVerification,
          userId: errorData.userId,
          email: errorData.email
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Real register function
  const register = async (userData) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if email verification is required
        if (data.requiresVerification) {
          setLoading(false);
          return { 
            success: true, 
            requiresVerification: true,
            userId: data.userId,
            email: data.email,
            message: data.message
          };
        }
        
        // Direct login (for OAuth users)
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setLoading(false);
        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        setLoading(false);
        return { success: false, error: errorData.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Force clear all auth data (useful for debugging)
  const clearAllAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('All authentication data cleared');
  };

  // Make clearAllAuthData available globally for debugging
  if (typeof window !== 'undefined') {
    window.clearAuthData = clearAllAuthData;
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    clearAllAuthData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};