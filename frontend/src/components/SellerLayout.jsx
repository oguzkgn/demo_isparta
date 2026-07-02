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
          <Link to="/satici/panel?tab=ilan" className="seller-logo">
            <IconStore size={22} />
            <span>
              demo
              <small>Satıcı Paneli</small>
            </span>
          </Link>
          <nav className="seller-nav">
            <Link to="/satici/panel?tab=envanter" className="seller-nav-link">Ürünlerim</Link>
            <Link to="/satici/panel?tab=siparisler" className="seller-nav-link">Siparişler</Link>
            <Link to="/satici/panel?tab=ilan" className="seller-nav-link seller-nav-highlight">İlan Ver</Link>
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
      {children}
      <footer className="seller-footer">
        <p>demo Satıcı — Isparta&apos;da ürünlerinizi satışa koyun</p>
      </footer>
    </div>
  );
}
