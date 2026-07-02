const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const { authZorunlu, tokenOlustur } = require('../middleware/auth');
const { dbBagli } = require('../lib/dbHelper');
const memoryStore = require('../lib/memoryStore');
const { kayitDogrula, girisDogrula } = require('../lib/validate');
const { kodAta, epostaDogrulandiMi, kodDogrula, dogrulamaTamamla } = require('../lib/emailDogrulama');
const { dogrulamaMailiGonder } = require('../lib/emailService');

const router = express.Router();

function kullaniciDon(res, user, token, extra = {}) {
  res.json({ kullanici: user, token, ...extra });
}

function epostaDogrulanmadi(res, email, mesaj) {
  return res.status(403).json({
    mesaj: mesaj || 'E-posta adresiniz doğrulanmamış. Gelen kutunuzdaki kodu girin.',
    kod: 'EPOSTA_DOGRULANMADI',
    email
  });
}

async function dogrulamaGonder(userDoc) {
  kodAta(userDoc);
  if (typeof userDoc.save === 'function') await userDoc.save();
  await dogrulamaMailiGonder(userDoc);
  return userDoc;
}

async function mongoKullaniciBulEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

async function kayitSonrasiDogrulama(userPlain, res) {
  if (dbBagli()) {
    try {
      const user = await User.findById(userPlain._id);
      if (user) await dogrulamaGonder(user);
    } catch (err) {
      console.error('[Demo] doğrulama maili:', err.message);
    }
  } else {
    const u = memoryStore.kullaniciDogrulamaAta(userPlain.email);
    if (u) await dogrulamaMailiGonder(u);
  }
  res.status(201).json({
    mesaj: 'Kayıt oluşturuldu. E-postanıza doğrulama kodu gönderildi.',
    email: userPlain.email,
    emailDogrulandi: false,
    kod: 'EPOSTA_DOGRULANMADI'
  });
}

async function girisOncesiDogrulama(user, res, next) {
  if (epostaDogrulandiMi(user)) return next();
  if (dbBagli() && user._id && !memoryStore.isMemoryUser(user._id)) {
    try {
      const doc = await User.findById(user._id);
      if (doc) await dogrulamaGonder(doc);
    } catch (err) {
      console.error('[Demo] doğrulama maili:', err.message);
    }
  } else {
    memoryStore.kullaniciDogrulamaAta(user.email);
    const u = memoryStore.kullaniciEmailIle(user.email);
    if (u) await dogrulamaMailiGonder(u);
  }
  return epostaDogrulanmadi(res, user.email, 'E-posta doğrulanmamış. Yeni kod gönderildi.');
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
        const user = await User.create({ ad, soyad, email, sifre, telefon, rol: 'kullanici', emailDogrulandi: false });
        return kayitSonrasiDogrulama(user, res);
      } catch (err) {
        console.error('[Demo] Mongo satici-kayit hatasi, bellek modu:', err.message);
      }
    }

    const user = await memoryStore.kullaniciKayit({ ad, soyad, email, sifre, telefon });
    return kayitSonrasiDogrulama(user, res);
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
        const user = await User.create({ ad, soyad, email, sifre, telefon, adres, konum, emailDogrulandi: false });
        return kayitSonrasiDogrulama(user, res);
      } catch (err) {
        console.error('[Demo] Mongo kayit hatasi, bellek modu:', err.message);
      }
    }

    const user = await memoryStore.kullaniciKayit({ ad, soyad, email, sifre, telefon, adres, konum });
    return kayitSonrasiDogrulama(user, res);
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
        return girisOncesiDogrulama(user, res, () => kullaniciDon(res, user, tokenOlustur(user._id)));
      } catch (err) {
        console.error('[Demo] Mongo giris hatasi, bellek modu:', err.message);
      }
    }

    const user = await memoryStore.kullaniciGiris(email, sifre);
    return girisOncesiDogrulama(user, res, () => kullaniciDon(res, user, tokenOlustur(user._id)));
  } catch (err) {
    console.error('[Demo] giris hatasi:', err.message);
    res.status(err.status || 500).json({
      mesaj: err.message || 'Giriş yapılamadı.',
      kod: err.status === 401 ? 'GIRIS_HATALI' : 'SUNUCU'
    });
  }
});

router.post('/eposta-dogrula', async (req, res) => {
  try {
    const { email, kod } = req.body;
    if (!email || !kod) {
      return res.status(400).json({ mesaj: 'E-posta ve doğrulama kodu gerekli.', kod: 'DOGRULAMA' });
    }

    if (dbBagli()) {
      try {
        const user = await mongoKullaniciBulEmail(email);
        if (!user || !kodDogrula(user, kod)) {
          return res.status(400).json({ mesaj: 'Geçersiz veya süresi dolmuş kod.', kod: 'KOD_HATALI' });
        }
        dogrulamaTamamla(user);
        await user.save();
        return kullaniciDon(res, user, tokenOlustur(user._id), { mesaj: 'E-posta doğrulandı.' });
      } catch (err) {
        console.error('[Demo] Mongo eposta-dogrula:', err.message);
      }
    }

    const user = memoryStore.kullaniciDogrula(email, kod);
    if (!user) {
      return res.status(400).json({ mesaj: 'Geçersiz veya süresi dolmuş kod.', kod: 'KOD_HATALI' });
    }
    return kullaniciDon(res, user, tokenOlustur(user._id), { mesaj: 'E-posta doğrulandı.' });
  } catch {
    res.status(500).json({ mesaj: 'Doğrulama başarısız.', kod: 'SUNUCU' });
  }
});

