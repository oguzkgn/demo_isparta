import { prepareSeller } from '../api/client';

/** Giriş yapılmış satıcı hesabını panele hazırlar (giriş ayrı yapılır). */
export async function saticiPanelHazirla(u, kullaniciGuncelle, cikisYap) {
  if (u.rol === 'satici' || u.rol === 'admin') {
    const sonuc = await prepareSeller();
    if (sonuc?.kullanici) kullaniciGuncelle(sonuc.kullanici);
    return sonuc?.kullanici || u;
  }

  if (u.rol === 'kullanici' && u.saticiKayit) {
    const sonuc = await prepareSeller();
    if (sonuc?.kullanici?.rol === 'satici' || sonuc?.kullanici?.rol === 'admin') {
      kullaniciGuncelle(sonuc.kullanici);
      return sonuc.kullanici;
    }
  }

  if (u.rol === 'kullanici' && !u.saticiKayit) {
    cikisYap?.();
    const err = new Error('Bu hesap müşteri hesabıdır. Müşteri sekmesinden giriş yapın.');
    err.response = { data: { mesaj: err.message } };
    throw err;
  }

  cikisYap?.();
  const err = new Error('Satıcı hesabı bulunamadı. Önce satıcı kaydı oluşturun.');
  err.response = { data: { mesaj: err.message } };
  throw err;
}

/** @deprecated saticiPanelHazirla kullanın */
export async function saticiGirisSonrasi(girisYap, email, sifre, kullaniciGuncelle, cikisYap) {
  const u = await girisYap(email, sifre);
  return saticiPanelHazirla(u, kullaniciGuncelle, cikisYap);
}
