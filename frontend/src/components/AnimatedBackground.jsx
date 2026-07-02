import { useEffect, useState } from 'react';
import { BG_IMAGES } from '../constants/images';

const SCROLL_RANGE = 1200;
const SCALE_MAX = 1;
const SCALE_MIN = 0.52;

function scrollToScale(scrollY) {
  const progress = Math.min(Math.max(scrollY / SCROLL_RANGE, 0), 1);
  return SCALE_MAX - progress * (SCALE_MAX - SCALE_MIN);
}

export default function AnimatedBackground() {
  const [scale, setScale] = useState(() => scrollToScale(0));

  useEffect(() => {
    let frame = null;
    const update = () => {
      setScale(scrollToScale(window.scrollY));
      frame = null;
    };
    const onScroll = () => {
      if (frame == null) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame != null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="animated-bg" aria-hidden="true">
      <div className="bg-overlay" />
      <div
        className="parallax-photo parallax-lavender-full"
        style={{ transform: `translate(-50%, -50%) scale(${scale.toFixed(4)})` }}
      >
        <img src={BG_IMAGES.lavender} alt="" loading="eager" decoding="async" />
      </div>
    </div>
  );
}
