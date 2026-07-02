import { BG_IMAGES } from '../constants/images';

export default function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden="true">
      <img
        className="animated-bg-image"
        src={BG_IMAGES.lavender}
        alt=""
        loading="eager"
        decoding="async"
      />
      <div className="bg-overlay" />
    </div>
  );
}
