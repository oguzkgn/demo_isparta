const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { authZorunlu } = require('../middleware/auth');

const router = express.Router();

async function sepetGetir(userId) {
  return User.findById(userId).populate('sepet.urun').select('sepet');
}

router.get('/', authZorunlu, async (req, res) => {
  try {
    const user = await sepetGetir(req.user._id);
    res.json(user?.sepet || []);
  } catch {
    res.status(500).json({ mesaj: 'Sepet getirilemedi.' });
  }
});

router.post('/', authZorunlu, async (req, res) => {
  try {
    const { urunId, adet = 1, beden, renk } = req.body;
    const urun = await Product.findById(urunId);
    if (!urun) return res.status(404).json({ mesaj: 'Ürün bulunamadı.' });
    if (urun.stok < 1) return res.status(400).json({ mesaj: 'Ürün stokta yok.' });

    const user = await User.findById(req.user._id);
    const mevcut = user.sepet.find((x) => x.urun.toString() === urunId);
    const yeniAdet = (mevcut?.adet || 0) + adet;
    if (yeniAdet > urun.stok) {
      return res.status(400).json({ mesaj: `Stok yetersiz. Maksimum ${urun.stok} adet.` });
    }
    if (mevcut) {
      mevcut.adet = yeniAdet;
      if (beden) mevcut.beden = beden;
      if (renk) mevcut.renk = renk;
    } else {
      user.sepet.push({ urun: urunId, adet, beden, renk });
    }
    await user.save();
    res.json((await sepetGetir(req.user._id)).sepet);
  } catch {
    res.status(500).json({ mesaj: 'Sepete eklenemedi.' });
  }
});

router.patch('/:urunId', authZorunlu, async (req, res) => {
  try {
    const { adet } = req.body;
    if (!adet || adet < 1) return res.status(400).json({ mesaj: 'Geçersiz adet.' });

    const user = await User.findById(req.user._id);
    const item = user.sepet.find((x) => x.urun.toString() === req.params.urunId);
    if (!item) return res.status(404).json({ mesaj: 'Ürün sepette yok.' });

    const urun = await Product.findById(req.params.urunId);
    if (adet > urun.stok) {
      return res.status(400).json({ mesaj: `Stok yetersiz. Maksimum ${urun.stok} adet.` });
    }
    item.adet = adet;
    await user.save();
    res.json((await sepetGetir(req.user._id)).sepet);
  } catch {
    res.status(500).json({ mesaj: 'Sepet güncellenemedi.' });
  }
});

router.delete('/:urunId', authZorunlu, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { sepet: { urun: req.params.urunId } } });
    res.json((await sepetGetir(req.user._id)).sepet);
  } catch {
    res.status(500).json({ mesaj: 'Sepetten çıkarılamadı.' });
  }
});

router.delete('/', authZorunlu, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { sepet: [] });
    res.json([]);
  } catch {
    res.status(500).json({ mesaj: 'Sepet temizlenemedi.' });
  }
});

module.exports = router;
