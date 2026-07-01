require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const { ORNEK_URUNLER } = require('./data/constants');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/demo-shop';

async function seed() {
  await mongoose.connect(MONGO_URI);
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`Veritabanında ${count} ürün var, seed atlandı.`);
    process.exit(0);
  }
  await Product.insertMany(ORNEK_URUNLER);
  console.log(`${ORNEK_URUNLER.length} örnek ürün eklendi.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
