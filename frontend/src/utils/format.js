export function konumMetni(konum) {
  return String(konum || '').replace(/^\s*⭐\s*/, '').trim();
}

export function formatPrice(n) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0
  }).format(n);
}

export const DURUM_ETIKET = {
  beklemede: 'Sipariş Alındı',
  hazirlaniyor: 'Hazırlanıyor',
  kargoya_verildi: 'Kargoya Verildi',
  kargo_teslim_alindi: 'Kargo Teslim Alındı',
  dagitimda: 'Dağıtıma Çıktı',
  kargoda: 'Kargoda',
  teslim: 'Teslim Edildi',
  iptal: 'İptal Edildi'
};

/** Satıcı panelinde güncellenebilir durumlar (iptal hariç) */
export const SATICI_DURUM_SECENEKLERI = [
  'beklemede',
  'hazirlaniyor',
  'kargoya_verildi',
  'kargo_teslim_alindi',
  'dagitimda',
  'teslim'
];

/** Müşteri sipariş takip adımları */
export const SIPARIS_TAKIP_ADIMLARI = [
  'beklemede',
  'hazirlaniyor',
  'kargoya_verildi',
  'kargo_teslim_alindi',
  'dagitimda',
  'teslim'
];

export function durumEtiketi(durum) {
  return DURUM_ETIKET[durum] || DURUM_ETIKET[durum === 'kargoda' ? 'kargoda' : durum] || durum;
}

export function durumTamamlandi(siparisDurum, adim) {
  if (siparisDurum === 'iptal') return false;
  const normalize = (d) => (d === 'kargoda' ? 'kargoya_verildi' : d);
  const sira = SIPARIS_TAKIP_ADIMLARI;
  const aktuel = normalize(siparisDurum);
  const aktuelIdx = sira.indexOf(aktuel);
  const adimIdx = sira.indexOf(adim);
  if (aktuelIdx === -1 || adimIdx === -1) return false;
  return aktuelIdx >= adimIdx;
}
