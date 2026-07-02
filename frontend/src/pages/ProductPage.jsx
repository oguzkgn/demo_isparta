import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchProduct, fetchCategories, fetchLocations,
  fetchFavorites, addFavorite, removeFavorite,
  fetchReviews, addReview, trackRecent
} from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice, konumMetni } from '../utils/format';
import Layout from '../components/Layout';
import ProductImage from '../components/ProductImage';
import EmptyState from '../components/EmptyState';
import { IconHeart, IconMapPin, IconStar, IconStore } from '../components/icons/Icons';

export default function ProductPage({ arama, setArama, kategori, setKategori, konum, setKonum }) {
  const { id } = useParams();
  const { kullanici } = useAuth();
  const { sepeteEkle } = useCart();
  const [urun, setUrun] = useState(null);
  const [kategoriler, setKategoriler] = useState([]);
  const [konumlar, setKonumlar] = useState([]);
  const [favori, setFavori] = useState(false);
  const [yorumlar, setYorumlar] = useState([]);
  const [yorumForm, setYorumForm] = useState({ puan: 5, yorum: '', fotoUrl: '' });
  const [seciliBeden, setSeciliBeden] = useState('');
  const [seciliRenk, setSeciliRenk] = useState('');
  const [seciliTaksit, setSeciliTaksit] = useState(1);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [yorumHata, setYorumHata] = useState('');

  useEffect(() => {
    Promise.all([fetchCategories(), fetchLocations()])
      .then(([k, l]) => { setKategoriler(k); setKonumlar(l); });
  }, []);

  useEffect(() => {
    setYukleniyor(true);
    Promise.all([fetchProduct(id), fetchReviews(id)])
      .then(([u, y]) => { setUrun(u); setYorumlar(y); })
      .catch(() => setUrun(null))
      .finally(() => setYukleniyor(false));
    if (kullanici) trackRecent(id).catch(() => {});
  }, [id, kullanici]);

  useEffect(() => {
    if (!kullanici || !urun) return;
    fetchFavorites()
      .then((list) => setFavori(list.some((f) => f._id === urun._id)))
      .catch(() => {});
  }, [kullanici, urun]);

  const favoriToggle = async () => {
    if (!kullanici) return;
    if (favori) { await removeFavorite(id); setFavori(false); }
    else { await addFavorite(id); setFavori(true); }
  };

  const yorumGonder = async (e) => {
    e.preventDefault();
    setYorumHata('');
    try {
      await addReview(id, yorumForm);
      const y = await fetchReviews(id);
      setYorumlar(y);
      const g = await fetchProduct(id);
      setUrun(g);
      setYorumForm({ puan: 5, yorum: '' });
    } catch (err) {
      setYorumHata(err.response?.data?.mesaj || 'Yorum eklenemedi.');
    }
  };

  const katAd = kategoriler.find((k) => k.id === urun?.kategori);
  const indirim = urun?.eskiFiyat ? Math.round((1 - urun.fiyat / urun.eskiFiyat) * 100) : 0;

  return (
    <Layout
      kategoriler={kategoriler}
      kategori={kategori}
      setKategori={setKategori}
      arama={arama}
      setArama={setArama}
      konumlar={konumlar}
      konum={konum}
      setKonum={setKonum}
    >
      <main className="main">
        {yukleniyor ? (
          <div className="loading">Yükleniyor...</div>
        ) : !urun ? (
          <EmptyState title="Ürün bulunamadı" description={<Link to="/">Ana sayfaya dön</Link>} />
        ) : (
          <>
            <nav className="breadcrumb">
              <Link to="/">Ana Sayfa</Link> / {katAd?.ad || 'Ürün'} / {urun.ad}
            </nav>
            <div className="product-detail">
              <ProductImage
                urun={urun}
                className="product-detail-image"
                badge={indirim > 0 ? <span className="badge discount">%{indirim}</span> : null}
              />
              <div className="product-detail-info">
                <div className="product-brand">{urun.marka}</div>
                <h1>{urun.ad}</h1>
                {katAd && <span className="cat-tag">{katAd.ad}</span>}
                <div className="product-rating">
                  <IconStar size={14} />
                  <span>{urun.puan?.toFixed(1)}</span>
                  <span className="rating-count">({urun.yorumSayisi} yorum)</span>
                </div>
                <div className="product-location">
                  <IconMapPin size={14} />
                  <span>{konumMetni(urun.konum)} · Stok: {urun.stok}</span>
                </div>
                <p className="product-desc">{urun.aciklama}</p>
                <div className="product-prices detail-prices">
                  <span className="price-now">{formatPrice(urun.fiyat)}</span>
                  {urun.eskiFiyat && <span className="price-old">{formatPrice(urun.eskiFiyat)}</span>}
                </div>
                <p className="kargo-info">{urun.fiyat >= 300 ? 'Ücretsiz kargo' : 'Kargo: 29,99 TL (300 TL üzeri ücretsiz)'}</p>
                {urun.saticiAd && (
                  <p className="seller-info">
                    <IconStore size={15} />
                    <span>Satıcı: <strong>{urun.saticiAd}</strong></span>
                  </p>
                )}
                {urun.bedenler?.length > 0 && (
                  <div className="variant-group">
                    <span>Beden:</span>
                    {urun.bedenler.map((b) => (
                      <button key={b} type="button" className={`variant-btn ${seciliBeden === b ? 'active' : ''}`} onClick={() => setSeciliBeden(b)}>{b}</button>
                    ))}
                  </div>
                )}
                {urun.renkler?.length > 0 && (
                  <div className="variant-group">
                    <span>Renk:</span>
                    {urun.renkler.map((r) => (
                      <button key={r} type="button" className={`variant-btn ${seciliRenk === r ? 'active' : ''}`} onClick={() => setSeciliRenk(r)}>{r}</button>
                    ))}
                  </div>
                )}
                {urun.taksitSecenekleri?.length > 0 && (
                  <div className="variant-group">
                    <span>Taksit:</span>
                    {urun.taksitSecenekleri.map((t) => (
                      <button key={t.ay} type="button" className={`variant-btn ${seciliTaksit === t.ay ? 'active' : ''}`} onClick={() => setSeciliTaksit(t.ay)}>
                        {t.ay}× {formatPrice(t.tutar)}
                      </button>
                    ))}
                  </div>
                )}
                <div className="detail-actions">
                  <button type="button" className="add-btn large" onClick={() => sepeteEkle(urun, { beden: seciliBeden, renk: seciliRenk })}>Sepete Ekle</button>
                  {kullanici ? (
                    <button type="button" className={`fav-btn icon-btn ${favori ? 'active' : ''}`} onClick={favoriToggle}>
                      <IconHeart filled={favori} size={16} />
                      {favori ? 'Favorilerde' : 'Favorilere Ekle'}
                    </button>
                  ) : (
                    <Link to="/giris" className="fav-btn">Giriş yapın</Link>
                  )}
                </div>
              </div>
            </div>

            <section className="reviews-section">
              <h2>Değerlendirmeler ({yorumlar.length})</h2>
              {kullanici ? (
                <form className="review-form" onSubmit={yorumGonder}>
                  {yorumHata && <div className="auth-error">{yorumHata}</div>}
                  <div className="star-select">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={n <= yorumForm.puan ? 'active' : ''}
                        onClick={() => setYorumForm({ ...yorumForm, puan: n })}
                      >★</button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Yorumunuzu yazın..."
                    value={yorumForm.yorum}
                    onChange={(e) => setYorumForm({ ...yorumForm, yorum: e.target.value })}
                    required rows={3}
                  />
                  <label>Fotoğraf URL (opsiyonel)<input value={yorumForm.fotoUrl} onChange={(e) => setYorumForm({ ...yorumForm, fotoUrl: e.target.value })} placeholder="https://..." /></label>
                  <button type="submit" className="add-btn">Yorum Yap</button>
                </form>
              ) : (
                <p className="auth-sub"><Link to="/giris">Giriş yapın</Link> ve yorum bırakın.</p>
              )}
              <div className="reviews-list">
                {yorumlar.length === 0 ? (
                  <p className="auth-sub">Henüz yorum yok. İlk yorumu siz yapın!</p>
                ) : yorumlar.map((y) => (
                  <article key={y._id} className="review-card">
                    <div className="review-header">
                      <strong>{y.kullaniciAd}</strong>
                      <span>{'★'.repeat(y.puan)}{'☆'.repeat(5 - y.puan)}</span>
                    </div>
                    <p>{y.yorum}</p>
                    <small>{new Date(y.createdAt).toLocaleDateString('tr-TR')}</small>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </Layout>
  );
}
