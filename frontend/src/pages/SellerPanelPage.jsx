import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchVendorProducts, createVendorProduct, updateVendorProduct, deleteVendorProduct,
  fetchVendorOrders, updateVendorOrderStatus, prepareSeller,
  fetchCategories, fetchLocations
} from '../api/client';
import { formatPrice, DURUM_ETIKET, SATICI_DURUM_SECENEKLERI } from '../utils/format';
import { asArray } from '../utils/safe';
import { ISPARTA_KONUMLAR } from '../constants/config';
import SellerLayout from '../components/SellerLayout';
import SellerGuard from '../components/SellerGuard';
import { epostaDogrulandiMi, epostaDogrulamaYolu } from '../utils/authVerify';
import ProductImage from '../components/ProductImage';
import ListingFormFields from '../components/ListingFormFields';
import EmptyState from '../components/EmptyState';

const BOS_ILAN = {
  ad: '', fiyat: '', stok: 10, kategori: 'lavanta', konum: '⭐ Çarşı / Merkez',
  marka: '', aciklama: '', resim: '', videoUrl: ''
};

function urundenForm(u) {
  return {
    ad: u.ad || '',
    fiyat: u.fiyat ?? '',
    stok: u.stok ?? 10,
    kategori: u.kategori || 'lavanta',
    konum: u.konum || '⭐ Çarşı / Merkez',
    marka: u.marka || '',
    aciklama: u.aciklama || '',
    resim: u.resim || '',
    videoUrl: u.videoUrl || ''
  };
}

function ilanPayload(form) {
  return {
    ad: form.ad.trim(),
    fiyat: Number(form.fiyat),
    stok: Number(form.stok) || 1,
    kategori: form.kategori,
    konum: form.konum,
    marka: form.marka.trim(),
    aciklama: form.aciklama.trim(),
    resim: form.resim || undefined,
    videoUrl: form.videoUrl || undefined
  };
}

