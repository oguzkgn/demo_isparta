const img = (id, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

const ISPARTA_KONUMLAR = [
  '⭐ Çünür (Kampüs Bölgesi)',
  '⭐ İyaş Bölgesi',
  '⭐ Yedişehitler',
  '⭐ Modernevler',
  '⭐ Bahçelievler',
  '⭐ Çarşı / Merkez',
  '⭐ Fatih Mahallesi',
  'Hızırbey',
  'Yayla Mahallesi',
  'Binbirevler',
  'Halıkent',
  'Işıkkent',
  'Eğirdir',
  'Yalvaç',
  'Gönen',
  'Keçiborlu',
  'Senirkent'
];

const KATEGORILER = [
  { id: 'giyim', ad: 'Giyim & Moda', ikon: '👗' },
  { id: 'elektronik', ad: 'Elektronik', ikon: '📱' },
  { id: 'ev', ad: 'Ev & Yaşam', ikon: '🏠' },
  { id: 'kozmetik', ad: 'Kozmetik', ikon: '💄' },
  { id: 'gida', ad: 'Gıda & Market', ikon: '🛒' },
  { id: 'lavanta', ad: 'Lavanta & Gül', ikon: '🌸' },
  { id: 'spor', ad: 'Spor & Outdoor', ikon: '⚽' },
  { id: 'kitap', ad: 'Kitap & Kırtasiye', ikon: '📚' }
];

const ORNEK_URUNLER = [
  { ad: 'Isparta Lavanta Kolonyası 400ml', aciklama: 'Yerel üretim, doğal lavanta esanslı.', fiyat: 89, eskiFiyat: 120, kategori: 'lavanta', konum: '⭐ Çarşı / Merkez', marka: 'Gül Vadisi', puan: 4.8, yorumSayisi: 234, resim: img('photo-1615485509133-12e1b2f455d0'), oneCikan: true },
  { ad: 'Gül Suyu Tonik 250ml', aciklama: 'Isparta gülü ile ferahlatıcı cilt bakımı.', fiyat: 145, eskiFiyat: 199, kategori: 'kozmetik', konum: '⭐ İyaş Bölgesi', marka: 'RoseLand', puan: 4.7, yorumSayisi: 189, resim: img('photo-1571875257727-25639fc50891'), oneCikan: true },
  { ad: 'SUÜT Isparta Basketbol Forması', aciklama: 'Yerel takım resmi forma.', fiyat: 599, eskiFiyat: 799, kategori: 'spor', konum: '⭐ Çünür (Kampüs Bölgesi)', marka: 'SUÜT Store', puan: 4.9, yorumSayisi: 56, resim: img('photo-1519861531477-920027218838'), oneCikan: true },
  { ad: 'Kablosuz Kulaklık Pro', aciklama: 'Aktif gürültü engelleme, 30 saat pil.', fiyat: 1299, eskiFiyat: 1899, kategori: 'elektronik', konum: '⭐ Modernevler', marka: 'TechZone', puan: 4.5, yorumSayisi: 412, resim: img('photo-1505740420928-5e560c06d30e') },
  { ad: 'Kadın Yazlık Elbise', aciklama: 'Pamuklu, lavanta desenli.', fiyat: 349, eskiFiyat: 499, kategori: 'giyim', konum: '⭐ Bahçelievler', marka: 'ModaIsparta', puan: 4.4, yorumSayisi: 78, resim: img('photo-1496747611176-843222e1e273') },
  { ad: 'Organik Bal 850g', aciklama: 'Isparta yaylalarından süzme bal.', fiyat: 320, kategori: 'gida', konum: 'Yalvaç', marka: 'Yayla Bal', puan: 4.9, yorumSayisi: 145, resim: img('photo-1587049350798-91c41641e991') },
  { ad: 'Lavanta Yastık Spreyi', aciklama: 'Uykuya dalma için rahatlatıcı koku.', fiyat: 75, eskiFiyat: 99, kategori: 'lavanta', konum: '⭐ Fatih Mahallesi', marka: 'DreamLav', puan: 4.6, yorumSayisi: 203, resim: img('photo-1608571423902-eed4a5ad8108') },
  { ad: 'Akıllı Saat S3', aciklama: 'Nabız, adım sayar, su geçirmez.', fiyat: 2199, eskiFiyat: 2799, kategori: 'elektronik', konum: '⭐ Yedişehitler', marka: 'FitWatch', puan: 4.3, yorumSayisi: 167, resim: img('photo-1523275335684-37898b6baf30') },
  { ad: 'Lavanta Çayı 20 Poşet', aciklama: 'Stres giderici bitki çayı.', fiyat: 45, kategori: 'gida', konum: 'Eğirdir', marka: 'Göl Çay', puan: 4.7, yorumSayisi: 92, resim: img('photo-1564890369478-c89ca4aee99d') },
  { ad: 'Erkek Spor Ayakkabı', aciklama: 'Hafif taban, günlük kullanım.', fiyat: 899, eskiFiyat: 1199, kategori: 'giyim', konum: 'Halıkent', marka: 'RunIsparta', puan: 4.5, yorumSayisi: 334, resim: img('photo-1542291026-7eec264c27ff') },
  { ad: 'Gül Kurutulmuş Buket', aciklama: 'Isparta gülü, dekoratif.', fiyat: 180, kategori: 'lavanta', konum: '⭐ Çarşı / Merkez', marka: 'Gül Bahçesi', puan: 4.8, yorumSayisi: 67, resim: img('photo-1582794549859-d2a299bfa77a'), oneCikan: true },
  { ad: 'Bluetooth Hoparlör Mini', aciklama: 'Taşınabilir, güçlü ses.', fiyat: 449, eskiFiyat: 599, kategori: 'elektronik', konum: 'Işıkkent', marka: 'SoundBox', puan: 4.2, yorumSayisi: 88, resim: img('photo-1608043159229-42382bbf4f62') },
  { ad: 'Lavanta Sabunu Seti (3\'lü)', aciklama: 'El yapımı doğal sabun.', fiyat: 120, kategori: 'kozmetik', konum: 'Gönen', marka: 'SabunEvi', puan: 4.6, yorumSayisi: 156, resim: img('photo-1556228720-195a672e8a03') },
  { ad: 'Kampüs Defter Seti', aciklama: 'SUÜT öğrencileri için 5\'li set.', fiyat: 65, kategori: 'kitap', konum: '⭐ Çünür (Kampüs Bölgesi)', marka: 'Campus', puan: 4.4, yorumSayisi: 41, resim: img('photo-1495446815901-a08987e031bb') },
  { ad: 'Tencere Seti 7 Parça', aciklama: 'Granit kaplama, indüksiyon uyumlu.', fiyat: 1599, eskiFiyat: 2199, kategori: 'ev', konum: '⭐ Modernevler', marka: 'EvModa', puan: 4.5, yorumSayisi: 223, resim: img('photo-1556911220-bff31c812dba') },
  { ad: 'Lavanta Kesesi 5\'li', aciklama: 'Dolap ve çekmece için.', fiyat: 55, kategori: 'lavanta', konum: 'Senirkent', marka: 'KokuDünyası', puan: 4.7, yorumSayisi: 98, resim: img('photo-1499002238440-d264edd596ec') }
];

module.exports = { ISPARTA_KONUMLAR, KATEGORILER, ORNEK_URUNLER, img };
