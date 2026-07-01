import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchPendingReviews, approveReview } from '../api/client';
import Layout from '../components/Layout';

export default function AdminReviewsPage(props) {
  const { kullanici } = useAuth();
  const navigate = useNavigate();
  const [yorumlar, setYorumlar] = useState([]);

  useEffect(() => {
    if (!kullanici || kullanici.rol !== 'admin') { navigate('/'); return; }
    fetchPendingReviews().then(setYorumlar).catch(() => {});
  }, [kullanici, navigate]);

  if (!kullanici || kullanici.rol !== 'admin') return null;

  return (
    <Layout {...props}>
      <main className="main">
        <h1 className="page-title">✅ Yorum Onay Paneli</h1>
        {yorumlar.length === 0 ? (
          <div className="empty-products"><span>✓</span>Bekleyen yorum yok</div>
        ) : yorumlar.map((y) => (
          <article key={y._id} className="review-card">
            <div className="review-header">
              <strong>{y.kullaniciAd} — {y.urun?.ad}</strong>
              <span>{'★'.repeat(y.puan)}</span>
            </div>
            <p>{y.yorum}</p>
            {y.fotoUrl && <p>📷 Fotoğraf eklendi</p>}
            <button type="button" className="add-btn" onClick={async () => {
              await approveReview(y._id);
              setYorumlar(yorumlar.filter((x) => x._id !== y._id));
            }}>Onayla</button>
          </article>
        ))}
      </main>
    </Layout>
  );
}
