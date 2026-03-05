import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';
import { Platform } from 'react-native';

// Use SecureStore for native, localStorage for web
const storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return await SecureStore.deleteItemAsync(key);
  },
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await storage.getItem('token');
      const storedUser = await storage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email);
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response.data);
      
      const { token: newToken, id, email: userEmail, roles } = response.data;
      
      const userData = { id, email: userEmail, roles };
      
      await storage.setItem('token', newToken);
      await storage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const signup = async (data) => {
    try {
      console.log('Attempting signup with:', data);
      const response = await authAPI.signup(data);
      console.log('Signup response:', response.data);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Signup failed' 
      };
    }
  };

  const logout = async () => {
    await storage.removeItem('token');
    await storage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
