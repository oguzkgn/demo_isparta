import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function RegisterPage({ arama, setArama, kategori, setKategori, konum, setKonum }) {
  const { kayitOl } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ad: '', soyad: '', email: '', sifre: '', telefon: '', adres: '', konum: '' });
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);
    try {
      await kayitOl(form);
      navigate('/');
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Kayıt başarısız.');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <Layout arama={arama} setArama={setArama} kategori={kategori} setKategori={setKategori} konum={konum} setKonum={setKonum}>
      <main className="main auth-page">
        <form className="auth-form wide" onSubmit={handleSubmit}>
          <h1>Kayıt Ol</h1>
          <p className="auth-sub">Yeni hesap oluşturun</p>
          {hata && <div className="auth-error">{hata}</div>}
          <div className="form-row">
            <label>Ad<input name="ad" value={form.ad} onChange={handleChange} required /></label>
            <label>Soyad<input name="soyad" value={form.soyad} onChange={handleChange} required /></label>
          </div>
          <label>E-posta<input type="email" name="email" value={form.email} onChange={handleChange} required /></label>
          <label>Şifre<input type="password" name="sifre" value={form.sifre} onChange={handleChange} required minLength={6} /></label>
          <label>Telefon<input name="telefon" value={form.telefon} onChange={handleChange} placeholder="05xx xxx xx xx" /></label>
          <label>Adres<textarea name="adres" value={form.adres} onChange={handleChange} rows={2} /></label>
          <label>Mahalle<input name="konum" value={form.konum} onChange={handleChange} placeholder="Çünür, İyaş..." /></label>
          <button type="submit" className="auth-submit" disabled={yukleniyor}>
            {yukleniyor ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
          </button>
          <p className="auth-alt">Zaten hesabınız var mı? <Link to="/giris">Giriş yapın</Link></p>
        </form>
      </main>
    </Layout>
  );
}
