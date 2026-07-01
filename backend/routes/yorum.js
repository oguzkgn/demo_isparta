const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { authZorunlu } = require('../middleware/auth');

const router = express.Router();

router.get('/urun/:urunId', async (req, res) => {
  try {
    const yorumlar = await Review.find({ urun: req.params.urunId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(yorumlar);
  } catch {
    res.status(500).json({ mesaj: 'Yorumlar getirilemedi.' });
  }
});

router.post('/urun/:urunId', authZorunlu, async (req, res) => {
  try {
    const { puan, yorum } = req.body;
    if (!puan || !yorum?.trim()) {
      return res.status(400).json({ mesaj: 'Puan ve yorum gerekli.' });
    }
    const urun = await Product.findById(req.params.urunId);
    if (!urun) return res.status(404).json({ mesaj: 'Ürün bulunamadı.' });

    const mevcut = await Review.findOne({ urun: urun._id, kullanici: req.user._id });
    if (mevcut) return res.status(409).json({ mesaj: 'Bu ürüne zaten yorum yaptınız.' });

    const yeni = await Review.create({
      urun: urun._id,
      kullanici: req.user._id,
      kullaniciAd: `${req.user.ad} ${req.user.soyad.charAt(0)}.`,
      puan,
      yorum: yorum.trim()
    });

    const tum = await Review.find({ urun: urun._id });
    urun.puan = tum.reduce((t, y) => t + y.puan, 0) / tum.length;
    urun.yorumSayisi = tum.length;
    await urun.save();

    res.status(201).json(yeni);
  } catch {
    res.status(500).json({ mesaj: 'Yorum eklenemedi.' });
  }
});

module.exports = router;
