const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  urun: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  kullanici: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kullaniciAd: String,
  puan: { type: Number, required: true, min: 1, max: 5 },
  yorum: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
