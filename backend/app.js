require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/Product');
const { ISPARTA_KONUMLAR, KATEGORILER, ORNEK_URUNLER } = require('./data/constants');

const app = express();

const allowedOrigins = [
  'http://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true
}));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/demo-shop';

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000
})
  .then(async () => {
    console.log('[Demo] MongoDB bağlandı');
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(ORNEK_URUNLER);
      console.log(`[Demo] ${ORNEK_URUNLER.length} örnek ürün yüklendi`);
    }
  })
  .catch((err) => console.error('[Demo] MongoDB hatası:', err.message));

app.get('/', (_req, res) => {
  res.json({ mesaj: 'Demo API — Isparta yerel alışveriş', durum: 'ok' });
});

app.get('/api/health', (_req, res) => {
  res.json({
    durum: 'ok',
    servis: 'demo-api',
    veritabani: mongoose.connection.readyState === 1 ? 'bagli' : 'bekleniyor'
  });
});

app.get('/api/konumlar', (_req, res) => {
  res.json(ISPARTA_KONUMLAR);
});

app.get('/api/kategoriler', (_req, res) => {
  res.json(KATEGORILER);
});

app.get('/api/urunler', async (req, res) => {
  try {
    const filter = {};
    if (req.query.kategori) filter.kategori = req.query.kategori;
    if (req.query.konum) filter.konum = req.query.konum;
    if (req.query.oneCikan === 'true') filter.oneCikan = true;
    if (req.query.ara) {
      filter.$or = [
        { ad: { $regex: req.query.ara, $options: 'i' } },
        { aciklama: { $regex: req.query.ara, $options: 'i' } },
        { marka: { $regex: req.query.ara, $options: 'i' } }
      ];
    }

    let sort = { createdAt: -1 };
    if (req.query.siralama === 'fiyatArtan') sort = { fiyat: 1 };
    if (req.query.siralama === 'fiyatAzalan') sort = { fiyat: -1 };
    if (req.query.siralama === 'puan') sort = { puan: -1 };

    const urunler = await Product.find(filter).sort(sort).lean();
    res.json(urunler);
  } catch (error) {
    res.status(500).json({ mesaj: 'Ürünler getirilemedi.' });
  }
});

app.get('/api/urunler/:id', async (req, res) => {
  try {
    const urun = await Product.findById(req.params.id);
    if (!urun) return res.status(404).json({ mesaj: 'Ürün bulunamadı.' });
    res.json(urun);
  } catch {
    res.status(400).json({ mesaj: 'Geçersiz ürün.' });
  }
});

const port = process.env.PORT || 5002;
app.listen(port, '0.0.0.0', () => {
  console.log(`[Demo] API http://0.0.0.0:${port}`);
});
