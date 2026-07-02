import { BG_IMAGES } from '../constants/images';

export default function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden="true">
      <div className="bg-overlay" />
      <div className="photo-scene">
        <div className="photo-panel photo-lavender panel-1">
          <img src={BG_IMAGES.lavender} alt="" loading="eager" />
        </div>
        <div className="photo-panel photo-rose panel-2">
          <img src={BG_IMAGES.rose} alt="" loading="eager" />
        </div>
        <div className="photo-panel photo-lavender panel-3">
          <img src={BG_IMAGES.lavender} alt="" loading="lazy" />
        </div>
        <div className="photo-panel photo-rose panel-4">
          <img src={BG_IMAGES.rose} alt="" loading="lazy" />
        </div>
      </div>
    </div>
  );
}
