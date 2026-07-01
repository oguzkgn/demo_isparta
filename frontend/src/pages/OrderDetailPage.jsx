import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchOrder, cancelOrder, createReturn } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatPrice, DURUM_ETIKET } from '../utils/format';
import Layout from '../components/Layout';

export default function OrderDetailPage({ arama, setArama, kategori, setKategori, konum, setKonum }) {
  const { id } = useParams();
  const { kullanici } = useAuth();
  const navigate = useNavigate();
  const [siparis, setSiparis] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!kullanici) { navigate('/giris'); return; }
    fetchOrder(id)
      .then(setSiparis)
      .catch(() => setSiparis(null))
      .finally(() => setYukleniyor(false));
  }, [id, kullanici, navigate]);

  const iptalEt = async () => {
    if (!confirm('Siparişi iptal etmek istediğinize emin misiniz?')) return;
    try {
      const g = await cancelOrder(id);
      setSiparis(g);
    } catch (err) {
      alert(err.response?.data?.mesaj || 'İptal edilemedi');
    }
  };

  if (!kullanici) return null;

  return (
    <Layout arama={arama} setArama={setArama} kategori={kategori} setKategori={setKategori} konum={konum} setKonum={setKonum}>
      <main className="main">
        {yukleniyor ? (
          <div className="loading">Yükleniyor...</div>
        ) : !siparis ? (
          <div className="empty-products"><span>😕</span>Sipariş bulunamadı. <Link to="/siparisler">Siparişlerime dön</Link></div>
        ) : (
          <div className="order-detail">
            <nav className="breadcrumb"><Link to="/siparisler">Siparişlerim</Link> / #{siparis._id.slice(-6).toUpperCase()}</nav>
            <div className="order-detail-header">
              <h1>Sipariş #{siparis._id.slice(-6).toUpperCase()}</h1>
              <span className={`order-status status-${siparis.durum}`}>{DURUM_ETIKET[siparis.durum]}</span>
            </div>
            {siparis.takipNo && siparis.durum !== 'iptal' && (
              <p className="tracking">📦 Kargo Takip: <strong>{siparis.takipNo}</strong></p>
            )}
            <div className="order-timeline">
              {['beklemede', 'hazirlaniyor', 'kargoda', 'teslim'].map((d) => (
                <div key={d} className={`timeline-step ${siparis.durum === d || ['teslim', 'kargoda', 'hazirlaniyor'].indexOf(siparis.durum) >= ['beklemede', 'hazirlaniyor', 'kargoda', 'teslim'].indexOf(d) ? 'done' : ''} ${siparis.durum === 'iptal' ? 'cancelled' : ''}`}>
                  {DURUM_ETIKET[d]}
                </div>
              ))}
            </div>
            <div className="order-items-detail">
              {siparis.urunler.map((u, i) => (
                <div key={i} className="order-item">
                  <span>{u.resim} {u.ad}</span>
                  <span>{u.adet} × {formatPrice(u.fiyat)}</span>
                </div>
              ))}
            </div>
            <div className="checkout-summary inline">
              {siparis.araToplam != null && <div className="summary-row"><span>Ara Toplam</span><span>{formatPrice(siparis.araToplam)}</span></div>}
              {siparis.indirim > 0 && <div className="summary-row discount"><span>İndirim ({siparis.kuponKodu})</span><span>-{formatPrice(siparis.indirim)}</span></div>}
              <div className="summary-row"><span>Kargo</span><span>{siparis.kargo === 0 ? 'Ücretsiz' : formatPrice(siparis.kargo)}</span></div>
              <div className="summary-row total"><span>Toplam</span><strong>{formatPrice(siparis.toplam)}</strong></div>
            </div>
            <p>📍 {siparis.adres} — {siparis.konum}</p>
            <p>💳 {{ kredi_karti: 'Kredi Kartı', kapida_odeme: 'Kapıda Ödeme', havale: 'Havale' }[siparis.odemeYontemi]}</p>
            <p><small>{new Date(siparis.createdAt).toLocaleString('tr-TR')}</small></p>
            {!['kargoda', 'teslim', 'iptal'].includes(siparis.durum) && (
              <button type="button" className="delete-btn" onClick={iptalEt}>Siparişi İptal Et</button>
            )}
            {siparis.durum === 'teslim' && (
              <button type="button" className="fav-btn" style={{ marginTop: '1rem' }} onClick={async () => {
                const neden = prompt('İade nedeni:');
                if (!neden) return;
                try {
                  const iade = await createReturn({ siparisId: siparis._id, neden });
                  alert(`İade talebi oluşturuldu. Kod: ${iade.iadeKodu}`);
                } catch (err) { alert(err.response?.data?.mesaj || 'İade oluşturulamadı'); }
              }}>İade Talebi Oluştur</button>
            )}
          </div>
        )}
      </main>
    </Layout>
  );
}
