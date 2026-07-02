import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  fetchAddresses, validateCoupon, createOrder, fetchCoupons, processPayment
} from '../api/client';
import { formatPrice } from '../utils/format';
import Layout from '../components/Layout';

export default function CheckoutPage({ arama, setArama, kategori, setKategori, konum, setKonum }) {
  const { kullanici } = useAuth();
  const { sepet, toplam, sepetiYukle } = useCart();
  const navigate = useNavigate();
  const [adresler, setAdresler] = useState([]);
  const [seciliAdres, setSeciliAdres] = useState('');
  const [manuelAdres, setManuelAdres] = useState({ adres: '', konum: '' });
  const [kuponKodu, setKuponKodu] = useState('');
  const [indirim, setIndirim] = useState(0);
  const [kuponMesaj, setKuponMesaj] = useState('');
  const [odemeYontemi, setOdemeYontemi] = useState('kredi_karti');
  const [kuponlar, setKuponlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kart, setKart] = useState({ kartNo: '', cvv: '', sonKullanma: '', taksit: 1 });

  useEffect(() => {
    if (!kullanici) { navigate('/giris'); return; }
    if (sepet.length === 0) { navigate('/'); return; }
    fetchAddresses().then((a) => {
      setAdresler(a);
      const vars = a.find((x) => x.varsayilan);
      if (vars) setSeciliAdres(vars._id);
    }).catch(() => {});
    fetchCoupons().then(setKuponlar).catch(() => {});
  }, [kullanici, sepet, navigate]);

  const kargo = toplam >= 300 ? 0 : 29.99;
  const genelToplam = Math.max(0, toplam - indirim + kargo);

  const kuponUygula = async () => {
    setKuponMesaj('');
    try {
      const sonuc = await validateCoupon(kuponKodu, toplam);
      setIndirim(sonuc.indirim);
      setKuponMesaj(`${sonuc.kupon.aciklama} uygulandı`);
    } catch (err) {
      setIndirim(0);
      setKuponMesaj(err.response?.data?.mesaj || 'Kupon geçersiz');
    }
  };

  const siparisVer = async () => {
    setYukleniyor(true);
    try {
      if (odemeYontemi === 'kredi_karti') {
        await processPayment({ ...kart, tutar: genelToplam, taksit: kart.taksit });
      }
      const secilen = adresler.find((a) => a._id === seciliAdres);
      const siparis = await createOrder({
        kuponKodu: indirim > 0 ? kuponKodu : undefined,
        odemeYontemi,
        adres: secilen?.adres || manuelAdres.adres || kullanici.adres,
        konum: secilen?.konum || manuelAdres.konum || kullanici.konum
      });
      await sepetiYukle();
      navigate(`/siparisler/${siparis._id}`);
    } catch (err) {
      alert(err.response?.data?.mesaj || 'Sipariş oluşturulamadı');
    } finally {
      setYukleniyor(false);
    }
  };

  if (!kullanici) return null;

  return (
    <Layout arama={arama} setArama={setArama} kategori={kategori} setKategori={setKategori} konum={konum} setKonum={setKonum}>
      <main className="main checkout-page">
        <h1 className="page-title">Ödeme</h1>
        <div className="checkout-grid">
          <div className="checkout-form">
            <section className="checkout-section">
              <h3>Teslimat Adresi</h3>
              {adresler.map((a) => (
                <label key={a._id} className="address-option">
                  <input type="radio" name="adres" value={a._id} checked={seciliAdres === a._id} onChange={() => setSeciliAdres(a._id)} />
                  <div>
                    <strong>{a.baslik}</strong> {a.varsayilan && <span className="badge">Varsayılan</span>}
                    <p>{a.adres} — {a.konum}</p>
                  </div>
                </label>
              ))}
              <label>Manuel adres<textarea value={manuelAdres.adres} onChange={(e) => setManuelAdres({ ...manuelAdres, adres: e.target.value })} rows={2} placeholder="Adres girin..." /></label>
              <label>Mahalle<input value={manuelAdres.konum} onChange={(e) => setManuelAdres({ ...manuelAdres, konum: e.target.value })} /></label>
            </section>

            <section className="checkout-section">
              <h3>Kupon Kodu</h3>
              <div className="coupon-row">
                <input value={kuponKodu} onChange={(e) => setKuponKodu(e.target.value.toUpperCase())} placeholder="Kupon kodu" />
                <button type="button" onClick={kuponUygula}>Uygula</button>
              </div>
              {kuponMesaj && <p className={indirim > 0 ? 'auth-success' : 'auth-error'}>{kuponMesaj}</p>}
              <div className="available-coupons">
                {kuponlar.map((k) => (
                  <button key={k.kod} type="button" className="coupon-chip" onClick={() => setKuponKodu(k.kod)}>{k.kod}</button>
                ))}
              </div>
            </section>

            <section className="checkout-section">
              <h3>Ödeme Yöntemi</h3>
              {['kredi_karti', 'kapida_odeme', 'havale'].map((y) => (
                <label key={y} className="address-option">
                  <input type="radio" name="odeme" value={y} checked={odemeYontemi === y} onChange={() => setOdemeYontemi(y)} />
                  {{ kredi_karti: 'Kredi / Banka Kartı', kapida_odeme: 'Kapıda Ödeme', havale: 'Havale / EFT' }[y]}
                </label>
              ))}
              {odemeYontemi === 'kredi_karti' && (
                <div className="kart-form">
                  <label>Kart No<input value={kart.kartNo} onChange={(e) => setKart({ ...kart, kartNo: e.target.value })} placeholder="4242 4242 4242 4242" /></label>
                  <div className="form-row">
                    <label>SKT<input value={kart.sonKullanma} onChange={(e) => setKart({ ...kart, sonKullanma: e.target.value })} placeholder="12/28" /></label>
                    <label>CVV<input value={kart.cvv} onChange={(e) => setKart({ ...kart, cvv: e.target.value })} placeholder="123" /></label>
                  </div>
                  <label>Taksit
                    <select value={kart.taksit} onChange={(e) => setKart({ ...kart, taksit: Number(e.target.value) })}>
                      {[1, 3, 6, 9].map((t) => <option key={t} value={t}>{t} Taksit</option>)}
                    </select>
                  </label>
                </div>
              )}
            </section>
          </div>

          <aside className="checkout-summary">
            <h3>Sipariş Özeti</h3>
            {sepet.map((x) => (
              <div key={x._id} className="summary-item">
                <span>{x.resim} {x.ad} ×{x.adet}</span>
                <span>{formatPrice(x.fiyat * x.adet)}</span>
              </div>
            ))}
            <div className="summary-row"><span>Ara Toplam</span><span>{formatPrice(toplam)}</span></div>
            {indirim > 0 && <div className="summary-row discount"><span>İndirim</span><span>-{formatPrice(indirim)}</span></div>}
            <div className="summary-row"><span>Kargo</span><span>{kargo === 0 ? 'Ücretsiz' : formatPrice(kargo)}</span></div>
            <div className="summary-row total"><span>Toplam</span><strong>{formatPrice(genelToplam)}</strong></div>
            <button type="button" className="checkout-btn" onClick={siparisVer} disabled={yukleniyor}>
              {yukleniyor ? 'İşleniyor...' : 'Siparişi Onayla'}
            </button>
          </aside>
        </div>
      </main>
    </Layout>
  );
}
