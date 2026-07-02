import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Müşteri hesabı satıcı paneline giremez. */
export default function SellerGuard({ children }) {
  const { kullanici, yukleniyor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!yukleniyor && kullanici?.rol === 'kullanici') {
      navigate('/satici/giris', { replace: true });
    }
  }, [kullanici, yukleniyor, navigate]);

  if (yukleniyor) return <div className="loading page-loading">Yükleniyor...</div>;
  if (kullanici?.rol === 'kullanici') return null;

  return children;
}
