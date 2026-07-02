import { BG_IMAGES } from '../constants/images';

function PhotoFlag({ src, type, className }) {
  return (
    <div className={`photo-flag ${type} ${className}`}>
      <div className="photo-flag-pole" />
      <div className="photo-flag-sheet">
        <img src={src} alt="" loading="eager" decoding="async" />
      </div>
    </div>
  );
}

export default function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden="true">
      <div className="bg-overlay" />
      <div className="photo-scene">
        <PhotoFlag src={BG_IMAGES.lavender} type="flag-lavender" className="flag-1" />
        <PhotoFlag src={BG_IMAGES.rose} type="flag-rose" className="flag-2" />
        <PhotoFlag src={BG_IMAGES.lavenderAlt} type="flag-lavender" className="flag-3" />
        <PhotoFlag src={BG_IMAGES.roseAlt} type="flag-rose" className="flag-4" />
        <PhotoFlag src={BG_IMAGES.lavender} type="flag-lavender" className="flag-5" />
        <PhotoFlag src={BG_IMAGES.rose} type="flag-rose" className="flag-6" />
      </div>
    </div>
  );
}
