import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/client';
import Layout from '../components/Layout';

export default function ProfilePage({ arama, setArama, kategori, setKategori, konum, setKonum }) {
  const { kullanici, cikisYap, hesabiSil, oturumuYukle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ad: '', soyad: '', telefon: '', adres: '', konum: '' });
  const [mesaj, setMesaj] = useState('');
  const [hata, setHata] = useState('');
  const [silOnay, setSilOnay] = useState(false);

  useEffect(() => {
    if (!kullanici) {
      navigate('/giris');
      return;
    }
    setForm({
      ad: kullanici.ad || '',
      soyad: kullanici.soyad || '',
      telefon: kullanici.telefon || '',
      adres: kullanici.adres || '',
      konum: kullanici.konum || ''
    });
  }, [kullanici, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setMesaj('');
    setHata('');
    try {
      await updateProfile(form);
      await oturumuYukle();
      setMesaj('Profil güncellendi.');
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Güncelleme başarısız.');
    }
  };

  const handleDelete = async () => {
    if (!silOnay) {
      setSilOnay(true);
      return;
    }
    try {
      await hesabiSil();
      navigate('/');
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Hesap silinemedi.');
      setSilOnay(false);
    }
  };

  if (!kullanici) return null;

  return (
    <Layout arama={arama} setArama={setArama} kategori={kategori} setKategori={setKategori} konum={konum} setKonum={setKonum}>
      <main className="main auth-page">
        <form className="auth-form wide" onSubmit={handleSave}>
          <h1>👤 Hesabım</h1>
          <p className="auth-sub">{kullanici.email}</p>
          {mesaj && <div className="auth-success">{mesaj}</div>}
          {hata && <div className="auth-error">{hata}</div>}
          <div className="form-row">
            <label>Ad<input name="ad" value={form.ad} onChange={handleChange} required /></label>
            <label>Soyad<input name="soyad" value={form.soyad} onChange={handleChange} required /></label>
          </div>
          <label>Telefon<input name="telefon" value={form.telefon} onChange={handleChange} /></label>
          <label>Adres<textarea name="adres" value={form.adres} onChange={handleChange} rows={2} /></label>
          <label>Mahalle<input name="konum" value={form.konum} onChange={handleChange} /></label>
          <button type="submit" className="auth-submit">Kaydet</button>
        </form>

        <div className="profile-actions">
          <button type="button" className="logout-btn" onClick={() => { cikisYap(); navigate('/'); }}>Çıkış Yap</button>
          <button type="button" className={`delete-btn ${silOnay ? 'confirm' : ''}`} onClick={handleDelete}>
            {silOnay ? 'Emin misiniz? Tekrar tıklayın' : 'Hesabımı Sil'}
          </button>
        </div>
      </main>
    </Layout>
  );
}
