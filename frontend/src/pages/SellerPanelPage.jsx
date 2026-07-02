import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchVendorProducts, createVendorProduct, updateVendorProduct, deleteVendorProduct,
  fetchVendorOrders, updateVendorOrderStatus, fetchMyVendor
} from '../api/client';
import { formatPrice, DURUM_ETIKET } from '../utils/format';
import { asArray } from '../utils/safe';
import SellerLayout from '../components/SellerLayout';
import ProductImage from '../components/ProductImage';
import EmptyState from '../components/EmptyState';

export default function SellerPanelPage() {
  const { kullanici } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('urunler');
  const [urunler, setUrunler] = useState([]);
  const [siparisler, setSiparisler] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [yeniUrun, setYeniUrun] = useState({
    ad: '', fiyat: '', stok: 10, kategori: 'lavanta', konum: 'Çarşı / Merkez',
    marka: '', aciklama: '', resim: ''
  });

  useEffect(() => {
    if (!kullanici) {
      navigate('/satici/giris');
      return;
    }
    if (!['satici', 'admin'].includes(kullanici.rol)) {
      navigate('/satici/basvuru');
      return;
    }
    fetchMyVendor().then(setVendor).catch(() => {});
    fetchVendorProducts().then((d) => setUrunler(asArray(d))).catch(() => setUrunler([]));
    fetchVendorOrders().then((d) => setSiparisler(asArray(d))).catch(() => setSiparisler([]));
  }, [kullanici, navigate]);

  if (!kullanici) return null;

  return (
    <SellerLayout>
      <main className="seller-main">
        <div className="seller-panel-header">
          <h1 className="page-title">Satıcı Paneli {vendor?.magazaAdi && `— ${vendor.magazaAdi}`}</h1>
          <p className="seller-panel-sub">Ürünlerinizi ekleyin, stok güncelleyin ve siparişleri yönetin</p>
        </div>
        <div className="profile-tabs seller-tabs">
          <button type="button" className={tab === 'urunler' ? 'active' : ''} onClick={() => setTab('urunler')}>Envanter</button>
          <button type="button" className={tab === 'siparisler' ? 'active' : ''} onClick={() => setTab('siparisler')}>Siparişler</button>
        </div>

        {tab === 'urunler' && (
          <>
            <form className="auth-form wide seller-product-form" onSubmit={async (e) => {
              e.preventDefault();
              try {
                const u = await createVendorProduct({
                  ...yeniUrun,
                  fiyat: Number(yeniUrun.fiyat),
                  stok: Number(yeniUrun.stok)
                });
                setUrunler([u, ...urunler]);
                setYeniUrun({ ad: '', fiyat: '', stok: 10, kategori: 'lavanta', konum: 'Çarşı / Merkez', marka: '', aciklama: '', resim: '' });
              } catch {
                alert('Ürün eklenemedi. Lütfen tekrar deneyin.');
              }
            }}>
              <h3>Yeni Ürün Satışa Koy</h3>
              <p className="auth-sub">Ürün bilgilerini doldurup mağazanıza ekleyin</p>
              <div className="form-row">
                <label>Ürün Adı<input value={yeniUrun.ad} onChange={(e) => setYeniUrun({ ...yeniUrun, ad: e.target.value })} required /></label>
                <label>Fiyat (TL)<input type="number" value={yeniUrun.fiyat} onChange={(e) => setYeniUrun({ ...yeniUrun, fiyat: e.target.value })} required /></label>
              </div>
              <div className="form-row">
                <label>Stok<input type="number" value={yeniUrun.stok} onChange={(e) => setYeniUrun({ ...yeniUrun, stok: e.target.value })} /></label>
                <label>Marka<input value={yeniUrun.marka} onChange={(e) => setYeniUrun({ ...yeniUrun, marka: e.target.value })} /></label>
              </div>
              <label>Açıklama<textarea value={yeniUrun.aciklama} onChange={(e) => setYeniUrun({ ...yeniUrun, aciklama: e.target.value })} rows={2} /></label>
              <button type="submit" className="auth-submit seller-submit">Satışa Koy</button>
            </form>
            <div className="product-grid seller-grid">
              {Array.isArray(urunler) && urunler.length === 0 ? (
                <EmptyState title="Henüz ürün eklemediniz" description="Yukarıdaki formu kullanarak ilk ürününüzü ekleyin." />
              ) : (
                urunler.map((u) => (
                  <article key={u._id} className="product-card seller-card">
                    <ProductImage urun={u} />
                    <div className="product-body">
                      <h3 className="product-title">{u.ad}</h3>
                      <p>{formatPrice(u.fiyat)} · Stok: {u.stok}</p>
                      <div className="card-actions">
                        <button type="button" className="fav-btn small" onClick={async () => {
                          const stok = prompt('Yeni stok:', u.stok);
                          if (stok == null) return;
                          await updateVendorProduct(u._id, { stok: Number(stok) });
                          setUrunler(await fetchVendorProducts());
                        }}>Stok</button>
                        <button type="button" className="fav-btn small danger" onClick={async () => {
                          if (!confirm('Bu ürünü silmek istiyor musunuz?')) return;
                          await deleteVendorProduct(u._id);
                          setUrunler(urunler.filter((x) => x._id !== u._id));
                        }}>Sil</button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </>
        )}

        {tab === 'siparisler' && (
          <div className="orders-list">
            {Array.isArray(siparisler) && siparisler.length === 0 ? (
              <EmptyState title="Henüz sipariş yok" description="Müşteri siparişleri burada listelenir." />
            ) : (
              siparisler.map((s) => (
                <article key={s._id} className="order-card seller-order">
                  <div className="order-header">
                    <span>#{s._id.slice(-6).toUpperCase()}</span>
                    <span className={`order-status status-${s.durum}`}>{DURUM_ETIKET[s.durum]}</span>
                  </div>
                  {Array.isArray(s.urunler) && s.urunler.map((u, i) => (
                    <div key={i} className="order-item"><span>{u.ad}</span><span>{u.adet} adet</span></div>
                  ))}
                  <select value={s.durum} onChange={async (e) => {
                    await updateVendorOrderStatus(s._id, e.target.value);
                    setSiparisler(await fetchVendorOrders());
                  }}>
                    {['beklemede', 'hazirlaniyor', 'kargoda', 'teslim'].map((d) => (
                      <option key={d} value={d}>{DURUM_ETIKET[d]}</option>
                    ))}
                  </select>
                </article>
              ))
            )}
          </div>
        )}
      </main>
    </SellerLayout>
  );
}
