import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function LoginPage({ arama, setArama, kategori, setKategori, konum, setKonum }) {
  const { girisYap } = useAuth();
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
      await girisYap(email, sifre);
      navigate('/');
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Giriş başarısız.');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <Layout arama={arama} setArama={setArama} kategori={kategori} setKategori={setKategori} konum={konum} setKonum={setKonum}>
      <main className="main auth-page">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Giriş Yap</h1>
          <p className="auth-sub">Hesabınıza giriş yapın</p>
          {hata && <div className="auth-error">{hata}</div>}
          <label>E-posta<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Şifre<input type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} required minLength={6} /></label>
          <button type="submit" className="auth-submit" disabled={yukleniyor}>
            {yukleniyor ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
          <p className="auth-alt">Hesabınız yok mu? <Link to="/kayit">Kayıt olun</Link></p>
        </form>
      </main>
    </Layout>
  );
}
