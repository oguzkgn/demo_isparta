import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saticiGirisSonrasi } from '../utils/sellerAuth';
import SellerLayout from '../components/SellerLayout';

export default function SellerLoginPage() {
  const { kullanici, yukleniyor, girisYap, kullaniciGuncelle, cikisYap } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const [formYukleniyor, setFormYukleniyor] = useState(false);

  useEffect(() => {
    if (!yukleniyor && kullanici?.rol === 'satici') {
      navigate('/satici/panel?tab=ilan', { replace: true });
    }
  }, [yukleniyor, kullanici, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHata('');
    setFormYukleniyor(true);
    try {
      await saticiGirisSonrasi(girisYap, email, sifre, kullaniciGuncelle, cikisYap);
      navigate('/satici/panel?tab=ilan', { replace: true });
    } catch (err) {
      setHata(err.response?.data?.mesaj || err.message || 'Giriş başarısız.');
    } finally {
      setFormYukleniyor(false);
    }
  };

  if (yukleniyor || kullanici?.rol === 'satici') {
    return (
      <SellerLayout>
        <main className="seller-main auth-page"><div className="loading">Yönlendiriliyor...</div></main>
      </SellerLayout>
    );
  }

  if (kullanici?.rol === 'kullanici') {
    return (
      <SellerLayout>
        <main className="seller-main auth-page">
          <div className="auth-form seller-auth-form">
            <h1>Müşteri hesabı açık</h1>
            <p className="auth-sub">Satıcı girişi için önce müşteri oturumunu kapatın, ardından satıcı hesabınızla giriş yapın.</p>
            <button type="button" className="auth-submit seller-submit" onClick={() => { cikisYap(); setHata(''); }}>Çıkış Yap</button>
          </div>
        </main>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <main className="seller-main auth-page">
        <div className="auth-portal seller-portal">
          <div className="auth-portal-badge">Satıcı Girişi</div>
          <form className="auth-form seller-auth-form" onSubmit={handleSubmit}>
            <h1>Mağazanıza Giriş Yapın</h1>
            <p className="auth-sub">Giriş sonrası satıcı panelinde kalırsınız — ilan verme ve sipariş yönetimi burada yapılır</p>
            {hata && <div className="auth-error">{hata}</div>}
            <label>E-posta<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label>Şifre<input type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} required minLength={6} /></label>
            <button type="submit" className="auth-submit seller-submit" disabled={formYukleniyor}>
              {formYukleniyor ? 'Giriş yapılıyor...' : 'Satıcı Paneline Giriş Yap'}
            </button>
            <p className="auth-alt">Henüz hesabınız yok mu? <Link to="/satici/basvuru">Satıcı kaydı oluşturun</Link></p>
          </form>
        </div>
      </main>
    </SellerLayout>
  );
}
