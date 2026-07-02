const u = (id, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

export const BG_IMAGES = {
  lavender: u('photo-1499002238440-d264edd596ec', 1600),
  lavenderAlt: u('photo-1615485509133-12e1b2f455d0', 1600),
  hero: u('photo-1499002238440-d264edd596ec', 1400)
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

export const PRODUCT_IMAGES = {
  'Isparta Lavanta Kolonyası 400ml': u('photo-1615485509133-12e1b2f455d0'),
  'Gül Suyu Tonik 250ml': u('photo-1571875257727-25639fc50891'),
  'SUÜT Isparta Basketbol Forması': u('photo-1519861531477-920027218838'),
  'Kablosuz Kulaklık Pro': u('photo-1505740420928-5e560c06d30e'),
  'Kadın Yazlık Elbise': u('photo-1496747611176-843222e1e273'),
  'Organik Bal 850g': u('photo-1587049350798-91c41641e991'),
  'Lavanta Yastık Spreyi': u('photo-1608571423902-eed4a5ad8108'),
  'Akıllı Saat S3': u('photo-1523275335684-37898b6baf30'),
  'Lavanta Çayı 20 Poşet': u('photo-1564890369478-c89ca4aee99d'),
  'Erkek Spor Ayakkabı': u('photo-1542291026-7eec264c27ff'),
  'Gül Kurutulmuş Buket': u('photo-1582794549859-d2a299bfa77a'),
  'Bluetooth Hoparlör Mini': u('photo-1608043159229-42382bbf4f62'),
  'Lavanta Sabunu Seti (3\'lü)': u('photo-1556228720-195a672e8a03'),
  'Kampüs Defter Seti': u('photo-1495446815901-a08987e031bb'),
  'Tencere Seti 7 Parça': u('photo-1556911220-bff31c812dba'),
  'Lavanta Kesesi 5\'li': u('photo-1499002238440-d264edd596ec')
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
    if (urun.resim.startsWith('http') || urun.resim.startsWith('data:')) return urun.resim;
  }
  if (urun?.ad && PRODUCT_IMAGES[urun.ad]) return PRODUCT_IMAGES[urun.ad];
  return CATEGORY_IMAGES[urun?.kategori] || DEFAULT_PRODUCT;
}
