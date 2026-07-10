require('dotenv').config();



process.on('uncaughtException', (err) => console.error('[Demo] Beklenmeyen hata:', err));

process.on('unhandledRejection', (err) => console.error('[Demo] İşlenmeyen hata:', err));



const express = require('express');

const path = require('path');

const fs = require('fs');

const mongoose = require('mongoose');

const cors = require('cors');

const { veritabaniBaglan } = require('./db');

const memoryStore = require('./lib/memoryStore');

const katalogRoutes = require('./routes/katalog');

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



const SURUM = '1.2.0';



const app = express();

const port = process.env.PORT || 5000;

const distPath = path.join(__dirname, '../frontend/dist');

const hasFrontend = fs.existsSync(path.join(distPath, 'index.html'));

const corsSecenekleri = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsSecenekleri));
app.options(/.*/, cors(corsSecenekleri));
app.use(express.json({ limit: '5mb' }));



memoryStore.ensureInit().catch((err) => console.error('[Demo] Bellek modu init:', err.message));



app.get('/api/health', (_req, res) => {

  const dbState = mongoose.connection.readyState;

  const dbDurum = { 0: 'kopuk', 1: 'bagli', 2: 'baglaniyor', 3: 'kesiliyor' }[dbState] || 'bilinmiyor';

  const mongoTanimli = Boolean(process.env.MONGO_URI);

  res.json({

    durum: 'ok',

    servis: 'demo-isparta',

    surum: SURUM,

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



app.use('/api', katalogRoutes);

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

      surum: SURUM,

      durum: 'ok'

    });

  });

  console.warn('[Demo] frontend/dist yok — sadece API modu');

}



app.use('/api', (_req, res) => {

  res.status(404).json({ mesaj: 'API endpoint bulunamadı.', kod: '404' });

});



app.listen(port, '0.0.0.0', () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
  console.log(`[Demo] Sunucu v${SURUM} 0.0.0.0:${port} üzerinde dinliyor ✓`);
  veritabaniBaglan();
});


