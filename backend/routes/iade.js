const express = require('express');
const Return = require('../models/Return');
const Order = require('../models/Order');
const { authZorunlu, epostaDogrulandiZorunlu, rolZorunlu } = require('../middleware/auth');

const router = express.Router();

router.get('/', authZorunlu, epostaDogrulandiZorunlu, async (req, res) => {
  const list = await Return.find({ kullanici: req.user._id }).sort({ createdAt: -1 });
  res.json(list);
});

router.post('/', authZorunlu, epostaDogrulandiZorunlu, async (req, res) => {
  try {
    const siparis = await Order.findOne({ _id: req.body.siparisId, kullanici: req.user._id });
    if (!siparis) return res.status(404).json({ mesaj: 'Sipariş bulunamadı.' });
    if (siparis.durum !== 'teslim') {
      return res.status(400).json({ mesaj: 'Sadece teslim edilmiş siparişler iade edilebilir.' });
    }
    const mevcut = await Return.findOne({ siparis: siparis._id });
    if (mevcut) return res.status(409).json({ mesaj: 'Bu sipariş için iade talebi mevcut.' });

    const iade = await Return.create({
      siparis: siparis._id,
      kullanici: req.user._id,
      urunler: siparis.urunler,
      neden: req.body.neden
    });
    res.status(201).json(iade);
  } catch {
    res.status(500).json({ mesaj: 'İade talebi oluşturulamadı.' });
  }
});

router.patch('/:id/onay', authZorunlu, epostaDogrulandiZorunlu, rolZorunlu('admin', 'satici'), async (req, res) => {
  const iade = await Return.findByIdAndUpdate(req.params.id, { durum: 'onaylandi' }, { new: true });
  res.json(iade);
});

module.exports = router;
