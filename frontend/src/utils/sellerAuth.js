import { registerSeller, prepareSeller } from '../api/client';

export async function saticiGirisSonrasi(girisYap, email, sifre, kullaniciGuncelle) {
  await girisYap(email, sifre);
  const sonuc = await prepareSeller();
  if (sonuc?.kullanici) kullaniciGuncelle(sonuc.kullanici);
  return sonuc?.kullanici;
}
