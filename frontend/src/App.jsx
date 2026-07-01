import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import OrdersPage from './pages/OrdersPage';
import './App.css';

function AppRoutes() {
  const [arama, setArama] = useState('');
  const [kategori, setKategori] = useState('');
  const [konum, setKonum] = useState('');
  const shared = { arama, setArama, kategori, setKategori, konum, setKonum };

  return (
    <Routes>
      <Route path="/" element={<HomePage {...shared} />} />
      <Route path="/urun/:id" element={<ProductPage {...shared} />} />
      <Route path="/giris" element={<LoginPage {...shared} />} />
      <Route path="/kayit" element={<RegisterPage {...shared} />} />
      <Route path="/profil" element={<ProfilePage {...shared} />} />
      <Route path="/favoriler" element={<FavoritesPage {...shared} />} />
      <Route path="/siparisler" element={<OrdersPage {...shared} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
