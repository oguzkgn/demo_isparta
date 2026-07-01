const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  kullanici: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  magazaAdi: { type: String, required: true },
  vergiNo: String,
  telefon: String,
  email: String,
  adres: String,
  aciklama: String,
  durum: { type: String, enum: ['beklemede', 'onayli', 'reddedildi'], default: 'beklemede' },
  redNedeni: String
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