export default function SellerPanelPage() {
  const { kullanici, yukleniyor, kullaniciGuncelle } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'ilan';
  const setTab = (next) => setSearchParams({ tab: next }, { replace: true });

  const [urunler, setUrunler] = useState([]);
  const [siparisler, setSiparisler] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [kategoriler, setKategoriler] = useState([]);
  const [konumlar, setKonumlar] = useState(ISPARTA_KONUMLAR);
  const [yeniUrun, setYeniUrun] = useState(BOS_ILAN);
  const [duzenlenen, setDuzenlenen] = useState(null);
  const [duzenleForm, setDuzenleForm] = useState(BOS_ILAN);
  const [ilanMesaj, setIlanMesaj] = useState('');
  const [ilanHata, setIlanHata] = useState('');
  const [panelHata, setPanelHata] = useState('');
  const [siparisMesaj, setSiparisMesaj] = useState('');
  const [hazir, setHazir] = useState(false);

  const urunleriYenile = useCallback(async () => {
    const u = await fetchVendorProducts().catch(() => []);
    setUrunler(asArray(u));
  }, []);

  useEffect(() => {
    if (yukleniyor) return;
    if (!kullanici) {
      navigate('/giris?portal=satici', { replace: true });
      return;
    }
    if (!epostaDogrulandiMi(kullanici)) {
      navigate(epostaDogrulamaYolu(kullanici.email, 'satici'), { replace: true });
      return;
    }

    let iptal = false;
    const yukle = async () => {
      setPanelHata('');
      try {
        const hazirSonuc = await prepareSeller();
        if (iptal) return;
        if (hazirSonuc?.kullanici) kullaniciGuncelle(hazirSonuc.kullanici);
        if (hazirSonuc?.vendor) setVendor(hazirSonuc.vendor);
        const [u, s] = await Promise.all([
          fetchVendorProducts().catch(() => []),
          fetchVendorOrders().catch(() => [])
        ]);
        if (iptal) return;
        setUrunler(asArray(u));
        setSiparisler(asArray(s));
      } catch (err) {
        if (!iptal) {
          setPanelHata(err.response?.data?.mesaj || 'Satıcı paneli yüklenemedi. Lütfen tekrar deneyin.');
        }
      } finally {
        if (!iptal) setHazir(true);
      }
    };
    yukle();
    return () => { iptal = true; };
  }, [kullanici, yukleniyor, navigate, kullaniciGuncelle]);

  useEffect(() => {
    fetchCategories().then((k) => setKategoriler(asArray(k))).catch(() => {});
    fetchLocations().then((l) => setKonumlar(asArray(l).length ? asArray(l) : ISPARTA_KONUMLAR)).catch(() => {});
  }, []);

  const ilanYayinla = async (e) => {
    e.preventDefault();
    setIlanHata('');
    setIlanMesaj('');
    if (!yeniUrun.ad.trim() || !yeniUrun.fiyat || !yeniUrun.aciklama.trim()) {
      setIlanHata('Başlık, açıklama ve fiyat zorunludur.');
      return;
    }
    try {
      const u = await createVendorProduct(ilanPayload(yeniUrun));
      setUrunler((prev) => [u, ...prev]);
      setYeniUrun(BOS_ILAN);
      setIlanMesaj(`"${u.ad}" ilanı yayınlandı! Müşteriler ana sayfada görebilir.`);
      setTab('envanter');
    } catch (err) {
      setIlanHata(err.response?.data?.mesaj || 'İlan yayınlanamadı.');
    }
  };

  const ilanGuncelle = async (e) => {
    e.preventDefault();
    if (!duzenlenen) return;
    setIlanHata('');
    setIlanMesaj('');
    if (!duzenleForm.ad.trim() || !duzenleForm.fiyat || !duzenleForm.aciklama.trim()) {
      setIlanHata('Başlık, açıklama ve fiyat zorunludur.');
      return;
    }
    try {
      await updateVendorProduct(duzenlenen, ilanPayload(duzenleForm));
      await urunleriYenile();
      setIlanMesaj('İlan güncellendi.');
      setDuzenlenen(null);
      setTab('envanter');
    } catch (err) {
      setIlanHata(err.response?.data?.mesaj || 'İlan güncellenemedi.');
    }
  };

  const ilanSil = async (id, ad) => {
    if (!confirm(`"${ad}" ilanını silmek istiyor musunuz?`)) return;
    try {
      await deleteVendorProduct(id);
      setUrunler((prev) => prev.filter((x) => x._id !== id));
      if (duzenlenen === id) setDuzenlenen(null);
    } catch (err) {
      setIlanHata(err.response?.data?.mesaj || 'İlan silinemedi.');
    }
  };

  const siparisDurumGuncelle = async (id, durum) => {
    setSiparisMesaj('');
    try {
      await updateVendorOrderStatus(id, durum);
      setSiparisler(asArray(await fetchVendorOrders()));
      setSiparisMesaj('Sipariş durumu güncellendi.');
    } catch (err) {
      setPanelHata(err.response?.data?.mesaj || 'Sipariş durumu güncellenemedi.');
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
      <SellerGuard>
      <main className="seller-main">
        <div className="seller-panel-header">
          <h1 className="page-title seller-page-title">İlan Yönetimi {vendor?.magazaAdi && `— ${vendor.magazaAdi}`}</h1>
          <p className="seller-panel-sub">Fotoğraf ve video yükleyin, açıklama yazın, ilanınızı yayınlayın veya güncelleyin</p>
        </div>
        {panelHata && <div className="auth-error">{panelHata}</div>}
        {ilanMesaj && tab !== 'ilan' && <div className="auth-success">{ilanMesaj}</div>}

        <div className="profile-tabs seller-tabs">
          <button type="button" className={tab === 'ilan' ? 'active' : ''} onClick={() => { setDuzenlenen(null); setTab('ilan'); setIlanHata(''); }}>Yeni İlan Ver</button>
          <button type="button" className={tab === 'envanter' ? 'active' : ''} onClick={() => { setDuzenlenen(null); setTab('envanter'); }}>İlanlarım ({urunler.length})</button>
          <button type="button" className={tab === 'siparisler' ? 'active' : ''} onClick={() => setTab('siparisler')}>Siparişler</button>
        </div>

        {tab === 'ilan' && !duzenlenen && (
          <form className="auth-form wide seller-product-form listing-form" onSubmit={ilanYayinla}>
            <h3>Yeni İlan Oluştur</h3>
            {ilanMesaj && <div className="auth-success">{ilanMesaj}</div>}
            {ilanHata && <div className="auth-error">{ilanHata}</div>}
            <ListingFormFields form={yeniUrun} setForm={setYeniUrun} kategoriler={kategoriler} konumlar={konumlar} />
            <button type="submit" className="auth-submit seller-submit">İlanı Yayınla</button>
          </form>
        )}

        {tab === 'envanter' && (
          <>
            {duzenlenen && (
              <form className="auth-form wide seller-product-form listing-form listing-form-edit" onSubmit={ilanGuncelle}>
                <h3>İlanı Düzenle</h3>
                {ilanHata && <div className="auth-error">{ilanHata}</div>}
                <ListingFormFields form={duzenleForm} setForm={setDuzenleForm} kategoriler={kategoriler} konumlar={konumlar} />
                <div className="listing-form-actions">
                  <button type="submit" className="auth-submit seller-submit">Değişiklikleri Kaydet</button>
                  <button type="button" className="fav-btn" onClick={() => { setDuzenlenen(null); setIlanHata(''); }}>İptal</button>
                </div>
              </form>
            )}
            <div className="product-grid seller-grid">
              {urunler.length === 0 ? (
                <EmptyState title="Henüz ilan yok" description="Yeni İlan Ver sekmesinden ilk ilanınızı oluşturun." />
              ) : (
                urunler.map((u) => (
                  <article key={u._id} className="product-card seller-card">
                    <ProductImage urun={u} />
                    <div className="product-body">
                      <h3 className="product-title">{u.ad}</h3>
                      <p className="seller-listing-price">{formatPrice(u.fiyat)} · Stok: {u.stok}</p>
                      {u.aciklama && <p className="seller-listing-desc">{u.aciklama.slice(0, 90)}{u.aciklama.length > 90 ? '…' : ''}</p>}
                      <div className="card-actions">
                        <button type="button" className="fav-btn small seller-btn-edit" onClick={() => {
                          setDuzenlenen(u._id);
                          setDuzenleForm(urundenForm(u));
                          setIlanHata('');
                          setIlanMesaj('');
                        }}>Düzenle</button>
                        <button type="button" className="fav-btn small danger" onClick={() => ilanSil(u._id, u.ad)}>Sil</button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </>
        )}

        {tab === 'siparisler' && (
          <div className="orders-list seller-orders">
            {siparisMesaj && <div className="auth-success">{siparisMesaj}</div>}
            {siparisler.length === 0 ? (
              <EmptyState title="Henüz sipariş yok" description="Müşteriler ürünlerinizi satın aldığında siparişler burada görünür." />
            ) : (
              siparisler.map((s) => (
                <article key={s._id} className="order-card seller-order">
                  <div className="order-header">
                    <div>
                      <strong>#{s._id.slice(-6).toUpperCase()}</strong>
                      {s.createdAt && (
                        <small className="seller-order-date">{new Date(s.createdAt).toLocaleString('tr-TR')}</small>
                      )}
                    </div>
                    <span className={`order-status status-${s.durum}`}>{DURUM_ETIKET[s.durum] || s.durum}</span>
                  </div>
                  {Array.isArray(s.urunler) && s.urunler.map((u, i) => (
                    <div key={i} className="order-item"><span>{u.ad}</span><span>{u.adet} adet · {formatPrice(u.fiyat * u.adet)}</span></div>
                  ))}
                  {s.takipNo && s.durum !== 'iptal' && (
                    <p className="seller-tracking">Takip No: <strong>{s.takipNo}</strong></p>
                  )}
                  {s.adres && <p className="seller-order-address">{s.adres}</p>}
                  <label className="seller-status-label">
                    Sipariş durumu
                    <select
                      className="seller-status-select"
                      value={s.durum === 'kargoda' ? 'kargoya_verildi' : s.durum}
                      onChange={(e) => siparisDurumGuncelle(s._id, e.target.value)}
                    >
                      {SATICI_DURUM_SECENEKLERI.map((d) => (
                        <option key={d} value={d}>{DURUM_ETIKET[d]}</option>
                      ))}
                    </select>
                  </label>
                </article>
              ))
            )}
          </div>
        )}
      </main>
      </SellerGuard>
    </SellerLayout>
  );
}
