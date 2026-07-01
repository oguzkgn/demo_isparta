import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applyVendor } from '../api/client';
import Layout from '../components/Layout';

export default function VendorApplyPage(props) {
  const { kullanici } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ magazaAdi: '', vergiNo: '', telefon: '', adres: '', aciklama: '' });
  const [mesaj, setMesaj] = useState('');
  const [hata, setHata] = useState('');

  if (!kullanici) { navigate('/giris'); return null; }

  return (
    <Layout {...props}>
      <main className="main auth-page">
        <form className="auth-form wide" onSubmit={async (e) => {
          e.preventDefault();
          try {
            await applyVendor(form);
            setMesaj('Başvurunuz alındı. Admin onayı bekleniyor.');
          } catch (err) { setHata(err.response?.data?.mesaj || 'Başvuru gönderilemedi.'); }
        }}>
          <h1>🏪 Satıcı Başvurusu</h1>
          <p className="auth-sub">Vergi levhası ve mağaza bilgilerinizi girin</p>
          {mesaj && <div className="auth-success">{mesaj}</div>}
          {hata && <div className="auth-error">{hata}</div>}
          <label>Mağaza Adı<input value={form.magazaAdi} onChange={(e) => setForm({ ...form, magazaAdi: e.target.value })} required /></label>
          <label>Vergi No<input value={form.vergiNo} onChange={(e) => setForm({ ...form, vergiNo: e.target.value })} required /></label>
          <label>Telefon<input value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} /></label>
          <label>Adres<textarea value={form.adres} onChange={(e) => setForm({ ...form, adres: e.target.value })} rows={2} /></label>
          <label>Açıklama<textarea value={form.aciklama} onChange={(e) => setForm({ ...form, aciklama: e.target.value })} rows={3} /></label>
          <button type="submit" className="auth-submit">Başvuru Gönder</button>
        </form>
      </main>
    </Layout>
  );
}
