const express = require('express');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { authZorunlu, rolZorunlu } = require('../middleware/auth');
const { dbBagli } = require('../lib/dbHelper');
const memoryStore = require('../lib/memoryStore');

const router = express.Router();

function memoryMod(req) {
  return !dbBagli() || memoryStore.isMemoryUser(req.user._id) || req.memoryMode;
}

router.post('/basvuru', authZorunlu, async (req, res) => {
  try {
    if (['satici', 'admin'].includes(req.user.rol)) {
      return res.status(409).json({ mesaj: 'Zaten satıcı hesabınız var.' });
    }

    if (!memoryMod(req)) {
      try {
        const mevcut = await Vendor.findOne({ kullanici: req.user._id });
        if (mevcut) return res.status(409).json({ mesaj: 'Başvurunuz mevcut.', basvuru: mevcut });

        const vendor = await Vendor.create({
          kullanici: req.user._id,
          magazaAdi: req.body.magazaAdi,
          vergiNo: req.body.vergiNo,
          telefon: req.body.telefon || req.user.telefon,
          email: req.body.email || req.user.email,
          adres: req.body.adres,
          aciklama: req.body.aciklama,
          durum: 'beklemede'
        });
        return res.status(201).json(vendor);
      } catch (err) {
        console.error('[Demo] Mongo basvuru hatasi, bellek modu:', err.message);
      }
    }

    const { vendor, kullanici } = await memoryStore.saticiBasvuru(req.user._id, req.body);
    res.status(201).json({ ...vendor, kullanici });
  } catch (err) {
    res.status(err.status || 500).json({ mesaj: err.message || 'Başvuru gönderilemedi.' });
  }
});

router.get('/benim', authZorunlu, async (req, res) => {
  try {
    if (!memoryMod(req)) {
      const vendor = await Vendor.findOne({ kullanici: req.user._id });
      return res.json(vendor);
    }
    res.json(memoryStore.saticiBul(req.user._id));
  } catch {
    res.status(500).json({ mesaj: 'Satıcı bilgisi alınamadı.' });
  }
});

router.get('/basvurular', authZorunlu, rolZorunlu('admin'), async (_req, res) => {
  const list = await Vendor.find({ durum: 'beklemede' }).populate('kullanici', 'ad soyad email');
  res.json(list);
});

router.patch('/:id/onayla', authZorunlu, rolZorunlu('admin'), async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, { durum: 'onayli' }, { new: true });
  if (vendor) {
    await User.findByIdAndUpdate(vendor.kullanici, { rol: 'satici', satici: vendor._id });
  }
  res.json(vendor);
});

router.patch('/:id/reddet', authZorunlu, rolZorunlu('admin'), async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, {
    durum: 'reddedildi', redNedeni: req.body.redNedeni || 'Başvuru reddedildi'
  }, { new: true });
  res.json(vendor);
});

router.get('/panel/urunler', authZorunlu, rolZorunlu('satici', 'admin'), async (req, res) => {
  try {
    if (!memoryMod(req)) {
      const vendor = await Vendor.findOne({ kullanici: req.user._id });
      if (!vendor) return res.status(404).json({ mesaj: 'Satıcı bulunamadı.' });
      const urunler = await Product.find({ satici: vendor._id });
      return res.json(urunler);
    }
    res.json(memoryStore.saticiUrunleri(req.user._id));
  } catch {
    res.status(500).json({ mesaj: 'Ürünler getirilemedi.' });
  }
});

router.post('/panel/urunler', authZorunlu, rolZorunlu('satici', 'admin'), async (req, res) => {
  try {
    if (!memoryMod(req)) {
      const vendor = await Vendor.findOne({ kullanici: req.user._id, durum: 'onayli' });
      if (!vendor) return res.status(403).json({ mesaj: 'Onaylı satıcı değilsiniz.' });
      const urun = await Product.create({ ...req.body, satici: vendor._id, saticiAd: vendor.magazaAdi });
      return res.status(201).json(urun);
    }
    const urun = memoryStore.saticiUrunEkle(req.user._id, req.body);
    if (!urun) return res.status(403).json({ mesaj: 'Onaylı satıcı değilsiniz.' });
    res.status(201).json(urun);
  } catch {
    res.status(500).json({ mesaj: 'Ürün eklenemedi.' });
  }
});

router.put('/panel/urunler/:id', authZorunlu, rolZorunlu('satici', 'admin'), async (req, res) => {
  try {
    if (!memoryMod(req)) {
      const vendor = await Vendor.findOne({ kullanici: req.user._id });
      const urun = await Product.findOneAndUpdate(
        { _id: req.params.id, satici: vendor._id },
        req.body, { new: true }
      );
      if (!urun) return res.status(404).json({ mesaj: 'Ürün bulunamadı.' });
      return res.json(urun);
    }
    const urun = memoryStore.saticiUrunGuncelle(req.user._id, req.params.id, req.body);
    if (!urun) return res.status(404).json({ mesaj: 'Ürün bulunamadı.' });
    res.json(urun);
  } catch {
    res.status(500).json({ mesaj: 'Ürün güncellenemedi.' });
  }
});

router.delete('/panel/urunler/:id', authZorunlu, rolZorunlu('satici', 'admin'), async (req, res) => {
  try {
    if (!memoryMod(req)) {
      const vendor = await Vendor.findOne({ kullanici: req.user._id });
      await Product.findOneAndDelete({ _id: req.params.id, satici: vendor._id });
      return res.json({ mesaj: 'Ürün silindi.' });
    }
    if (!memoryStore.saticiUrunSil(req.user._id, req.params.id)) {
      return res.status(404).json({ mesaj: 'Ürün bulunamadı.' });
    }
    res.json({ mesaj: 'Ürün silindi.' });
  } catch {
    res.status(500).json({ mesaj: 'Ürün silinemedi.' });
  }
});

router.get('/panel/siparisler', authZorunlu, rolZorunlu('satici', 'admin'), async (req, res) => {
  try {
    if (!memoryMod(req)) {
      const vendor = await Vendor.findOne({ kullanici: req.user._id });
      const urunIds = (await Product.find({ satici: vendor._id })).map((u) => u._id.toString());
      const siparisler = await Order.find({ 'urunler.urun': { $in: urunIds } }).sort({ createdAt: -1 });
      return res.json(siparisler);
    }
    res.json(memoryStore.saticiSiparisleri(req.user._id));
  } catch {
    res.status(500).json({ mesaj: 'Siparişler getirilemedi.' });
  }
});

router.patch('/panel/siparisler/:id/durum', authZorunlu, rolZorunlu('satici', 'admin'), async (req, res) => {
  try {
    if (!memoryMod(req)) {
      const { durum } = req.body;
      const siparis = await Order.findByIdAndUpdate(req.params.id, { durum }, { new: true });
      return res.json(siparis);
    }
    res.json({ _id: req.params.id, durum: req.body.durum });
  } catch {
    res.status(500).json({ mesaj: 'Sipariş güncellenemedi.' });
  }
});

module.exports = router;
