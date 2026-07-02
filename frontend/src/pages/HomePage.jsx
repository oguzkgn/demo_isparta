import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, fetchCategories, fetchLocations, fetchRecent, fetchBrands, fetchFavorites, addFavorite, removeFavorite } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { asArray } from '../utils/safe';
import { ISPARTA_KONUMLAR } from '../constants/config';
import { urunleriFiltrele } from '../utils/products';
import { konumMetni } from '../utils/format';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';

export default function HomePage({ arama, setArama, kategori, setKategori, konum, setKonum }) {
  const { kullanici } = useAuth();
  const { sepeteEkle } = useCart();
  const navigate = useNavigate();
  const [urunler, setUrunler] = useState([]);
  const [oneCikan, setOneCikan] = useState([]);
  const [sonGorulen, setSonGorulen] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [konumlar, setKonumlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [siralama, setSiralama] = useState('');
  const [markalar, setMarkalar] = useState([]);
  const [filtre, setFiltre] = useState({ marka: '', minFiyat: '', maxFiyat: '', minPuan: '' });
  const [favoriIds, setFavoriIds] = useState(new Set());

  useEffect(() => {
    if (!kullanici) {
      setFavoriIds(new Set());
      return;
    }
    fetchFavorites()
      .then((list) => setFavoriIds(new Set(asArray(list).map((f) => f._id))))
      .catch(() => setFavoriIds(new Set()));
  }, [kullanici]);

  const favoriToggle = async (urunId) => {
    if (!kullanici) {
      navigate('/giris');
      return;
    }
    if (favoriIds.has(urunId)) {
      await removeFavorite(urunId);
      setFavoriIds((prev) => {
        const next = new Set(prev);
        next.delete(urunId);
        return next;
      });
    } else {
      await addFavorite(urunId);
      setFavoriIds((prev) => new Set(prev).add(urunId));
    }
  };

  const cardProps = { sepeteEkle, favoriToggle };

  useEffect(() => {
    Promise.all([fetchCategories(), fetchLocations(), fetchBrands()])
      .then(([k, l, m]) => {
        setKategoriler(asArray(k));
        setKonumlar(asArray(l).length ? asArray(l) : ISPARTA_KONUMLAR);
        setMarkalar(asArray(m));
      })
      .catch(() => {
        setKonumlar(ISPARTA_KONUMLAR);
      });
  }, []);

  useEffect(() => {
    if (kullanici) {
      fetchRecent().then((data) => setSonGorulen(asArray(data))).catch(() => setSonGorulen([]));
    }
  }, [kullanici]);

  useEffect(() => {
    fetchProducts({ oneCikan: 'true' })
      .then((data) => setOneCikan(asArray(data)))
      .catch(() => setOneCikan([]));
  }, []);

  const urunleriGetir = useCallback(() => {
    setYukleniyor(true);
    const params = {};
    if (kategori) params.kategori = kategori;
    if (konum) params.konum = konum;
    if (arama.trim()) params.ara = arama.trim();
    if (siralama) params.siralama = siralama;
    if (filtre.marka) params.marka = filtre.marka;
    if (filtre.minFiyat) params.minFiyat = filtre.minFiyat;
    if (filtre.maxFiyat) params.maxFiyat = filtre.maxFiyat;
    if (filtre.minPuan) params.minPuan = filtre.minPuan;
    fetchProducts(params)
      .then((data) => {
        const ham = asArray(data);
        const islenmis = urunleriFiltrele(ham, {
          kategori,
          konum,
          marka: filtre.marka,
          minFiyat: filtre.minFiyat,
          maxFiyat: filtre.maxFiyat,
          minPuan: filtre.minPuan,
          ara: arama.trim(),
          siralama
        });
        setUrunler(islenmis);
      })
      .catch(() => setUrunler([]))
      .finally(() => setYukleniyor(false));
  }, [kategori, konum, arama, siralama, filtre]);

  useEffect(() => { urunleriGetir(); }, [urunleriGetir]);

  return (
    <Layout
      kategoriler={kategoriler}
      kategori={kategori}
      setKategori={setKategori}
      arama={arama}
      setArama={setArama}
      onAra={urunleriGetir}
    >
      <section className="hero">
        <div className="hero-banner hero-banner-single">
          <div className="hero-content hero-vivid">
            <p className="hero-eyebrow">Isparta · Yerel Ticaret</p>
            <h1>Isparta&apos;nın yerel alışveriş platformu</h1>
            <p className="hero-lead">Lavanta vadisinden kapınıza teslimat. 300 TL üzeri siparişlerde ücretsiz kargo.</p>
            <div className="hero-coupons">
              <span className="coupon-chip">ISPARTA10</span>
              <span className="coupon-chip">LAVANTA50</span>
              <span className="coupon-chip">GUL20</span>
            </div>
          </div>
        </div>
      </section>

      <section className="shop-controls">
        <div className="shop-controls-inner">
          <div className="filter-bar-top">
            <span className="filter-bar-label">Filtrele</span>
            <div className="filter-bar-fields">
              <label>Mahalle
                <select value={konum} onChange={(e) => setKonum(e.target.value)}>
                  <option value="">Tüm Mahalleler</option>
                  {Array.isArray(konumlar) && konumlar.map((k) => (
                    <option key={k} value={k}>{konumMetni(k)}</option>
                  ))}
                </select>
              </label>
              <label>Marka
                <select value={filtre.marka} onChange={(e) => setFiltre({ ...filtre, marka: e.target.value })}>
                  <option value="">Tümü</option>
                  {Array.isArray(markalar) && markalar.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label>Min Fiyat<input type="number" value={filtre.minFiyat} onChange={(e) => setFiltre({ ...filtre, minFiyat: e.target.value })} /></label>
              <label>Max Fiyat<input type="number" value={filtre.maxFiyat} onChange={(e) => setFiltre({ ...filtre, maxFiyat: e.target.value })} /></label>
              <label>Min Puan
                <select value={filtre.minPuan} onChange={(e) => setFiltre({ ...filtre, minPuan: e.target.value })}>
                  <option value="">Tümü</option>
                  {[4, 4.5, 5].map((p) => <option key={p} value={p}>{p}+ puan</option>)}
                </select>
              </label>
              <button type="button" className="fav-btn filter-clear-btn" onClick={() => {
                setKonum('');
                setFiltre({ marka: '', minFiyat: '', maxFiyat: '', minPuan: '' });
                setSiralama('');
              }}>Temizle</button>
            </div>
          </div>
          <div className="shop-toolbar-top">
            <select value={siralama} onChange={(e) => setSiralama(e.target.value)} aria-label="Sıralama">
              <option value="">Sıralama</option>
              <option value="fiyatArtan">Fiyat: Artan</option>
              <option value="fiyatAzalan">Fiyat: Azalan</option>
              <option value="puan">Puan: Yüksekten düşüğe</option>
              <option value="puanArtan">Puan: Düşükten yükseğe</option>
            </select>
            {konum && (
              <span className="filter-chip">
                {konumMetni(konum)}
                <button type="button" onClick={() => setKonum('')} aria-label="Mahalle filtresini kaldır">×</button>
              </span>
            )}
            <span className="product-count">{Array.isArray(urunler) ? urunler.length : 0} ürün</span>
          </div>
        </div>
      </section>

      {!kategori && !arama && Array.isArray(oneCikan) && oneCikan.length > 0 && (
        <section className="section-block">
          <h2 className="section-title">Flaş Ürünler</h2>
          <div className="product-grid compact">
            {oneCikan.slice(0, 4).map((u) => (
              <ProductCard key={u._id} u={u} {...cardProps} favoriMi={favoriIds.has(u._id)} />
            ))}
          </div>
        </section>
      )}

      {Array.isArray(sonGorulen) && sonGorulen.length > 0 && !arama && (
        <section className="section-block">
          <h2 className="section-title">Son Baktıklarınız</h2>
          <div className="product-grid compact">
            {sonGorulen.slice(0, 4).map((u) => (
              <ProductCard key={u._id} u={u} {...cardProps} favoriMi={favoriIds.has(u._id)} />
            ))}
          </div>
        </section>
      )}

      <main className="main">
        {yukleniyor ? (
          <div className="loading">Ürünler yükleniyor...</div>
        ) : !Array.isArray(urunler) || urunler.length === 0 ? (
          <EmptyState
            title="Ürün bulunamadı"
            description="Filtreleri değiştirerek tekrar deneyin."
          />
        ) : (
          <div className="product-grid">
            {urunler.map((u) => (
              <ProductCard key={u._id} u={u} {...cardProps} favoriMi={favoriIds.has(u._id)} />
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}
