import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrders } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatPrice, DURUM_ETIKET } from '../utils/format';
import Layout from '../components/Layout';

export default function OrdersPage({ arama, setArama, kategori, setKategori, konum, setKonum }) {
  const { kullanici } = useAuth();
  const navigate = useNavigate();
  const [siparisler, setSiparisler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!kullanici) {
      navigate('/giris');
      return;
    }
    fetchOrders()
      .then(setSiparisler)
      .catch(() => setSiparisler([]))
      .finally(() => setYukleniyor(false));
  }, [kullanici, navigate]);

  if (!kullanici) return null;

  return (
    <Layout arama={arama} setArama={setArama} kategori={kategori} setKategori={setKategori} konum={konum} setKonum={setKonum}>
      <main className="main">
        <h1 className="page-title">📦 Siparişlerim</h1>
        {yukleniyor ? (
          <div className="loading">Yükleniyor...</div>
        ) : siparisler.length === 0 ? (
          <div className="empty-products"><span>📭</span>Henüz siparişiniz yok.</div>
        ) : (
          <div className="orders-list">
            {siparisler.map((s) => (
              <article key={s._id} className="order-card">
                <div className="order-header">
                  <span>Sipariş #{s._id.slice(-6).toUpperCase()}</span>
                  <span className={`order-status status-${s.durum}`}>{DURUM_ETIKET[s.durum]}</span>
                </div>
                <div className="order-items">
                  {s.urunler.map((u, i) => (
                    <div key={i} className="order-item">
                      <span>{u.resim} {u.ad}</span>
                      <span>{u.adet} × {formatPrice(u.fiyat)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <span>{new Date(s.createdAt).toLocaleDateString('tr-TR')}</span>
                  <strong>{formatPrice(s.toplam)}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}
