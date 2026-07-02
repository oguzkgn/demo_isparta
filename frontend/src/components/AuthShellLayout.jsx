import { Link } from 'react-router-dom';
import { IconStore } from './icons/Icons';

/** Müşteri/satıcı guard'sız ortak giriş kabuğu */
export default function AuthShellLayout({ children }) {
  return (
    <div className="auth-shell">
      <header className="auth-shell-header">
        <Link to="/" className="auth-shell-logo">demo</Link>
        <span className="auth-shell-tag">Giriş Portalı</span>
      </header>
      {children}
      <footer className="auth-shell-footer">
        <p>Giriş sonrası müşteri alışverişi ve satıcı paneli birbirinden ayrıdır.</p>
      </footer>
    </div>
  );
}

export function PortalToggle({ portal, setPortal }) {
  return (
    <div className="portal-toggle" role="tablist" aria-label="Hesap türü">
      <button
        type="button"
        role="tab"
        aria-selected={portal === 'musteri'}
        className={portal === 'musteri' ? 'active' : ''}
        onClick={() => setPortal('musteri')}
      >
        Müşteri
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={portal === 'satici'}
        className={portal === 'satici' ? 'active seller' : 'seller'}
        onClick={() => setPortal('satici')}
      >
        <IconStore size={15} /> Satıcı
      </button>
    </div>
  );
}
