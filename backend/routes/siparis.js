const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const { authZorunlu } = require('../middleware/auth');

const router = express.Router();

router.get('/', authZorunlu, async (req, res) => {
  try {
    const siparisler = await Order.find({ kullanici: req.user._id }).sort({ createdAt: -1 });
    res.json(siparisler);
  } catch {
    res.status(500).json({ mesaj: 'Siparişler getirilemedi.' });
  }
});

router.get('/:id', authZorunlu, async (req, res) => {
  try {
    const siparis = await Order.findOne({ _id: req.params.id, kullanici: req.user._id });
    if (!siparis) return res.status(404).json({ mesaj: 'Sipariş bulunamadı.' });
    res.json(siparis);
  } catch {
    res.status(400).json({ mesaj: 'Geçersiz sipariş.' });
  }
});

router.post('/', authZorunlu, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('sepet.urun');
    if (!user.sepet.length) {
      return res.status(400).json({ mesaj: 'Sepetiniz boş.' });
    }

    const urunler = user.sepet.map((item) => ({
      urun: item.urun._id,
      ad: item.urun.ad,
      fiyat: item.urun.fiyat,
      adet: item.adet,
      resim: item.urun.resim
    }));
    const toplam = urunler.reduce((t, x) => t + x.fiyat * x.adet, 0);

    const siparis = await Order.create({
      kullanici: user._id,
      urunler,
      toplam,
      adres: req.body.adres || user.adres,
      konum: req.body.konum || user.konum
    });

    user.sepet = [];
    await user.save();

    res.status(201).json(siparis);
  } catch {
    res.status(500).json({ mesaj: 'Sipariş oluşturulamadı.' });
  }
});

module.exports = router;
