import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerSeller } from '../api/client';
import { kayitFormDogrula, apiHataMesaji } from '../utils/apiError';
import AuthShellLayout, { PortalToggle } from '../components/AuthShellLayout';

export default function RegisterPage() {
  const { kayitOl } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [portal, setPortal] = useState(searchParams.get('portal') === 'satici' ? 'satici' : 'musteri');
  const [form, setForm] = useState({ ad: '', soyad: '', email: '', sifre: '', telefon: '', adres: '', konum: '' });
  const [hatalar, setHatalar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    if (searchParams.get('portal') === 'satici') setPortal('satici');
  }, [searchParams]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const yerelHatalar = kayitFormDogrula(form);
    if (yerelHatalar.length) {
      setHatalar(yerelHatalar);
      return;
    }
    setHatalar([]);
    setYukleniyor(true);
    sessionStorage.setItem('authPortal', portal);
    try {
      if (portal === 'satici') {
        sessionStorage.setItem('pendingSellerSetup', '1');
        await registerSeller(form);
      } else {
        sessionStorage.removeItem('pendingSellerSetup');
        await kayitOl(form);
      }
      navigate(`/eposta-dogrula?email=${encodeURIComponent(form.email)}&portal=${portal}`, { replace: true });
    } catch (err) {
      sessionStorage.removeItem('pendingSellerSetup');
      if (err.response?.status === 503) {
        setHatalar([apiHataMesaji(err, 'Doğrulama e-postası gönderilemedi. Kayıt tamamlanamadı.')]);
        return;
      }
      const apiHatalar = err.response?.data?.hatalar;
      if (Array.isArray(apiHatalar) && apiHatalar.length) {
        setHatalar(apiHatalar);
      } else {
        setHatalar([apiHataMesaji(err, 'Kayıt başarısız.')]);
      }
    } finally {
      setYukleniyor(false);
    }
  };

  const saticiMod = portal === 'satici';

  return (
    <AuthShellLayout>
      <main className="auth-shell-main">
        <div className={`auth-portal ${saticiMod ? 'seller-portal' : 'customer-portal auth-vivid'}`}>
          <div className={`auth-portal-badge ${saticiMod ? '' : 'customer'}`}>
            {saticiMod ? 'Satıcı Kaydı' : 'Müşteri Kaydı'}
          </div>
          <PortalToggle portal={portal} setPortal={setPortal} />
          <form className={`auth-form wide ${saticiMod ? 'seller-auth-form' : 'auth-form-vivid'}`} onSubmit={handleSubmit} noValidate>
            <h1>{saticiMod ? 'Satıcı Hesabı Oluştur' : 'Hesap Oluşturun'}</h1>
            <p className="auth-sub">
              {saticiMod
                ? 'Kayıt sonrası e-posta doğrulaması ile ilan paneline geçersiniz'
                : 'Isparta\'da alışverişe başlayın'}
            </p>
            {hatalar.length > 0 && (
              <div className="auth-error">
                {hatalar.length === 1 ? hatalar[0] : (
                  <ul className="auth-error-list">{hatalar.map((h, i) => <li key={i}>{h}</li>)}</ul>
                )}
              </div>
            )}
            <div className="form-row">
              <label>Ad<input name="ad" value={form.ad} onChange={handleChange} required /></label>
              <label>Soyad<input name="soyad" value={form.soyad} onChange={handleChange} required /></label>
            </div>
            <label>E-posta<input type="email" name="email" value={form.email} onChange={handleChange} required /></label>
            <label>Şifre<input type="password" name="sifre" value={form.sifre} onChange={handleChange} required minLength={6} /></label>
            <label>Telefon<input name="telefon" value={form.telefon} onChange={handleChange} placeholder="05xx xxx xx xx" /></label>
            {!saticiMod && (
              <>
                <label>Adres<textarea name="adres" value={form.adres} onChange={handleChange} rows={2} /></label>
                <label>Mahalle<input name="konum" value={form.konum} onChange={handleChange} placeholder="Çünür, Merkez..." /></label>
              </>
            )}
            <button type="submit" className={`auth-submit ${saticiMod ? 'seller-submit' : ''}`} disabled={yukleniyor}>
              {yukleniyor ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
            </button>
            <p className="auth-alt auth-portal-note">
              Kayıt sonrası doğrulama kodu yalnızca e-postanıza gönderilir. Kod olmadan panele giriş yapılamaz.
            </p>
            <p className="auth-alt">Zaten hesabınız var mı? <Link to={`/giris?portal=${portal}`}>Giriş yapın</Link></p>
          </form>
        </div>
      </main>
    </AuthShellLayout>
  );
}
