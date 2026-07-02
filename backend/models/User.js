const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sepetItemSchema = new mongoose.Schema({
  urun: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  adet: { type: Number, default: 1, min: 1 },
  beden: String,
  renk: String
}, { _id: false });

const adresSchema = new mongoose.Schema({
  baslik: { type: String, default: 'Ev' },
  tip: { type: String, enum: ['teslimat', 'fatura'], default: 'teslimat' },
  tamAd: String,
  telefon: String,
  adres: { type: String, required: true },
  konum: String,
  varsayilan: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  ad: { type: String, required: true, trim: true },
  soyad: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  sifre: { type: String, required: true, minlength: 6 },
  telefon: String,
  adres: String,
  konum: String,
  rol: { type: String, enum: ['kullanici', 'satici', 'admin'], default: 'kullanici' },
  satici: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  googleId: String,
  appleId: String,
  emailDogrulandi: { type: Boolean, default: false },
  emailDogrulamaKodu: String,
  emailDogrulamaSon: Date,
  adresler: [adresSchema],
  sepet: [sepetItemSchema],
  favoriler: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  sonGorulenler: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('sifre')) return;
  this.sifre = await bcrypt.hash(this.sifre, 10);
});

userSchema.methods.sifreKontrol = function (sifre) {
  return bcrypt.compare(sifre, this.sifre);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.sifre;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
