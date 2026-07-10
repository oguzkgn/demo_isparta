const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const { authZorunlu, epostaDogrulandiZorunlu, tokenOlustur } = require('../middleware/auth');
const { dbBagli } = require('../lib/dbHelper');
const memoryStore = require('../lib/memoryStore');
const { kayitDogrula, girisDogrula } = require('../lib/validate');
const { kodAta, sifreSifirlamaKoduAta, epostaDogrulandiMi, kodDogrula, dogrulamaTamamla } = require('../lib/emailDogrulama');
const {
  dogrulamaMailiArkaPlanGonder,
  sifreSifirlamaMailiArkaPlanGonder,
  smtpYapilandirildiMi
} = require('../lib/emailService');

const router = express.Router();

const GIRIS_DB_TIMEOUT_MS = 12000;

function kullaniciDon(res, user, token, extra = {}) {
  const kullanici = user?.toJSON ? user.toJSON() : user;
  return res.json({ kullanici, token, ...extra });
}

function sunucuHataYanit(res, error, status = 500) {
  if (res.headersSent) return;
  return res.status(status).json({
    mesaj: status === 401 ? (error?.message || 'Giriş başarısız.') : 'Sunucu hatası',
    message: status === 401 ? (error?.message || 'Giriş başarısız.') : 'Sunucu hatası',
    error: error?.message || String(error),
    kod: status === 401 ? 'GIRIS_HATALI' : 'SUNUCU'
  });
}

function epostaDogrulanmadi(res, email, mesaj) {
  return res.status(403).json({
    mesaj: mesaj || 'E-posta adresiniz doğrulanmamış. Gelen kutunuzdaki kodu girin.',
    kod: 'EPOSTA_DOGRULANMADI',
    email
  });
}

async function dogrulamaKoduKaydet(userDoc, { sifreSifirlama = false } = {}) {
  if (sifreSifirlama) sifreSifirlamaKoduAta(userDoc);
  else kodAta(userDoc);
  if (typeof userDoc.save === 'function') await userDoc.save();
  return userDoc;
}

async function kayitSonrasiDogrulama(res, { mongoId, email }) {
  let kullanici = null;
  let token = null;

  try {
    if (dbBagli() && mongoId) {
      const user = await User.findById(mongoId);
      if (!user) {
        return res.status(500).json({ mesaj: 'Kayıt oluştu ancak kullanıcı yüklenemedi.', kod: 'SUNUCU' });
      }
      kullanici = user.toJSON ? user.toJSON() : user;
      token = tokenOlustur(user._id);
    } else {
      const ham = memoryStore.kullaniciHamEmailIle(email);
      if (!ham) {
        return res.status(500).json({ mesaj: 'Kayıt oluştu ancak kullanıcı yüklenemedi.', kod: 'SUNUCU' });
      }
      kullanici = memoryStore.kullaniciEmailIle(email);
      token = tokenOlustur(ham._id);
    }
  } catch (err) {
    console.error('[Demo] Kayıt sonrası kullanıcı yükleme:', err.message);
    return res.status(500).json({ mesaj: 'Kayıt tamamlanamadı.', kod: 'SUNUCU' });
  }

  let mailGonderildi = false;
  let mailHata = null;

  try {
    if (dbBagli() && mongoId) {
      const user = await User.findById(mongoId);
      if (user) {
        await dogrulamaKoduKaydet(user);
        if (smtpYapilandirildiMi()) {
          dogrulamaMailiArkaPlanGonder(user);
          mailGonderildi = true;
        } else {
          mailHata = 'SMTP yapılandırılmamış';
        }
      }
    } else {
      memoryStore.kullaniciDogrulamaAta(email);
      const ham = memoryStore.kullaniciHamEmailIle(email);
      if (ham && smtpYapilandirildiMi()) {
        dogrulamaMailiArkaPlanGonder(ham);
        mailGonderildi = true;
      } else if (!smtpYapilandirildiMi()) {
        mailHata = 'SMTP yapılandırılmamış';
      }
    }
  } catch (err) {
    console.error('[Demo] Kayıt sonrası doğrulama kodu/mail:', err.message);
    mailHata = err.message;
  }

  const mesaj = mailGonderildi
    ? 'Kayıt başarılı. Doğrulama kodu e-postanıza gönderiliyor; gelmezse «Kodu yeniden gönder» kullanın.'
    : 'Kayıt başarılı ancak doğrulama e-postası gönderilemedi. «Kodu yeniden gönder» ile tekrar deneyin.';

  return res.status(201).json({
    mesaj,
    email,
    kullanici,
    token,
    emailDogrulandi: false,
    mailGonderildi,
    mailHata: mailHata || undefined,
    dogrulamaGerekli: true,
    islemKodu: mailGonderildi ? 'EPOSTA_BEKLENIYOR' : 'KAYIT_MAIL_HATASI'
  });
}

