function normalizeKonum(konum) {
  return String(konum || '')
    .replace(/^\s*⭐\s*/, '')
    .trim()
    .toLowerCase();
}

function konumEslestir(urunKonum, filtreKonum) {
  if (!filtreKonum) return true;
  return normalizeKonum(urunKonum) === normalizeKonum(filtreKonum);
}

module.exports = { normalizeKonum, konumEslestir };
