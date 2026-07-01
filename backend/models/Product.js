const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  ad: { type: String, required: true },
  aciklama: String,
  fiyat: { type: Number, required: true },
  eskiFiyat: Number,
  kategori: { type: String, required: true },
  altKategori: String,
  konum: { type: String, required: true },
  marka: String,
  stok: { type: Number, default: 10 },
  puan: { type: Number, default: 4.5 },
  yorumSayisi: { type: Number, default: 0 },
  resim: String,
  oneCikan: { type: Boolean, default: false },
  satici: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  saticiAd: String,
  bedenler: [String],
  renkler: [String],
  taksitSecenekleri: [{ ay: Number, tutar: Number }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
