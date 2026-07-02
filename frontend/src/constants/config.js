const RENDER_API = 'https://demo-isparta.onrender.com';

/** Runtime API kökü — Vercel external rewrite POST desteklemediği için doğrudan Render kullanılır */
export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return '';
  }
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return RENDER_API;
}

/** @deprecated getApiBaseUrl() kullanın */
export const API_URL = getApiBaseUrl();

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
