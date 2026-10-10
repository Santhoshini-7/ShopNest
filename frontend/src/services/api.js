import axios from 'axios';
import { getToken, clearAuth } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute = error.config.url.includes('/api/auth/login') || error.config.url.includes('/api/auth/register');
      if (!isAuthRoute) {
        clearAuth();
        // Notify or window redirect if session expired
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
};

export const productsApi = {
  getAll: (params) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
};

export const categoriesApi = {
  getAll: () => api.get('/api/categories'),
  getById: (id) => api.get(`/api/categories/${id}`),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

export const cartApi = {
  get: () => api.get('/api/cart'),
  add: (productId, quantity = 1) => api.post('/api/cart', { productId, quantity }),
  updateQuantity: (itemId, quantity) => api.put(`/api/cart/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/api/cart/${itemId}`),
  clear: () => api.delete('/api/cart'),
};

export const wishlistApi = {
  get: () => api.get('/api/wishlist'),
  add: (productId) => api.post(`/api/wishlist/${productId}`),
  remove: (productId) => api.delete(`/api/wishlist/${productId}`),
};

export const ordersApi = {
  create: (data) => api.post('/api/orders', data),
  getMyOrders: () => api.get('/api/orders/my'),
  getById: (id) => api.get(`/api/orders/${id}`),
  cancel: (id) => api.put(`/api/orders/${id}/cancel`),
  requestReturn: (id) => api.put(`/api/orders/${id}/return`),
};

export const adminApi = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getUsers: () => api.get('/api/admin/users'),
  updateUserRole: (userId, role) => api.put(`/api/admin/users/${userId}/role`, { role }),
  getOrders: (params) => api.get('/api/admin/orders', { params }),
  updateOrderStatus: (orderId, status) => api.put(`/api/admin/orders/${orderId}/status`, { status }),
  uploadImage: (formData) => api.post('/api/admin/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export default api;
