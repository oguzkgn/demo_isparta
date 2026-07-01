import axios from 'axios';
import { API_URL } from '../constants/config';

const api = axios.create({ baseURL: API_URL, timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('demo-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchProducts = (params) => api.get('/api/urunler', { params }).then((r) => r.data);
export const fetchProduct = (id) => api.get(`/api/urunler/${id}`).then((r) => r.data);
export const fetchCategories = () => api.get('/api/kategoriler').then((r) => r.data);
export const fetchLocations = () => api.get('/api/konumlar').then((r) => r.data);

export const register = (data) => api.post('/api/auth/kayit', data).then((r) => r.data);
export const login = (data) => api.post('/api/auth/giris', data).then((r) => r.data);
export const fetchProfile = () => api.get('/api/auth/profil').then((r) => r.data);
export const updateProfile = (data) => api.put('/api/auth/profil', data).then((r) => r.data);
export const deleteAccount = () => api.delete('/api/auth/hesap').then((r) => r.data);

export const fetchCart = () => api.get('/api/sepet').then((r) => r.data);
export const addToCart = (urunId, adet = 1) => api.post('/api/sepet', { urunId, adet }).then((r) => r.data);
export const updateCartItem = (urunId, adet) => api.patch(`/api/sepet/${urunId}`, { adet }).then((r) => r.data);
export const removeFromCart = (urunId) => api.delete(`/api/sepet/${urunId}`).then((r) => r.data);
export const clearCart = () => api.delete('/api/sepet').then((r) => r.data);

export const fetchFavorites = () => api.get('/api/favoriler').then((r) => r.data);
export const addFavorite = (urunId) => api.post(`/api/favoriler/${urunId}`).then((r) => r.data);
export const removeFavorite = (urunId) => api.delete(`/api/favoriler/${urunId}`).then((r) => r.data);

export const fetchOrders = () => api.get('/api/siparisler').then((r) => r.data);
export const createOrder = (data) => api.post('/api/siparisler', data).then((r) => r.data);

export default api;
