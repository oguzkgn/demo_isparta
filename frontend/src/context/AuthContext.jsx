import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  login as apiLogin, register as apiRegister, loginGoogle, loginApple,
  fetchProfile, deleteAccount as apiDeleteAccount, verifyEmail
} from '../api/client';

const AuthContext = createContext(null);

function oturumKaydet(data) {
  if (data?.token) localStorage.setItem('demo-token', data.token);
  return data?.kullanici;
}

export function AuthProvider({ children }) {
  const [kullanici, setKullanici] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  const oturumuYukle = useCallback(async () => {
    const token = localStorage.getItem('demo-token');
    if (!token) {
      setYukleniyor(false);
      return;
    }
    try {
      const profil = await fetchProfile();
      setKullanici(profil);
    } catch (err) {
      if (err.response?.data?.kod === 'EPOSTA_DOGRULANMADI') {
        setKullanici(null);
        localStorage.removeItem('demo-token');
      } else {
        localStorage.removeItem('demo-token');
        setKullanici(null);
      }
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => { oturumuYukle(); }, [oturumuYukle]);

  const girisYap = async (email, sifre) => {
    const data = await apiLogin({ email, sifre });
    const u = oturumKaydet(data);
    setKullanici(u);
    return u;
  };

  const kayitOl = async (formData) => apiRegister(formData);

  const epostaDogrula = async (email, kod) => {
    const data = await verifyEmail({ email, kod });
    const u = oturumKaydet(data);
    setKullanici(u);
    return data;
  };

  const cikisYap = () => {
    localStorage.removeItem('demo-token');
    setKullanici(null);
  };

  const hesabiSil = async () => {
    await apiDeleteAccount();
    localStorage.removeItem('demo-token');
    setKullanici(null);
  };

  const googleGiris = async (email, ad, soyad) => {
    const data = await loginGoogle({ email, ad, soyad, googleId: `google_${email}` });
    const u = oturumKaydet(data);
    setKullanici(u);
    return u;
  };

  const appleGiris = async (email, ad = 'Apple', soyad = 'Kullanıcı') => {
    const data = await loginApple({ email, ad, soyad, appleId: `apple_${email}` });
    const u = oturumKaydet(data);
    setKullanici(u);
    return u;
  };

  const profilYenile = async () => {
    const token = localStorage.getItem('demo-token');
    if (!token) {
      setKullanici(null);
      return null;
    }
    const profil = await fetchProfile();
    setKullanici(profil);
    return profil;
  };

  const kullaniciGuncelle = (u) => setKullanici(u);

  return (
    <AuthContext.Provider value={{
      kullanici, yukleniyor, girisYap, kayitOl, epostaDogrula, googleGiris, appleGiris,
      cikisYap, hesabiSil, oturumuYukle, profilYenile, kullaniciGuncelle
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider içinde kullanılmalı');
  return ctx;
}
