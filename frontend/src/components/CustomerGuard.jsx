import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Satıcı hesabı müşteri arayüzüne giremez. */
export default function CustomerGuard({ children }) {
  const { kullanici, yukleniyor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!yukleniyor && kullanici?.rol === 'satici') {
      navigate('/satici/panel?tab=ilan', { replace: true });
    }
  }, [kullanici, yukleniyor, navigate]);

  if (yukleniyor) {
    return <div className="loading page-loading">Yükleniyor...</div>;
  }
  if (kullanici?.rol === 'satici') return null;

  return children;
}
