const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:5002';
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
