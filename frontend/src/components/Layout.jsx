import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { searchProducts } from '../api/client';
import { asArray } from '../utils/safe';
import { IconCart, IconHeart, IconPackage, IconSearch, IconStore, IconTag, IconUser } from './icons/Icons';
import CartPanel from './CartPanel';

export default function Layout({ children, kategoriler, kategori, setKategori, arama, setArama, onAra }) {
  const { kullanici, cikisYap } = useAuth();
  const { sepetAdet, setSepetAcik } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const anaSayfadaMi = location.pathname === '/';
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
          <Link to="/" className="logo">
            <span className="logo-mark">demo</span>
            <span className="logo-sub">Isparta Alışveriş</span>
          </Link>
          <div className="search-wrap" ref={searchRef}>
            <form onSubmit={(e) => { e.preventDefault(); setOneriAcik(false); onAra?.(); navigate('/'); }}>
              <IconSearch className="search-icon" />
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
                    {o.tip === 'marka' ? <IconTag size={14} /> : <IconSearch size={14} />}
                    <span>{o.metin}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="header-actions">
            {kullanici ? (
              <>
                <Link to="/favoriler" className="header-link icon-link" title="Favorilerim">
                  <IconHeart size={16} />
                  <span>Favoriler</span>
                </Link>
                <Link to="/siparisler" className="header-link icon-link" title="Siparişler">
                  <IconPackage size={16} />
                  <span>Siparişler</span>
                </Link>
                <Link to="/profil" className="header-link icon-link" title="Profil">
                  <IconUser size={16} />
                  <span>{kullanici.ad}</span>
                </Link>
                <button type="button" className="header-link-btn" onClick={cikisYap}>Çıkış</button>
              </>
            ) : (
              <>
                <Link to="/giris" className="header-link">Giriş</Link>
                <Link to="/kayit" className="header-link register-link">Kayıt Ol</Link>
                <Link to="/satici/giris" className="header-link seller-link">
                  <IconStore size={15} />
                  <span>Satıcı</span>
                </Link>
              </>
            )}
            <button type="button" className="cart-btn" onClick={() => setSepetAcik(true)} aria-label="Sepet">
              <IconCart size={18} />
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
                {k.ad}
              </button>
            ))}
          </div>
        )}
      </header>

      {!anaSayfadaMi && (
        <nav className="back-home-bar" aria-label="Gezinme">
          <Link to="/" className="back-home-link">← Ana sayfaya dön</Link>
        </nav>
      )}

      {children}

      <footer className="footer">
        <p className="footer-brand"><strong>demo</strong> — Isparta&apos;nın yerel alışveriş platformu</p>
        <p className="footer-locations">Çünür · İyaş · Merkez · Lavanta Vadisi</p>
      </footer>

      <CartPanel />
    </>
  );
}
