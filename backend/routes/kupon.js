const express = require('express');
const { KUPONLAR, kuponDogrula } = require('../data/kuponlar');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json(Object.values(KUPONLAR));
});

router.post('/dogrula', (req, res) => {
  const { kod, araToplam } = req.body;
  const sonuc = kuponDogrula(kod, araToplam || 0);
  if (!sonuc.gecerli) return res.status(400).json(sonuc);
  res.json(sonuc);
});

module.exports = router;
