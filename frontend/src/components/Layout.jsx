import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartPanel from './CartPanel';

export default function Layout({ children, kategoriler, kategori, setKategori, arama, setArama, onAra, konumlar, konum, setKonum }) {
  const { kullanici, cikisYap } = useAuth();
  const { sepetAdet, setSepetAcik } = useCart();
  const navigate = useNavigate();

  return (
    <>
      <header className="header">
        <div className="header-top">
          <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            demo
            <span>Isparta Alışveriş</span>
          </Link>
          <form className="search-wrap" onSubmit={(e) => { e.preventDefault(); onAra?.(); navigate('/'); }}>
            <input
              placeholder="Ürün, kategori veya marka ara..."
              value={arama}
              onChange={(e) => setArama(e.target.value)}
            />
            <button type="submit">Ara</button>
          </form>
          {konumlar?.length > 0 && (
          <select className="location-select" value={konum} onChange={(e) => setKonum(e.target.value)}>
            <option value="">📍 Tüm Mahalleler</option>
            {konumlar.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          )}
          <div className="header-actions">
            {kullanici ? (
              <>
                <Link to="/favoriler" className="header-link">❤️ Favoriler</Link>
                <Link to="/siparisler" className="header-link">📦 Siparişler</Link>
                <Link to="/profil" className="header-link">👤 {kullanici.ad}</Link>
                <button type="button" className="header-link-btn" onClick={cikisYap}>Çıkış</button>
              </>
            ) : (
              <>
                <Link to="/giris" className="header-link">Giriş Yap</Link>
                <Link to="/kayit" className="header-link register-link">Kayıt Ol</Link>
              </>
            )}
            <button type="button" className="cart-btn" onClick={() => setSepetAcik(true)}>
              🛒 Sepet
              {sepetAdet > 0 && <span className="cart-badge">{sepetAdet}</span>}
            </button>
          </div>
        </div>
        {kategoriler && (
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
