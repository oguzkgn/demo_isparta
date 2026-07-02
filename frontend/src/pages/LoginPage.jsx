import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiHataMesaji } from '../utils/apiError';
import { saticiGirisSonrasi } from '../utils/sellerAuth';
import { epostaDogrulandiMi, epostaDogrulamaYolu } from '../utils/authVerify';
import AuthShellLayout, { PortalToggle } from '../components/AuthShellLayout';

export default function LoginPage() {
  const { kullanici, yukleniyor, girisYap, googleGiris, appleGiris, kullaniciGuncelle, cikisYap } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [portal, setPortal] = useState(searchParams.get('portal') === 'satici' ? 'satici' : 'musteri');
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const [formYukleniyor, setFormYukleniyor] = useState(false);

  useEffect(() => {
    if (searchParams.get('portal') === 'satici') setPortal('satici');
  }, [searchParams]);

  useEffect(() => {
    if (yukleniyor || !kullanici) return;
    if (!epostaDogrulandiMi(kullanici)) {
      const p = kullanici.rol === 'satici' ? 'satici' : 'musteri';
      navigate(epostaDogrulamaYolu(kullanici.email, p), { replace: true });
      return;
    }
    if (kullanici.rol === 'satici' || kullanici.rol === 'admin') {
      navigate('/satici/panel?tab=ilan', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [yukleniyor, kullanici, navigate]);

  const dogrulamaYonlendir = (eposta) => {
    sessionStorage.setItem('authPortal', portal);
    navigate(`/eposta-dogrula?email=${encodeURIComponent(eposta)}&portal=${portal}`, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHata('');
    setFormYukleniyor(true);
    sessionStorage.setItem('authPortal', portal);
    try {
      if (portal === 'satici') {
        await saticiGirisSonrasi(girisYap, email, sifre, kullaniciGuncelle, cikisYap);
        navigate('/satici/panel?tab=ilan', { replace: true });
      } else {
        const u = await girisYap(email, sifre);
        if (u.rol === 'satici') {
          cikisYap();
          setHata('Bu hesap satıcı hesabıdır. Üstten Satıcı sekmesini seçin.');
          return;
        }
        navigate('/', { replace: true });
      }
    } catch (err) {
      if (err.response?.data?.kod === 'EPOSTA_DOGRULANMADI') {
        dogrulamaYonlendir(err.response.data.email || email);
        return;
      }
      setHata(apiHataMesaji(err, 'Giriş başarısız.'));
    } finally {
      setFormYukleniyor(false);
    }
  };

  const googleIle = async () => {
    const eposta = prompt('Google e-posta adresiniz:', '');
    if (!eposta) return;
    sessionStorage.setItem('authPortal', portal);
    setHata('');
    try {
      const u = await googleGiris(eposta, 'Google', 'Kullanıcı');
      if (portal === 'satici') {
        if (u.rol !== 'satici' && u.rol !== 'admin') {
          cikisYap();
          setHata('Satıcı hesabı bulunamadı. Önce satıcı kaydı oluşturun.');
          return;
        }
        navigate('/satici/panel?tab=ilan', { replace: true });
      } else {
        if (u.rol === 'satici') { cikisYap(); setHata('Satıcı hesabı — Satıcı sekmesini kullanın.'); return; }
        navigate('/', { replace: true });
      }
    } catch (err) {
      if (err.response?.data?.kod === 'EPOSTA_DOGRULANMADI') {
        dogrulamaYonlendir(err.response.data.email || eposta);
        return;
      }
      setHata(apiHataMesaji(err, 'Google girişi başarısız.'));
    }
  };

  const appleIle = async () => {
    const eposta = prompt('Apple girişi için e-posta adresiniz:', '');
    if (!eposta) return;
    sessionStorage.setItem('authPortal', portal);
    setHata('');
    try {
      const u = await appleGiris(eposta);
      if (portal === 'satici') {
        if (u.rol !== 'satici' && u.rol !== 'admin') {
          cikisYap();
          setHata('Satıcı hesabı bulunamadı. Önce satıcı kaydı oluşturun.');
          return;
        }
        navigate('/satici/panel?tab=ilan', { replace: true });
      } else {
        if (u.rol === 'satici') { cikisYap(); setHata('Satıcı hesabı — Satıcı sekmesini kullanın.'); return; }
        navigate('/', { replace: true });
      }
    } catch (err) {
      if (err.response?.data?.kod === 'EPOSTA_DOGRULANMADI') {
        dogrulamaYonlendir(err.response.data.email || eposta);
        return;
      }
      setHata(apiHataMesaji(err, 'Apple girişi başarısız.'));
    }
  };

  if (yukleniyor) {
    return (
      <AuthShellLayout>
        <main className="auth-shell-main"><div className="loading">Yükleniyor...</div></main>
      </AuthShellLayout>
    );
  }

  const saticiMod = portal === 'satici';

  return (
    <AuthShellLayout>
      <main className="auth-shell-main">
        <div className={`auth-portal ${saticiMod ? 'seller-portal' : 'customer-portal'}`}>
          <div className={`auth-portal-badge ${saticiMod ? '' : 'customer'}`}>
            {saticiMod ? 'Satıcı Girişi' : 'Müşteri Girişi'}
          </div>
          <PortalToggle portal={portal} setPortal={setPortal} />
          <form className={`auth-form ${saticiMod ? 'seller-auth-form' : ''}`} onSubmit={handleSubmit}>
            <h1>{saticiMod ? 'Satıcı Paneline Giriş' : 'Alışverişe Giriş Yap'}</h1>
            <p className="auth-sub">
              {saticiMod
                ? 'Giriş sonrası ilan ve sipariş paneline gidersiniz'
                : 'Favorilerinize, siparişlerinize ve sepetinize erişin'}
            </p>
            {hata && <div className="auth-error">{hata}</div>}
            <label>E-posta<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label>Şifre<input type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} required minLength={6} /></label>
            <button type="submit" className={`auth-submit ${saticiMod ? 'seller-submit' : ''}`} disabled={formYukleniyor}>
              {formYukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
            <div className="social-login">
              <button type="button" className="social-btn google" onClick={googleIle}>Google ile Giriş</button>
              <button type="button" className="social-btn apple" onClick={appleIle}>Apple ile Giriş</button>
            </div>
            <p className="auth-alt auth-portal-note">
              E-posta ve sosyal girişlerde doğrulama kodu gönderilir.
            </p>
            <p className="auth-alt">
              Hesabınız yok mu?{' '}
              <Link to={`/kayit?portal=${portal}`}>Kayıt olun</Link>
            </p>
          </form>
        </div>
      </main>
    </AuthShellLayout>
  );
}
