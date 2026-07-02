const Product = require('../models/Product');
const { dbBagli } = require('./dbHelper');
const memoryStore = require('./memoryStore');

async function mongoVeyaBellek(mongoFn, bellekFn) {
  if (dbBagli()) {
    try {
      return await mongoFn();
    } catch (err) {
      console.error('[Demo] Mongo sorgu hatasi, bellek modu:', err.message);
    }
  }
  await memoryStore.ensureInit();
  return bellekFn();
}

async function urunleriGetir(query) {
  return mongoVeyaBellek(
    async () => {
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
    },
    () => memoryStore.urunleriFiltrele(query)
  );
}

async function urunGetir(id) {
  return mongoVeyaBellek(
    () => Product.findById(id).lean(),
    () => memoryStore.urunBul(id)
  );
}

async function markalarGetir() {
  return mongoVeyaBellek(
    async () => {
      const markalar = await Product.distinct('marka');
      return markalar.filter(Boolean).sort();
    },
    () => memoryStore.markalarGetir()
  );
}

module.exports = { urunleriGetir, urunGetir, markalarGetir };
