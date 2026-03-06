import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For Android emulator, use your machine's IP address
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return 'http://192.168.1.6:8080/api/v1';
  }
  return 'http://localhost:8080/api/v1';
};

const API_BASE_URL = getBaseURL();

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    let token;
    if (Platform.OS === 'web') {
      token = localStorage.getItem('token');
    } else {
      token = await SecureStore.getItemAsync('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  checkEmail: (email) => api.get(`/auth/check-email?email=${email}`),
  checkPhone: (phone) => api.get(`/auth/check-phone?phone=${phone}`),
};

// Wallet APIs
export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  getBalance: () => api.get('/wallet/balance'),
};

// VPA APIs
export const vpaAPI = {
  create: (data) => {
    console.log('VPA API sending:', data);
    return api.post('/vpa', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  getAll: () => api.get('/vpa'),
  setPrimary: (vpa) => api.patch(`/vpa/${vpa}/primary`),
  checkAvailability: (vpa) => api.get(`/vpa/check-availability?vpa=${vpa}`),
  delete: (vpa) => api.delete(`/vpa/${vpa}`),
};

// UPI PIN APIs
export const upiPinAPI = {
  set: (pin) => api.post(`/upi-pin/set?upiPin=${pin}`),
  validate: (pin) => api.post(`/upi-pin/validate?upiPin=${pin}`),
  change: (oldPin, newPin) => api.post(`/upi-pin/change?oldPin=${oldPin}&newPin=${newPin}`),
};

// Transaction APIs
export const transactionAPI = {
  transfer: (data) => api.post('/transaction/transfer', data),
  getHistory: () => api.get('/transaction/history'),
  getById: (id) => api.get(`/transaction/${id}`),
  getStatus: (id) => api.get(`/transaction/status/${id}`),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Payment Request APIs
export const paymentRequestAPI = {
  create: (data) => api.post('/payment-requests', data),
  accept: (requestId, upiPin) => api.post(`/payment-requests/${requestId}/accept?upiPin=${upiPin}`),
  reject: (requestId) => api.post(`/payment-requests/${requestId}/reject`),
  getById: (requestId) => api.get(`/payment-requests/${requestId}`),
  getSent: () => api.get('/payment-requests/sent'),
  getReceived: () => api.get('/payment-requests/received'),
  getAll: () => api.get('/payment-requests'),
  getPendingCount: () => api.get('/payment-requests/pending/count'),
};

// Profile APIs
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  changePassword: (data) => api.post('/profile/change-password', data),
  deleteAccount: () => api.delete('/profile'),
};

// QR Code APIs
export const qrCodeAPI = {
  generateStatic: () => api.get('/qr/generate/static'),
  generateDynamic: (data) => api.post('/qr/generate/dynamic', data),
  parse: (qrData) => api.post('/qr/parse', qrData, {
    headers: {
      'Content-Type': 'text/plain',
    },
  }),
};

export default api;
