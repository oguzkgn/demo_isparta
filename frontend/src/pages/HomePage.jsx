import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchCategories, fetchLocations, fetchRecent } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import Layout from '../components/Layout';

function ProductCard({ u, sepeteEkle }) {
  return (
    <article className="product-card">
      <Link to={`/urun/${u._id}`} className="product-image">
        {u.oneCikan && <span className="badge">Öne Çıkan</span>}
        {u.resim || '🛍️'}
      </Link>
      <div className="product-body">
        <div className="product-brand">{u.marka}</div>
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

  useEffect(() => {
    Promise.all([fetchCategories(), fetchLocations()])
      .then(([k, l]) => { setKategoriler(k); setKonumlar(l); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (kullanici) {
      fetchRecent().then(setSonGorulen).catch(() => {});
    }
  }, [kullanici]);

  useEffect(() => {
    fetchProducts({ oneCikan: 'true' }).then(setOneCikan).catch(() => {});
  }, []);

  const urunleriGetir = useCallback(() => {
    setYukleniyor(true);
    const params = {};
    if (kategori) params.kategori = kategori;
    if (konum) params.konum = konum;
    if (arama.trim()) params.ara = arama.trim();
    if (siralama) params.siralama = siralama;
    fetchProducts(params)
      .then(setUrunler)
      .catch(() => setUrunler([]))
      .finally(() => setYukleniyor(false));
  }, [kategori, konum, arama, siralama]);

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

      {!kategori && !arama && oneCikan.length > 0 && (
        <section className="section-block">
          <h2 className="section-title">⚡ Flaş Ürünler</h2>
          <div className="product-grid compact">
            {oneCikan.slice(0, 4).map((u) => (
              <ProductCard key={u._id} u={u} sepeteEkle={sepeteEkle} />
            ))}
          </div>
        </section>
      )}

      {sonGorulen.length > 0 && !arama && (
        <section className="section-block">
          <h2 className="section-title">👁️ Son Baktıklarınız</h2>
          <div className="product-grid compact">
            {sonGorulen.slice(0, 4).map((u) => (
              <ProductCard key={u._id} u={u} sepeteEkle={sepeteEkle} />
            ))}
          </div>
        </section>
      )}

      <section className="section-block">
        <div className="category-grid">
          {kategoriler.map((k) => (
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

      <main className="main">
        <div className="toolbar">
          <select value={siralama} onChange={(e) => setSiralama(e.target.value)}>
            <option value="">Sıralama</option>
            <option value="fiyatArtan">Fiyat: Artan</option>
            <option value="fiyatAzalan">Fiyat: Azalan</option>
            <option value="puan">En Yüksek Puan</option>
          </select>
          <span className="product-count">{urunler.length} ürün listeleniyor</span>
        </div>

        {yukleniyor ? (
          <div className="loading">Ürünler yükleniyor...</div>
        ) : urunler.length === 0 ? (
          <div className="empty-products"><span>🌿</span>Bu filtreye uygun ürün bulunamadı.</div>
        ) : (
          <div className="product-grid">
            {urunler.map((u) => (
              <ProductCard key={u._id} u={u} sepeteEkle={sepeteEkle} />
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}
