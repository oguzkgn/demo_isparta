/** E-posta doğrulaması tamamlandı mı (admin muaf) */
export function epostaDogrulandiMi(kullanici) {
  if (!kullanici) return false;
  if (kullanici.rol === 'admin') return true;
  return kullanici.emailDogrulandi === true;
}

export function epostaDogrulamaYolu(email, portal = 'musteri') {
  return `/eposta-dogrula?email=${encodeURIComponent(email)}&portal=${portal}`;
}
