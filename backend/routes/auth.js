const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const { authZorunlu, tokenOlustur } = require('../middleware/auth');
const { dbBagli } = require('../lib/dbHelper');
const memoryStore = require('../lib/memoryStore');
const { kayitDogrula, girisDogrula } = require('../lib/validate');

const router = express.Router();

function kullaniciDon(res, user, token) {
  res.json({ kullanici: user, token });
}

router.post('/satici-kayit', async (req, res) => {
  try {
    const { ad, soyad, email, sifre, telefon } = req.body;
    const hatalar = kayitDogrula({ ad, soyad, email, sifre, telefon });
    if (hatalar.length) {
      return res.status(400).json({ mesaj: hatalar[0], hatalar, kod: 'DOGRULAMA' });
    }

    if (dbBagli()) {
      try {
        if (await User.findOne({ email: email.toLowerCase() })) {
          return res.status(409).json({ mesaj: 'Bu e-posta zaten kayıtlı.', kod: 'EPOSTA_KAYITLI' });
        }
        const user = await User.create({ ad, soyad, email, sifre, telefon, rol: 'kullanici' });
        return kullaniciDon(res, user, tokenOlustur(user._id));
      } catch (err) {
        console.error('[Demo] Mongo satici-kayit hatasi, bellek modu:', err.message);
      }
    }

    const user = await memoryStore.kullaniciKayit({ ad, soyad, email, sifre, telefon });
    kullaniciDon(res, user, tokenOlustur(user._id));
  } catch (err) {
    res.status(err.status || 500).json({
      mesaj: err.message || 'Kayıt oluşturulamadı.',
      kod: err.status === 409 ? 'EPOSTA_KAYITLI' : 'SUNUCU'
    });
  }
});

router.post('/kayit', async (req, res) => {
  try {
    const { ad, soyad, email, sifre, telefon, adres, konum } = req.body;
    const hatalar = kayitDogrula({ ad, soyad, email, sifre, telefon });
    if (hatalar.length) {
      return res.status(400).json({
        mesaj: hatalar[0],
        hatalar,
        kod: 'DOGRULAMA'
      });
    }

    if (dbBagli()) {
      try {
        if (await User.findOne({ email: email.toLowerCase() })) {
          return res.status(409).json({ mesaj: 'Bu e-posta zaten kayıtlı.', kod: 'EPOSTA_KAYITLI' });
        }
        const user = await User.create({ ad, soyad, email, sifre, telefon, adres, konum });
        return kullaniciDon(res, user, tokenOlustur(user._id));
      } catch (err) {
        console.error('[Demo] Mongo kayit hatasi, bellek modu:', err.message);
      }
    }

    const user = await memoryStore.kullaniciKayit({ ad, soyad, email, sifre, telefon, adres, konum });
    kullaniciDon(res, user, tokenOlustur(user._id));
  } catch (err) {
    console.error('[Demo] kayit hatasi:', err.message);
    const status = err.status || 500;
    res.status(status).json({
      mesaj: err.message || 'Kayıt oluşturulamadı.',
      kod: status === 409 ? 'EPOSTA_KAYITLI' : status === 400 ? 'DOGRULAMA' : 'SUNUCU'
    });
  }
});

router.post('/giris', async (req, res) => {
  try {
    const { email, sifre } = req.body;
    const hatalar = girisDogrula({ email, sifre });
    if (hatalar.length) {
      return res.status(400).json({ mesaj: hatalar[0], hatalar, kod: 'DOGRULAMA' });
    }

    if (dbBagli()) {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !(await user.sifreKontrol(sifre))) {
          return res.status(401).json({ mesaj: 'E-posta veya şifre hatalı.', kod: 'GIRIS_HATALI' });
        }
        return kullaniciDon(res, user, tokenOlustur(user._id));
      } catch (err) {
        console.error('[Demo] Mongo giris hatasi, bellek modu:', err.message);
      }
    }

    const user = await memoryStore.kullaniciGiris(email, sifre);
    kullaniciDon(res, user, tokenOlustur(user._id));
  } catch (err) {
    console.error('[Demo] giris hatasi:', err.message);
    res.status(err.status || 500).json({
      mesaj: err.message || 'Giriş yapılamadı.',
      kod: err.status === 401 ? 'GIRIS_HATALI' : 'SUNUCU'
    });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { email, ad, soyad, googleId } = req.body;
    if (!email) return res.status(400).json({ mesaj: 'Google e-posta gerekli.' });

    if (dbBagli()) {
      let user = await User.findOne({ $or: [{ email: email.toLowerCase() }, { googleId }] });
      if (!user) {
        user = await User.create({
          ad: ad || 'Google', soyad: soyad || 'Kullanıcı',
          email, sifre: Math.random().toString(36).slice(2),
          googleId: googleId || `google_${Date.now()}`
        });
      } else if (!user.googleId) {
        user.googleId = googleId || user.googleId;
        await user.save();
      }
      return kullaniciDon(res, user, tokenOlustur(user._id));
    }

    const user = await memoryStore.kullaniciBulVeyaOlustur({
      email, ad, soyad, googleId: googleId || `google_${Date.now()}`
    });
    kullaniciDon(res, user, tokenOlustur(user._id));
  } catch (err) {
    console.error('[Demo] google giris hatasi:', err.message);
    res.status(500).json({ mesaj: 'Google girişi başarısız.' });
  }
});

