import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  updateProfile, changePassword, deleteAccount, updateEmail, updatePhone, deletePhone,
  fetchAddresses, addAddress, deleteAddress
} from '../api/client';
import Layout from '../components/Layout';

export default function ProfilePage({ arama, setArama, kategori, setKategori, konum, setKonum }) {
  const { kullanici, cikisYap, hesabiSil, oturumuYukle } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profil');
  const [form, setForm] = useState({ ad: '', soyad: '', telefon: '', adres: '', konum: '' });
  const [emailForm, setEmailForm] = useState({ email: '', sifre: '' });
  const [telefon, setTelefon] = useState('');
  const [sifreForm, setSifreForm] = useState({ eskiSifre: '', yeniSifre: '' });
  const [adresler, setAdresler] = useState([]);
  const [yeniAdres, setYeniAdres] = useState({ baslik: 'Ev', tip: 'teslimat', tamAd: '', telefon: '', adres: '', konum: '', varsayilan: false });
  const [mesaj, setMesaj] = useState('');
  const [hata, setHata] = useState('');
  const [silOnay, setSilOnay] = useState(false);

  useEffect(() => {
    if (!kullanici) { navigate('/giris'); return; }
    setForm({ ad: kullanici.ad || '', soyad: kullanici.soyad || '', telefon: kullanici.telefon || '', adres: kullanici.adres || '', konum: kullanici.konum || '' });
    setEmailForm({ email: kullanici.email || '', sifre: '' });
    setTelefon(kullanici.telefon || '');
    fetchAddresses().then(setAdresler).catch(() => {});
  }, [kullanici, navigate]);

  if (!kullanici) return null;

  const tabs = ['profil', 'email', 'telefon', 'sifre', 'adresler', 'tehlike'];
  const tabLabels = { profil: 'Profil', email: 'E-posta', telefon: 'Telefon', sifre: 'Şifre', adresler: 'Adresler', tehlike: 'Hesap' };

  return (
    <Layout arama={arama} setArama={setArama} kategori={kategori} setKategori={setKategori} konum={konum} setKonum={setKonum}>
      <main className="main auth-page">
        <h1 className="page-title">👤 Hesabım</h1>
        <div className="profile-tabs">
          {tabs.map((t) => (
            <button key={t} type="button" className={tab === t ? 'active' : ''} onClick={() => { setTab(t); setMesaj(''); setHata(''); }}>
              {tabLabels[t]}
            </button>
          ))}
        </div>
        {mesaj && <div className="auth-success">{mesaj}</div>}
        {hata && <div className="auth-error">{hata}</div>}

        {tab === 'profil' && (
          <form className="auth-form wide" onSubmit={async (e) => {
            e.preventDefault();
            try { await updateProfile(form); await oturumuYukle(); setMesaj('Profil güncellendi.'); }
            catch (err) { setHata(err.response?.data?.mesaj || 'Hata'); }
          }}>
            <div className="form-row">
              <label>Ad<input value={form.ad} onChange={(e) => setForm({ ...form, ad: e.target.value })} required /></label>
              <label>Soyad<input value={form.soyad} onChange={(e) => setForm({ ...form, soyad: e.target.value })} required /></label>
            </div>
            <label>Adres<textarea value={form.adres} onChange={(e) => setForm({ ...form, adres: e.target.value })} rows={2} /></label>
            <button type="submit" className="auth-submit">Kaydet</button>
          </form>
        )}

        {tab === 'email' && (
          <form className="auth-form" onSubmit={async (e) => {
            e.preventDefault();
            try { await updateEmail(emailForm); await oturumuYukle(); setMesaj('E-posta güncellendi.'); }
            catch (err) { setHata(err.response?.data?.mesaj || 'Hata'); }
          }}>
            <label>Yeni E-posta<input type="email" value={emailForm.email} onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })} required /></label>
            <label>Şifre (doğrulama)<input type="password" value={emailForm.sifre} onChange={(e) => setEmailForm({ ...emailForm, sifre: e.target.value })} required /></label>
            <button type="submit" className="auth-submit">E-postayı Güncelle</button>
          </form>
        )}

        {tab === 'telefon' && (
          <div className="auth-form">
            <label>Telefon<input value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="05xx xxx xx xx" /></label>
            <button type="button" className="auth-submit" onClick={async () => {
              try { await updatePhone(telefon); await oturumuYukle(); setMesaj('Telefon güncellendi.'); }
              catch { setHata('Güncellenemedi.'); }
            }}>Kaydet</button>
            {kullanici.telefon && (
              <button type="button" className="delete-btn" style={{ marginTop: '1rem' }} onClick={async () => {
                await deletePhone(); await oturumuYukle(); setTelefon(''); setMesaj('Telefon silindi.');
              }}>Telefonu Sil</button>
            )}
          </div>
        )}

        {tab === 'sifre' && (
          <form className="auth-form" onSubmit={async (e) => {
            e.preventDefault();
            try { await changePassword(sifreForm); setMesaj('Şifre güncellendi.'); setSifreForm({ eskiSifre: '', yeniSifre: '' }); }
            catch (err) { setHata(err.response?.data?.mesaj || 'Hata'); }
          }}>
            <label>Mevcut Şifre<input type="password" value={sifreForm.eskiSifre} onChange={(e) => setSifreForm({ ...sifreForm, eskiSifre: e.target.value })} required /></label>
            <label>Yeni Şifre<input type="password" value={sifreForm.yeniSifre} onChange={(e) => setSifreForm({ ...sifreForm, yeniSifre: e.target.value })} required minLength={6} /></label>
            <button type="submit" className="auth-submit">Şifreyi Güncelle</button>
          </form>
        )}

        {tab === 'adresler' && (
          <div className="auth-form wide">
            {adresler.map((a) => (
              <div key={a._id} className="address-card">
                <strong>{a.baslik}</strong> <span className="badge">{a.tip}</span> {a.varsayilan && <span className="badge">Varsayılan</span>}
                <p>{a.adres} — {a.konum}</p>
                <button type="button" className="fav-btn small" onClick={async () => setAdresler(await deleteAddress(a._id))}>Sil</button>
              </div>
            ))}
            <form onSubmit={async (e) => {
              e.preventDefault();
              setAdresler(await addAddress(yeniAdres));
              setMesaj('Adres eklendi.');
            }}>
              <h3>Yeni Adres</h3>
              <label>Başlık<input value={yeniAdres.baslik} onChange={(e) => setYeniAdres({ ...yeniAdres, baslik: e.target.value })} /></label>
              <label>Tip
                <select value={yeniAdres.tip} onChange={(e) => setYeniAdres({ ...yeniAdres, tip: e.target.value })}>
                  <option value="teslimat">Teslimat</option>
                  <option value="fatura">Fatura</option>
                </select>
              </label>
              <label>Adres<textarea value={yeniAdres.adres} onChange={(e) => setYeniAdres({ ...yeniAdres, adres: e.target.value })} required rows={2} /></label>
              <label>Mahalle<input value={yeniAdres.konum} onChange={(e) => setYeniAdres({ ...yeniAdres, konum: e.target.value })} /></label>
              <label className="checkbox-label"><input type="checkbox" checked={yeniAdres.varsayilan} onChange={(e) => setYeniAdres({ ...yeniAdres, varsayilan: e.target.checked })} /> Varsayılan</label>
              <button type="submit" className="auth-submit">Adres Ekle</button>
            </form>
          </div>
        )}

        {tab === 'tehlike' && (
          <div className="profile-actions">
            <button type="button" className="logout-btn" onClick={() => { cikisYap(); navigate('/'); }}>Çıkış Yap</button>
            <button type="button" className={`delete-btn ${silOnay ? 'confirm' : ''}`} onClick={async () => {
              if (!silOnay) { setSilOnay(true); return; }
              try { await hesabiSil(); navigate('/'); } catch { setSilOnay(false); }
            }}>{silOnay ? 'Emin misiniz? Tekrar tıklayın' : 'Hesabımı Sil'}</button>
          </div>
        )}

        <div className="profile-links">
          <Link to="/favoriler">❤️ Favorilerim</Link>
          <Link to="/siparisler">📦 Siparişlerim</Link>
          <Link to="/satici/basvuru">🏪 Satıcı Ol</Link>
          {(kullanici.rol === 'satici' || kullanici.rol === 'admin') && <Link to="/satici/panel">📊 Satıcı Paneli</Link>}
          {kullanici.rol === 'admin' && <Link to="/admin/yorumlar">✅ Yorum Onay</Link>}
        </div>
      </main>
    </Layout>
  );
}
