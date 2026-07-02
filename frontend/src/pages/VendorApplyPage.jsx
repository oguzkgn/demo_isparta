import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applyVendor } from '../api/client';
import { kayitFormDogrula, apiHataMesaji } from '../utils/apiError';
import SellerLayout from '../components/SellerLayout';

function SellerAuthTabs({ mod, setMod }) {
  return (
    <div className="seller-auth-tabs">
      <button type="button" className={mod === 'kayit' ? 'active' : ''} onClick={() => setMod('kayit')}>Kayıt Ol</button>
      <button type="button" className={mod === 'giris' ? 'active' : ''} onClick={() => setMod('giris')}>Giriş Yap</button>
    </div>
  );
}

function SellerKayitForm() {
  const { kayitOl } = useAuth();
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
      await kayitOl(form);
    } catch (err) {
      const apiHatalar = err.response?.data?.hatalar;
      setHatalar(Array.isArray(apiHatalar) && apiHatalar.length ? apiHatalar : [apiHataMesaji(err, 'Kayıt başarısız.')]);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <form className="auth-form wide seller-auth-form" onSubmit={handleSubmit} noValidate>
      <h1>Satıcı Hesabı Oluşturun</h1>
      <p className="auth-sub">Önce üye olun, ardından mağaza başvurunuzu tamamlayın</p>
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
        {yukleniyor ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol ve Devam Et'}
      </button>
    </form>
  );
}

function SellerGirisForm() {
  const { girisYap } = useAuth();
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);
    try {
      await girisYap(email, sifre);
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Giriş başarısız.');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <form className="auth-form wide seller-auth-form" onSubmit={handleSubmit}>
      <h1>Satıcı Girişi</h1>
      <p className="auth-sub">Hesabınız varsa giriş yapın ve başvuruya devam edin</p>
      {hata && <div className="auth-error">{hata}</div>}
      <label>E-posta<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Şifre<input type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} required minLength={6} /></label>
      <button type="submit" className="auth-submit seller-submit" disabled={yukleniyor}>
        {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap ve Devam Et'}
      </button>
    </form>
  );
}

export default function VendorApplyPage() {
  const { kullanici, yukleniyor, profilYenile, kullaniciGuncelle } = useAuth();
  const navigate = useNavigate();
  const [authMod, setAuthMod] = useState('kayit');
  const [form, setForm] = useState({ magazaAdi: '', vergiNo: '', telefon: '', adres: '', aciklama: '' });
  const [mesaj, setMesaj] = useState('');
  const [hata, setHata] = useState('');
  const [gonderiliyor, setGonderiliyor] = useState(false);

  const basvuruGonder = async (e) => {
    e.preventDefault();
    setGonderiliyor(true);
    setHata('');
    try {
      const sonuc = await applyVendor(form);
      if (sonuc?.kullanici) kullaniciGuncelle(sonuc.kullanici);
      else await profilYenile();
      setMesaj(sonuc?.durum === 'onayli'
        ? 'Mağazanız onaylandı! Satıcı paneline yönlendiriliyorsunuz...'
        : 'Başvurunuz alındı. Admin onayı bekleniyor.');
      setTimeout(() => navigate('/satici/panel'), 1200);
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Başvuru gönderilemedi.');
    } finally {
      setGonderiliyor(false);
    }
  };

  if (yukleniyor) {
    return (
      <SellerLayout>
        <main className="seller-main auth-page"><div className="loading">Yükleniyor...</div></main>
      </SellerLayout>
    );
  }

  if (!kullanici) {
    return (
      <SellerLayout>
        <main className="seller-main auth-page">
          <div className="auth-portal seller-portal">
            <div className="auth-portal-badge">Satıcı Başvurusu</div>
            <SellerAuthTabs mod={authMod} setMod={setAuthMod} />
            {authMod === 'giris' ? (
              <SellerGirisForm />
            ) : (
              <SellerKayitForm />
            )}
            <p className="auth-alt">
              Alışveriş yapmak mı istiyorsunuz? <Link to="/">Ana sayfaya dön</Link>
            </p>
          </div>
        </main>
      </SellerLayout>
    );
  }

  if (['satici', 'admin'].includes(kullanici.rol)) {
    return (
      <SellerLayout>
        <main className="seller-main auth-page">
          <div className="auth-form wide seller-auth-form">
            <h1 className="page-title">Zaten satıcısınız</h1>
            <p className="auth-sub">Mağazanızı satıcı panelinden yönetebilirsiniz.</p>
            <Link to="/satici/panel" className="auth-submit seller-submit link-btn">Satıcı Paneline Git</Link>
          </div>
        </main>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <main className="seller-main auth-page">
        <form className="auth-form wide seller-auth-form" onSubmit={basvuruGonder}>
          <h1 className="page-title">Satıcı Başvurusu</h1>
          <p className="auth-sub">Merhaba {kullanici.ad}, mağaza bilgilerinizi doldurun</p>
          {mesaj && <div className="auth-success">{mesaj}</div>}
          {hata && <div className="auth-error">{hata}</div>}
          <label>Mağaza Adı<input value={form.magazaAdi} onChange={(e) => setForm({ ...form, magazaAdi: e.target.value })} required /></label>
          <label>Vergi No<input value={form.vergiNo} onChange={(e) => setForm({ ...form, vergiNo: e.target.value })} required /></label>
          <label>Telefon<input value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} placeholder={kullanici.telefon || '05xx xxx xx xx'} /></label>
          <label>Adres<textarea value={form.adres} onChange={(e) => setForm({ ...form, adres: e.target.value })} rows={2} /></label>
          <label>Açıklama<textarea value={form.aciklama} onChange={(e) => setForm({ ...form, aciklama: e.target.value })} rows={3} placeholder="Mağazanızı kısaca tanıtın" /></label>
          <button type="submit" className="auth-submit seller-submit" disabled={gonderiliyor}>
            {gonderiliyor ? 'Gönderiliyor...' : 'Başvuru Gönder'}
          </button>
          <p className="auth-alt"><Link to="/satici/giris">Farklı hesapla giriş yap</Link></p>
        </form>
      </main>
    </SellerLayout>
  );
}
