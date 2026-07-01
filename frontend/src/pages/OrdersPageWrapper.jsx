import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrders } from '../api/client';
import { useAuth } from '../context/AuthContext';
import OrdersPageView from './OrdersPage';

export default function OrdersPageWrapper(props) {
  const { kullanici } = useAuth();
  const navigate = useNavigate();
  const [siparisler, setSiparisler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (!kullanici) { navigate('/giris'); return; }
    fetchOrders()
      .then(setSiparisler)
      .catch(() => setSiparisler([]))
      .finally(() => setYukleniyor(false));
  }, [kullanici, navigate]);

  if (!kullanici) return null;
  return <OrdersPageView {...props} siparisler={siparisler} yukleniyor={yukleniyor} />;
}