async function mongoKullaniciBulEmail(email) {
  return User.findOne({ email: email.toLowerCase() }).maxTimeMS(GIRIS_DB_TIMEOUT_MS);
}

async function mongoKullaniciBulEmailZamanli(email) {
  const eposta = email.toLowerCase().trim();
  return Promise.race([
    mongoKullaniciBulEmail(eposta),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Veritabanı zaman aşımı')), GIRIS_DB_TIMEOUT_MS);
    })
  ]);
}

async function girisSonrasiDogrulamaMailiGonder(user) {
  if (dbBagli() && user?._id && !memoryStore.isMemoryUser(user._id)) {
    const doc = await User.findById(user._id).maxTimeMS(GIRIS_DB_TIMEOUT_MS);
    if (doc) {
      await dogrulamaKoduKaydet(doc);
      if (smtpYapilandirildiMi()) dogrulamaMailiArkaPlanGonder(doc);
    }
    return;
  }
  if (user?.email) {
    memoryStore.kullaniciDogrulamaAta(user.email);
    const ham = memoryStore.kullaniciHamEmailIle(user.email);
    if (ham && smtpYapilandirildiMi()) dogrulamaMailiArkaPlanGonder(ham);
  }
}

async function kullaniciBulEmailIle(eposta) {
  if (dbBagli()) {
    const user = await mongoKullaniciBulEmail(eposta);
    return user ? { tip: 'mongo', user } : null;
  }
  const ham = memoryStore.kullaniciHamEmailIle(eposta);
  return ham ? { tip: 'memory', user: ham } : null;
}

function authHataOlustur(mesaj, status, kod) {
  const err = new Error(mesaj);
  err.status = status;
  err.kod = kod;
  return err;
}

async function sifremiUnuttumKoduGonder(email) {
  const eposta = email?.toLowerCase?.()?.trim();
  if (!eposta) {
    throw authHataOlustur('E-posta gerekli.', 400, 'DOGRULAMA');
  }

  const bulunan = await kullaniciBulEmailIle(eposta);
  if (!bulunan) {
    throw authHataOlustur('Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.', 404, 'KULLANICI_BULUNAMADI');
  }

  let mailHedef;
  if (bulunan.tip === 'mongo') {
    await dogrulamaKoduKaydet(bulunan.user, { sifreSifirlama: true });
    mailHedef = bulunan.user;
  } else {
    const ham = memoryStore.kullaniciSifreSifirlamaKoduAta(eposta);
    if (!ham) {
      throw authHataOlustur('Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.', 404, 'KULLANICI_BULUNAMADI');
    }
    mailHedef = memoryStore.kullaniciHamEmailIle(eposta);
  }

  if (!smtpYapilandirildiMi()) {
    throw authHataOlustur('E-posta servisi yapılandırılmamış (SMTP).', 500, 'SMTP_YOK');
  }

  sifreSifirlamaMailiArkaPlanGonder(mailHedef);
  return { email: eposta, mailGonderildi: true };
}

