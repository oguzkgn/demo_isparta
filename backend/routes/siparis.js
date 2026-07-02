const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const { authZorunlu } = require('../middleware/auth');
const { kuponDogrula } = require('../data/kuponlar');
const { IPTAL_EDILEMEZ } = require('../data/orderDurumlar');

const router = express.Router();
const KARGO_UCRETI = 29.99;

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
    const araToplam = urunler.reduce((t, x) => t + x.fiyat * x.adet, 0);

    let indirim = 0;
    let kuponKodu = null;
    if (req.body.kuponKodu) {
      const kupon = kuponDogrula(req.body.kuponKodu, araToplam);
      if (!kupon.gecerli) return res.status(400).json({ mesaj: kupon.mesaj });
      indirim = kupon.indirim;
      kuponKodu = req.body.kuponKodu.toUpperCase();
    }

    const kargo = araToplam >= 300 ? 0 : KARGO_UCRETI;
    const toplam = Math.max(0, araToplam - indirim + kargo);

    const siparis = await Order.create({
      kullanici: user._id,
      urunler,
      araToplam,
      indirim,
      kargo,
      toplam,
      kuponKodu,
      odemeYontemi: req.body.odemeYontemi || 'kredi_karti',
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

router.patch('/:id/iptal', authZorunlu, async (req, res) => {
  try {
    const siparis = await Order.findOne({ _id: req.params.id, kullanici: req.user._id });
    if (!siparis) return res.status(404).json({ mesaj: 'Sipariş bulunamadı.' });
    if (IPTAL_EDILEMEZ.has(siparis.durum)) {
      return res.status(400).json({ mesaj: 'Bu sipariş iptal edilemez.' });
    }
    siparis.durum = 'iptal';
    await siparis.save();
    res.json(siparis);
  } catch {
    res.status(500).json({ mesaj: 'Sipariş iptal edilemedi.' });
  }
});

module.exports = router;
