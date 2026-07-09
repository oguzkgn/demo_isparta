import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import OrdersPageWrapper from './pages/OrdersPageWrapper';
import OrderDetailPage from './pages/OrderDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import VendorApplyPage from './pages/VendorApplyPage';
import SellerPanelPage from './pages/SellerPanelPage';
import SellerLoginPage from './pages/SellerLoginPage';
import AdminReviewsPage from './pages/AdminReviewsPage';
import EmailVerifyPage from './pages/EmailVerifyPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ApiWarmup from './components/ApiWarmup';
import AnimatedBackground from './components/AnimatedBackground';
import './App.css';

function AppRoutes() {
  const location = useLocation();
  const saticiSayfasi = location.pathname.startsWith('/satici');
  const authSayfasi = ['/giris', '/kayit', '/eposta-dogrula', '/sifremi-unuttum'].includes(location.pathname);
  const [arama, setArama] = useState('');
  const [kategori, setKategori] = useState('');
  const [konum, setKonum] = useState('');
  const shared = { arama, setArama, kategori, setKategori, konum, setKonum };

  return (
    <>
      <ApiWarmup />
      {!saticiSayfasi && !authSayfasi && <AnimatedBackground />}
      <Routes>
        <Route path="/" element={<HomePage {...shared} />} />
        <Route path="/urun/:id" element={<ProductPage {...shared} />} />
        <Route path="/giris" element={<LoginPage />} />
        <Route path="/kayit" element={<RegisterPage />} />
        <Route path="/eposta-dogrula" element={<EmailVerifyPage />} />
        <Route path="/sifremi-unuttum" element={<ForgotPasswordPage />} />
        <Route path="/profil" element={<ProfilePage {...shared} />} />
        <Route path="/favoriler" element={<FavoritesPage {...shared} />} />
        <Route path="/siparisler" element={<OrdersPageWrapper {...shared} />} />
        <Route path="/siparisler/:id" element={<OrderDetailPage {...shared} />} />
        <Route path="/odeme" element={<CheckoutPage {...shared} />} />
        <Route path="/satici/giris" element={<SellerLoginPage />} />
        <Route path="/satici/basvuru" element={<VendorApplyPage />} />
        <Route path="/satici/panel" element={<SellerPanelPage />} />
        <Route path="/admin/yorumlar" element={<AdminReviewsPage {...shared} />} />
      </Routes>
    </>
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