router.post('/apple', async (req, res) => {
  try {
    const { email, ad, soyad, appleId } = req.body;

    if (dbBagli()) {
      const eposta = email || `apple_${appleId || Date.now()}@demo.local`;
      let user = await User.findOne({ $or: [{ email: eposta.toLowerCase() }, { appleId }] });
      if (!user) {
        user = await User.create({
          ad: ad || 'Apple', soyad: soyad || 'Kullanıcı',
          email: eposta, sifre: Math.random().toString(36).slice(2),
          appleId: appleId || `apple_${Date.now()}`
        });
      }
      return kullaniciDon(res, user, tokenOlustur(user._id));
    }

    const user = await memoryStore.kullaniciBulVeyaOlustur({
      email: email || `apple_${appleId || Date.now()}@demo.local`,
      ad, soyad, appleId: appleId || `apple_${Date.now()}`
    });
    kullaniciDon(res, user, tokenOlustur(user._id));
  } catch (err) {
    console.error('[Demo] apple giris hatasi:', err.message);
    res.status(500).json({ mesaj: 'Apple girişi başarısız.' });
  }
});

router.get('/profil', authZorunlu, (req, res) => res.json(req.user));

router.put('/profil', authZorunlu, async (req, res) => {
  try {
    if (!dbBagli() || memoryStore.isMemoryUser(req.user._id)) {
      return res.status(503).json({ mesaj: 'Profil güncelleme geçici olarak kullanılamıyor.' });
    }
    const { ad, soyad, telefon, adres, konum } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { ad, soyad, telefon, adres, konum }, { new: true }).select('-sifre');
    res.json(user);
  } catch {
    res.status(500).json({ mesaj: 'Profil güncellenemedi.' });
  }
});

router.put('/email', authZorunlu, async (req, res) => {
  try {
    const { email, sifre } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.sifreKontrol(sifre))) return res.status(401).json({ mesaj: 'Şifre hatalı.' });
    if (await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } })) {
      return res.status(409).json({ mesaj: 'E-posta kullanımda.' });
    }
    user.email = email.toLowerCase();
    await user.save();
    res.json(user);
  } catch {
    res.status(500).json({ mesaj: 'E-posta güncellenemedi.' });
  }
});

router.put('/telefon', authZorunlu, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { telefon: req.body.telefon }, { new: true }).select('-sifre');
    res.json(user);
  } catch {
    res.status(500).json({ mesaj: 'Telefon güncellenemedi.' });
  }
});

router.delete('/telefon', authZorunlu, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { telefon: '' }, { new: true }).select('-sifre');
    res.json(user);
  } catch {
    res.status(500).json({ mesaj: 'Telefon silinemedi.' });
  }
});

router.put('/sifre', authZorunlu, async (req, res) => {
  try {
    const { eskiSifre, yeniSifre } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.sifreKontrol(eskiSifre))) return res.status(401).json({ mesaj: 'Mevcut şifre hatalı.' });
    user.sifre = yeniSifre;
    await user.save();
    res.json({ mesaj: 'Şifre güncellendi.' });
  } catch {
    res.status(500).json({ mesaj: 'Şifre güncellenemedi.' });
  }
});

router.delete('/hesap', authZorunlu, async (req, res) => {
  try {
    await Order.deleteMany({ kullanici: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ mesaj: 'Hesabınız silindi.' });
  } catch {
    res.status(500).json({ mesaj: 'Hesap silinemedi.' });
  }
});

router.get('/adresler', authZorunlu, async (req, res) => {
  const user = await User.findById(req.user._id).select('adresler');
  res.json(user.adresler || []);
});

router.post('/adresler', authZorunlu, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.varsayilan) user.adresler.forEach((a) => { a.varsayilan = false; });
    user.adresler.push(req.body);
    await user.save();
    res.status(201).json(user.adresler);
  } catch {
    res.status(500).json({ mesaj: 'Adres eklenemedi.' });
  }
});

router.put('/adresler/:id', authZorunlu, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const adres = user.adresler.id(req.params.id);
    if (!adres) return res.status(404).json({ mesaj: 'Adres bulunamadı.' });
    if (req.body.varsayilan) user.adresler.forEach((a) => { a.varsayilan = false; });
    Object.assign(adres, req.body);
    await user.save();
    res.json(user.adresler);
  } catch {
    res.status(500).json({ mesaj: 'Adres güncellenemedi.' });
  }
});

router.delete('/adresler/:id', authZorunlu, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.adresler.pull(req.params.id);
    await user.save();
    res.json(user.adresler);
  } catch {
    res.status(500).json({ mesaj: 'Adres silinemedi.' });
  }
});

module.exports = router;
