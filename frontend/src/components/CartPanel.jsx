import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export default function CartPanel() {
  const { kullanici } = useAuth();
  const {
    sepet, sepetAcik, setSepetAcik, sepettenCikar,
    adetGuncelle, siparisTamamla, toplam
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!kullanici) {
      setSepetAcik(false);
      navigate('/giris');
      return;
    }
    try {
      await siparisTamamla();
      setSepetAcik(false);
      alert('Siparişiniz alındı! 🌸');
      navigate('/siparisler');
    } catch (err) {
      alert(err.response?.data?.mesaj || err.message);
    }
  };

  return (
    <>
      <div className={`cart-overlay ${sepetAcik ? 'open' : ''}`} onClick={() => setSepetAcik(false)} />
      <aside className={`cart-panel ${sepetAcik ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>🛒 Sepetim</h2>
          <button type="button" onClick={() => setSepetAcik(false)} className="close-btn">✕</button>
        </div>
        <div className="cart-items">
          {sepet.length === 0 ? (
            <div className="empty-cart"><span>🌸</span>Sepetiniz boş</div>
          ) : sepet.map((x) => (
            <div key={x._id} className="cart-item">
              <div className="cart-item-icon">{x.resim}</div>
              <div className="cart-item-info">
                <h4>{x.ad}</h4>
                <p>{formatPrice(x.fiyat)}</p>
                <div className="cart-qty">
                  <button type="button" onClick={() => adetGuncelle(x._id, Math.max(1, x.adet - 1))}>−</button>
                  <span>{x.adet}</span>
                  <button type="button" onClick={() => adetGuncelle(x._id, x.adet + 1)}>+</button>
                </div>
              </div>
              <button type="button" onClick={() => sepettenCikar(x._id)} className="remove-btn">✕</button>
            </div>
          ))}
        </div>
        {sepet.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Toplam</span>
              <span>{formatPrice(toplam)}</span>
            </div>
            <button type="button" className="checkout-btn" onClick={handleCheckout}>
              {kullanici ? 'Siparişi Tamamla' : 'Giriş Yap ve Sipariş Ver'}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
