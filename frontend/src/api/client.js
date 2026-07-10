import axios from 'axios';
import { getApiBaseUrl } from '../constants/config';
import { asArray } from '../utils/safe';

const COLD_START_TIMEOUT = 90000;
const AUTH_TIMEOUT = 60000;
const MAX_RETRY = 3;
const RETRY_DELAY_MS = 4000;

function authIstegiMi(url = '') {
  return url.includes('/api/auth/');
}

const api = axios.create({ timeout: COLD_START_TIMEOUT });

function yenidenDenenebilirMi(err) {
  if (err.response) return false;
  return (
    err.code === 'ECONNABORTED' ||
    err.code === 'ERR_NETWORK' ||
    err.message?.includes('Network Error')
  );
}

function bekle(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  if (authIstegiMi(config.url)) {
    config.timeout = AUTH_TIMEOUT;
    config.__authIstek = true;
  }
  const token = localStorage.getItem('demo-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;
    if (config && yenidenDenenebilirMi(err) && !config.__authIstek) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < MAX_RETRY) {
        config.__retryCount += 1;
        await bekle(RETRY_DELAY_MS * config.__retryCount);
        return api(config);
      }
    }
    if (err.response?.data?.kod === 'EPOSTA_DOGRULANMADI' && !authIstegiMi(err.config?.url)) {
      localStorage.removeItem('demo-token');
    }
    if (!err.response) {
      err.message = err.code === 'ECONNABORTED'
        ? 'Sunucu yanıt vermedi. Otomatik yeniden deneme başarısız; bir dakika bekleyip tekrar deneyin.'
        : 'API sunucusuna bağlanılamadı.';
    }
    return Promise.reject(err);
  }
);

/** Render free tier uyandırma — uygulama açılışında çağrılır */
export function apiUyandir() {
  return api.get('/api/health', { timeout: COLD_START_TIMEOUT, __retryCount: 0 });
}

export const fetchProducts = (params) =>
  api.get('/api/urunler', { params }).then((r) => asArray(r.data));
export const fetchProduct = (id) => api.get(`/api/urunler/${id}`).then((r) => r.data);
export const fetchCategories = () =>
  api.get('/api/kategoriler').then((r) => asArray(r.data));
export const fetchCategoryTree = () =>
  api.get('/api/kategoriler/agac').then((r) => asArray(r.data));
export const fetchBrands = () =>
  api.get('/api/markalar').then((r) => asArray(r.data));
export const fetchLocations = () =>
  api.get('/api/konumlar').then((r) => asArray(r.data));

export const searchProducts = (q) => api.get('/api/ara', { params: { q } }).then((r) => ({
  urunler: asArray(r.data?.urunler),
  oneriler: asArray(r.data?.oneriler)
}));
export const fetchRecent = () =>
  api.get('/api/ara/son-gorulen').then((r) => asArray(r.data));
export const trackRecent = (urunId) => api.post(`/api/ara/son-gorulen/${urunId}`).then((r) => r.data);

export const register = (data) => api.post('/api/auth/kayit', data).then((r) => r.data);
export const registerSeller = (data) => api.post('/api/auth/satici-kayit', data).then((r) => r.data);
export const login = (data) => api.post('/api/auth/giris', data).then((r) => r.data);
export const verifyEmail = (data) => api.post('/api/auth/eposta-dogrula', data).then((r) => r.data);
export const resendVerification = (email) =>
  api.post('/api/auth/eposta-dogrula/yeniden', { email }).then((r) => r.data);
export const forgotPassword = (email) =>
  api.post('/api/auth/sifremi-unuttum', { email }).then((r) => r.data);
export const resetPassword = (data) =>
  api.post('/api/auth/sifre-sifirla', data).then((r) => r.data);
