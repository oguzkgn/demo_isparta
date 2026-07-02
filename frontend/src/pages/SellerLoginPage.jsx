import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saticiGirisSonrasi } from '../utils/sellerAuth';
import SellerLayout from '../components/SellerLayout';

export default function SellerLoginPage() {
  const { girisYap, kullaniciGuncelle } = useAuth();
  const navigate = useNavigate();
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
    <SellerLayout>
      <main className="seller-main auth-page">
        <div className="auth-portal seller-portal">
          <div className="auth-portal-badge">Satıcı Girişi</div>
          <form className="auth-form seller-auth-form" onSubmit={handleSubmit}>
            <h1>Mağazanıza Giriş Yapın</h1>
            <p className="auth-sub">Giriş sonrası doğrudan ilan verme paneline gidersiniz</p>
            {hata && <div className="auth-error">{hata}</div>}
            <label>E-posta<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label>Şifre<input type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} required minLength={6} /></label>
            <button type="submit" className="auth-submit seller-submit" disabled={yukleniyor}>
              {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap — İlan Paneline Git'}
            </button>
            <p className="auth-alt">
              Henüz hesabınız yok mu? <Link to="/satici/basvuru">Kayıt olun</Link>
            </p>
            <p className="auth-alt">
              Alışveriş yapmak mı istiyorsunuz? <Link to="/giris">Müşteri girişi</Link>
            </p>
          </form>
        </div>
      </main>
    </SellerLayout>
  );
}
