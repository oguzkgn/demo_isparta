const ISIM_RE = /^[\p{L}\s'-]{2,40}$/u;
const EPOSTA_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function telefonGecerli(val) {
  if (!val || !String(val).trim()) return true;
  const d = String(val).replace(/\D/g, '');
  if (d.startsWith('90')) return d.length === 12 && d.slice(2).startsWith('5');
  if (d.startsWith('0')) return d.length === 11 && d.startsWith('05');
  return d.length === 10 && d.startsWith('5');
}

export function kayitFormDogrula(form) {
  const hatalar = [];
  if (!form.ad?.trim()) hatalar.push('Ad alanı zorunludur.');
  else if (!ISIM_RE.test(form.ad.trim())) {
    hatalar.push('Ad yalnızca harf içermeli (Türkçe karakterler kabul edilir).');
  }
  if (!form.soyad?.trim()) hatalar.push('Soyad alanı zorunludur.');
  else if (!ISIM_RE.test(form.soyad.trim())) {
    hatalar.push('Soyad yalnızca harf içermeli (Türkçe karakterler kabul edilir).');
  }
  if (!form.email?.trim()) hatalar.push('E-posta adresi zorunludur.');
  else if (!EPOSTA_RE.test(form.email.trim())) {
    hatalar.push('Geçerli bir e-posta adresi girin (örnek: ad@mail.com).');
  }
  if (!form.sifre) hatalar.push('Şifre zorunludur.');
  else if (form.sifre.length < 6) hatalar.push('Şifre en az 6 karakter olmalı.');
  if (form.telefon?.trim() && !telefonGecerli(form.telefon)) {
    hatalar.push('Telefon numarası geçersiz. Örnek: 05xx xxx xx xx');
  }
  return hatalar;
}

export function apiHataMesaji(err, varsayilan = 'Bir hata oluştu.') {
  if (!err?.response) {
    if (err?.code === 'ECONNABORTED') {
      return 'Sunucu yanıt vermedi. Sayfa otomatik yeniden denedi; lütfen bir dakika bekleyip tekrar deneyin.';
    }
    return 'API sunucusuna bağlanılamadı. İnternet bağlantınızı kontrol edin.';
  }
  const data = err.response.data;
  if (Array.isArray(data?.hatalar) && data.hatalar.length) {
    return data.hatalar.join(' ');
  }
  if (data?.kod === 'SUNUCU') {
    return `${data.mesaj || varsayilan} (Sunucu/API hatası — birkaç dakika sonra tekrar deneyin.)`;
  }
  return data?.mesaj || varsayilan;
}
