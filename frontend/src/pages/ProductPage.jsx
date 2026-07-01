import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProduct, fetchCategories, fetchLocations, fetchFavorites, addFavorite, removeFavorite } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import Layout from '../components/Layout';

export default function ProductPage({ arama, setArama, kategori, setKategori, konum, setKonum }) {
  const { id } = useParams();
  const { kullanici } = useAuth();
  const { sepeteEkle } = useCart();
  const [urun, setUrun] = useState(null);
  const [kategoriler, setKategoriler] = useState([]);
  const [konumlar, setKonumlar] = useState([]);
  const [favori, setFavori] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchLocations()])
      .then(([k, l]) => { setKategoriler(k); setKonumlar(l); });
  }, []);

  useEffect(() => {
    setYukleniyor(true);
    fetchProduct(id)
      .then(setUrun)
      .catch(() => setUrun(null))
      .finally(() => setYukleniyor(false));
  }, [id]);

  useEffect(() => {
    if (!kullanici || !urun) return;
    fetchFavorites()
      .then((list) => setFavori(list.some((f) => f._id === urun._id)))
      .catch(() => {});
  }, [kullanici, urun]);

  const favoriToggle = async () => {
    if (!kullanici) return;
    if (favori) {
      await removeFavorite(id);
      setFavori(false);
    } else {
      await addFavorite(id);
      setFavori(true);
    }
  };

  const katAd = kategoriler.find((k) => k.id === urun?.kategori);

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
          <div className="empty-products"><span>😕</span>Ürün bulunamadı. <Link to="/">Ana sayfaya dön</Link></div>
        ) : (
          <div className="product-detail">
            <div className="product-detail-image">{urun.resim || '🛍️'}</div>
            <div className="product-detail-info">
              <div className="product-brand">{urun.marka}</div>
              <h1>{urun.ad}</h1>
              {katAd && <span className="cat-tag">{katAd.ikon} {katAd.ad}</span>}
              <div className="product-rating">★ {urun.puan} ({urun.yorumSayisi} yorum)</div>
              <div className="product-location">📍 {urun.konum}</div>
              <p className="product-desc">{urun.aciklama}</p>
              <div className="product-prices detail-prices">
                <span className="price-now">{formatPrice(urun.fiyat)}</span>
                {urun.eskiFiyat && <span className="price-old">{formatPrice(urun.eskiFiyat)}</span>}
              </div>
              <div className="detail-actions">
                <button type="button" className="add-btn large" onClick={() => sepeteEkle(urun)}>Sepete Ekle</button>
                {kullanici && (
                  <button type="button" className={`fav-btn ${favori ? 'active' : ''}`} onClick={favoriToggle}>
                    {favori ? '❤️ Favorilerde' : '🤍 Favorilere Ekle'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}
