import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';
import { IconHeart, IconMapPin, IconStar } from './icons/Icons';
import { formatPrice, konumMetni } from '../utils/format';

export default function ProductCard({ u, sepeteEkle, favoriMi, favoriToggle }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <button
          type="button"
          className={`card-fav-btn ${favoriMi ? 'active' : ''}`}
          onClick={() => favoriToggle?.(u._id)}
          aria-label={favoriMi ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          <IconHeart filled={favoriMi} size={16} />
        </button>
        <Link to={`/urun/${u._id}`} className="product-image-link">
          <ProductImage
            urun={u}
            badge={u.oneCikan ? <span className="badge">Öne Çıkan</span> : null}
          />
        </Link>
      </div>
      <div className="product-body">
        <div className="product-brand">
          {u.marka}
          {u.saticiAd && <span className="seller-tag">· {u.saticiAd}</span>}
        </div>
        <Link to={`/urun/${u._id}`} className="product-title">{u.ad}</Link>
        <div className="product-location">
          <IconMapPin size={13} />
          <span>{konumMetni(u.konum)}</span>
        </div>
        <div className="product-rating">
          <IconStar size={13} />
          <span>{u.puan?.toFixed(1)}</span>
          <span className="rating-count">({u.yorumSayisi} yorum)</span>
        </div>
        <div className="product-prices">
          <span className="price-now">{formatPrice(u.fiyat)}</span>
          {u.eskiFiyat && <span className="price-old">{formatPrice(u.eskiFiyat)}</span>}
        </div>
        <button type="button" className="add-btn" onClick={() => sepeteEkle(u)}>Sepete Ekle</button>
      </div>
    </article>
  );
}
