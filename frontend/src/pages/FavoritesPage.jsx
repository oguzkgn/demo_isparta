import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFavorites, removeFavorite } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';

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
        <h1 className="page-title">Favorilerim</h1>
        {yukleniyor ? (
          <div className="loading">Yükleniyor...</div>
        ) : favoriler.length === 0 ? (
          <EmptyState title="Favori ürününüz yok" description="Beğendiğiniz ürünleri favorilere ekleyin." />
        ) : (
          <div className="product-grid">
            {favoriler.map((u) => (
              <ProductCard
                key={u._id}
                u={u}
                sepeteEkle={sepeteEkle}
                favoriMi
                favoriToggle={() => cikar(u._id)}
              />
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}
