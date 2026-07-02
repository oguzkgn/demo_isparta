function kodUret() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function kodAta(hedef) {
  hedef.emailDogrulamaKodu = kodUret();
  hedef.emailDogrulamaSon = new Date(Date.now() + 15 * 60 * 1000);
  hedef.emailDogrulandi = false;
}

function epostaDogrulandiMi(kullanici) {
  if (!kullanici) return false;
  if (kullanici.rol === 'admin') return true;
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

module.exports = { kodUret, kodAta, epostaDogrulandiMi, kodDogrula, dogrulamaTamamla };
