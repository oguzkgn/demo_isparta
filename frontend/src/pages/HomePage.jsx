import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories, fetchLocations } from '../api/client';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import Layout from '../components/Layout';

export default function HomePage({ arama, setArama, kategori, setKategori, konum, setKonum }) {
  const [urunler, setUrunler] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [konumlar, setKonumlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [siralama, setSiralama] = useState('');
  const { sepeteEkle } = useCart();

  useEffect(() => {
    Promise.all([fetchCategories(), fetchLocations()])
      .then(([k, l]) => { setKategoriler(k); setKonumlar(l); })
      .catch(() => {});
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
            <p>Lavanta kokulu mahallelerden kapına teslimat. Gül ve lavanta ürünleri, moda, elektronik ve daha fazlası.</p>
          </div>
          <div className="hero-deco">🌹🌿</div>
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
              <article key={u._id} className="product-card">
                <Link to={`/urun/${u._id}`} className="product-image">
                  {u.oneCikan && <span className="badge">Öne Çıkan</span>}
                  {u.resim || '🛍️'}
                </Link>
                <div className="product-body">
                  <div className="product-brand">{u.marka}</div>
                  <Link to={`/urun/${u._id}`} className="product-title">{u.ad}</Link>
                  <div className="product-location">📍 {u.konum}</div>
                  <div className="product-rating">★ {u.puan} ({u.yorumSayisi} yorum)</div>
                  <div className="product-prices">
                    <span className="price-now">{formatPrice(u.fiyat)}</span>
                    {u.eskiFiyat && <span className="price-old">{formatPrice(u.eskiFiyat)}</span>}
                  </div>
                  <button type="button" className="add-btn" onClick={() => sepeteEkle(u)}>Sepete Ekle</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}
