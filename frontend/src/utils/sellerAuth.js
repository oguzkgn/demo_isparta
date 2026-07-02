import { prepareSeller } from '../api/client';

export async function saticiGirisSonrasi(girisYap, email, sifre, kullaniciGuncelle, cikisYap) {
  const u = await girisYap(email, sifre);
  if (u.rol !== 'satici' && u.rol !== 'admin') {
    cikisYap?.();
    const err = new Error('Satıcı hesabı bulunamadı. Önce satıcı kaydı oluşturun.');
    err.response = { data: { mesaj: err.message } };
    throw err;
  }
  const sonuc = await prepareSeller();
  if (sonuc?.kullanici) kullaniciGuncelle(sonuc.kullanici);
  return sonuc?.kullanici;
}
