const u = (id, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

export const BG_IMAGES = {
  lavender: u('photo-1499002238440-d264edd596ec', 1600),
  lavenderAlt: u('photo-1615485509133-12e1b2f455d0', 1600),
  rose: u('photo-1582794549859-d2a299bfa77a', 1600),
  roseAlt: u('photo-1518709268805-4e9042af2179', 1600),
  hero: u('photo-1518709268805-4e9042af2179', 1400)
};

export const CATEGORY_IMAGES = {
  giyim: u('photo-1489987707025-afc2321137af'),
  elektronik: u('photo-1498049794561-9730f036b101'),
  ev: u('photo-1586023492125-27b2c045efd7'),
  kozmetik: u('photo-1571875257727-25639fc50891'),
  gida: u('photo-1542838132-92c53300491e'),
  lavanta: u('photo-1615485509133-12e1b2f455d0'),
  spor: u('photo-1461896836934-ffe607ba8211'),
  kitap: u('photo-1495446815901-a08987e031bb')
};

export const DEFAULT_PRODUCT = u('photo-1472851294608-062f824d29cc');

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u;

export function isEmojiOnly(val) {
  if (!val || typeof val !== 'string') return false;
  const t = val.trim();
  return t.length <= 4 && EMOJI_RE.test(t);
}

export function productImageSrc(urun) {
  if (urun?.resim && !isEmojiOnly(urun.resim)) {
    if (urun.resim.startsWith('http')) return urun.resim;
  }
  return CATEGORY_IMAGES[urun?.kategori] || DEFAULT_PRODUCT;
}
