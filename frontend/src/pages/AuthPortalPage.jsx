import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerSeller, prepareSeller } from '../api/client';
import { kayitFormDogrula, apiHataMesaji } from '../utils/apiError';
import { saticiPanelHazirla } from '../utils/sellerAuth';
import { epostaDogrulandiMi, epostaDogrulamaYolu } from '../utils/authVerify';
import AuthShellLayout, { PortalToggle } from '../components/AuthShellLayout';
import { AuthModeToggle } from '../components/AuthModeToggle';

const BOS_FORM = { ad: '', soyad: '', email: '', sifre: '', telefon: '', adres: '', konum: '' };

export default function AuthPortalPage() {
  const { pathname } = useLocation();
  /** API seçimi yalnızca URL yoluna göre — /giris = login, /kayit = register */
  const kayitModu = pathname === '/kayit';

  const { kullanici, yukleniyor, girisYap, kayitOl, googleGiris, appleGiris, kullaniciGuncelle, cikisYap } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [portal, setPortal] = useState(searchParams.get('portal') === 'satici' ? 'satici' : 'musteri');
  const [form, setForm] = useState(BOS_FORM);
  const [hata, setHata] = useState('');
  const [hatalar, setHatalar] = useState([]);
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

  const portalDegistir = (next) => {
    setPortal(next);
    setHata('');
    setHatalar([]);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const girisGonder = async () => {
    sessionStorage.setItem('authPortal', portal);
    const u = await girisYap(form.email, form.sifre);

    if (!epostaDogrulandiMi(u)) {
      dogrulamaYonlendir(u.email || form.email);
      return;
    }

    if (portal === 'satici') {
      await saticiPanelHazirla(u, kullaniciGuncelle, cikisYap);
      navigate('/satici/panel?tab=ilan', { replace: true });
    } else {
      if (u.rol === 'satici') {
        cikisYap();
        setHata('Bu hesap satıcı hesabıdır. Üstten Satıcı sekmesini seçin.');
        return;
      }
      navigate('/', { replace: true });
    }
  };

  const kayitGonder = async () => {
    const yerelHatalar = kayitFormDogrula(form);
    if (yerelHatalar.length) {
      setHatalar(yerelHatalar);
      return;
    }
    sessionStorage.setItem('authPortal', portal);
    let sonuc;
    if (portal === 'satici') {
      sessionStorage.setItem('pendingSellerSetup', '1');
      sonuc = await registerSeller(form);
      if (sonuc?.token) {
        localStorage.setItem('demo-token', sonuc.token);
        if (sonuc.kullanici) kullaniciGuncelle(sonuc.kullanici);
      }
    } else {
      sessionStorage.removeItem('pendingSellerSetup');
      sonuc = await kayitOl(form);
    }
    if (sonuc?.mailGonderildi === false) {
      sessionStorage.setItem('mailGonderilemedi', '1');
    } else {
      sessionStorage.removeItem('mailGonderilemedi');
    }
    navigate(`/eposta-dogrula?email=${encodeURIComponent(form.email)}&portal=${portal}`, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHata('');
    setHatalar([]);
    setFormYukleniyor(true);
    try {
      if (kayitModu) {
        await kayitGonder();
      } else {
        await girisGonder();
      }
    } catch (err) {
      sessionStorage.removeItem('pendingSellerSetup');
      if (err.response?.data?.kod === 'EPOSTA_DOGRULANMADI') {
        dogrulamaYonlendir(err.response.data.email || form.email);
        return;
      }
      if (kayitModu && err.response?.status === 409) {
        setHatalar(['Bu e-posta zaten kayıtlı. Giriş Yap sekmesini kullanın — doğrulama kodu gelmediyse girişten sonra «Kodu yeniden gönder» deneyin.']);
        return;
      }
      if (kayitModu && err.response?.status === 503) {
        setHatalar([apiHataMesaji(err, 'Doğrulama e-postası gönderilemedi. Kayıt tamamlanamadı.')]);
        return;
      }
      const mesaj = apiHataMesaji(err, kayitModu ? 'Kayıt başarısız.' : 'Giriş başarısız.');
      if (kayitModu) setHatalar([mesaj]);
      else setHata(mesaj);
    } finally {
      setFormYukleniyor(false);
    }
  };

  const sosyalGiris = async (tip) => {
    const eposta = prompt(`${tip} e-posta adresiniz:`, '');
    if (!eposta) return;
    sessionStorage.setItem('authPortal', portal);
    setHata('');
    setHatalar([]);
    try {
      const u = tip === 'Google'
        ? await googleGiris(eposta, 'Google', 'Kullanıcı')
        : await appleGiris(eposta);
      if (!epostaDogrulandiMi(u)) {
        dogrulamaYonlendir(u.email || eposta);
        return;
      }
      if (portal === 'satici') {
        if (u.rol !== 'satici' && u.rol !== 'admin') {
          if (!u.saticiKayit) {
            cikisYap();
            setHata('Satıcı hesabı bulunamadı. Önce satıcı kaydı oluşturun.');
            return;
          }
          const sonuc = await prepareSeller();
          if (sonuc?.kullanici) kullaniciGuncelle(sonuc.kullanici);
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
      setHata(apiHataMesaji(err, `${tip} girişi başarısız.`));
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
  const hataMesajlari = kayitModu ? hatalar : (hata ? [hata] : []);

  return (
    <AuthShellLayout>
      <main className="auth-shell-main">
        <div className={`auth-portal ${saticiMod ? 'seller-portal' : 'customer-portal'} ${kayitModu ? 'auth-vivid' : ''}`}>
          <div className={`auth-portal-badge ${saticiMod ? '' : 'customer'}`}>
            {saticiMod ? (kayitModu ? 'Satıcı Kaydı' : 'Satıcı Girişi') : (kayitModu ? 'Müşteri Kaydı' : 'Müşteri Girişi')}
          </div>
          <AuthModeToggle portal={portal} />
          <PortalToggle portal={portal} setPortal={portalDegistir} />
          <form
            className={`auth-form ${kayitModu ? 'wide' : ''} ${saticiMod ? 'seller-auth-form' : ''} ${kayitModu && !saticiMod ? 'auth-form-vivid' : ''}`}
            onSubmit={handleSubmit}
            noValidate
          >
            <h1>
              {kayitModu
                ? (saticiMod ? 'Satıcı Hesabı Oluştur' : 'Hesap Oluşturun')
                : (saticiMod ? 'Satıcı Paneline Giriş' : 'Alışverişe Giriş Yap')}
            </h1>
            <p className="auth-sub">
              {kayitModu
                ? (saticiMod ? 'Kayıt sonrası e-posta doğrulaması ile ilan paneline geçersiniz' : 'Isparta\'da alışverişe başlayın')
                : (saticiMod ? 'Giriş sonrası ilan ve sipariş paneline gidersiniz' : 'Favorilerinize, siparişlerinize ve sepetinize erişin')}
            </p>
            {hataMesajlari.length > 0 && (
              <div className="auth-error">
                {hataMesajlari.length === 1 ? hataMesajlari[0] : (
                  <ul className="auth-error-list">{hataMesajlari.map((m, i) => <li key={i}>{m}</li>)}</ul>
                )}
              </div>
            )}
            {kayitModu && (
              <div className="form-row">
                <label>Ad<input name="ad" value={form.ad} onChange={handleChange} required /></label>
                <label>Soyad<input name="soyad" value={form.soyad} onChange={handleChange} required /></label>
              </div>
            )}
            <label>E-posta<input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" /></label>
            <label>Şifre<input type="password" name="sifre" value={form.sifre} onChange={handleChange} required minLength={6} autoComplete={kayitModu ? 'new-password' : 'current-password'} /></label>
            {kayitModu && (
              <>
                <label>Telefon<input name="telefon" value={form.telefon} onChange={handleChange} placeholder="05xx xxx xx xx" /></label>
                {!saticiMod && (
                  <>
                    <label>Adres<textarea name="adres" value={form.adres} onChange={handleChange} rows={2} /></label>
                    <label>Mahalle<input name="konum" value={form.konum} onChange={handleChange} placeholder="Çünür, Merkez..." /></label>
                  </>
                )}
              </>
            )}
            <button type="submit" className={`auth-submit ${saticiMod ? 'seller-submit' : ''}`} disabled={formYukleniyor}>
              {formYukleniyor
                ? (kayitModu ? 'Kayıt oluşturuluyor...' : 'Giriş yapılıyor...')
                : (kayitModu ? 'Kayıt Ol' : 'Giriş Yap')}
            </button>
            {!kayitModu && (
              <div className="social-login">
                <button type="button" className="social-btn google" onClick={() => sosyalGiris('Google')}>Google ile Giriş</button>
                <button type="button" className="social-btn apple" onClick={() => sosyalGiris('Apple')}>Apple ile Giriş</button>
              </div>
            )}
            <p className="auth-alt auth-portal-note">
              {kayitModu
                ? 'Kayıt sonrası doğrulama kodu yalnızca e-postanıza gönderilir.'
                : 'E-posta ve sosyal girişlerde doğrulama kodu gönderilir.'}
            </p>
          </form>
        </div>
      </main>
    </AuthShellLayout>
  );
}
