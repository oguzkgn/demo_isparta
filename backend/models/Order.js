const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  urun: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  ad: String,
  fiyat: Number,
  adet: Number,
  resim: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  kullanici: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  urunler: [orderItemSchema],
  toplam: { type: Number, required: true },
  durum: {
    type: String,
    enum: ['beklemede', 'hazirlaniyor', 'kargoda', 'teslim'],
    default: 'beklemede'
  },
  adres: String,
  konum: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
