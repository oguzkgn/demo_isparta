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
  kargoda: 'Kargoda',
  teslim: 'Teslim Edildi',
  iptal: 'İptal Edildi'
};
