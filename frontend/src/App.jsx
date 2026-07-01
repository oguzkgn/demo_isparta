import { useState, useEffect, useCallback } from 'react';
import { fetchProducts, fetchCategories, fetchLocations } from './api/client';
import './App.css';

function formatPrice(n) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
}

export default function App() {
  const [urunler, setUrunler] = useState([]);
  const [kategoriler, setKategoriler] = useState([]);
  const [konumlar, setKonumlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState('');
  const [kategori, setKategori] = useState('');
  const [konum, setKonum] = useState('');
  const [siralama, setSiralama] = useState('');
  const [sepet, setSepet] = useState(() => JSON.parse(localStorage.getItem('demo-sepet') || '[]'));
  const [sepetAcik, setSepetAcik] = useState(false);

  useEffect(() => {
    localStorage.setItem('demo-sepet', JSON.stringify(sepet));
  }, [sepet]);

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

  const sepeteEkle = (urun) => {
    setSepet((prev) => {
      const mevcut = prev.find((x) => x._id === urun._id);
      if (mevcut) {
        return prev.map((x) => x._id === urun._id ? { ...x, adet: x.adet + 1 } : x);
      }
      return [...prev, { ...urun, adet: 1 }];
    });
  };

  const sepettenCikar = (id) => {
    setSepet((prev) => prev.filter((x) => x._id !== id));
  };

  const toplam = sepet.reduce((t, x) => t + x.fiyat * x.adet, 0);
  const sepetAdet = sepet.reduce((t, x) => t + x.adet, 0);

  return (
    <>
      <header className="header">
        <div className="header-top">
          <div className="logo">
            demo
            <span>Isparta Alışveriş</span>
          </div>
          <form className="search-wrap" onSubmit={(e) => { e.preventDefault(); urunleriGetir(); }}>
            <input
              placeholder="Ürün, kategori veya marka ara..."
              value={arama}
              onChange={(e) => setArama(e.target.value)}
            />
            <button type="submit">Ara</button>
          </form>
          <select className="location-select" value={konum} onChange={(e) => setKonum(e.target.value)}>
            <option value="">📍 Tüm Mahalleler</option>
            {konumlar.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <div className="header-actions">
            <button type="button" className="cart-btn" onClick={() => setSepetAcik(true)}>
              🛒 Sepet
              {sepetAdet > 0 && <span className="cart-badge">{sepetAdet}</span>}
            </button>
          </div>
        </div>
        <div className="category-bar">
          <button type="button" className={`cat-chip ${!kategori ? 'active' : ''}`} onClick={() => setKategori('')}>
            Tümü
          </button>
          {kategoriler.map((k) => (
            <button
              key={k.id}
              type="button"
              className={`cat-chip ${kategori === k.id ? 'active' : ''}`}
              onClick={() => setKategori(k.id)}
            >
              {k.ikon} {k.ad}
            </button>
          ))}
        </div>
      </header>

      <section className="hero">
        <div className="hero-banner">
          <div>
            <h1>Isparta'nın Yerel Alışverişi 🌸</h1>
            <p>Lavanta kokulu mahallelerden kapına teslimat. Gül ve lavanta ürünleri, moda, elektronik ve daha fazlası — Demo'da.</p>
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
          <div className="empty-products">
            <span>🌿</span>
            Bu filtreye uygun ürün bulunamadı.
          </div>
        ) : (
          <div className="product-grid">
            {urunler.map((u) => (
              <article key={u._id} className="product-card">
                <div className="product-image">
                  {u.oneCikan && <span className="badge">Öne Çıkan</span>}
                  {u.resim || '🛍️'}
                </div>
                <div className="product-body">
                  <div className="product-brand">{u.marka}</div>
                  <h3 className="product-title">{u.ad}</h3>
                  <div className="product-location">📍 {u.konum}</div>
                  <div className="product-rating">★ {u.puan} ({u.yorumSayisi} yorum)</div>
                  <div className="product-prices">
                    <span className="price-now">{formatPrice(u.fiyat)}</span>
                    {u.eskiFiyat && <span className="price-old">{formatPrice(u.eskiFiyat)}</span>}
                  </div>
                  <button type="button" className="add-btn" onClick={() => sepeteEkle(u)}>
                    Sepete Ekle
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="deco">🌹 🌿 💜</div>
        <p><strong>demo</strong> — Isparta'nın yerel alışveriş platformu</p>
        <p>Çünür · İyaş · Merkez · Lavanta Vadisi</p>
      </footer>

      <div className={`cart-overlay ${sepetAcik ? 'open' : ''}`} onClick={() => setSepetAcik(false)} />
      <aside className={`cart-panel ${sepetAcik ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>🛒 Sepetim</h2>
          <button type="button" onClick={() => setSepetAcik(false)} style={{ background: 'transparent', color: 'white', fontSize: '1.25rem' }}>✕</button>
        </div>
        <div className="cart-items">
          {sepet.length === 0 ? (
            <div className="empty-cart"><span>🌸</span>Sepetiniz boş</div>
          ) : sepet.map((x) => (
            <div key={x._id} className="cart-item">
              <div className="cart-item-icon">{x.resim}</div>
              <div className="cart-item-info">
                <h4>{x.ad}</h4>
                <p>{formatPrice(x.fiyat)} × {x.adet}</p>
              </div>
              <button type="button" onClick={() => sepettenCikar(x._id)} style={{ background: 'none', color: '#999' }}>✕</button>
            </div>
          ))}
        </div>
        {sepet.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Toplam</span>
              <span>{formatPrice(toplam)}</span>
            </div>
            <button type="button" className="checkout-btn" onClick={() => alert('Demo sipariş alındı! 🌸')}>
              Siparişi Tamamla
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
