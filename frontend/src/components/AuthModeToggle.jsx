import { Link, useNavigate, useLocation } from 'react-router-dom';

/** Giriş / Kayıt sekmeleri — URL ile senkron */
export function AuthModeToggle({ portal }) {
  const { pathname } = useLocation();
  const girisAktif = pathname === '/giris';
  const q = portal === 'satici' ? '?portal=satici' : '';

  return (
    <div className="auth-mode-toggle" role="tablist" aria-label="Giriş veya kayıt">
      <Link
        to={`/giris${q}`}
        role="tab"
        aria-selected={girisAktif}
        className={girisAktif ? 'active' : ''}
      >
        Giriş Yap
      </Link>
      <Link
        to={`/kayit${q}`}
        role="tab"
        aria-selected={!girisAktif}
        className={!girisAktif ? 'active' : ''}
      >
        Kayıt Ol
      </Link>
    </div>
  );
}

export function AuthModeToggleNav({ portal, setPortal }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const girisAktif = pathname === '/giris';

  const modDegistir = (kayit) => {
    const hedef = kayit ? '/kayit' : '/giris';
    const q = portal === 'satici' ? '?portal=satici' : '';
    navigate(`${hedef}${q}`, { replace: true });
  };

  return (
    <div className="auth-mode-toggle" role="tablist" aria-label="Giriş veya kayıt">
      <button type="button" role="tab" aria-selected={girisAktif} className={girisAktif ? 'active' : ''} onClick={() => modDegistir(false)}>
        Giriş Yap
      </button>
      <button type="button" role="tab" aria-selected={!girisAktif} className={!girisAktif ? 'active' : ''} onClick={() => modDegistir(true)}>
        Kayıt Ol
      </button>
    </div>
  );
}
