import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiHataMesaji } from '../utils/apiError';
import { musteriYonlendir } from '../utils/authRedirect';
import Layout from '../components/Layout';

export default function LoginPage({ arama, setArama, kategori, setKategori, konum, setKonum }) {
  const { girisYap, googleGiris, appleGiris, cikisYap } = useAuth();
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
      const u = await girisYap(email, sifre);
      if (u.rol === 'satici') {
        cikisYap();
        setHata('Bu hesap satıcı hesabıdır. Satıcı girişi ayrı bir adresten yapılır.');
        return;
      }
      musteriYonlendir(navigate);
    } catch (err) {
      setHata(apiHataMesaji(err, 'Giriş başarısız.'));
    } finally {
      setYukleniyor(false);
    }
  };

  const googleIle = async () => {
    const eposta = prompt('Google e-posta (demo):', 'kullanici@gmail.com');
    if (!eposta) return;
    try {
      await googleGiris(eposta, 'Google', 'Kullanıcı');
      musteriYonlendir(navigate);
    } catch { setHata('Google girişi başarısız.'); }
  };

  const appleIle = async () => {
    try {
      await appleGiris();
      musteriYonlendir(navigate);
    } catch { setHata('Apple girişi başarısız.'); }
  };

  return (
    <Layout arama={arama} setArama={setArama} kategori={kategori} setKategori={setKategori} konum={konum} setKonum={setKonum}>
      <main className="main auth-page">
        <div className="auth-portal customer-portal">
          <div className="auth-portal-badge customer">Müşteri Girişi</div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <h1>Alışverişe Giriş Yap</h1>
            <p className="auth-sub">Favorilerinize, siparişlerinize ve sepetinize erişin</p>
            {hata && <div className="auth-error">{hata}</div>}
            <label>E-posta<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label>Şifre<input type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} required minLength={6} /></label>
            <button type="submit" className="auth-submit" disabled={yukleniyor}>Giriş Yap</button>
            <div className="social-login">
              <button type="button" className="social-btn google" onClick={googleIle}>Google ile Giriş</button>
              <button type="button" className="social-btn apple" onClick={appleIle}>Apple ile Giriş</button>
            </div>
            <p className="auth-alt">Hesabınız yok mu? <Link to="/kayit">Kayıt olun</Link></p>
          </form>
        </div>
      </main>
    </Layout>
  );
}
