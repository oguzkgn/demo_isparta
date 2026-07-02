import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchCategories, fetchLocations, fetchRecent, fetchBrands, fetchFavorites, addFavorite, removeFavorite } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { asArray } from '../utils/safe';
import Layout from '../components/Layout';

function ProductCard({ u, sepeteEkle, favoriMi, favoriToggle }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <button
          type="button"
          className={`card-fav-btn ${favoriMi ? 'active' : ''}`}
          onClick={() => favoriToggle?.(u._id)}
          aria-label={favoriMi ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          {favoriMi ? '❤️' : '🤍'}
        </button>
        <Link to={`/urun/${u._id}`} className="product-image">
          {u.oneCikan && <span className="badge">Öne Çıkan</span>}
          {u.resim || '🛍️'}
        </Link>
      </div>
      <div className="product-body">
        <div className="product-brand">{u.marka} {u.saticiAd && <span className="seller-tag">· {u.saticiAd}</span>}</div>
        <Link to={`/urun/${u._id}`} className="product-title">{u.ad}</Link>
        <div className="product-location">📍 {u.konum}</div>
        <div className="product-rating">★ {u.puan?.toFixed(1)} ({u.yorumSayisi} yorum)</div>
        <div className="product-prices">
          <span className="price-now">{formatPrice(u.fiyat)}</span>
          {u.eskiFiyat && <span className="price-old">{formatPrice(u.eskiFiyat)}</span>}
        </div>
        <button type="button" className="add-btn" onClick={() => sepeteEkle(u)}>Sepete Ekle</button>
      </div>
    </article>
  );
}

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

  const cardProps = { sepeteEkle, favoriToggle, favoriMi: false };

  useEffect(() => {
    Promise.all([fetchCategories(), fetchLocations(), fetchBrands()])
      .then(([k, l, m]) => {
        setKategoriler(asArray(k));
        setKonumlar(asArray(l));
        setMarkalar(asArray(m));
      })
      .catch(() => {});
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
      .then((data) => setUrunler(asArray(data)))
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
      konumlar={konumlar}
      konum={konum}
      setKonum={setKonum}
    >
      <section className="hero">
        <div className="hero-banner">
          <div>
            <h1>Isparta'nın Yerel Alışverişi 🌸</h1>
            <p>Lavanta kokulu mahallelerden kapına teslimat. 300 TL üzeri ücretsiz kargo!</p>
            <div className="hero-coupons">
              <span className="coupon-chip">ISPARTA10</span>
              <span className="coupon-chip">LAVANTA50</span>
              <span className="coupon-chip">GUL20</span>
            </div>
          </div>
          <div className="hero-deco">🌹🌿</div>
        </div>
      </section>

      {!kategori && !arama && Array.isArray(oneCikan) && oneCikan.length > 0 && (
        <section className="section-block">
          <h2 className="section-title">⚡ Flaş Ürünler</h2>
          <div className="product-grid compact">
            {oneCikan.slice(0, 4).map((u) => (
              <ProductCard key={u._id} u={u} {...cardProps} favoriMi={favoriIds.has(u._id)} />
            ))}
          </div>
        </section>
      )}

      {Array.isArray(sonGorulen) && sonGorulen.length > 0 && !arama && (
        <section className="section-block">
          <h2 className="section-title">👁️ Son Baktıklarınız</h2>
          <div className="product-grid compact">
            {sonGorulen.slice(0, 4).map((u) => (
              <ProductCard key={u._id} u={u} {...cardProps} favoriMi={favoriIds.has(u._id)} />
            ))}
          </div>
        </section>
      )}

      <section className="section-block">
        <div className="category-grid">
          {Array.isArray(kategoriler) && kategoriler.map((k) => (
            <button
              key={k.id}
              type="button"
              className={`category-card ${kategori === k.id ? 'active' : ''}`}
              onClick={() => { setKategori(k.id); navigate('/'); }}
            >
              <span>{k.ikon}</span>
              <small>{k.ad}</small>
            </button>
          ))}
        </div>
      </section>

      <main className="main with-sidebar">
        <aside className="filter-sidebar">
          <h3>Filtrele</h3>
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
              {[4, 4.5, 5].map((p) => <option key={p} value={p}>{p}+ ★</option>)}
            </select>
          </label>
          <button type="button" className="fav-btn" onClick={() => setFiltre({ marka: '', minFiyat: '', maxFiyat: '', minPuan: '' })}>Temizle</button>
        </aside>
        <div className="main-content">
        <div className="toolbar">
          <select value={siralama} onChange={(e) => setSiralama(e.target.value)}>
            <option value="">Sıralama</option>
            <option value="fiyatArtan">Fiyat: Artan</option>
            <option value="fiyatAzalan">Fiyat: Azalan</option>
            <option value="puan">En Yüksek Puan</option>
          </select>
          <span className="product-count">{Array.isArray(urunler) ? urunler.length : 0} ürün listeleniyor</span>
        </div>

        {yukleniyor ? (
          <div className="loading">Ürünler yükleniyor...</div>
        ) : !Array.isArray(urunler) || urunler.length === 0 ? (
          <div className="empty-products"><span>🌿</span>Bu filtreye uygun ürün bulunamadı.</div>
        ) : (
          <div className="product-grid">
            {urunler.map((u) => (
              <ProductCard key={u._id} u={u} {...cardProps} favoriMi={favoriIds.has(u._id)} />
            ))}
          </div>
        )}
        </div>
      </main>
    </Layout>
  );
}
