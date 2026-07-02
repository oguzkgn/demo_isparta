const Product = require('../models/Product');
const { dbBagli } = require('./dbHelper');
const memoryStore = require('./memoryStore');

async function urunleriGetir(query) {
  if (dbBagli()) {
    const filter = {};
    if (query.kategori) filter.kategori = query.kategori;
    if (query.altKategori) filter.altKategori = query.altKategori;
    if (query.konum) filter.konum = query.konum;
    if (query.marka) filter.marka = query.marka;
    if (query.oneCikan === 'true') filter.oneCikan = true;
    if (query.minFiyat) filter.fiyat = { ...filter.fiyat, $gte: Number(query.minFiyat) };
    if (query.maxFiyat) filter.fiyat = { ...filter.fiyat, $lte: Number(query.maxFiyat) };
    if (query.minPuan) filter.puan = { $gte: Number(query.minPuan) };
    if (query.beden) filter.bedenler = query.beden;
    if (query.ara) {
      filter.$or = [
        { ad: { $regex: query.ara, $options: 'i' } },
        { aciklama: { $regex: query.ara, $options: 'i' } },
        { marka: { $regex: query.ara, $options: 'i' } },
        { saticiAd: { $regex: query.ara, $options: 'i' } }
      ];
    }
    let sort = { createdAt: -1 };
    if (query.siralama === 'fiyatArtan') sort = { fiyat: 1 };
    if (query.siralama === 'fiyatAzalan') sort = { fiyat: -1 };
    if (query.siralama === 'puan') sort = { puan: -1 };
    return Product.find(filter).sort(sort).lean();
  }
  await memoryStore.ensureInit();
  return memoryStore.urunleriFiltrele(query);
}

async function urunGetir(id) {
  if (dbBagli()) {
    return Product.findById(id).lean();
  }
  await memoryStore.ensureInit();
  return memoryStore.urunBul(id);
}

async function markalarGetir() {
  if (dbBagli()) {
    const markalar = await Product.distinct('marka');
    return markalar.filter(Boolean).sort();
  }
  await memoryStore.ensureInit();
  return memoryStore.markalarGetir();
}

module.exports = { urunleriGetir, urunGetir, markalarGetir };
