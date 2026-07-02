import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { productImageSrc } from '../constants/images';
import { IconCart } from './icons/Icons';
import EmptyState from './EmptyState';

export default function CartPanel() {
  const { kullanici } = useAuth();
  const { sepet, sepetAcik, setSepetAcik, sepettenCikar, adetGuncelle, toplam } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setSepetAcik(false);
    if (!kullanici) { navigate('/giris'); return; }
    navigate('/odeme');
  };

  return (
    <>
      <div className={`cart-overlay ${sepetAcik ? 'open' : ''}`} onClick={() => setSepetAcik(false)} />
      <aside className={`cart-panel ${sepetAcik ? 'open' : ''}`}>
        <div className="cart-header">
          <h2><IconCart size={20} /> Sepetim</h2>
          <button type="button" onClick={() => setSepetAcik(false)} className="close-btn" aria-label="Kapat">×</button>
        </div>
        <div className="cart-items">
          {sepet.length === 0 ? (
            <EmptyState title="Sepetiniz boş" description="Alışverişe başlamak için ürün ekleyin." />
          ) : sepet.map((x) => (
            <div key={x._id} className="cart-item">
              <div className="cart-item-thumb">
                <img src={productImageSrc(x)} alt={x.ad} />
              </div>
              <div className="cart-item-info">
                <h4>{x.ad}</h4>
                <p>{formatPrice(x.fiyat)}</p>
                <div className="cart-qty">
                  <button type="button" onClick={() => adetGuncelle(x._id, Math.max(1, x.adet - 1))}>−</button>
                  <span>{x.adet}</span>
                  <button type="button" onClick={() => adetGuncelle(x._id, x.adet + 1)}>+</button>
                </div>
              </div>
              <button type="button" onClick={() => sepettenCikar(x._id)} className="remove-btn" aria-label="Kaldır">×</button>
            </div>
          ))}
        </div>
        {sepet.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Toplam</span>
              <span>{formatPrice(toplam)}</span>
            </div>
            <p className="kargo-info">
              {toplam >= 300 ? 'Ücretsiz kargo' : `${formatPrice(300 - toplam)} daha ekleyin, kargo bedava`}
            </p>
            <button type="button" className="checkout-btn" onClick={handleCheckout}>
              {kullanici ? 'Ödemeye Geç' : 'Giriş Yap ve Devam Et'}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
