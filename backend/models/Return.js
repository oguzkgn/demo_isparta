const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  siparis: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  kullanici: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  urunler: [{
    ad: String, adet: Number, fiyat: Number, resim: String
  }],
  neden: { type: String, required: true },
  durum: { type: String, enum: ['beklemede', 'onaylandi', 'reddedildi', 'tamamlandi'], default: 'beklemede' },
  iadeKodu: String
}, { timestamps: true });

returnSchema.pre('save', function () {
  if (!this.iadeKodu) this.iadeKodu = 'IADE' + Date.now().toString().slice(-8);
});

module.exports = mongoose.model('Return', returnSchema);
