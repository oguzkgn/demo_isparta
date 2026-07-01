import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFavorites, removeFavorite } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import Layout from '../components/Layout';

export default function FavoritesPage({ arama, setArama, kategori, setKategori, konum, setKonum }) {
  const { kullanici } = useAuth();
  const { sepeteEkle } = useCart();
  const navigate = useNavigate();
  const [favoriler, setFavoriler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!kullanici) {
      navigate('/giris');
      return;
    }
    fetchFavorites()
      .then(setFavoriler)
      .catch(() => setFavoriler([]))
      .finally(() => setYukleniyor(false));
  }, [kullanici, navigate]);

  const cikar = async (id) => {
    const list = await removeFavorite(id);
    setFavoriler(list);
  };

  if (!kullanici) return null;

  return (
    <Layout arama={arama} setArama={setArama} kategori={kategori} setKategori={setKategori} konum={konum} setKonum={setKonum}>
      <main className="main">
        <h1 className="page-title">❤️ Favorilerim</h1>
        {yukleniyor ? (
          <div className="loading">Yükleniyor...</div>
        ) : favoriler.length === 0 ? (
          <div className="empty-products"><span>💜</span>Favori ürününüz yok.</div>
        ) : (
          <div className="product-grid">
            {favoriler.map((u) => (
              <article key={u._id} className="product-card">
                <Link to={`/urun/${u._id}`} className="product-image">{u.resim || '🛍️'}</Link>
                <div className="product-body">
                  <div className="product-brand">{u.marka}</div>
                  <Link to={`/urun/${u._id}`} className="product-title">{u.ad}</Link>
                  <div className="product-prices">
                    <span className="price-now">{formatPrice(u.fiyat)}</span>
                  </div>
                  <div className="card-actions">
                    <button type="button" className="add-btn" onClick={() => sepeteEkle(u)}>Sepete Ekle</button>
                    <button type="button" className="fav-btn small" onClick={() => cikar(u._id)}>Kaldır</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}
