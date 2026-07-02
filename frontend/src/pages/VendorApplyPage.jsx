import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applyVendor } from '../api/client';
import SellerLayout from '../components/SellerLayout';

export default function VendorApplyPage() {
  const { kullanici } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ magazaAdi: '', vergiNo: '', telefon: '', adres: '', aciklama: '' });
  const [mesaj, setMesaj] = useState('');
  const [hata, setHata] = useState('');

  useEffect(() => {
    if (!kullanici) navigate('/satici/giris');
  }, [kullanici, navigate]);

  if (!kullanici) return null;

  return (
    <SellerLayout>
      <main className="seller-main auth-page">
        <form className="auth-form wide seller-auth-form" onSubmit={async (e) => {
          e.preventDefault();
          try {
            await applyVendor(form);
            setMesaj('Başvurunuz alındı. Admin onayı bekleniyor.');
            setHata('');
          } catch (err) {
            setHata(err.response?.data?.mesaj || 'Başvuru gönderilemedi.');
          }
        }}>
          <h1 className="page-title">Satıcı Başvurusu</h1>
          <p className="auth-sub">Onay sonrası ürünlerinizi satışa koyabilirsiniz</p>
          {mesaj && <div className="auth-success">{mesaj}</div>}
          {hata && <div className="auth-error">{hata}</div>}
          <label>Mağaza Adı<input value={form.magazaAdi} onChange={(e) => setForm({ ...form, magazaAdi: e.target.value })} required /></label>
          <label>Vergi No<input value={form.vergiNo} onChange={(e) => setForm({ ...form, vergiNo: e.target.value })} required /></label>
          <label>Telefon<input value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} /></label>
          <label>Adres<textarea value={form.adres} onChange={(e) => setForm({ ...form, adres: e.target.value })} rows={2} /></label>
          <label>Açıklama<textarea value={form.aciklama} onChange={(e) => setForm({ ...form, aciklama: e.target.value })} rows={3} /></label>
          <button type="submit" className="auth-submit seller-submit">Başvuru Gönder</button>
          {['satici', 'admin'].includes(kullanici.rol) && (
            <p className="auth-alt"><Link to="/satici/panel">Satıcı paneline git →</Link></p>
          )}
        </form>
      </main>
    </SellerLayout>
  );
}
