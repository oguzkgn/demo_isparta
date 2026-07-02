const bcrypt = require('bcryptjs');
const { ORNEK_URUNLER } = require('../data/constants');

let initDone = false;
let userCounter = 1;

function zenginlestir(u, idx) {
  const fiyat = u.fiyat;
  return {
    ...u,
    _id: `mem-${String(idx).padStart(3, '0')}`,
    saticiAd: u.saticiAd || 'Demo Mağaza Isparta',
    altKategori: u.altKategori || null,
    stok: u.stok ?? 10,
    bedenler: u.kategori === 'giyim' || u.kategori === 'spor' ? ['S', 'M', 'L', 'XL'] : [],
    renkler: u.kategori === 'giyim' ? ['Siyah', 'Beyaz', 'Mor'] : ['Standart'],
    taksitSecenekleri: [
      { ay: 1, tutar: fiyat },
      { ay: 3, tutar: Math.ceil(fiyat / 3) },
      { ay: 6, tutar: Math.ceil(fiyat / 6) },
      { ay: 9, tutar: Math.ceil(fiyat / 9) }
    ],
    createdAt: new Date()
  };
}

const products = ORNEK_URUNLER.map((u, i) => zenginlestir(u, i));
const users = new Map();

async function ensureInit() {
  if (initDone) return;
  const hash = await bcrypt.hash('admin123', 10);
  users.set('mem-admin', {
    _id: 'mem-admin',
    ad: 'Admin',
    soyad: 'Demo',
    email: 'admin@demo-isparta.com',
    sifreHash: hash,
    rol: 'admin',
    telefon: '',
    adres: '',
    konum: '',
    sepet: [],
    favoriler: [],
    sonGorulenler: [],
    adresler: []
  });
  initDone = true;
}

function isMemoryUser(id) {
  return String(id).startsWith('mem-');
}

function sanitizeUser(u) {
  if (!u) return null;
  const { sifreHash, ...rest } = u;
  return { ...rest };
}

function urunBul(id) {
  return products.find((p) => p._id === id) || null;
}

function urunleriFiltrele(query = {}) {
  let list = [...products];

  if (query.kategori) list = list.filter((u) => u.kategori === query.kategori);
  if (query.altKategori) list = list.filter((u) => u.altKategori === query.altKategori);
  if (query.konum) list = list.filter((u) => u.konum === query.konum);
  if (query.marka) list = list.filter((u) => u.marka === query.marka);
  if (query.oneCikan === 'true') list = list.filter((u) => u.oneCikan);
  if (query.minFiyat) list = list.filter((u) => u.fiyat >= Number(query.minFiyat));
  if (query.maxFiyat) list = list.filter((u) => u.fiyat <= Number(query.maxFiyat));
  if (query.minPuan) list = list.filter((u) => u.puan >= Number(query.minPuan));
  if (query.beden) list = list.filter((u) => u.bedenler?.includes(query.beden));
  if (query.ara) {
    const q = query.ara.toLowerCase();
    list = list.filter((u) =>
      u.ad?.toLowerCase().includes(q) ||
      u.aciklama?.toLowerCase().includes(q) ||
      u.marka?.toLowerCase().includes(q) ||
      u.saticiAd?.toLowerCase().includes(q)
    );
  }

  if (query.siralama === 'fiyatArtan') list.sort((a, b) => a.fiyat - b.fiyat);
  else if (query.siralama === 'fiyatAzalan') list.sort((a, b) => b.fiyat - a.fiyat);
  else if (query.siralama === 'puan') list.sort((a, b) => b.puan - a.puan);
  else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return list;
}

function markalarGetir() {
  return [...new Set(products.map((u) => u.marka).filter(Boolean))].sort();
}

async function kullaniciKayit(data) {
  await ensureInit();
  const email = data.email.toLowerCase();
  if ([...users.values()].some((u) => u.email === email)) {
    const err = new Error('Bu e-posta zaten kayıtlı.');
    err.status = 409;
    throw err;
  }
  const id = `mem-user-${userCounter++}`;
  const sifreHash = await bcrypt.hash(data.sifre, 10);
  const user = {
    _id: id,
    ad: data.ad,
    soyad: data.soyad,
    email,
    sifreHash,
    telefon: data.telefon || '',
    adres: data.adres || '',
    konum: data.konum || '',
    rol: 'kullanici',
    sepet: [],
    favoriler: [],
    sonGorulenler: [],
    adresler: []
  };
  users.set(id, user);
  return sanitizeUser(user);
}

async function kullaniciGiris(email, sifre) {
  await ensureInit();
  const user = [...users.values()].find((u) => u.email === email.toLowerCase());
  if (!user || !(await bcrypt.compare(sifre, user.sifreHash))) {
    const err = new Error('E-posta veya şifre hatalı.');
    err.status = 401;
    throw err;
  }
  return sanitizeUser(user);
}

