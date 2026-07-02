const express = require('express');
const User = require('../models/User');
const { authZorunlu } = require('../middleware/auth');
const memoryStore = require('../lib/memoryStore');
const { urunleriGetir } = require('../lib/urunService');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) {
      return res.json({ urunler: [], oneriler: [] });
    }

    const urunler = (await urunleriGetir({ ara: q })).slice(0, 20);
    const markalar = [...new Set(urunler.map((u) => u.marka).filter(Boolean))];
    const oneriler = [
      ...markalar.slice(0, 3).map((m) => ({ tip: 'marka', metin: m })),
      ...urunler.slice(0, 5).map((u) => ({ tip: 'urun', metin: u.ad, id: u._id }))
    ];

    res.json({ urunler, oneriler });
  } catch (err) {
    console.error('[Demo] arama hatasi:', err.message);
    res.status(500).json({ mesaj: 'Arama yapılamadı.' });
  }
});

router.get('/son-gorulen', authZorunlu, async (req, res) => {
  try {
    if (req.memoryMode) {
      return res.json(memoryStore.sonGorulenGetir(req.user._id));
    }
    const user = await User.findById(req.user._id).populate('sonGorulenler');
    res.json(user.sonGorulenler || []);
  } catch (err) {
    console.error('[Demo] son gorulen hatasi:', err.message);
    res.status(500).json({ mesaj: 'Son görülenler getirilemedi.' });
  }
});

router.post('/son-gorulen/:urunId', authZorunlu, async (req, res) => {
  try {
    if (req.memoryMode) {
      memoryStore.sonGorulenEkle(req.user._id, req.params.urunId);
      return res.json({ ok: true });
    }
    const user = await User.findById(req.user._id);
    user.sonGorulenler = user.sonGorulenler.filter(
      (id) => id.toString() !== req.params.urunId
    );
    user.sonGorulenler.unshift(req.params.urunId);
    user.sonGorulenler = user.sonGorulenler.slice(0, 12);
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('[Demo] son gorulen kayit hatasi:', err.message);
    res.status(500).json({ mesaj: 'Kaydedilemedi.' });
  }
});

module.exports = router;
