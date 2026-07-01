const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authZorunlu, rolZorunlu } = require('../middleware/auth');

const router = express.Router();

async function puanGuncelle(urunId) {
  const onayli = await Review.find({ urun: urunId, onayDurumu: 'onaylandi' });
  const urun = await Product.findById(urunId);
  if (!urun) return;
  if (onayli.length === 0) return;
  urun.puan = onayli.reduce((t, y) => t + y.puan, 0) / onayli.length;
  urun.yorumSayisi = onayli.length;
  await urun.save();
}

router.get('/urun/:urunId', async (req, res) => {
  try {
    const yorumlar = await Review.find({ urun: req.params.urunId, onayDurumu: 'onaylandi' })
      .sort({ createdAt: -1 }).limit(50);
    res.json(yorumlar);
  } catch {
    res.status(500).json({ mesaj: 'Yorumlar getirilemedi.' });
  }
});

router.get('/bekleyen', authZorunlu, rolZorunlu('admin'), async (_req, res) => {
  const yorumlar = await Review.find({ onayDurumu: 'beklemede' }).populate('urun', 'ad').sort({ createdAt: -1 });
  res.json(yorumlar);
});

router.patch('/:id/onay', authZorunlu, rolZorunlu('admin'), async (req, res) => {
  const yorum = await Review.findByIdAndUpdate(req.params.id, { onayDurumu: 'onaylandi' }, { new: true });
  if (yorum) await puanGuncelle(yorum.urun);
  res.json(yorum);
});

router.patch('/:id/red', authZorunlu, rolZorunlu('admin'), async (req, res) => {
  const yorum = await Review.findByIdAndUpdate(req.params.id, { onayDurumu: 'reddedildi' }, { new: true });
  res.json(yorum);
});

router.post('/urun/:urunId', authZorunlu, async (req, res) => {
  try {
    const { puan, yorum, fotoUrl, siparisId } = req.body;
    if (!puan || !yorum?.trim()) return res.status(400).json({ mesaj: 'Puan ve yorum gerekli.' });

    const urun = await Product.findById(req.params.urunId);
    if (!urun) return res.status(404).json({ mesaj: 'Ürün bulunamadı.' });

    const teslimSiparis = await Order.findOne({
      kullanici: req.user._id,
      durum: 'teslim',
      'urunler.urun': urun._id
    });
    if (!teslimSiparis) {
      return res.status(403).json({ mesaj: 'Yorum yapmak için ürünün teslim edilmiş olması gerekir.' });
    }

    if (await Review.findOne({ urun: urun._id, kullanici: req.user._id })) {
      return res.status(409).json({ mesaj: 'Bu ürüne zaten yorum yaptınız.' });
    }

    const yeni = await Review.create({
      urun: urun._id,
      kullanici: req.user._id,
      siparis: siparisId || teslimSiparis._id,
      kullaniciAd: `${req.user.ad} ${req.user.soyad.charAt(0)}.`,
      puan, yorum: yorum.trim(), fotoUrl,
      onayDurumu: 'beklemede'
    });

    res.status(201).json({ ...yeni.toObject(), mesaj: 'Yorumunuz onay bekliyor.' });
  } catch {
    res.status(500).json({ mesaj: 'Yorum eklenemedi.' });
  }
});

module.exports = router;