export const loginGoogle = (data) => api.post('/api/auth/google', data).then((r) => r.data);
export const loginApple = (data) => api.post('/api/auth/apple', data).then((r) => r.data);
export const fetchProfile = () => api.get('/api/auth/profil').then((r) => r.data);
export const updateProfile = (data) => api.put('/api/auth/profil', data).then((r) => r.data);
export const updateEmail = (data) => api.put('/api/auth/email', data).then((r) => r.data);
export const updatePhone = (telefon) => api.put('/api/auth/telefon', { telefon }).then((r) => r.data);
export const deletePhone = () => api.delete('/api/auth/telefon').then((r) => r.data);
export const changePassword = (data) => api.put('/api/auth/sifre', data).then((r) => r.data);
export const deleteAccount = () => api.delete('/api/auth/hesap').then((r) => r.data);

export const fetchAddresses = () => api.get('/api/auth/adresler').then((r) => asArray(r.data));
export const addAddress = (data) => api.post('/api/auth/adresler', data).then((r) => r.data);
export const updateAddress = (id, data) => api.put(`/api/auth/adresler/${id}`, data).then((r) => r.data);
export const deleteAddress = (id) => api.delete(`/api/auth/adresler/${id}`).then((r) => r.data);

export const fetchCart = () => api.get('/api/sepet').then((r) => asArray(r.data));
export const addToCart = (urunId, adet = 1, beden, renk) =>
  api.post('/api/sepet', { urunId, adet, beden, renk }).then((r) => r.data);
export const updateCartItem = (urunId, adet) => api.put(`/api/sepet/${urunId}`, { adet }).then((r) => r.data);
export const removeFromCart = (urunId) => api.delete(`/api/sepet/${urunId}`).then((r) => r.data);

export const fetchFavorites = () => api.get('/api/favoriler').then((r) => asArray(r.data));
export const addFavorite = (urunId) => api.post(`/api/favoriler/${urunId}`).then((r) => r.data);
export const removeFavorite = (urunId) => api.delete(`/api/favoriler/${urunId}`).then((r) => r.data);

export const fetchOrders = () => api.get('/api/siparisler').then((r) => asArray(r.data));
export const fetchOrder = (id) => api.get(`/api/siparisler/${id}`).then((r) => r.data);
export const createOrder = (data) => api.post('/api/siparisler', data).then((r) => r.data);
export const cancelOrder = (id) => api.patch(`/api/siparisler/${id}/iptal`).then((r) => r.data);

export const fetchReviews = (urunId) =>
  api.get(`/api/yorumlar/urun/${urunId}`).then((r) => asArray(r.data));
export const addReview = (urunId, data) => api.post(`/api/yorumlar/urun/${urunId}`, data).then((r) => r.data);
export const fetchPendingReviews = () => api.get('/api/yorumlar/bekleyen').then((r) => r.data);
export const approveReview = (id) => api.patch(`/api/yorumlar/${id}/onay`).then((r) => r.data);

export const fetchCoupons = () => api.get('/api/kuponlar').then((r) => asArray(r.data));
export const validateCoupon = (kod, araToplam) => api.post('/api/kuponlar/dogrula', { kod, araToplam }).then((r) => r.data);
export const processPayment = (data) => api.post('/api/odeme/odeme', data).then((r) => r.data);

export const applyVendor = (data) => api.post('/api/satici/basvuru', data).then((r) => r.data);
export const prepareSeller = () => api.post('/api/satici/hazir').then((r) => r.data);
export const fetchMyVendor = () => api.get('/api/satici/benim').then((r) => r.data);
export const fetchVendorProducts = () => api.get('/api/satici/panel/urunler').then((r) => r.data);
export const createVendorProduct = (data) => api.post('/api/satici/panel/urunler', data).then((r) => r.data);
export const updateVendorProduct = (id, data) => api.put(`/api/satici/panel/urunler/${id}`, data).then((r) => r.data);
export const deleteVendorProduct = (id) => api.delete(`/api/satici/panel/urunler/${id}`).then((r) => r.data);
export const fetchVendorOrders = () => api.get('/api/satici/panel/siparisler').then((r) => r.data);
export const updateVendorOrderStatus = (id, durum) =>
  api.patch(`/api/satici/panel/siparisler/${id}/durum`, { durum }).then((r) => r.data);

export const fetchReturns = () => api.get('/api/iade').then((r) => r.data);
export const createReturn = (data) => api.post('/api/iade', data).then((r) => r.data);

export default api;
