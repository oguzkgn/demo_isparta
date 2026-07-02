import { asArray } from './safe';
import { konumMetni } from './format';

export function normalizeKonum(konum) {
  return konumMetni(konum).toLowerCase();
}

export function konumEslestir(urunKonum, filtreKonum) {
  if (!filtreKonum) return true;
  return normalizeKonum(urunKonum) === normalizeKonum(filtreKonum);
}

export function siralamaUygula(list, siralama) {
  const sorted = [...list];
  if (siralama === 'fiyatArtan') {
    sorted.sort((a, b) => (a.fiyat ?? 0) - (b.fiyat ?? 0));
  } else if (siralama === 'fiyatAzalan') {
    sorted.sort((a, b) => (b.fiyat ?? 0) - (a.fiyat ?? 0));
  } else if (siralama === 'puan') {
    sorted.sort((a, b) => (b.puan ?? 0) - (a.puan ?? 0));
  } else if (siralama === 'puanArtan') {
    sorted.sort((a, b) => (a.puan ?? 0) - (b.puan ?? 0));
  } else {
    sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }
  return sorted;
}

export function urunleriFiltrele(list, query = {}) {
  let result = asArray(list);

  if (query.kategori) result = result.filter((u) => u.kategori === query.kategori);
  if (query.konum) result = result.filter((u) => konumEslestir(u.konum, query.konum));
  if (query.marka) result = result.filter((u) => u.marka === query.marka);
  if (query.oneCikan === 'true' || query.oneCikan === true) {
    result = result.filter((u) => u.oneCikan);
  }
  if (query.minFiyat) result = result.filter((u) => u.fiyat >= Number(query.minFiyat));
  if (query.maxFiyat) result = result.filter((u) => u.fiyat <= Number(query.maxFiyat));
  if (query.minPuan) result = result.filter((u) => u.puan >= Number(query.minPuan));
  if (query.ara) {
    const q = String(query.ara).toLowerCase();
    result = result.filter((u) =>
      u.ad?.toLowerCase().includes(q) ||
      u.aciklama?.toLowerCase().includes(q) ||
      u.marka?.toLowerCase().includes(q) ||
      u.saticiAd?.toLowerCase().includes(q)
    );
  }

  return siralamaUygula(result, query.siralama);
}
