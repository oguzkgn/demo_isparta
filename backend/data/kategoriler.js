const KATEGORI_AGACI = [
  {
    id: 'elektronik', ad: 'Elektronik', ikon: '📱',
    alt: [
      { id: 'telefon', ad: 'Telefon' },
      { id: 'akilli-telefon', ad: 'Akıllı Telefon', parent: 'telefon' },
      { id: 'bilgisayar', ad: 'Bilgisayar' },
      { id: 'aksesuar', ad: 'Aksesuar', parent: 'telefon' }
    ]
  },
  {
    id: 'giyim', ad: 'Giyim & Moda', ikon: '👗',
    alt: [
      { id: 'kadin', ad: 'Kadın' },
      { id: 'erkek', ad: 'Erkek' },
      { id: 'ayakkabi', ad: 'Ayakkabı' }
    ]
  },
  {
    id: 'ev', ad: 'Ev & Yaşam', ikon: '🏠',
    alt: [
      { id: 'mutfak', ad: 'Mutfak' },
      { id: 'dekorasyon', ad: 'Dekorasyon' }
    ]
  },
  { id: 'kozmetik', ad: 'Kozmetik', ikon: '💄', alt: [{ id: 'cilt-bakimi', ad: 'Cilt Bakımı' }] },
  { id: 'gida', ad: 'Gıda & Market', ikon: '🛒', alt: [{ id: 'organik', ad: 'Organik' }] },
  { id: 'lavanta', ad: 'Lavanta & Gül', ikon: '🌸', alt: [{ id: 'lavanta-urun', ad: 'Lavanta Ürünleri' }] },
  { id: 'spor', ad: 'Spor & Outdoor', ikon: '⚽', alt: [{ id: 'fitness', ad: 'Fitness' }] },
  { id: 'kitap', ad: 'Kitap & Kırtasiye', ikon: '📚', alt: [{ id: 'kirtasiye', ad: 'Kırtasiye' }] }
];

function duzKategoriler() {
  const list = [];
  KATEGORI_AGACI.forEach((k) => {
    list.push({ id: k.id, ad: k.ad, ikon: k.ikon, seviye: 'ana' });
    (k.alt || []).forEach((a) => list.push({ id: a.id, ad: a.ad, ikon: k.ikon, ana: k.id, seviye: 'alt' }));
  });
  return list;
}

module.exports = { KATEGORI_AGACI, duzKategoriler };
