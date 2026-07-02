const express = require('express');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { authZorunlu, rolZorunlu } = require('../middleware/auth');
const { dbBagli } = require('../lib/dbHelper');
const memoryStore = require('../lib/memoryStore');
const { durumGecerliMi } = require('../data/orderDurumlar');

const router = express.Router();

function memoryMod(req) {
  return !dbBagli() || memoryStore.isMemoryUser(req.user._id) || req.memoryMode;
}

async function ensureSatici(req) {
  if (['satici', 'admin'].includes(req.user.rol)) return;

  if (!memoryMod(req)) {
    try {
      let vendor = await Vendor.findOne({ kullanici: req.user._id });
      let user = await User.findById(req.user._id).select('-sifre');
      if (!vendor) {
        vendor = await Vendor.create({
          kullanici: req.user._id,
          magazaAdi: `${user.ad} ${user.soyad} Mağazası`,
          vergiNo: '0000000000',
          telefon: user.telefon || '',
          email: user.email,
          durum: 'onayli'
        });
      }
      if (user.rol !== 'satici' && user.rol !== 'admin') {
        user = await User.findByIdAndUpdate(req.user._id, { rol: 'satici' }, { new: true }).select('-sifre');
      }
      req.user = user;
      return;
    } catch (err) {
      console.error('[Demo] Mongo ensureSatici hatasi:', err.message);
      if (!memoryStore.isMemoryUser(req.user._id)) throw err;
    }
  }

  const { kullanici } = await memoryStore.saticiHazirla(req.user._id);
  req.user = kullanici;
}

async function ensureSaticiMiddleware(req, res, next) {
  try {
    await ensureSatici(req);
    next();
  } catch (err) {
    res.status(err.status || 500).json({ mesaj: err.message || 'Satıcı hesabı hazırlanamadı.' });
  }
}

router.post('/hazir', authZorunlu, async (req, res) => {
  try {
    if (!memoryMod(req)) {
      try {
        let vendor = await Vendor.findOne({ kullanici: req.user._id });
        let user = await User.findById(req.user._id).select('-sifre');
        if (!vendor) {
          vendor = await Vendor.create({
            kullanici: req.user._id,
            magazaAdi: `${user.ad} ${user.soyad} Mağazası`,
            vergiNo: '0000000000',
            telefon: user.telefon || '',
            email: user.email,
            durum: 'onayli'
          });
          user = await User.findByIdAndUpdate(req.user._id, { rol: 'satici' }, { new: true }).select('-sifre');
        } else if (user.rol !== 'satici' && user.rol !== 'admin' && vendor.durum === 'onayli') {
          user = await User.findByIdAndUpdate(req.user._id, { rol: 'satici' }, { new: true }).select('-sifre');
        }
        return res.json({ vendor, kullanici: user });
      } catch (err) {
        console.error('[Demo] Mongo satici hazir hatasi:', err.message);
        if (!memoryStore.isMemoryUser(req.user._id)) {
          return res.status(500).json({ mesaj: 'Satıcı hesabı hazırlanamadı.' });
        }
      }
    }
    const { vendor, kullanici } = await memoryStore.saticiHazirla(req.user._id);
    res.json({ vendor, kullanici });
  } catch (err) {
    res.status(err.status || 500).json({ mesaj: err.message || 'Satıcı hesabı hazırlanamadı.' });
  }
});

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

router.get('/panel/urunler', authZorunlu, ensureSaticiMiddleware, async (req, res) => {
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

router.post('/panel/urunler', authZorunlu, ensureSaticiMiddleware, async (req, res) => {
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

router.put('/panel/urunler/:id', authZorunlu, ensureSaticiMiddleware, async (req, res) => {
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

router.delete('/panel/urunler/:id', authZorunlu, ensureSaticiMiddleware, async (req, res) => {
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

router.get('/panel/siparisler', authZorunlu, ensureSaticiMiddleware, async (req, res) => {
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

router.patch('/panel/siparisler/:id/durum', authZorunlu, ensureSaticiMiddleware, async (req, res) => {
  try {
    const { durum } = req.body;
    if (!durumGecerliMi(durum)) {
      return res.status(400).json({ mesaj: 'Geçersiz sipariş durumu.' });
    }
    if (!memoryMod(req)) {
      const vendor = await Vendor.findOne({ kullanici: req.user._id });
      if (!vendor) return res.status(403).json({ mesaj: 'Satıcı bulunamadı.' });
      const urunIds = (await Product.find({ satici: vendor._id })).map((u) => u._id.toString());
      const siparis = await Order.findById(req.params.id);
      if (!siparis) return res.status(404).json({ mesaj: 'Sipariş bulunamadı.' });
      const saticiUrunuVar = siparis.urunler.some((u) => urunIds.includes(String(u.urun)));
      if (!saticiUrunuVar) return res.status(403).json({ mesaj: 'Bu sipariş size ait değil.' });
      siparis.durum = durum;
      await siparis.save();
      return res.json(siparis);
    }
    res.json({ _id: req.params.id, durum });
  } catch {
    res.status(500).json({ mesaj: 'Sipariş güncellenemedi.' });
  }
});

module.exports = router;
