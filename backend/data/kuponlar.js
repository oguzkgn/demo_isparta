const KUPONLAR = {
  ISPARTA10: { kod: 'ISPARTA10', indirim: 10, tip: 'yuzde', aciklama: '%10 indirim' },
  LAVANTA50: { kod: 'LAVANTA50', indirim: 50, tip: 'tutar', minTutar: 200, aciklama: '50 TL indirim (200 TL üzeri)' },
  GUL20: { kod: 'GUL20', indirim: 20, tip: 'yuzde', minTutar: 100, aciklama: '%20 indirim (100 TL üzeri)' }
};

function kuponDogrula(kod, araToplam) {
  const kupon = KUPONLAR[kod?.toUpperCase()];
  if (!kupon) return { gecerli: false, mesaj: 'Geçersiz kupon kodu.' };
  if (kupon.minTutar && araToplam < kupon.minTutar) {
    return { gecerli: false, mesaj: `Minimum ${kupon.minTutar} TL alışveriş gerekli.` };
  }
  let indirim = 0;
  if (kupon.tip === 'yuzde') indirim = Math.round(araToplam * kupon.indirim / 100);
  else indirim = kupon.indirim;
  return { gecerli: true, indirim, kupon };
}

module.exports = { KUPONLAR, kuponDogrula };
