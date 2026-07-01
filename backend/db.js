const mongoose = require('mongoose');
const Product = require('./models/Product');
const { ORNEK_URUNLER } = require('./data/constants');

let baglaniyor = false;

async function veritabaniBaglan() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('[Demo] MONGO_URI tanımlı değil — Render Environment sekmesine ekleyin.');
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

    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(ORNEK_URUNLER);
      console.log(`[Demo] ${ORNEK_URUNLER.length} örnek ürün yüklendi`);
    } else {
      console.log(`[Demo] Veritabanında ${count} ürün mevcut`);
    }
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
