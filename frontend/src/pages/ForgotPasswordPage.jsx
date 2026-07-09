import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { forgotPassword, resetPassword } from '../api/client';
import { apiHataMesaji } from '../utils/apiError';
import AuthShellLayout from '../components/AuthShellLayout';

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { kullaniciGuncelle } = useAuth();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [kod, setKod] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState('');
  const [adim, setAdim] = useState(searchParams.get('kodGonderildi') === '1' ? 2 : 1);
  const [mesaj, setMesaj] = useState(
    searchParams.get('kodGonderildi') === '1'
      ? 'Şifre hatalı giriş nedeniyle doğrulama kodu e-postanıza gönderildi. Kodu girin ve yeni şifre belirleyin.'
      : ''
  );
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const portal = searchParams.get('portal') || sessionStorage.getItem('authPortal') || 'musteri';

  useEffect(() => {
    const ep = searchParams.get('email');
    if (ep) setEmail(ep);
    if (searchParams.get('kodGonderildi') === '1') setAdim(2);
  }, [searchParams]);

  const kodGonder = async (e) => {
    e.preventDefault();
    setHata('');
    setMesaj('');
    setYukleniyor(true);
    try {
      const r = await forgotPassword(email);
      setMesaj(r.mesaj || 'Doğrulama kodu gönderildi.');
      setAdim(2);
    } catch (err) {
      setHata(apiHataMesaji(err, 'Kod gönderilemedi.'));
    } finally {
      setYukleniyor(false);
    }
  };

  const sifreSifirla = async (e) => {
    e.preventDefault();
    setHata('');
    setMesaj('');
    if (yeniSifre.length < 6) {
      setHata('Yeni şifre en az 6 karakter olmalı.');
      return;
    }
    if (yeniSifre !== yeniSifreTekrar) {
      setHata('Şifreler eşleşmiyor.');
      return;
    }
    setYukleniyor(true);
    try {
      const r = await resetPassword({ email, kod, yeniSifre });
      if (r?.token) localStorage.setItem('demo-token', r.token);
      if (r?.kullanici) kullaniciGuncelle(r.kullanici);
      setMesaj(r.mesaj || 'Şifreniz güncellendi.');
      if (portal === 'satici' || r?.kullanici?.rol === 'satici') {
        navigate('/satici/panel?tab=ilan', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setHata(apiHataMesaji(err, 'Şifre sıfırlanamadı.'));
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <AuthShellLayout>
      <main className="auth-shell-main">
        <div className={`auth-portal ${portal === 'satici' ? 'seller-portal' : 'customer-portal'}`}>
          {adim === 1 ? (
            <form className={`auth-form ${portal === 'satici' ? 'seller-auth-form' : ''}`} onSubmit={kodGonder}>
              <h1>Şifremi Unuttum</h1>
              <p className="auth-sub">
                Kayıtlı e-posta adresinize doğrulama kodu gönderilir (godswhip540@gmail.com üzerinden).
              </p>
              {mesaj && <div className="auth-success">{mesaj}</div>}
              {hata && <div className="auth-error">{hata}</div>}
              <label>
                E-posta
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </label>
              <button type="submit" className={`auth-submit ${portal === 'satici' ? 'seller-submit' : ''}`} disabled={yukleniyor}>
                {yukleniyor ? 'Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
              </button>
              <p className="auth-alt">
                <Link to={`/giris?portal=${portal}`}>← Giriş sayfasına dön</Link>
              </p>
            </form>
          ) : (
            <form className={`auth-form ${portal === 'satici' ? 'seller-auth-form' : ''}`} onSubmit={sifreSifirla}>
              <h1>Yeni Şifre Belirle</h1>
              <p className="auth-sub">
                {email ? `${email} adresine gönderilen 6 haneli kodu girin ve yeni şifrenizi belirleyin.` : 'E-postanıza gelen kodu girin.'}
              </p>
              {mesaj && <div className="auth-success">{mesaj}</div>}
              {hata && <div className="auth-error">{hata}</div>}
              <label>
                E-posta
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label>
                Doğrulama Kodu
                <input value={kod} onChange={(e) => setKod(e.target.value)} required placeholder="6 haneli kod" maxLength={6} inputMode="numeric" />
              </label>
              <label>
                Yeni Şifre
                <input type="password" value={yeniSifre} onChange={(e) => setYeniSifre(e.target.value)} required minLength={6} autoComplete="new-password" />
              </label>
              <label>
                Yeni Şifre (Tekrar)
                <input type="password" value={yeniSifreTekrar} onChange={(e) => setYeniSifreTekrar(e.target.value)} required minLength={6} autoComplete="new-password" />
              </label>
              <button type="submit" className={`auth-submit ${portal === 'satici' ? 'seller-submit' : ''}`} disabled={yukleniyor}>
                {yukleniyor ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </button>
              <button type="button" className="fav-btn" style={{ marginTop: '0.75rem' }} onClick={kodGonder} disabled={yukleniyor}>
                Kodu Yeniden Gönder
              </button>
              <p className="auth-alt">
                <Link to={`/giris?portal=${portal}`}>← Giriş sayfasına dön</Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </AuthShellLayout>
  );
}
