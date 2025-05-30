import React, { createContext, useState, useEffect, useCallback } from 'react';
import API from '../api';
import { jwtDecode } from 'jwt-decode'; // You might need to install jwt-decode: npm install jwt-decode

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateUserFromToken = useCallback((currentToken) => {
    if (currentToken) {
      try {
        const decodedUser = jwtDecode(currentToken); // Assumes token contains user info like id, role
        setUser({ id: decodedUser.id, email: decodedUser.email, role: decodedUser.role }); // Adjust based on your JWT payload
        localStorage.setItem('token', currentToken);
        setToken(currentToken);
      } catch (e) {
        console.error("Failed to decode token:", e);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } else {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    updateUserFromToken(token);
  }, [token, updateUserFromToken]);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await API.post('/auth/login', { email, password });
      updateUserFromToken(res.data.token);
    } catch (err) {
      console.error("Login failed:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      // Keep token and user null/previous state on error
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      const res = await API.post('/auth/register', { name, email, password });
      // Assuming successful registration also returns a token and logs the user in
      updateUserFromToken(res.data.token);
    } catch (err) {
      console.error("Registration failed:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      // Keep token and user null/previous state on error
    }
  };

  const logout = () => {
    updateUserFromToken(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout, register, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
