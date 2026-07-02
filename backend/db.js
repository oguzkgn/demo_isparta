const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const { ORNEK_URUNLER } = require('./data/constants');

let baglaniyor = false;

function urunZenginlestir(urunler) {
  return urunler.map((u) => ({
    ...u,
    saticiAd: u.saticiAd || 'Demo Mağaza Isparta',
    altKategori: u.altKategori || null,
    bedenler: u.kategori === 'giyim' || u.kategori === 'spor' ? ['S', 'M', 'L', 'XL'] : [],
    renkler: u.kategori === 'giyim' ? ['Siyah', 'Beyaz', 'Mor'] : ['Standart'],
    taksitSecenekleri: [
      { ay: 1, tutar: u.fiyat },
      { ay: 3, tutar: Math.ceil(u.fiyat / 3) },
      { ay: 6, tutar: Math.ceil(u.fiyat / 6) },
      { ay: 9, tutar: Math.ceil(u.fiyat / 9) }
    ]
  }));
}

async function seedVerileri() {
  let admin = await User.findOne({ email: 'admin@demo-isparta.com' });
  if (!admin) {
    admin = await User.create({
      ad: 'Admin', soyad: 'Demo', email: 'admin@demo-isparta.com',
      sifre: 'admin123', rol: 'admin'
    });
    console.log('[Demo] Admin kullanıcı: admin@demo-isparta.com / admin123');
  }

  let vendor = await Vendor.findOne({ magazaAdi: 'Demo Mağaza Isparta' });
  if (!vendor) {
    vendor = await Vendor.create({
      kullanici: admin._id, magazaAdi: 'Demo Mağaza Isparta',
      vergiNo: '1234567890', durum: 'onayli', aciklama: 'Isparta yerel mağaza'
    });
  }

  const count = await Product.countDocuments();
  if (count === 0) {
    const urunler = urunZenginlestir(ORNEK_URUNLER).map((u) => ({ ...u, satici: vendor._id }));
    await Product.insertMany(urunler);
    console.log(`[Demo] ${urunler.length} örnek ürün yüklendi`);
  }
}

async function veritabaniBaglan() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('[Demo] MONGO_URI tanımlı değil — bellek içi yedek mod aktif.');
    return;
  }
  if (baglaniyor || mongoose.connection.readyState === 1) return;
  baglaniyor = true;

  console.log('[Demo] MongoDB bağlanıyor...');
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });
    console.log('[Demo] MongoDB bağlandı ✓');
    await seedVerileri();
  } catch (err) {
    console.error('[Demo] MongoDB hatası:', err.message);
    console.log('[Demo] 10 saniye sonra tekrar denenecek...');
    setTimeout(() => {
      baglaniyor = false;
      veritabaniBaglan();
    }, 10000);
    return;
  }
  baglaniyor = false;
}

mongoose.connection.on('disconnected', () => {
  console.warn('[Demo] MongoDB bağlantısı kesildi, yeniden bağlanılıyor...');
  baglaniyor = false;
  setTimeout(veritabaniBaglan, 5000);
});

module.exports = { veritabaniBaglan };
