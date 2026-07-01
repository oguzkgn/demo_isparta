const express = require('express');
const { authZorunlu } = require('../middleware/auth');

const router = express.Router();

router.post('/odeme', authZorunlu, async (req, res) => {
  const { kartNo, cvv, sonKullanma, taksit = 1, tutar } = req.body;
  if (!kartNo || !cvv || !sonKullanma) {
    return res.status(400).json({ mesaj: 'Kart bilgileri eksik.' });
  }
  if (kartNo.replace(/\s/g, '').length < 15) {
    return res.status(400).json({ mesaj: 'Geçersiz kart numarası.' });
  }
  await new Promise((r) => setTimeout(r, 800));
  res.json({
    basarili: true,
    islemId: 'IYZ' + Date.now(),
    tutar,
    taksit,
    mesaj: 'Ödeme başarılı (demo — Iyzico simülasyonu)'
  });
});

module.exports = router;
