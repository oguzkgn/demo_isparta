import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchVendorProducts, createVendorProduct, updateVendorProduct, deleteVendorProduct,
  fetchVendorOrders, updateVendorOrderStatus, fetchMyVendor
} from '../api/client';
import { formatPrice, DURUM_ETIKET } from '../utils/format';
import Layout from '../components/Layout';

export default function SellerPanelPage(props) {
  const { kullanici } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('urunler');
  const [urunler, setUrunler] = useState([]);
  const [siparisler, setSiparisler] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [yeniUrun, setYeniUrun] = useState({ ad: '', fiyat: '', stok: 10, kategori: 'lavanta', konum: '⭐ Çarşı / Merkez', marka: '', aciklama: '', resim: '🛍️' });

  useEffect(() => {
    if (!kullanici || !['satici', 'admin'].includes(kullanici.rol)) { navigate('/giris'); return; }
    fetchMyVendor().then(setVendor).catch(() => {});
    fetchVendorProducts().then(setUrunler).catch(() => {});
    fetchVendorOrders().then(setSiparisler).catch(() => {});
  }, [kullanici, navigate]);

  if (!kullanici) return null;

  return (
    <Layout {...props}>
      <main className="main">
        <h1 className="page-title">📊 Satıcı Paneli {vendor?.magazaAdi && `— ${vendor.magazaAdi}`}</h1>
        <div className="profile-tabs">
          <button type="button" className={tab === 'urunler' ? 'active' : ''} onClick={() => setTab('urunler')}>Envanter</button>
          <button type="button" className={tab === 'siparisler' ? 'active' : ''} onClick={() => setTab('siparisler')}>Siparişler</button>
        </div>

        {tab === 'urunler' && (
          <>
            <form className="auth-form wide" onSubmit={async (e) => {
              e.preventDefault();
              const u = await createVendorProduct({ ...yeniUrun, fiyat: Number(yeniUrun.fiyat), stok: Number(yeniUrun.stok) });
              setUrunler([u, ...urunler]);
            }}>
              <h3>Yeni Ürün Ekle</h3>
              <div className="form-row">
                <label>Ad<input value={yeniUrun.ad} onChange={(e) => setYeniUrun({ ...yeniUrun, ad: e.target.value })} required /></label>
                <label>Fiyat<input type="number" value={yeniUrun.fiyat} onChange={(e) => setYeniUrun({ ...yeniUrun, fiyat: e.target.value })} required /></label>
              </div>
              <div className="form-row">
                <label>Stok<input type="number" value={yeniUrun.stok} onChange={(e) => setYeniUrun({ ...yeniUrun, stok: e.target.value })} /></label>
                <label>Marka<input value={yeniUrun.marka} onChange={(e) => setYeniUrun({ ...yeniUrun, marka: e.target.value })} /></label>
              </div>
              <button type="submit" className="auth-submit">Ürün Ekle</button>
            </form>
            <div className="product-grid" style={{ marginTop: '1.5rem' }}>
              {urunler.map((u) => (
                <article key={u._id} className="product-card">
                  <div className="product-image">{u.resim}</div>
                  <div className="product-body">
                    <h3 className="product-title">{u.ad}</h3>
                    <p>{formatPrice(u.fiyat)} · Stok: {u.stok}</p>
                    <div className="card-actions">
                      <button type="button" className="fav-btn small" onClick={async () => {
                        const stok = prompt('Yeni stok:', u.stok);
                        if (stok) setUrunler(await fetchVendorProducts());
                        await updateVendorProduct(u._id, { stok: Number(stok) });
                        setUrunler(await fetchVendorProducts());
                      }}>Stok</button>
                      <button type="button" className="fav-btn small" onClick={async () => {
                        await deleteVendorProduct(u._id);
                        setUrunler(urunler.filter((x) => x._id !== u._id));
                      }}>Sil</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {tab === 'siparisler' && (
          <div className="orders-list">
            {siparisler.map((s) => (
              <article key={s._id} className="order-card">
                <div className="order-header">
                  <span>#{s._id.slice(-6).toUpperCase()}</span>
                  <span className={`order-status status-${s.durum}`}>{DURUM_ETIKET[s.durum]}</span>
                </div>
                {s.urunler.map((u, i) => <div key={i} className="order-item"><span>{u.ad}</span><span>{u.adet} adet</span></div>)}
                <select value={s.durum} onChange={async (e) => {
                  await updateVendorOrderStatus(s._id, e.target.value);
                  setSiparisler(await fetchVendorOrders());
                }}>
                  {['beklemede', 'hazirlaniyor', 'kargoda', 'teslim'].map((d) => (
                    <option key={d} value={d}>{DURUM_ETIKET[d]}</option>
                  ))}
                </select>
              </article>
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}
