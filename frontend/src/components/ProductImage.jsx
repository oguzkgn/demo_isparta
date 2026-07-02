import { productImageSrc } from '../constants/images';

export default function ProductImage({ urun, className = '', badge }) {
  return (
    <div className={`product-image ${className}`.trim()}>
      {badge}
      <img src={productImageSrc(urun)} alt={urun?.ad || 'Ürün'} loading="lazy" />
    </div>
  );
}
