const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { authZorunlu } = require('../middleware/auth');

const router = express.Router();

router.get('/', authZorunlu, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favoriler');
    res.json(user.favoriler);
  } catch {
    res.status(500).json({ mesaj: 'Favoriler getirilemedi.' });
  }
});

router.post('/:urunId', authZorunlu, async (req, res) => {
  try {
    const urun = await Product.findById(req.params.urunId);
    if (!urun) return res.status(404).json({ mesaj: 'Ürün bulunamadı.' });

    const user = await User.findById(req.user._id);
    if (!user.favoriler.some((id) => id.toString() === req.params.urunId)) {
      user.favoriler.push(req.params.urunId);
      await user.save();
    }
    const guncel = await User.findById(req.user._id).populate('favoriler');
    res.json(guncel.favoriler);
  } catch {
    res.status(500).json({ mesaj: 'Favorilere eklenemedi.' });
  }
});

router.delete('/:urunId', authZorunlu, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { favoriler: req.params.urunId }
    });
    const guncel = await User.findById(req.user._id).populate('favoriler');
    res.json(guncel.favoriler);
  } catch {
    res.status(500).json({ mesaj: 'Favorilerden çıkarılamadı.' });
  }
});

module.exports = router;
