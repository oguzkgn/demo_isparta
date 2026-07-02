const SIPARIS_DURUMLARI = [
  'beklemede',
  'hazirlaniyor',
  'kargoya_verildi',
  'kargo_teslim_alindi',
  'dagitimda',
  'teslim',
  'iptal'
];

/** Eski kayıtlar için geriye dönük uyumluluk */
const ESKI_DURUM_MAP = { kargoda: 'kargoya_verildi' };

const IPTAL_EDILEMEZ = new Set([
  'kargoya_verildi',
  'kargo_teslim_alindi',
  'dagitimda',
  'kargoda',
  'teslim',
  'iptal'
]);

function durumGecerliMi(durum) {
  return SIPARIS_DURUMLARI.includes(durum) || durum === 'kargoda';
}

function durumSirasi(durum) {
  const d = ESKI_DURUM_MAP[durum] || durum;
  const idx = SIPARIS_DURUMLARI.indexOf(d);
  return idx === -1 ? -1 : idx;
}

module.exports = {
  SIPARIS_DURUMLARI,
  ESKI_DURUM_MAP,
  IPTAL_EDILEMEZ,
  durumGecerliMi,
  durumSirasi
};
