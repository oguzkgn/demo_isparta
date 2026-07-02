import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerSeller } from '../api/client';
import { kayitFormDogrula, apiHataMesaji } from '../utils/apiError';
import { saticiGirisSonrasi } from '../utils/sellerAuth';
import SellerLayout from '../components/SellerLayout';

function SellerAuthTabs({ mod, setMod }) {
  return (
    <div className="seller-auth-tabs">
      <button type="button" className={mod === 'kayit' ? 'active' : ''} onClick={() => setMod('kayit')}>Kayıt Ol</button>
      <button type="button" className={mod === 'giris' ? 'active' : ''} onClick={() => setMod('giris')}>Giriş Yap</button>
    </div>
  );
}

export default function VendorApplyPage() {
  const { kullanici, yukleniyor, girisYap, kullaniciGuncelle } = useAuth();
  const navigate = useNavigate();
  const [authMod, setAuthMod] = useState('kayit');
  const [basari, setBasari] = useState('');

  if (yukleniyor) {
    return (
      <SellerLayout>
        <main className="seller-main auth-page"><div className="loading">Yükleniyor...</div></main>
      </SellerLayout>
    );
  }

  if (kullanici && ['satici', 'admin'].includes(kullanici.rol)) {
    navigate('/satici/panel', { replace: true });
    return null;
  }

  if (kullanici) {
    navigate('/satici/panel', { replace: true });
    return null;
  }

  return (
    <SellerLayout>
      <main className="seller-main auth-page">
        <div className="auth-portal seller-portal">
          <div className="auth-portal-badge">Satıcı Hesabı</div>
          <SellerAuthTabs mod={authMod} setMod={(m) => { setBasari(''); setAuthMod(m); }} />
          {basari && <div className="auth-success">{basari}</div>}
          {authMod === 'giris' ? (
            <SellerGirisForm
              girisYap={girisYap}
              kullaniciGuncelle={kullaniciGuncelle}
              navigate={navigate}
            />
          ) : (
            <SellerKayitForm onKayitTamam={() => { setBasari('Kayıt tamamlandı! Giriş yapın.'); setAuthMod('giris'); }} />
          )}
          <p className="auth-alt">
            Alışveriş yapmak mı istiyorsunuz? <Link to="/">Ana sayfaya dön</Link>
          </p>
        </div>
      </main>
    </SellerLayout>
  );
}

function SellerKayitForm({ onKayitTamam }) {
  const [form, setForm] = useState({ ad: '', soyad: '', email: '', sifre: '', telefon: '' });
  const [hatalar, setHatalar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const yerel = kayitFormDogrula(form);
    if (yerel.length) {
      setHatalar(yerel);
      return;
    }
    setHatalar([]);
    setYukleniyor(true);
    try {
      await registerSeller(form);
      onKayitTamam?.();
    } catch (err) {
      const apiHatalar = err.response?.data?.hatalar;
      setHatalar(Array.isArray(apiHatalar) && apiHatalar.length ? apiHatalar : [apiHataMesaji(err, 'Kayıt başarısız.')]);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <form className="auth-form wide seller-auth-form" onSubmit={handleSubmit} noValidate>
      <h1>Satıcı Kaydı</h1>
      <p className="auth-sub">Hesabınızı oluşturun, ardından giriş yaparak ilan vermeye başlayın</p>
      {hatalar.length > 0 && (
        <div className="auth-error">
          {hatalar.length === 1 ? hatalar[0] : (
            <ul className="auth-error-list">{hatalar.map((h, i) => <li key={i}>{h}</li>)}</ul>
          )}
        </div>
      )}
      <div className="form-row">
        <label>Ad<input value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} required /></label>
        <label>Soyad<input value={form.soyad} onChange={(e) => setForm({ ...form, soyad: e.target.value })} required /></label>
      </div>
      <label>E-posta<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
      <label>Şifre<input type="password" value={form.sifre} onChange={(e) => setForm({ ...form, sifre: e.target.value })} required minLength={6} /></label>
      <label>Telefon<input value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} placeholder="05xx xxx xx xx" /></label>
      <button type="submit" className="auth-submit seller-submit" disabled={yukleniyor}>
        {yukleniyor ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
      </button>
    </form>
  );
}

function SellerGirisForm({ girisYap, kullaniciGuncelle, navigate }) {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);
    try {
      await saticiGirisSonrasi(girisYap, email, sifre, kullaniciGuncelle);
      navigate('/satici/panel', { replace: true });
    } catch (err) {
      setHata(err.response?.data?.mesaj || err.message || 'Giriş başarısız.');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <form className="auth-form wide seller-auth-form" onSubmit={handleSubmit}>
      <h1>Satıcı Girişi</h1>
      <p className="auth-sub">Giriş yaptıktan sonra ilan verme paneline yönlendirileceksiniz</p>
      {hata && <div className="auth-error">{hata}</div>}
      <label>E-posta<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Şifre<input type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} required minLength={6} /></label>
      <button type="submit" className="auth-submit seller-submit" disabled={yukleniyor}>
        {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap — İlan Paneline Git'}
      </button>
    </form>
  );
}
