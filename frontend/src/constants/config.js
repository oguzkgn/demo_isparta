const RENDER_API = 'https://demo-isparta.onrender.com';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('vercel.app') || host.includes('localhost')) {
      return host.includes('localhost') ? '' : RENDER_API;
    }
    return window.location.origin;
  }
  return RENDER_API;
};

export const API_URL = getBaseUrl();

export const ISPARTA_KONUMLAR = [
  '⭐ Çünür (Kampüs Bölgesi)',
  '⭐ İyaş Bölgesi',
  '⭐ Yedişehitler',
  '⭐ Modernevler',
  '⭐ Bahçelievler',
  '⭐ Çarşı / Merkez',
  '⭐ Fatih Mahallesi',
  'Hızırbey',
  'Yayla Mahallesi',
  'Binbirevler',
  'Halıkent',
  'Işıkkent',
  'Eğirdir',
  'Yalvaç',
  'Gönen',
  'Keçiborlu',
  'Senirkent'
];