async function epostaIleSifreSifirlamaKoduGonder(email) {
  const eposta = email?.toLowerCase?.()?.trim();
  if (!eposta) return false;

  if (dbBagli()) {
    const user = await mongoKullaniciBulEmail(eposta);
    if (!user) return false;
    await dogrulamaKoduKaydet(user, { sifreSifirlama: true });
    if (smtpYapilandirildiMi()) sifreSifirlamaMailiArkaPlanGonder(user);
    return true;
  }

  const ham = memoryStore.kullaniciSifreSifirlamaKoduAta(eposta);
  if (!ham) return false;
  const guncel = memoryStore.kullaniciHamEmailIle(eposta);
  if (guncel && smtpYapilandirildiMi()) sifreSifirlamaMailiArkaPlanGonder(guncel);
  return true;
}

function girisHataliYanit(res, user) {
  if (user) {
    setImmediate(() => {
      epostaIleSifreSifirlamaKoduGonder(user.email).catch(() => {});
    });
    return res.status(401).json({
      mesaj: 'Şifre hatalı. Doğrulama kodu e-postanıza gönderildi. Şifremi unuttum veya doğrulama sayfasını kullanın.',
      message: 'Şifre hatalı.',
      kod: 'GIRIS_HATALI',
      email: user.email,
      dogrulamaGonderildi: true
    });
  }
  return res.status(401).json({
    mesaj: 'E-posta veya şifre hatalı.',
    message: 'E-posta veya şifre hatalı.',
    kod: 'GIRIS_HATALI'
  });
}

async function girisYanit(res, user) {
  try {
    if (!user?._id) {
      return res.status(500).json({
        mesaj: 'Sunucu hatası',
        message: 'Sunucu hatası',
        error: 'Kullanıcı kimliği bulunamadı',
        kod: 'SUNUCU'
      });
    }

    const token = tokenOlustur(user._id);
    const kullanici = user?.toJSON ? user.toJSON() : { ...user };
    delete kullanici.sifre;
    delete kullanici.sifreHash;

    const dogrulanmamis = !epostaDogrulandiMi(user);

    if (dogrulanmamis) {
      setImmediate(() => {
        girisSonrasiDogrulamaMailiGonder(user).catch((err) => {
          console.error('[Demo] Giriş sonrası doğrulama:', err.message);
        });
      });
      return res.status(200).json({
        kullanici,
        token,
        mesaj: 'Lütfen önce e-posta adresinizi doğrulayın.',
        message: 'Lütfen önce e-posta adresinizi doğrulayın.',
        dogrulamaGerekli: true,
        kod: 'EPOSTA_DOGRULANMADI'
      });
    }

    return res.status(200).json({
      kullanici,
      token,
      mesaj: 'Giriş başarılı.',
      message: 'Giriş başarılı.'
    });
  } catch (error) {
    console.error('[Demo] girisYanit:', error.message);
    return res.status(500).json({
      mesaj: 'Sunucu hatası',
      message: 'Sunucu hatası',
      error: error.message,
      kod: 'SUNUCU'
    });
  }
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
        const user = await User.create({ ad, soyad, email, sifre, telefon, rol: 'kullanici', emailDogrulandi: false, saticiKayit: true });
        return kayitSonrasiDogrulama(res, { mongoId: user._id, email: user.email });
      } catch (err) {
        if (err.code === 11000) {
          return res.status(409).json({ mesaj: 'Bu e-posta zaten kayıtlı.', kod: 'EPOSTA_KAYITLI' });
        }
        console.error('[Demo] Mongo satici-kayit hatasi:', err.message);
        return res.status(500).json({ mesaj: 'Kayıt oluşturulamadı.', kod: 'SUNUCU' });
      }
    }

    const user = await memoryStore.kullaniciKayit({ ad, soyad, email, sifre, telefon, saticiKayit: true });
    return kayitSonrasiDogrulama(res, { email: user.email });
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
        return kayitSonrasiDogrulama(res, { mongoId: user._id, email: user.email });
      } catch (err) {
        if (err.code === 11000) {
          return res.status(409).json({ mesaj: 'Bu e-posta zaten kayıtlı.', kod: 'EPOSTA_KAYITLI' });
        }
        console.error('[Demo] Mongo kayit hatasi:', err.message);
        return res.status(500).json({ mesaj: 'Kayıt oluşturulamadı.', kod: 'SUNUCU' });
      }
    }

    const user = await memoryStore.kullaniciKayit({ ad, soyad, email, sifre, telefon, adres, konum });
    return kayitSonrasiDogrulama(res, { email: user.email });
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
      return res.status(400).json({
        mesaj: hatalar[0],
        message: hatalar[0],
        hatalar,
        kod: 'DOGRULAMA'
      });
    }

    const eposta = email.toLowerCase().trim();

    if (dbBagli()) {
      let user;
      try {
        user = await mongoKullaniciBulEmailZamanli(eposta);
      } catch (dbErr) {
        console.error('[Demo] Mongo giris sorgu:', dbErr.message);
        return res.status(500).json({
          mesaj: 'Sunucu hatası',
          message: 'Sunucu hatası',
          error: dbErr.message,
          kod: 'SUNUCU'
        });
      }

      if (!user) {
        return res.status(401).json({
          mesaj: 'E-posta veya şifre hatalı.',
          message: 'E-posta veya şifre hatalı.',
          kod: 'GIRIS_HATALI'
        });
      }

      let sifreDogru = false;
      try {
        sifreDogru = await user.sifreKontrol(sifre);
      } catch (bcryptErr) {
        console.error('[Demo] bcrypt compare:', bcryptErr.message);
        return res.status(500).json({
          mesaj: 'Sunucu hatası',
          message: 'Sunucu hatası',
          error: bcryptErr.message,
          kod: 'SUNUCU'
        });
      }

      if (!sifreDogru) {
        return girisHataliYanit(res, user);
      }

      return await girisYanit(res, user);
    }

    try {
      const user = await memoryStore.kullaniciGiris(email, sifre);
      return await girisYanit(res, user);
    } catch (err) {
      if (err.status === 401 && err.user) {
        return girisHataliYanit(res, err.user);
      }
      if (err.status === 401) {
        return res.status(401).json({
          mesaj: 'E-posta veya şifre hatalı.',
          message: 'E-posta veya şifre hatalı.',
          kod: 'GIRIS_HATALI'
        });
      }
      throw err;
    }
  } catch (error) {
    console.error('[Demo] giris hatasi:', error.message);
    return sunucuHataYanit(res, error, error.status || 500);
  }
});

