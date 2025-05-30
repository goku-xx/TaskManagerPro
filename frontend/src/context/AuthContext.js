import React, { createContext, useState, useEffect, useCallback } from 'react';
import API from '../api';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const decodeAndSetUser = useCallback((newToken) => {
    console.log('decodeAndSetUser called with token:', newToken ? 'exists' : 'null');
    
    if (!newToken) {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      return;
    }

    try {
      const decoded = jwtDecode(newToken);
      console.log('Decoded JWT:', decoded);
      
      const isExpired = decoded.exp * 1000 < Date.now();
      console.log('Token expired?', isExpired);

      if (isExpired) {
        throw new Error('Token expired');
      }

      setToken(newToken);
      
      // Create user object from decoded JWT
      // Handle different possible JWT structures
      const userData = {
        id: decoded.id || decoded.userId || decoded.user?.id || decoded._id,
        email: decoded.email || decoded.user?.email,
        role: decoded.role || decoded.user?.role,
        name: decoded.name || decoded.user?.name,
      };
      
      console.log('Setting user data:', userData);
      setUser(userData);
      localStorage.setItem('token', newToken);
      
    } catch (err) {
      console.error('Token decode error:', err.message);
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
    }
  }, []);

  useEffect(() => {
    console.log('AuthProvider mounting, checking existing token...');
    const existingToken = localStorage.getItem('token');
    console.log('Existing token:', existingToken ? 'found' : 'not found');
    
    if (existingToken) {
      decodeAndSetUser(existingToken);
    }
    setLoading(false);
  }, [decodeAndSetUser]);

  // Listen to changes in token across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        console.log('Storage change detected for token');
        decodeAndSetUser(localStorage.getItem('token'));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [decodeAndSetUser]);

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Attempting login...');
      const res = await API.post('/auth/login', { email, password });
      console.log('Login response:', res.data);
      decodeAndSetUser(res.data.token);
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed.';
      console.error('Login error:', message);
      setError(message);
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      console.log('Attempting registration...');
      const res = await API.post('/auth/register', { name, email, password });
      console.log('Register response:', res.data);
      decodeAndSetUser(res.data.token);
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      console.error('Register error:', message);
      setError(message);
    }
  };

  const logout = () => {
    console.log('Logging out...');
    decodeAndSetUser(null);
  };

  const isAuthenticated = !!token && !!user && !!user.id;

  // Debug: Log current auth state
  useEffect(() => {
    console.log('Auth state updated:', {
      hasToken: !!token,
      hasUser: !!user,
      userId: user?.id,
      isAuthenticated
    });
  }, [token, user, isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        logout,
        register,
        loading,
        error,
        setError,
      }}
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
          <span>Loading authentication...</span>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};