router.post('/eposta-dogrula/yeniden', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ mesaj: 'E-posta gerekli.' });

    if (dbBagli()) {
      try {
        const user = await mongoKullaniciBulEmail(email);
        if (!user) return res.status(404).json({ mesaj: 'Hesap bulunamadı.' });
        if (epostaDogrulandiMi(user)) {
          return res.status(400).json({ mesaj: 'E-posta zaten doğrulanmış.' });
        }
        await dogrulamaGonder(user);
        return res.json({ mesaj: 'Doğrulama kodu yeniden gönderildi.', email: user.email });
      } catch (err) {
        console.error('[Demo] Mongo yeniden gönder:', err.message);
      }
    }

    const user = memoryStore.kullaniciDogrulamaAta(email);
    if (!user) return res.status(404).json({ mesaj: 'Hesap bulunamadı.' });
    await dogrulamaMailiGonder(user);
    res.json({ mesaj: 'Doğrulama kodu yeniden gönderildi.', email: user.email });
  } catch {
    res.status(500).json({ mesaj: 'Kod gönderilemedi.' });
  }
});

async function sosyalGiris(req, res, { email, ad, soyad, googleId, appleId }) {
  if (!email || email.includes('@demo.local')) {
    return res.status(400).json({
      mesaj: 'Apple/Google girişi için geçerli e-posta gerekli.',
      kod: 'DOGRULAMA'
    });
  }

  if (dbBagli()) {
    try {
      let user = await User.findOne({ $or: [{ email: email.toLowerCase() }, ...(googleId ? [{ googleId }] : []), ...(appleId ? [{ appleId }] : [])] });
      const yeniHesap = !user;
      if (!user) {
        user = await User.create({
          ad: ad || 'Kullanıcı',
          soyad: soyad || '',
          email: email.toLowerCase(),
          sifre: Math.random().toString(36).slice(2),
          googleId: googleId || undefined,
          appleId: appleId || undefined,
          emailDogrulandi: false
        });
      } else {
        if (googleId && !user.googleId) user.googleId = googleId;
        if (appleId && !user.appleId) user.appleId = appleId;
        await user.save();
      }
      if (yeniHesap || !epostaDogrulandiMi(user)) {
        await dogrulamaGonder(user);
        return epostaDogrulanmadi(res, user.email, 'Doğrulama kodu e-postanıza gönderildi.');
      }
      return kullaniciDon(res, user, tokenOlustur(user._id));
    } catch (err) {
      console.error('[Demo] sosyal giris mongo:', err.message);
    }
  }

  const user = await memoryStore.kullaniciBulVeyaOlustur({ email, ad, soyad, googleId, appleId });
  if (!epostaDogrulandiMi(user)) {
    memoryStore.kullaniciDogrulamaAta(user.email);
    const u = memoryStore.kullaniciEmailIle(user.email);
    if (u) await dogrulamaMailiGonder(u);
    return epostaDogrulanmadi(res, user.email, 'Doğrulama kodu e-postanıza gönderildi.');
  }
  kullaniciDon(res, user, tokenOlustur(user._id));
}

router.post('/google', async (req, res) => {
  try {
    const { email, ad, soyad, googleId } = req.body;
    if (!email) return res.status(400).json({ mesaj: 'Google e-posta gerekli.' });
    await sosyalGiris(req, res, { email, ad, soyad, googleId: googleId || `google_${email}` });
  } catch (err) {
    console.error('[Demo] google giris hatasi:', err.message);
    res.status(500).json({ mesaj: 'Google girişi başarısız.' });
  }
});

router.post('/apple', async (req, res) => {
  try {
    const { email, ad, soyad, appleId } = req.body;
    if (!email) {
      return res.status(400).json({ mesaj: 'Apple girişi için e-posta adresinizi girin.', kod: 'DOGRULAMA' });
    }
    await sosyalGiris(req, res, { email, ad, soyad, appleId: appleId || `apple_${email}` });
  } catch (err) {
    console.error('[Demo] apple giris hatasi:', err.message);
    res.status(500).json({ mesaj: 'Apple girişi başarısız.' });
  }
});

router.get('/profil', authZorunlu, (req, res) => {
  if (!epostaDogrulandiMi(req.user)) {
    return epostaDogrulanmadi(res, req.user.email);
  }
  res.json(req.user);
});

router.put('/profil', authZorunlu, async (req, res) => {
  try {
    if (!epostaDogrulandiMi(req.user)) {
      return epostaDogrulanmadi(res, req.user.email);
    }
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
    user.emailDogrulandi = false;
    await dogrulamaGonder(user);
    res.json({ mesaj: 'E-posta güncellendi. Yeni adrese doğrulama kodu gönderildi.', email: user.email, emailDogrulandi: false });
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
