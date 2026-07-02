import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { epostaDogrulandiMi, epostaDogrulamaYolu } from '../utils/authVerify';

/** Satıcı hesabı müşteri arayüzüne giremez. */
export default function CustomerGuard({ children }) {
  const { kullanici, yukleniyor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (yukleniyor || !kullanici) return;
    if (kullanici.rol === 'satici') {
      navigate('/satici/panel?tab=ilan', { replace: true });
      return;
    }
    if (!epostaDogrulandiMi(kullanici)) {
      navigate(epostaDogrulamaYolu(kullanici.email, 'musteri'), { replace: true });
    }
  }, [kullanici, yukleniyor, navigate]);

  if (yukleniyor) {
    return <div className="loading page-loading">Yükleniyor...</div>;
  }
  if (kullanici?.rol === 'satici') return null;
  if (kullanici && !epostaDogrulandiMi(kullanici)) return null;

  return children;
}
