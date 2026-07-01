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
  araToplam: Number,
  indirim: { type: Number, default: 0 },
  kargo: { type: Number, default: 29.99 },
  toplam: { type: Number, required: true },
  kuponKodu: String,
  odemeYontemi: { type: String, default: 'kredi_karti' },
  durum: {
    type: String,
    enum: ['beklemede', 'hazirlaniyor', 'kargoda', 'teslim', 'iptal'],
    default: 'beklemede'
  },
  adres: String,
  konum: String,
  takipNo: String
}, { timestamps: true });

orderSchema.pre('save', function () {
  if (!this.takipNo && this.durum !== 'iptal') {
    this.takipNo = 'ISP' + Date.now().toString().slice(-8);
  }
});

module.exports = mongoose.model('Order', orderSchema);
