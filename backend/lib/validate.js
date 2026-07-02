const ISIM_RE = /^[\p{L}\s'-]{2,40}$/u;
const EPOSTA_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function telefonTemizle(val) {
  return String(val || '').replace(/\D/g, '');
}

function telefonGecerli(val) {
  if (!val || !String(val).trim()) return true;
  const d = telefonTemizle(val);
  if (d.startsWith('90')) return d.length === 12 && d.slice(2).startsWith('5');
  if (d.startsWith('0')) return d.length === 11 && d.startsWith('05');
  return d.length === 10 && d.startsWith('5');
}

function kayitDogrula({ ad, soyad, email, sifre, telefon }) {
  const hatalar = [];

  if (!ad?.trim()) hatalar.push('Ad alanı zorunludur.');
  else if (!ISIM_RE.test(ad.trim())) {
    hatalar.push('Ad yalnızca harf içermeli (Türkçe karakterler kabul edilir), 2–40 karakter olmalı.');
  }

  if (!soyad?.trim()) hatalar.push('Soyad alanı zorunludur.');
  else if (!ISIM_RE.test(soyad.trim())) {
    hatalar.push('Soyad yalnızca harf içermeli (Türkçe karakterler kabul edilir), 2–40 karakter olmalı.');
  }

  if (!email?.trim()) hatalar.push('E-posta adresi zorunludur.');
  else if (!EPOSTA_RE.test(email.trim())) {
    hatalar.push('Geçerli bir e-posta adresi girin (örnek: ad@mail.com).');
  }

  if (!sifre) hatalar.push('Şifre zorunludur.');
  else if (sifre.length < 6) hatalar.push('Şifre en az 6 karakter olmalı.');

  if (telefon?.trim() && !telefonGecerli(telefon)) {
    hatalar.push('Telefon numarası geçersiz. Örnek: 05xx xxx xx xx veya +905xxxxxxxxx');
  }

  return hatalar;
}

function girisDogrula({ email, sifre }) {
  const hatalar = [];
  if (!email?.trim()) hatalar.push('E-posta adresi zorunludur.');
  else if (!EPOSTA_RE.test(email.trim())) hatalar.push('Geçerli bir e-posta adresi girin.');
  if (!sifre) hatalar.push('Şifre zorunludur.');
  return hatalar;
}

module.exports = { kayitDogrula, girisDogrula, telefonGecerli };
