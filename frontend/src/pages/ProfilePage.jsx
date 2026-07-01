import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  updateProfile, changePassword, deleteAccount,
  fetchAddresses, addAddress, deleteAddress
} from '../api/client';
import Layout from '../components/Layout';

export default function ProfilePage({ arama, setArama, kategori, setKategori, konum, setKonum }) {
  const { kullanici, cikisYap, hesabiSil, oturumuYukle } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profil');
  const [form, setForm] = useState({ ad: '', soyad: '', telefon: '', adres: '', konum: '' });
  const [sifreForm, setSifreForm] = useState({ eskiSifre: '', yeniSifre: '' });
  const [adresler, setAdresler] = useState([]);
  const [yeniAdres, setYeniAdres] = useState({ baslik: 'Ev', tamAd: '', telefon: '', adres: '', konum: '', varsayilan: false });
  const [mesaj, setMesaj] = useState('');
  const [hata, setHata] = useState('');
  const [silOnay, setSilOnay] = useState(false);

  useEffect(() => {
    if (!kullanici) { navigate('/giris'); return; }
    setForm({
      ad: kullanici.ad || '', soyad: kullanici.soyad || '',
      telefon: kullanici.telefon || '', adres: kullanici.adres || '', konum: kullanici.konum || ''
    });
    fetchAddresses().then(setAdresler).catch(() => {});
  }, [kullanici, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMesaj(''); setHata('');
    try {
      await updateProfile(form);
      await oturumuYukle();
      setMesaj('Profil güncellendi.');
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Güncelleme başarısız.');
    }
  };

  const sifreDegistir = async (e) => {
    e.preventDefault();
    setMesaj(''); setHata('');
    try {
      await changePassword(sifreForm);
      setMesaj('Şifre güncellendi.');
      setSifreForm({ eskiSifre: '', yeniSifre: '' });
    } catch (err) {
      setHata(err.response?.data?.mesaj || 'Şifre güncellenemedi.');
    }
  };

  const adresEkle = async (e) => {
    e.preventDefault();
    try {
      const list = await addAddress(yeniAdres);
      setAdresler(list);
      setYeniAdres({ baslik: 'Ev', tamAd: '', telefon: '', adres: '', konum: '', varsayilan: false });
      setMesaj('Adres eklendi.');
    } catch {
      setHata('Adres eklenemedi.');
    }
  };

  const adresSil = async (id) => {
    const list = await deleteAddress(id);
    setAdresler(list);
  };

  const handleDelete = async () => {
    if (!silOnay) { setSilOnay(true); return; }
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
        <h1 className="page-title">👤 Hesabım</h1>
        <div className="profile-tabs">
          {['profil', 'sifre', 'adresler', 'tehlike'].map((t) => (
            <button key={t} type="button" className={tab === t ? 'active' : ''} onClick={() => { setTab(t); setMesaj(''); setHata(''); }}>
              {{ profil: 'Profil', sifre: 'Şifre', adresler: 'Adresler', tehlike: 'Hesap' }[t]}
            </button>
          ))}
        </div>

        {mesaj && <div className="auth-success">{mesaj}</div>}
        {hata && <div className="auth-error">{hata}</div>}

        {tab === 'profil' && (
          <form className="auth-form wide" onSubmit={handleSave}>
            <p className="auth-sub">{kullanici.email}</p>
            <div className="form-row">
              <label>Ad<input value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} required /></label>
              <label>Soyad<input value={form.soyad} onChange={(e) => setForm({ ...form, soyad: e.target.value })} required /></label>
            </div>
            <label>Telefon<input value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} /></label>
            <label>Adres<textarea value={form.adres} onChange={(e) => setForm({ ...form, adres: e.target.value })} rows={2} /></label>
            <label>Mahalle<input value={form.konum} onChange={(e) => setForm({ ...form, konum: e.target.value })} /></label>
            <button type="submit" className="auth-submit">Kaydet</button>
          </form>
        )}

        {tab === 'sifre' && (
          <form className="auth-form" onSubmit={sifreDegistir}>
            <label>Mevcut Şifre<input type="password" value={sifreForm.eskiSifre} onChange={(e) => setSifreForm({ ...sifreForm, eskiSifre: e.target.value })} required /></label>
            <label>Yeni Şifre<input type="password" value={sifreForm.yeniSifre} onChange={(e) => setSifreForm({ ...sifreForm, yeniSifre: e.target.value })} required minLength={6} /></label>
            <button type="submit" className="auth-submit">Şifreyi Güncelle</button>
          </form>
        )}

        {tab === 'adresler' && (
          <div className="auth-form wide">
            {adresler.map((a) => (
              <div key={a._id} className="address-card">
                <strong>{a.baslik}</strong> {a.varsayilan && <span className="badge">Varsayılan</span>}
                <p>{a.adres} — {a.konum}</p>
                <button type="button" className="fav-btn small" onClick={() => adresSil(a._id)}>Sil</button>
              </div>
            ))}
            <form onSubmit={adresEkle}>
              <h3>Yeni Adres</h3>
              <label>Başlık<input value={yeniAdres.baslik} onChange={(e) => setYeniAdres({ ...yeniAdres, baslik: e.target.value })} /></label>
              <label>Adres<textarea value={yeniAdres.adres} onChange={(e) => setYeniAdres({ ...yeniAdres, adres: e.target.value })} required rows={2} /></label>
              <label>Mahalle<input value={yeniAdres.konum} onChange={(e) => setYeniAdres({ ...yeniAdres, konum: e.target.value })} /></label>
              <label className="checkbox-label"><input type="checkbox" checked={yeniAdres.varsayilan} onChange={(e) => setYeniAdres({ ...yeniAdres, varsayilan: e.target.checked })} /> Varsayılan adres</label>
              <button type="submit" className="auth-submit">Adres Ekle</button>
            </form>
          </div>
        )}

        {tab === 'tehlike' && (
          <div className="profile-actions">
            <button type="button" className="logout-btn" onClick={() => { cikisYap(); navigate('/'); }}>Çıkış Yap</button>
            <button type="button" className={`delete-btn ${silOnay ? 'confirm' : ''}`} onClick={handleDelete}>
              {silOnay ? 'Emin misiniz? Tekrar tıklayın' : 'Hesabımı Sil'}
            </button>
          </div>
        )}

        <div className="profile-links">
          <Link to="/siparisler">📦 Siparişlerim</Link>
          <Link to="/favoriler">❤️ Favorilerim</Link>
        </div>
      </main>
    </Layout>
  );
}
