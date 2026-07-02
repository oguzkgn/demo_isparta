require('dotenv').config();

process.on('uncaughtException', (err) => console.error('[Demo] Beklenmeyen hata:', err));
process.on('unhandledRejection', (err) => console.error('[Demo] İşlenmeyen hata:', err));

const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cors = require('cors');
const { ISPARTA_KONUMLAR, KATEGORILER } = require('./data/constants');
const { KATEGORI_AGACI } = require('./data/kategoriler');
const { veritabaniBaglan } = require('./db');
const { urunleriGetir, urunGetir, markalarGetir } = require('./lib/urunService');
const authRoutes = require('./routes/auth');
const sepetRoutes = require('./routes/sepet');
const favoriRoutes = require('./routes/favori');
const siparisRoutes = require('./routes/siparis');
const yorumRoutes = require('./routes/yorum');
const araRoutes = require('./routes/ara');
const kuponRoutes = require('./routes/kupon');
const saticiRoutes = require('./routes/satici');
const iadeRoutes = require('./routes/iade');
const odemeRoutes = require('./routes/odeme');

const app = express();
const port = Number(process.env.PORT) || 5002;
const distPath = path.join(__dirname, '../frontend/dist');
const hasFrontend = fs.existsSync(path.join(distPath, 'index.html'));

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbDurum = { 0: 'kopuk', 1: 'bagli', 2: 'baglaniyor', 3: 'kesiliyor' }[dbState] || 'bilinmiyor';
  const mongoTanimli = Boolean(process.env.MONGO_URI);
  res.json({
    durum: 'ok',
    servis: 'demo-isparta',
    veritabani: dbDurum,
    mongoUri: mongoTanimli ? 'tanimli' : 'eksik',
    yedekMod: dbState !== 1 ? 'bellek' : 'yok',
    frontend: hasFrontend ? 'hazir' : 'eksik',
    port,
    nodeEnv: process.env.NODE_ENV || 'development',
    ...(mongoTanimli ? {} : {
      uyari: 'Render Dashboard → Environment → MONGO_URI ekleyin'
    })
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/sepet', sepetRoutes);
app.use('/api/favoriler', favoriRoutes);
app.use('/api/siparisler', siparisRoutes);
app.use('/api/yorumlar', yorumRoutes);
app.use('/api/ara', araRoutes);
app.use('/api/kuponlar', kuponRoutes);
app.use('/api/satici', saticiRoutes);
app.use('/api/iade', iadeRoutes);
app.use('/api/odeme', odemeRoutes);

app.get('/api/konumlar', (_req, res) => res.json(ISPARTA_KONUMLAR));
app.get('/api/kategoriler/agac', (_req, res) => res.json(KATEGORI_AGACI));
app.get('/api/kategoriler', (_req, res) => res.json(KATEGORILER));

app.get('/api/markalar', async (_req, res) => {
  try {
    res.json(await markalarGetir());
  } catch (err) {
    console.error('[Demo] markalar hatasi:', err.message);
    res.status(500).json({ mesaj: 'Markalar getirilemedi.' });
  }
});

app.get('/api/urunler', async (req, res) => {
  try {
    res.json(await urunleriGetir(req.query));
  } catch (err) {
    console.error('[Demo] urunler hatasi:', err.message);
    res.status(500).json({ mesaj: 'Ürünler getirilemedi.' });
  }
});

app.get('/api/urunler/:id', async (req, res) => {
  try {
    const urun = await urunGetir(req.params.id);
    if (!urun) return res.status(404).json({ mesaj: 'Ürün bulunamadı.' });
    res.json(urun);
  } catch (err) {
    console.error('[Demo] urun detay hatasi:', err.message);
    res.status(400).json({ mesaj: 'Geçersiz ürün.' });
  }
});

if (hasFrontend) {
  app.use(express.static(distPath, { index: false }));
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('[Demo] Frontend aktif:', distPath);
} else {
  app.get('/', (_req, res) => {
    res.json({
      mesaj: 'Demo API çalışıyor — frontend/dist bulunamadı',
      api: '/api/health',
      durum: 'ok'
    });
  });
  console.warn('[Demo] frontend/dist yok — sadece API modu');
}

app.use('/api', (_req, res) => {
  res.status(404).json({ mesaj: 'API endpoint bulunamadı.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[Demo] Sunucu 0.0.0.0:${port} portunda dinliyor ✓`);
  veritabaniBaglan();
});
