import React, { createContext, useState, useEffect, useCallback } from 'react';
import API from '../api';
import { jwtDecode } from 'jwt-decode'; // Ensure installed: npm install jwt-decode

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const decodeAndSetUser = useCallback((newToken) => {
    if (!newToken) {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      return;
    }

    try {
      const decoded = jwtDecode(newToken);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        throw new Error('Token expired');
      }

      setToken(newToken);
      setUser({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      });
      localStorage.setItem('token', newToken);
    } catch (err) {
      console.error('Token error:', err.message);
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
    }
  }, []);

  useEffect(() => {
    const existingToken = localStorage.getItem('token');
    decodeAndSetUser(existingToken);
    setLoading(false);
  }, [decodeAndSetUser]);

  // Listen to changes in token across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        decodeAndSetUser(localStorage.getItem('token'));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [decodeAndSetUser]);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await API.post('/auth/login', { email, password });
      decodeAndSetUser(res.data.token);
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed.';
      console.error(message);
      setError(message);
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      const res = await API.post('/auth/register', { name, email, password });
      decodeAndSetUser(res.data.token);
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      console.error(message);
      setError(message);
    }
  };

  const logout = () => {
    decodeAndSetUser(null);
  };

  const isAuthenticated = !!token && !!user;

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
