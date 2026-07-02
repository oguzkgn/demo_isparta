const express = require('express');
const { ISPARTA_KONUMLAR, KATEGORILER } = require('../data/constants');
const { KATEGORI_AGACI } = require('../data/kategoriler');
const { urunleriGetir, urunGetir, markalarGetir } = require('../lib/urunService');
const memoryStore = require('../lib/memoryStore');

const router = express.Router();

router.get('/konumlar', (_req, res) => res.json(ISPARTA_KONUMLAR));
router.get('/kategoriler/agac', (_req, res) => res.json(KATEGORI_AGACI));
router.get('/kategoriler', (_req, res) => res.json(KATEGORILER));

router.get('/markalar', async (_req, res) => {
  try {
    res.json(await markalarGetir());
  } catch (err) {
    console.error('[Demo] markalar hatasi:', err.message);
    try {
      await memoryStore.ensureInit();
      res.json(memoryStore.markalarGetir());
    } catch {
      res.status(500).json({ mesaj: 'Markalar getirilemedi.', kod: 'SUNUCU' });
    }
  }
});

router.get('/urunler', async (req, res) => {
  try {
    res.json(await urunleriGetir(req.query));
  } catch (err) {
    console.error('[Demo] urunler hatasi:', err.message);
    try {
      await memoryStore.ensureInit();
      res.json(memoryStore.urunleriFiltrele(req.query));
    } catch {
      res.status(500).json({ mesaj: 'Ürünler getirilemedi.', kod: 'SUNUCU' });
    }
  }
});

router.get('/urunler/:id', async (req, res) => {
  try {
    const urun = await urunGetir(req.params.id);
    if (!urun) return res.status(404).json({ mesaj: 'Ürün bulunamadı.' });
    res.json(urun);
  } catch (err) {
    console.error('[Demo] urun detay hatasi:', err.message);
    res.status(400).json({ mesaj: 'Geçersiz ürün.' });
  }
});

module.exports = router;