router.post('/sifremi-unuttum', async (req, res) => {
  try {
    const { email } = req.body;
    const sonuc = await sifremiUnuttumKoduGonder(email);
    return res.json({
      mesaj: 'Şifre sıfırlama kodu e-postanıza gönderildi. Gelen kutusu ve spam klasörünü kontrol edin.',
      email: sonuc.email,
      kod: 'KOD_GONDERILDI'
    });
  } catch (err) {
    console.error('[Demo] sifremi-unuttum:', err.message);
    const status = err.status || 500;
    return res.status(status).json({
      mesaj: err.message || 'Kod gönderilemedi.',
      kod: err.kod || (status === 404 ? 'KULLANICI_BULUNAMADI' : 'SUNUCU')
    });
  }
});

router.post('/sifre-sifirla', async (req, res) => {
  try {
    const { email, kod, yeniSifre } = req.body;
    if (!email || !kod || !yeniSifre) {
      return res.status(400).json({ mesaj: 'E-posta, kod ve yeni şifre gerekli.', kod: 'DOGRULAMA' });
    }
    if (String(yeniSifre).length < 6) {
      return res.status(400).json({ mesaj: 'Yeni şifre en az 6 karakter olmalı.', kod: 'DOGRULAMA' });
    }

    const eposta = email.toLowerCase().trim();
    const bulunan = await kullaniciBulEmailIle(eposta);
    if (!bulunan) {
      return res.status(404).json({ mesaj: 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.', kod: 'KULLANICI_BULUNAMADI' });
    }

    if (bulunan.tip === 'mongo') {
      try {
        const user = bulunan.user;
        if (!kodDogrula(user, kod)) {
          return res.status(400).json({ mesaj: 'Geçersiz veya süresi dolmuş kod.', kod: 'KOD_HATALI' });
        }
        user.sifre = yeniSifre;
        dogrulamaTamamla(user);
        await user.save();
        return kullaniciDon(res, user, tokenOlustur(user._id), { mesaj: 'Şifreniz güncellendi.', kod: 'SIFRE_GUNCELLENDI' });
      } catch (err) {
        console.error('[Demo] Mongo sifre-sifirla:', err.message);
        return res.status(500).json({ mesaj: 'Şifre sıfırlanamadı.', kod: 'SUNUCU' });
      }
    }

    const ham = bulunan.user;
    if (!kodDogrula(ham, kod)) {
      return res.status(400).json({ mesaj: 'Geçersiz veya süresi dolmuş kod.', kod: 'KOD_HATALI' });
    }
    dogrulamaTamamla(ham);
    const user = await memoryStore.kullaniciSifreGuncelle(eposta, yeniSifre);
    if (!user) {
      return res.status(500).json({ mesaj: 'Şifre güncellenemedi.', kod: 'SUNUCU' });
    }
    return kullaniciDon(res, user, tokenOlustur(user._id), { mesaj: 'Şifreniz güncellendi.', kod: 'SIFRE_GUNCELLENDI' });
  } catch (err) {
    console.error('[Demo] sifre-sifirla:', err.message);
    return res.status(500).json({ mesaj: 'Şifre sıfırlanamadı.', kod: 'SUNUCU' });
  }
});

router.post('/eposta-dogrula', async (req, res) => {
  try {
    const { email, kod } = req.body;
    if (!email || !kod) {
      return res.status(400).json({ mesaj: 'E-posta ve doğrulama kodu gerekli.', kod: 'DOGRULAMA' });
    }

    const eposta = email.toLowerCase().trim();
    const bulunan = await kullaniciBulEmailIle(eposta);
    if (!bulunan) {
      return res.status(404).json({ mesaj: 'Kullanıcı bulunamadı.', kod: 'KULLANICI_BULUNAMADI' });
    }

    if (bulunan.tip === 'mongo') {
      try {
        const user = bulunan.user;
        if (!kodDogrula(user, kod)) {
          return res.status(400).json({ mesaj: 'Geçersiz veya süresi dolmuş kod.', kod: 'KOD_HATALI' });
        }
        dogrulamaTamamla(user);
        await user.save();
        return kullaniciDon(res, user, tokenOlustur(user._id), { mesaj: 'E-posta doğrulandı.', kod: 'EPOSTA_DOGRULANDI' });
      } catch (err) {
        console.error('[Demo] Mongo eposta-dogrula:', err.message);
        return res.status(500).json({ mesaj: 'Doğrulama başarısız.', kod: 'SUNUCU' });
      }
    }

    const user = memoryStore.kullaniciDogrula(eposta, kod);
    if (!user) {
      return res.status(400).json({ mesaj: 'Geçersiz veya süresi dolmuş kod.', kod: 'KOD_HATALI' });
    }
    return kullaniciDon(res, user, tokenOlustur(user._id), { mesaj: 'E-posta doğrulandı.', kod: 'EPOSTA_DOGRULANDI' });
  } catch (err) {
    console.error('[Demo] eposta-dogrula:', err.message);
    return res.status(500).json({ mesaj: 'Doğrulama başarısız.', kod: 'SUNUCU' });
  }
});

router.post('/eposta-dogrula/yeniden', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      return res.status(400).json({ mesaj: 'E-posta gerekli.', kod: 'DOGRULAMA' });
    }

    const eposta = email.toLowerCase().trim();
    const bulunan = await kullaniciBulEmailIle(eposta);
    if (!bulunan) {
      return res.status(404).json({
        mesaj: 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.',
        kod: 'KULLANICI_BULUNAMADI'
      });
    }

    if (epostaDogrulandiMi(bulunan.user)) {
      return res.status(400).json({ mesaj: 'E-posta zaten doğrulanmış.', kod: 'ZATEN_DOGRULANDI' });
    }

    let mailGonderildi = false;
    try {
      if (bulunan.tip === 'mongo') {
        await dogrulamaKoduKaydet(bulunan.user);
        if (smtpYapilandirildiMi()) {
          dogrulamaMailiArkaPlanGonder(bulunan.user);
          mailGonderildi = true;
        }
      } else {
        memoryStore.kullaniciDogrulamaAta(eposta);
        const ham = memoryStore.kullaniciHamEmailIle(eposta);
        if (ham && smtpYapilandirildiMi()) {
          dogrulamaMailiArkaPlanGonder(ham);
          mailGonderildi = true;
        }
      }
    } catch (err) {
      console.error('[Demo] yeniden gönder:', err.message);
    }

    return res.json({
      mesaj: mailGonderildi
        ? 'Doğrulama kodu e-postanıza gönderildi.'
        : 'Kod oluşturuldu ancak e-posta gönderilemedi. SMTP ayarlarını kontrol edin.',
      email: eposta,
      mailGonderildi,
      kod: mailGonderildi ? 'KOD_GONDERILDI' : 'MAIL_GONDERILEMEDI'
    });
  } catch (err) {
    console.error('[Demo] eposta-dogrula/yeniden:', err.message);
    return res.status(500).json({ mesaj: 'Kod gönderilemedi.', kod: 'SUNUCU' });
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
      return girisYanit(res, user);
    } catch (err) {
      console.error('[Demo] sosyal giris mongo:', err.message);
    }
  }

  const user = await memoryStore.kullaniciBulVeyaOlustur({ email, ad, soyad, googleId, appleId });
  return girisYanit(res, user);
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

