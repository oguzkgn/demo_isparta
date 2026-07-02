const RENDER_API = 'https://demo-isparta.onrender.com';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Production/dev: aynı origin — /api Vercel veya vite proxy ile Render'a gider
    if (host.includes('vercel.app') || host === 'localhost' || host === '127.0.0.1') {
      return '';
    }
  }
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') return window.location.origin;
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
