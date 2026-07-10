const crypto = require('crypto');

function kodUret() {
  return String(crypto.randomInt(100000, 1000000));
}

function kodAta(hedef) {
  hedef.emailDogrulamaKodu = kodUret();
  hedef.emailDogrulamaSon = new Date(Date.now() + 15 * 60 * 1000);
  hedef.emailDogrulandi = false;
}

/** Şifre sıfırlama — mevcut doğrulama durumunu bozmaz */
function sifreSifirlamaKoduAta(hedef) {
  hedef.emailDogrulamaKodu = kodUret();
  hedef.emailDogrulamaSon = new Date(Date.now() + 15 * 60 * 1000);
}

function epostaDogrulandiMi(kullanici) {
  if (!kullanici) return false;
  if (kullanici.rol === 'admin') return true;
  // Eski kayıtlar: alan hiç set edilmemişse doğrulanmış kabul et (geriye dönük uyum)
  if (kullanici.emailDogrulandi === undefined || kullanici.emailDogrulandi === null) {
    return true;
  }
  return kullanici.emailDogrulandi === true;
}

function kodDogrula(kullanici, kod) {
  if (!kullanici?.emailDogrulamaKodu || !kullanici.emailDogrulamaSon) return false;
  if (new Date() > new Date(kullanici.emailDogrulamaSon)) return false;
  return String(kullanici.emailDogrulamaKodu) === String(kod).trim();
}

function dogrulamaTamamla(hedef) {
  hedef.emailDogrulandi = true;
  hedef.emailDogrulamaKodu = undefined;
  hedef.emailDogrulamaSon = undefined;
}

module.exports = {
  kodUret,
  kodAta,
  sifreSifirlamaKoduAta,
  epostaDogrulandiMi,
  kodDogrula,
  dogrulamaTamamla
};