async function kullaniciBulVeyaOlustur({ email, ad, soyad, googleId, appleId }) {
  await ensureInit();
  const eposta = (email || `demo_${Date.now()}@demo.local`).toLowerCase();
  let user = [...users.values()].find((u) =>
    u.email === eposta || (googleId && u.googleId === googleId) || (appleId && u.appleId === appleId)
  );
  if (!user) {
    const id = `mem-user-${userCounter++}`;
    const sifreHash = await bcrypt.hash(Math.random().toString(36).slice(2), 10);
    user = {
      _id: id,
      ad: ad || 'Demo',
      soyad: soyad || 'Kullanıcı',
      email: eposta,
      sifreHash,
      rol: 'kullanici',
      googleId: googleId || undefined,
      appleId: appleId || undefined,
      sepet: [],
      favoriler: [],
      sonGorulenler: [],
      adresler: []
    };
    users.set(id, user);
  }
  return sanitizeUser(user);
}

function kullaniciGetir(id) {
  return sanitizeUser(users.get(String(id)));
}

function sepetGetir(userId) {
  const user = users.get(String(userId));
  if (!user) return [];
  return user.sepet.map((item) => ({
    urun: urunBul(item.urun) || { _id: item.urun, ad: 'Ürün', fiyat: 0, resim: '🛍️' },
    adet: item.adet,
    beden: item.beden,
    renk: item.renk
  }));
}

function sepeteEkle(userId, urunId, adet = 1, beden, renk) {
  const user = users.get(String(userId));
  const urun = urunBul(urunId);
  if (!user || !urun) return null;
  const mevcut = user.sepet.find((x) => x.urun === urunId);
  const yeniAdet = (mevcut?.adet || 0) + adet;
  if (yeniAdet > urun.stok) {
    const err = new Error(`Stok yetersiz. Maksimum ${urun.stok} adet.`);
    err.status = 400;
    throw err;
  }
  if (mevcut) {
    mevcut.adet = yeniAdet;
    if (beden) mevcut.beden = beden;
    if (renk) mevcut.renk = renk;
  } else {
    user.sepet.push({ urun: urunId, adet, beden, renk });
  }
  return sepetGetir(userId);
}

function sepetGuncelle(userId, urunId, adet) {
  const user = users.get(String(userId));
  if (!user) return [];
  const item = user.sepet.find((x) => x.urun === urunId);
  if (!item) return sepetGetir(userId);
  if (adet <= 0) user.sepet = user.sepet.filter((x) => x.urun !== urunId);
  else item.adet = adet;
  return sepetGetir(userId);
}

function sepettenSil(userId, urunId) {
  const user = users.get(String(userId));
  if (!user) return [];
  user.sepet = user.sepet.filter((x) => x.urun !== urunId);
  return sepetGetir(userId);
}

function favorilerGetir(userId) {
  const user = users.get(String(userId));
  if (!user) return [];
  return user.favoriler.map((id) => urunBul(id)).filter(Boolean);
}

function favoriEkle(userId, urunId) {
  const user = users.get(String(userId));
  if (!user || !urunBul(urunId)) return null;
  if (!user.favoriler.includes(urunId)) user.favoriler.push(urunId);
  return favorilerGetir(userId);
}

function favoriSil(userId, urunId) {
  const user = users.get(String(userId));
  if (!user) return [];
  user.favoriler = user.favoriler.filter((id) => id !== urunId);
  return favorilerGetir(userId);
}

function sonGorulenGetir(userId) {
  const user = users.get(String(userId));
  if (!user) return [];
  return user.sonGorulenler.map((id) => urunBul(id)).filter(Boolean);
}

function sonGorulenEkle(userId, urunId) {
  const user = users.get(String(userId));
  if (!user || !urunBul(urunId)) return;
  user.sonGorulenler = user.sonGorulenler.filter((id) => id !== urunId);
  user.sonGorulenler.unshift(urunId);
  user.sonGorulenler = user.sonGorulenler.slice(0, 12);
}

function aramaYap(q) {
  const urunler = urunleriFiltrele({ ara: q }).slice(0, 20);
  const markalar = [...new Set(urunler.map((u) => u.marka).filter(Boolean))];
  const oneriler = [
    ...markalar.slice(0, 3).map((m) => ({ tip: 'marka', metin: m })),
    ...urunler.slice(0, 5).map((u) => ({ tip: 'urun', metin: u.ad, id: u._id }))
  ];
  return { urunler, oneriler };
}

module.exports = {
  ensureInit,
  isMemoryUser,
  urunBul,
  urunleriFiltrele,
  markalarGetir,
  kullaniciKayit,
  kullaniciGiris,
  kullaniciBulVeyaOlustur,
  kullaniciGetir,
  sepetGetir,
  sepeteEkle,
  sepetGuncelle,
  sepettenSil,
  favorilerGetir,
  favoriEkle,
  favoriSil,
  sonGorulenGetir,
  sonGorulenEkle,
  aramaYap
};
