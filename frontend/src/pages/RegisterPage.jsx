import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { kayitFormDogrula, apiHataMesaji } from '../utils/apiError';
import Layout from '../components/Layout';

export default function RegisterPage({ arama, setArama, kategori, setKategori, konum, setKonum }) {
  const { kayitOl } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ad: '', soyad: '', email: '', sifre: '', telefon: '', adres: '', konum: '' });
  const [hatalar, setHatalar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);

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
    try {
      await kayitOl(form);
      navigate('/');
    } catch (err) {
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

  return (
    <Layout arama={arama} setArama={setArama} kategori={kategori} setKategori={setKategori} konum={konum} setKonum={setKonum}>
      <main className="main auth-page">
        <form className="auth-form wide" onSubmit={handleSubmit} noValidate>
          <h1>Kayıt Ol</h1>
          <p className="auth-sub">Türkçe karakterli ad/soyad kabul edilir. Telefon isteğe bağlıdır.</p>
          {hatalar.length > 0 && (
            <div className="auth-error">
              {hatalar.length === 1 ? hatalar[0] : (
                <ul className="auth-error-list">
                  {hatalar.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              )}
            </div>
          )}
          <div className="form-row">
            <label>Ad<input name="ad" value={form.ad} onChange={handleChange} required placeholder="Öğuz" /></label>
            <label>Soyad<input name="soyad" value={form.soyad} onChange={handleChange} required placeholder="Kara" /></label>
          </div>
          <label>E-posta<input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="ornek@mail.com" /></label>
          <label>Şifre<input type="password" name="sifre" value={form.sifre} onChange={handleChange} required minLength={6} /></label>
          <label>Telefon (isteğe bağlı)<input name="telefon" value={form.telefon} onChange={handleChange} placeholder="05xx xxx xx xx" /></label>
          <label>Adres<textarea name="adres" value={form.adres} onChange={handleChange} rows={2} /></label>
          <label>Mahalle<input name="konum" value={form.konum} onChange={handleChange} placeholder="Çünür, İyaş..." /></label>
          <button type="submit" className="auth-submit" disabled={yukleniyor}>
            {yukleniyor ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
          </button>
          <p className="auth-alt">Zaten hesabınız var mı? <Link to="/giris">Giriş yapın</Link></p>
          <Link to="/satici/giris" className="seller-entry-link">🏪 Satıcı olarak satış yapmak istiyorum</Link>
        </form>
      </main>
    </Layout>
  );
}