router.get('/profil', authZorunlu, (req, res) => res.json(req.user));

router.put('/profil', authZorunlu, epostaDogrulandiZorunlu, async (req, res) => {
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

router.put('/email', authZorunlu, epostaDogrulandiZorunlu, async (req, res) => {
  try {
    const { email, sifre } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.sifreKontrol(sifre))) return res.status(401).json({ mesaj: 'Şifre hatalı.' });
    if (await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } })) {
      return res.status(409).json({ mesaj: 'E-posta kullanımda.' });
    }
    user.email = email.toLowerCase();
    user.emailDogrulandi = false;
    try {
      await dogrulamaKoduKaydet(user);
      if (smtpYapilandirildiMi()) dogrulamaMailiArkaPlanGonder(user);
    } catch (err) {
      console.error('[Demo] email güncelleme mail:', err.message);
    }
    res.json({ mesaj: 'E-posta güncellendi. Yeni adrese doğrulama kodu gönderildi.', email: user.email, emailDogrulandi: false });
  } catch {
    res.status(500).json({ mesaj: 'E-posta güncellenemedi.' });
  }
});

router.put('/telefon', authZorunlu, epostaDogrulandiZorunlu, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { telefon: req.body.telefon }, { new: true }).select('-sifre');
    res.json(user);
  } catch {
    res.status(500).json({ mesaj: 'Telefon güncellenemedi.' });
  }
});

router.delete('/telefon', authZorunlu, epostaDogrulandiZorunlu, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { telefon: '' }, { new: true }).select('-sifre');
    res.json(user);
  } catch {
    res.status(500).json({ mesaj: 'Telefon silinemedi.' });
  }
});

router.put('/sifre', authZorunlu, epostaDogrulandiZorunlu, async (req, res) => {
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

router.delete('/hesap', authZorunlu, epostaDogrulandiZorunlu, async (req, res) => {
  try {
    await Order.deleteMany({ kullanici: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ mesaj: 'Hesabınız silindi.' });
  } catch {
    res.status(500).json({ mesaj: 'Hesap silinemedi.' });
  }
});

router.get('/adresler', authZorunlu, epostaDogrulandiZorunlu, async (req, res) => {
  const user = await User.findById(req.user._id).select('adresler');
  res.json(user.adresler || []);
});

router.post('/adresler', authZorunlu, epostaDogrulandiZorunlu, async (req, res) => {
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

router.put('/adresler/:id', authZorunlu, epostaDogrulandiZorunlu, async (req, res) => {
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

router.delete('/adresler/:id', authZorunlu, epostaDogrulandiZorunlu, async (req, res) => {
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
