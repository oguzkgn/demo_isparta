const express = require('express');
const User = require('../models/User');
const { authZorunlu } = require('../middleware/auth');
const memoryStore = require('../lib/memoryStore');
const { urunGetir } = require('../lib/urunService');

const router = express.Router();

router.get('/', authZorunlu, async (req, res) => {
  try {
    if (req.memoryMode) {
      return res.json(memoryStore.favorilerGetir(req.user._id));
    }
    const user = await User.findById(req.user._id).populate('favoriler');
    res.json(user.favoriler);
  } catch (err) {
    console.error('[Demo] favoriler hatasi:', err.message);
    res.status(500).json({ mesaj: 'Favoriler getirilemedi.' });
  }
});

router.post('/:urunId', authZorunlu, async (req, res) => {
  try {
    const urun = await urunGetir(req.params.urunId);
    if (!urun) return res.status(404).json({ mesaj: 'Ürün bulunamadı.' });

    if (req.memoryMode) {
      const list = memoryStore.favoriEkle(req.user._id, req.params.urunId);
      return res.json(list);
    }

    const user = await User.findById(req.user._id);
    if (!user.favoriler.some((id) => id.toString() === req.params.urunId)) {
      user.favoriler.push(req.params.urunId);
      await user.save();
    }
    const guncel = await User.findById(req.user._id).populate('favoriler');
    res.json(guncel.favoriler);
  } catch (err) {
    console.error('[Demo] favori ekle hatasi:', err.message);
    res.status(500).json({ mesaj: 'Favorilere eklenemedi.' });
  }
});

router.delete('/:urunId', authZorunlu, async (req, res) => {
  try {
    if (req.memoryMode) {
      return res.json(memoryStore.favoriSil(req.user._id, req.params.urunId));
    }
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { favoriler: req.params.urunId }
    });
    const guncel = await User.findById(req.user._id).populate('favoriler');
    res.json(guncel.favoriler);
  } catch (err) {
    console.error('[Demo] favori sil hatasi:', err.message);
    res.status(500).json({ mesaj: 'Favorilerden çıkarılamadı.' });
  }
});

module.exports = router;
