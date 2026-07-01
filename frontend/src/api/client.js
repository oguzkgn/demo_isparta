import axios from 'axios';
import { API_URL } from '../constants/config';

const api = axios.create({ baseURL: API_URL, timeout: 30000 });

export const fetchProducts = (params) => api.get('/api/urunler', { params }).then((r) => r.data);
export const fetchProduct = (id) => api.get(`/api/urunler/${id}`).then((r) => r.data);
export const fetchCategories = () => api.get('/api/kategoriler').then((r) => r.data);
export const fetchLocations = () => api.get('/api/konumlar').then((r) => r.data);
