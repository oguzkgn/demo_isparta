const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { authZorunlu } = require('../middleware/auth');
const { dbBagli } = require('../lib/dbHelper');
const memoryStore = require('../lib/memoryStore');
const { urunGetir } = require('../lib/urunService');

const router = express.Router();

async function sepetGetir(userId) {
  return User.findById(userId).populate('sepet.urun').select('sepet');
}

router.get('/', authZorunlu, async (req, res) => {
  try {
    if (req.memoryMode) {
      return res.json(memoryStore.sepetGetir(req.user._id));
    }
    const user = await sepetGetir(req.user._id);
    res.json(user?.sepet || []);
  } catch (err) {
    console.error('[Demo] sepet getir hatasi:', err.message);
    res.status(500).json({ mesaj: 'Sepet getirilemedi.' });
  }
});

router.post('/', authZorunlu, async (req, res) => {
  try {
    const { urunId, adet = 1, beden, renk } = req.body;
    const urun = await urunGetir(urunId);
    if (!urun) return res.status(404).json({ mesaj: 'Ürün bulunamadı.' });
    if (urun.stok < 1) return res.status(400).json({ mesaj: 'Ürün stokta yok.' });

    if (req.memoryMode) {
      const sepet = memoryStore.sepeteEkle(req.user._id, urunId, adet, beden, renk);
      return res.json(sepet);
    }

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
    const guncel = await sepetGetir(req.user._id);
    res.json(guncel.sepet);
  } catch (err) {
    console.error('[Demo] sepet ekle hatasi:', err.message);
    res.status(err.status || 500).json({ mesaj: err.message || 'Sepete eklenemedi.' });
  }
});

router.put('/:urunId', authZorunlu, async (req, res) => {
  try {
    const { adet } = req.body;
    if (req.memoryMode) {
      return res.json(memoryStore.sepetGuncelle(req.user._id, req.params.urunId, adet));
    }
    const user = await User.findById(req.user._id);
    const item = user.sepet.find((x) => x.urun.toString() === req.params.urunId);
    if (!item) return res.status(404).json({ mesaj: 'Sepette bulunamadı.' });
    if (adet <= 0) user.sepet = user.sepet.filter((x) => x.urun.toString() !== req.params.urunId);
    else item.adet = adet;
    await user.save();
    const guncel = await sepetGetir(req.user._id);
    res.json(guncel.sepet);
  } catch {
    res.status(500).json({ mesaj: 'Sepet güncellenemedi.' });
  }
});

router.delete('/:urunId', authZorunlu, async (req, res) => {
  try {
    if (req.memoryMode) {
      return res.json(memoryStore.sepettenSil(req.user._id, req.params.urunId));
    }
    const user = await User.findById(req.user._id);
    user.sepet = user.sepet.filter((x) => x.urun.toString() !== req.params.urunId);
    await user.save();
    const guncel = await sepetGetir(req.user._id);
    res.json(guncel.sepet);
  } catch {
    res.status(500).json({ mesaj: 'Sepetten çıkarılamadı.' });
  }
});

module.exports = router;
