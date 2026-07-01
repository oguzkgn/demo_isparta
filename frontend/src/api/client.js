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

export const searchProducts = (q) => api.get('/api/ara', { params: { q } }).then((r) => r.data);
export const fetchRecent = () => api.get('/api/ara/son-gorulen').then((r) => r.data);
export const trackRecent = (urunId) => api.post(`/api/ara/son-gorulen/${urunId}`).then((r) => r.data);

export const register = (data) => api.post('/api/auth/kayit', data).then((r) => r.data);
export const login = (data) => api.post('/api/auth/giris', data).then((r) => r.data);
export const fetchProfile = () => api.get('/api/auth/profil').then((r) => r.data);
export const updateProfile = (data) => api.put('/api/auth/profil', data).then((r) => r.data);
export const changePassword = (data) => api.put('/api/auth/sifre', data).then((r) => r.data);
export const deleteAccount = () => api.delete('/api/auth/hesap').then((r) => r.data);

export const fetchAddresses = () => api.get('/api/auth/adresler').then((r) => r.data);
export const addAddress = (data) => api.post('/api/auth/adresler', data).then((r) => r.data);
export const updateAddress = (id, data) => api.put(`/api/auth/adresler/${id}`, data).then((r) => r.data);
export const deleteAddress = (id) => api.delete(`/api/auth/adresler/${id}`).then((r) => r.data);

export const fetchCart = () => api.get('/api/sepet').then((r) => r.data);
export const addToCart = (urunId, adet = 1) => api.post('/api/sepet', { urunId, adet }).then((r) => r.data);
export const updateCartItem = (urunId, adet) => api.patch(`/api/sepet/${urunId}`, { adet }).then((r) => r.data);
export const removeFromCart = (urunId) => api.delete(`/api/sepet/${urunId}`).then((r) => r.data);

export const fetchFavorites = () => api.get('/api/favoriler').then((r) => r.data);
export const addFavorite = (urunId) => api.post(`/api/favoriler/${urunId}`).then((r) => r.data);
export const removeFavorite = (urunId) => api.delete(`/api/favoriler/${urunId}`).then((r) => r.data);

export const fetchOrders = () => api.get('/api/siparisler').then((r) => r.data);
export const fetchOrder = (id) => api.get(`/api/siparisler/${id}`).then((r) => r.data);
export const createOrder = (data) => api.post('/api/siparisler', data).then((r) => r.data);
export const cancelOrder = (id) => api.patch(`/api/siparisler/${id}/iptal`).then((r) => r.data);

export const fetchReviews = (urunId) => api.get(`/api/yorumlar/urun/${urunId}`).then((r) => r.data);
export const addReview = (urunId, data) => api.post(`/api/yorumlar/urun/${urunId}`, data).then((r) => r.data);

export const fetchCoupons = () => api.get('/api/kuponlar').then((r) => r.data);
export const validateCoupon = (kod, araToplam) => api.post('/api/kuponlar/dogrula', { kod, araToplam }).then((r) => r.data);

export default api;
