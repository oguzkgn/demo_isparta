import { Link } from 'react-router-dom';
import { formatPrice, DURUM_ETIKET } from '../utils/format';
import { productImageSrc } from '../constants/images';
import EmptyState from '../components/EmptyState';
import Layout from '../components/Layout';

export default function OrdersPage({ arama, setArama, kategori, setKategori, konum, setKonum, siparisler, yukleniyor }) {
  return (
    <Layout arama={arama} setArama={setArama} kategori={kategori} setKategori={setKategori} konum={konum} setKonum={setKonum}>
      <main className="main">
        <h1 className="page-title">Siparişlerim</h1>
        {yukleniyor ? (
          <div className="loading">Yükleniyor...</div>
        ) : !Array.isArray(siparisler) || siparisler.length === 0 ? (
          <EmptyState title="Henüz siparişiniz yok" description="Alışveriş yaptığınızda siparişleriniz burada görünür." />
        ) : (
          <div className="orders-list">
            {siparisler.map((s) => (
              <Link key={s._id} to={`/siparisler/${s._id}`} className="order-card link">
                <div className="order-header">
                  <span>Sipariş #{s._id.slice(-6).toUpperCase()}</span>
                  <span className={`order-status status-${s.durum}`}>{DURUM_ETIKET[s.durum] || s.durum}</span>
                </div>
                <div className="order-items">
                  {Array.isArray(s.urunler) && s.urunler.slice(0, 2).map((u, i) => (
                    <div key={i} className="order-item">
                      <span className="order-item-label">
                        <img src={productImageSrc(u)} alt="" className="order-item-thumb" />
                        {u.ad}
                      </span>
                      <span>{u.adet} adet</span>
                    </div>
                  ))}
                  {Array.isArray(s.urunler) && s.urunler.length > 2 && <small>+{s.urunler.length - 2} ürün daha</small>}
                </div>
                <div className="order-footer">
                  <span>{new Date(s.createdAt).toLocaleDateString('tr-TR')}</span>
                  <strong>{formatPrice(s.toplam)}</strong>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}
