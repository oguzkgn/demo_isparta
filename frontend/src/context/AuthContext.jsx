import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, loginGoogle, loginApple, fetchProfile, deleteAccount as apiDeleteAccount } from '../api/client';

const AuthContext = createContext(null);

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
    } catch {
      localStorage.removeItem('demo-token');
      setKullanici(null);
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => { oturumuYukle(); }, [oturumuYukle]);

  const girisYap = async (email, sifre) => {
    const { kullanici: u, token } = await apiLogin({ email, sifre });
    localStorage.setItem('demo-token', token);
    setKullanici(u);
    return u;
  };

  const kayitOl = async (data) => {
    const { kullanici: u, token } = await apiRegister(data);
    localStorage.setItem('demo-token', token);
    setKullanici(u);
    return u;
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
    const { kullanici: u, token } = await loginGoogle({ email, ad, soyad, googleId: `google_${email}` });
    localStorage.setItem('demo-token', token);
    setKullanici(u);
    return u;
  };

  const appleGiris = async () => {
    const { kullanici: u, token } = await loginApple({ appleId: `apple_${Date.now()}`, ad: 'Apple', soyad: 'Kullanıcı' });
    localStorage.setItem('demo-token', token);
    setKullanici(u);
    return u;
  };

  return (
    <AuthContext.Provider value={{ kullanici, yukleniyor, girisYap, kayitOl, googleGiris, appleGiris, cikisYap, hesabiSil, oturumuYukle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider içinde kullanılmalı');
  return ctx;
}
