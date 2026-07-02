import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchVendorProducts, createVendorProduct, updateVendorProduct, deleteVendorProduct,
  fetchVendorOrders, updateVendorOrderStatus, fetchMyVendor, prepareSeller,
  fetchCategories, fetchLocations
} from '../api/client';
import { formatPrice, DURUM_ETIKET } from '../utils/format';
import { asArray } from '../utils/safe';
import { ISPARTA_KONUMLAR } from '../constants/config';
import SellerLayout from '../components/SellerLayout';
import ProductImage from '../components/ProductImage';
import MediaUpload from '../components/MediaUpload';
import EmptyState from '../components/EmptyState';

const BOS_ILAN = {
  ad: '', fiyat: '', stok: 10, kategori: 'lavanta', konum: '⭐ Çarşı / Merkez',
  marka: '', aciklama: '', resim: '', videoUrl: ''
};

export default function SellerPanelPage() {
  const { kullanici, yukleniyor, kullaniciGuncelle } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('ilan');
  const [urunler, setUrunler] = useState([]);
  const [siparisler, setSiparisler] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [kategoriler, setKategoriler] = useState([]);
  const [konumlar, setKonumlar] = useState(ISPARTA_KONUMLAR);
  const [yeniUrun, setYeniUrun] = useState(BOS_ILAN);
  const [ilanMesaj, setIlanMesaj] = useState('');
  const [ilanHata, setIlanHata] = useState('');
  const [hazir, setHazir] = useState(false);

  useEffect(() => {
    if (yukleniyor) return;
    if (!kullanici) {
      navigate('/satici/basvuru', { replace: true });
      return;
    }
    const yukle = async () => {
      try {
        const hazirSonuc = await prepareSeller();
        if (hazirSonuc?.kullanici) kullaniciGuncelle(hazirSonuc.kullanici);
        if (hazirSonuc?.vendor) setVendor(hazirSonuc.vendor);
        setHazir(true);
        const [u, s] = await Promise.all([
          fetchVendorProducts().catch(() => []),
          fetchVendorOrders().catch(() => [])
        ]);
        setUrunler(asArray(u));
        setSiparisler(asArray(s));
      } catch {
        navigate('/satici/basvuru', { replace: true });
      }
    };
    yukle();
  }, [kullanici, yukleniyor, navigate, kullaniciGuncelle]);

  useEffect(() => {
    fetchCategories().then((k) => setKategoriler(asArray(k))).catch(() => {});
    fetchLocations().then((l) => setKonumlar(asArray(l).length ? asArray(l) : ISPARTA_KONUMLAR)).catch(() => {});
  }, []);

  const ilanYayinla = async (e) => {
    e.preventDefault();
    setIlanHata('');
    setIlanMesaj('');
    if (!yeniUrun.ad.trim() || !yeniUrun.fiyat) {
      setIlanHata('Ürün adı ve fiyat zorunludur.');
      return;
    }
    try {
      const u = await createVendorProduct({
        ...yeniUrun,
        fiyat: Number(yeniUrun.fiyat),
        stok: Number(yeniUrun.stok) || 1,
        aciklama: yeniUrun.aciklama.trim(),
        resim: yeniUrun.resim || undefined,
        videoUrl: yeniUrun.videoUrl || undefined
      });
      setUrunler((prev) => [u, ...prev]);
      setYeniUrun(BOS_ILAN);
      setIlanMesaj(`"${u.ad}" ilanı yayınlandı! Müşteriler ana sayfada görebilir.`);
      setTab('envanter');
    } catch (err) {
      setIlanHata(err.response?.data?.mesaj || 'İlan yayınlanamadı.');
    }
  };

  if (yukleniyor || !kullanici || !hazir) {
    return (
      <SellerLayout>
        <main className="seller-main"><div className="loading">Satıcı paneli hazırlanıyor...</div></main>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <main className="seller-main">
        <div className="seller-panel-header">
          <h1 className="page-title">İlan Yönetimi {vendor?.magazaAdi && `— ${vendor.magazaAdi}`}</h1>
          <p className="seller-panel-sub">Fotoğraf ve video ekleyin, fiyat belirleyin, ilanınızı yayınlayın</p>
        </div>
        <div className="profile-tabs seller-tabs">
          <button type="button" className={tab === 'ilan' ? 'active' : ''} onClick={() => setTab('ilan')}>Yeni İlan Ver</button>
          <button type="button" className={tab === 'envanter' ? 'active' : ''} onClick={() => setTab('envanter')}>İlanlarım</button>
          <button type="button" className={tab === 'siparisler' ? 'active' : ''} onClick={() => setTab('siparisler')}>Siparişler</button>
        </div>

        {tab === 'ilan' && (
          <form className="auth-form wide seller-product-form listing-form" onSubmit={ilanYayinla}>
            <h3>Yeni İlan Oluştur</h3>
            {ilanMesaj && <div className="auth-success">{ilanMesaj}</div>}
            {ilanHata && <div className="auth-error">{ilanHata}</div>}
            <label>İlan Başlığı<input value={yeniUrun.ad} onChange={(e) => setYeniUrun({ ...yeniUrun, ad: e.target.value })} required placeholder="Örn: Isparta Lavanta Kolonyası 400ml" /></label>
            <MediaUpload
              resim={yeniUrun.resim}
              videoUrl={yeniUrun.videoUrl}
              onResim={(v) => setYeniUrun({ ...yeniUrun, resim: v })}
              onVideoUrl={(v) => setYeniUrun({ ...yeniUrun, videoUrl: v })}
            />
            <label>Ürün Açıklaması<textarea value={yeniUrun.aciklama} onChange={(e) => setYeniUrun({ ...yeniUrun, aciklama: e.target.value })} rows={4} placeholder="Ürününüzü detaylı anlatın..." required /></label>
            <div className="form-row">
              <label>Fiyat (TL)<input type="number" min="1" value={yeniUrun.fiyat} onChange={(e) => setYeniUrun({ ...yeniUrun, fiyat: e.target.value })} required /></label>
              <label>Stok<input type="number" min="1" value={yeniUrun.stok} onChange={(e) => setYeniUrun({ ...yeniUrun, stok: e.target.value })} /></label>
            </div>
            <div className="form-row">
              <label>Marka<input value={yeniUrun.marka} onChange={(e) => setYeniUrun({ ...yeniUrun, marka: e.target.value })} placeholder="Mağaza markanız" /></label>
              <label>Kategori
                <select value={yeniUrun.kategori} onChange={(e) => setYeniUrun({ ...yeniUrun, kategori: e.target.value })}>
                  {kategoriler.map((k) => <option key={k.id} value={k.id}>{k.ad}</option>)}
                  {!kategoriler.length && <option value="lavanta">Lavanta & Gül</option>}
                </select>
              </label>
            </div>
            <label>Mahalle
              <select value={yeniUrun.konum} onChange={(e) => setYeniUrun({ ...yeniUrun, konum: e.target.value })}>
                {konumlar.map((k) => <option key={k} value={k}>{k.replace(/^\s*⭐\s*/, '')}</option>)}
              </select>
            </label>
            <button type="submit" className="auth-submit seller-submit">İlanı Yayınla</button>
          </form>
        )}

        {tab === 'envanter' && (
          <div className="product-grid seller-grid">
            {urunler.length === 0 ? (
              <EmptyState title="Henüz ilan yok" description="Yeni İlan Ver sekmesinden ilk ilanınızı oluşturun." />
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
                        setUrunler(asArray(await fetchVendorProducts()));
                      }}>Stok</button>
                      <button type="button" className="fav-btn small danger" onClick={async () => {
                        if (!confirm('Bu ilanı silmek istiyor musunuz?')) return;
                        await deleteVendorProduct(u._id);
                        setUrunler((prev) => prev.filter((x) => x._id !== u._id));
                      }}>Sil</button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {tab === 'siparisler' && (
          <div className="orders-list">
            {siparisler.length === 0 ? (
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
                    setSiparisler(asArray(await fetchVendorOrders()));
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
