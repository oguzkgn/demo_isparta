import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconStore, IconUser } from './icons/Icons';

export default function SellerLayout({ children }) {
  const { kullanici, cikisYap } = useAuth();
  const navigate = useNavigate();

  const handleCikis = () => {
    cikisYap();
    navigate('/satici/giris');
  };

  return (
    <div className="seller-shell">
      <header className="seller-header">
        <div className="seller-header-inner">
          <Link to="/satici/panel" className="seller-logo">
            <IconStore size={22} />
            <span>
              demo
              <small>Satıcı Paneli</small>
            </span>
          </Link>
          <nav className="seller-nav">
            <Link to="/satici/panel" className="seller-nav-link">Ürünlerim</Link>
            <Link to="/satici/panel" className="seller-nav-link">Siparişler</Link>
            <Link to="/satici/panel" className="seller-nav-link">İlan Ver</Link>
            <Link to="/" className="seller-nav-link muted">Alışveriş Sitesi</Link>
          </nav>
          <div className="seller-header-actions">
            {kullanici ? (
              <>
                <span className="seller-user"><IconUser size={16} /> {kullanici.ad}</span>
                <button type="button" className="seller-btn outline" onClick={handleCikis}>Çıkış</button>
              </>
            ) : (
              <Link to="/satici/giris" className="seller-btn">Satıcı Girişi</Link>
            )}
          </div>
        </div>
      </header>
      <nav className="back-home-bar seller-back-home" aria-label="Gezinme">
        <Link to="/" className="back-home-link">← Ana sayfaya dön</Link>
      </nav>
      {children}
      <footer className="seller-footer">
        <p>demo Satıcı — Isparta&apos;da ürünlerinizi satışa koyun</p>
      </footer>
    </div>
  );
}
