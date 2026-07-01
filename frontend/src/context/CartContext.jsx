import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchCart, addToCart, removeFromCart, updateCartItem, createOrder } from '../api/client';

const CartContext = createContext(null);

function localSepetOku() {
  try {
    return JSON.parse(localStorage.getItem('demo-sepet') || '[]');
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { kullanici } = useAuth();
  const [sepet, setSepet] = useState(localSepetOku);
  const [sepetAcik, setSepetAcik] = useState(false);

  const sepetiYukle = useCallback(async () => {
    if (!kullanici) {
      setSepet(localSepetOku());
      return;
    }
    try {
      const data = await fetchCart();
      setSepet(data.map((x) => ({ ...x.urun, adet: x.adet, sepetUrunId: x.urun._id })));
    } catch {
      setSepet([]);
    }
  }, [kullanici]);

  useEffect(() => { sepetiYukle(); }, [sepetiYukle]);

  useEffect(() => {
    if (!kullanici) {
      localStorage.setItem('demo-sepet', JSON.stringify(sepet));
    }
  }, [sepet, kullanici]);

  const sepeteEkle = async (urun, opts = {}) => {
    const { beden, renk, adet = 1 } = opts;
    if (kullanici) {
      const data = await addToCart(urun._id, adet, beden, renk);
      setSepet(data.map((x) => ({ ...x.urun, adet: x.adet, beden: x.beden, renk: x.renk })));
    } else {
      setSepet((prev) => {
        const mevcut = prev.find((x) => x._id === urun._id);
        if (mevcut) {
          return prev.map((x) => (x._id === urun._id ? { ...x, adet: x.adet + adet } : x));
        }
        return [...prev, { ...urun, adet, beden, renk }];
      });
    }
  };

  const sepettenCikar = async (id) => {
    if (kullanici) {
      const data = await removeFromCart(id);
      setSepet(data.map((x) => ({ ...x.urun, adet: x.adet })));
    } else {
      setSepet((prev) => prev.filter((x) => x._id !== id));
    }
  };

  const adetGuncelle = async (id, adet) => {
    if (kullanici) {
      const data = await updateCartItem(id, adet);
      setSepet(data.map((x) => ({ ...x.urun, adet: x.adet })));
    } else {
      setSepet((prev) => prev.map((x) => (x._id === id ? { ...x, adet } : x)));
    }
  };

  const siparisTamamla = async () => {
    if (kullanici) {
      const siparis = await createOrder({});
      await sepetiYukle();
      return siparis;
    }
    throw new Error('Sipariş için giriş yapmalısınız.');
  };

  const sepetAdet = sepet.reduce((t, x) => t + x.adet, 0);
  const toplam = sepet.reduce((t, x) => t + x.fiyat * x.adet, 0);

  return (
    <CartContext.Provider value={{
      sepet, sepetAcik, setSepetAcik, sepeteEkle, sepettenCikar,
      adetGuncelle, siparisTamamla, sepetAdet, toplam, sepetiYukle
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart CartProvider içinde kullanılmalı');
  return ctx;
}
