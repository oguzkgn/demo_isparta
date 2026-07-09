import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { epostaDogrulandiMi, epostaDogrulamaYolu } from '../utils/authVerify';

/** Müşteri hesabı satıcı paneline giremez. */
export default function SellerGuard({ children }) {
  const { kullanici, yukleniyor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (yukleniyor || !kullanici) return;
    if (kullanici.rol === 'kullanici') {
      navigate('/satici/giris', { replace: true });
      return;
    }
    if (!epostaDogrulandiMi(kullanici)) {
      navigate(epostaDogrulamaYolu(kullanici.email, 'satici'), { replace: true });
    }
  }, [kullanici, yukleniyor, navigate]);

  if (yukleniyor) {
    return <div className="loading">Yükleniyor...</div>;
  }
  if (kullanici?.rol === 'kullanici') return null;
  if (kullanici && !epostaDogrulandiMi(kullanici)) return null;

  return children;
}
