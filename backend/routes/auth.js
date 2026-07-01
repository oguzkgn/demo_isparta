const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const { authZorunlu, tokenOlustur } = require('../middleware/auth');

const router = express.Router();

router.post('/kayit', async (req, res) => {
  try {
    const { ad, soyad, email, sifre, telefon, adres, konum } = req.body;
    if (!ad || !soyad || !email || !sifre) {
      return res.status(400).json({ mesaj: 'Ad, soyad, e-posta ve şifre zorunludur.' });
    }
    if (sifre.length < 6) {
      return res.status(400).json({ mesaj: 'Şifre en az 6 karakter olmalı.' });
    }
    const mevcut = await User.findOne({ email: email.toLowerCase() });
    if (mevcut) return res.status(409).json({ mesaj: 'Bu e-posta zaten kayıtlı.' });

    const user = await User.create({ ad, soyad, email, sifre, telefon, adres, konum });
    const token = tokenOlustur(user._id);
    res.status(201).json({ kullanici: user, token });
  } catch {
    res.status(500).json({ mesaj: 'Kayıt oluşturulamadı.' });
  }
});

router.post('/giris', async (req, res) => {
  try {
    const { email, sifre } = req.body;
    if (!email || !sifre) {
      return res.status(400).json({ mesaj: 'E-posta ve şifre gerekli.' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.sifreKontrol(sifre))) {
      return res.status(401).json({ mesaj: 'E-posta veya şifre hatalı.' });
    }
    res.json({ kullanici: user, token: tokenOlustur(user._id) });
  } catch {
    res.status(500).json({ mesaj: 'Giriş yapılamadı.' });
  }
});

router.get('/profil', authZorunlu, (req, res) => {
  res.json(req.user);
});

router.put('/profil', authZorunlu, async (req, res) => {
  try {
    const { ad, soyad, telefon, adres, konum } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ad, soyad, telefon, adres, konum },
      { new: true, runValidators: true }
    ).select('-sifre');
    res.json(user);
  } catch {
    res.status(500).json({ mesaj: 'Profil güncellenemedi.' });
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

module.exports = router;
