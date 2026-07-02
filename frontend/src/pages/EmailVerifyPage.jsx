import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resendVerification, prepareSeller } from '../api/client';
import AuthShellLayout, { PortalToggle } from '../components/AuthShellLayout';

export default function EmailVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { epostaDogrula, kullaniciGuncelle } = useAuth();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [kod, setKod] = useState('');
  const [portal, setPortal] = useState(sessionStorage.getItem('authPortal') || searchParams.get('portal') || 'musteri');
  const [mesaj, setMesaj] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    const ep = searchParams.get('email');
    if (ep) setEmail(ep);
  }, [searchParams]);

  const dogrula = async (e) => {
    e.preventDefault();
    setHata('');
    setMesaj('');
    setYukleniyor(true);
    try {
      const sonuc = await epostaDogrula(email, kod);
      if (sonuc?.kullanici) kullaniciGuncelle(sonuc.kullanici);
      const hedefPortal = sessionStorage.getItem('authPortal') || portal;
      const saticiKayit = sessionStorage.getItem('pendingSellerSetup') === '1';

      if (saticiKayit || hedefPortal === 'satici') {
        sessionStorage.removeItem('pendingSellerSetup');
        const hazir = await prepareSeller();
        if (hazir?.kullanici) kullaniciGuncelle(hazir.kullanici);
        navigate('/satici/panel?tab=ilan', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
      sessionStorage.removeItem('authPortal');
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Doğrulama başarısız.');
    } finally {
      setYukleniyor(false);
    }
  };

  const yenidenGonder = async () => {
    setHata('');
    try {
      const r = await resendVerification(email);
      setMesaj(r.mesaj || 'Kod yeniden gönderildi.');
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Kod gönderilemedi.');
    }
  };

  return (
    <AuthShellLayout>
      <main className="auth-shell-main">
        <div className={`auth-portal ${portal === 'satici' ? 'seller-portal' : 'customer-portal'}`}>
          <PortalToggle portal={portal} setPortal={setPortal} />
          <form className={`auth-form ${portal === 'satici' ? 'seller-auth-form' : ''}`} onSubmit={dogrula}>
            <h1>E-posta Doğrulama</h1>
            <p className="auth-sub">
              {email ? `${email} adresine gönderilen 6 haneli kodu girin.` : 'E-postanıza gelen kodu girin.'}
              {' '}Kod yalnızca e-posta kutunuzda görünür.
            </p>
            {mesaj && <div className="auth-success">{mesaj}</div>}
            {hata && <div className="auth-error">{hata}</div>}
            <label>E-posta<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label>Doğrulama Kodu<input value={kod} onChange={(e) => setKod(e.target.value)} required placeholder="6 haneli kod" maxLength={6} inputMode="numeric" /></label>
            <button type="submit" className={`auth-submit ${portal === 'satici' ? 'seller-submit' : ''}`} disabled={yukleniyor}>
              {yukleniyor ? 'Doğrulanıyor...' : 'Doğrula ve Devam Et'}
            </button>
            <button type="button" className="fav-btn" style={{ marginTop: '0.75rem' }} onClick={yenidenGonder}>Kodu Yeniden Gönder</button>
            <p className="auth-alt"><Link to={`/giris?portal=${portal}`}>← Giriş sayfasına dön</Link></p>
          </form>
        </div>
      </main>
    </AuthShellLayout>
  );
}
