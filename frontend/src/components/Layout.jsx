import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { searchProducts } from '../api/client';
import { asArray } from '../utils/safe';
import CartPanel from './CartPanel';

export default function Layout({ children, kategoriler, kategori, setKategori, arama, setArama, onAra, konumlar, konum, setKonum }) {
  const { kullanici, cikisYap } = useAuth();
  const { sepetAdet, setSepetAcik } = useCart();
  const navigate = useNavigate();
  const [oneriler, setOneriler] = useState([]);
  const [oneriAcik, setOneriAcik] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!arama || arama.length < 2) { setOneriler([]); return; }
    const t = setTimeout(() => {
      searchProducts(arama)
        .then((r) => setOneriler(asArray(r?.oneriler)))
        .catch(() => setOneriler([]));
    }, 300);
    return () => clearTimeout(t);
  }, [arama]);

  const oneriSec = (o) => {
    setOneriAcik(false);
    if (o.tip === 'urun' && o.id) navigate(`/urun/${o.id}`);
    else { setArama(o.metin); onAra?.(); navigate('/'); }
  };

  return (
    <>
      <header className="header">
        <div className="header-top">
          <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            demo
            <span>Isparta Alışveriş</span>
          </Link>
          <div className="search-wrap" ref={searchRef}>
            <form onSubmit={(e) => { e.preventDefault(); setOneriAcik(false); onAra?.(); navigate('/'); }}>
              <input
                placeholder="Ürün, kategori veya marka ara..."
                value={arama}
                onChange={(e) => { setArama(e.target.value); setOneriAcik(true); }}
                onFocus={() => setOneriAcik(true)}
              />
              <button type="submit">Ara</button>
            </form>
            {oneriAcik && Array.isArray(oneriler) && oneriler.length > 0 && (
              <div className="search-suggestions">
                {oneriler.slice(0, 5).map((o, i) => (
                  <button key={i} type="button" onClick={() => oneriSec(o)}>
                    {o.tip === 'marka' ? '🏷️' : '🔍'} {o.metin}
                  </button>
                ))}
              </div>
            )}
          </div>
          {Array.isArray(konumlar) && konumlar.length > 0 && (
            <select className="location-select" value={konum} onChange={(e) => setKonum(e.target.value)}>
              <option value="">📍 Tüm Mahalleler</option>
              {konumlar.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          )}
          <div className="header-actions">
            {kullanici ? (
              <>
                <Link to="/favoriler" className="header-link">❤️</Link>
                <Link to="/siparisler" className="header-link">📦</Link>
                <Link to="/profil" className="header-link">👤 {kullanici.ad}</Link>
                <button type="button" className="header-link-btn" onClick={cikisYap}>Çıkış</button>
              </>
            ) : (
              <>
                <Link to="/giris" className="header-link">Giriş</Link>
                <Link to="/kayit" className="header-link register-link">Kayıt Ol</Link>
              </>
            )}
            <button type="button" className="cart-btn" onClick={() => setSepetAcik(true)}>
              🛒
              {sepetAdet > 0 && <span className="cart-badge">{sepetAdet}</span>}
            </button>
          </div>
        </div>
        {Array.isArray(kategoriler) && (
          <div className="category-bar">
            <button type="button" className={`cat-chip ${!kategori ? 'active' : ''}`} onClick={() => setKategori('')}>
              Tümü
            </button>
            {kategoriler.map((k) => (
              <button
                key={k.id}
                type="button"
                className={`cat-chip ${kategori === k.id ? 'active' : ''}`}
                onClick={() => { setKategori(k.id); navigate('/'); }}
              >
                {k.ikon} {k.ad}
              </button>
            ))}
          </div>
        )}
      </header>

      {children}

      <footer className="footer">
        <div className="deco">🌹 🌿 💜</div>
        <p><strong>demo</strong> — Isparta'nın yerel alışveriş platformu</p>
        <p>Çünür · İyaş · Merkez · Lavanta Vadisi</p>
      </footer>

      <CartPanel />
    </>
  );
}
