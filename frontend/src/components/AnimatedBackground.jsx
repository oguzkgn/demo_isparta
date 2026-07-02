import { useEffect, useState } from 'react';
import { BG_IMAGES } from '../constants/images';

const SCROLL_RANGE = 900;
const TOP_BASE = 1.06;
const TOP_MIN = 0.82;
const BOTTOM_BASE = 0.88;
const BOTTOM_MAX = 1.14;

function scrollToScales(scrollY) {
  const progress = Math.min(Math.max(scrollY / SCROLL_RANGE, 0), 1);
  return {
    top: TOP_BASE - progress * (TOP_BASE - TOP_MIN),
    bottom: BOTTOM_BASE + progress * (BOTTOM_MAX - BOTTOM_BASE)
  };
}

export default function AnimatedBackground() {
  const [scales, setScales] = useState(() => scrollToScales(0));

  useEffect(() => {
    let frame = null;
    const update = () => {
      setScales(scrollToScales(window.scrollY));
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
        className="parallax-photo parallax-lavender"
        style={{ transform: `scale(${scales.top.toFixed(4)})` }}
      >
        <img src={BG_IMAGES.lavender} alt="" loading="eager" decoding="async" />
      </div>
      <div
        className="parallax-photo parallax-rose"
        style={{ transform: `scale(${scales.bottom.toFixed(4)})` }}
      >
        <img src={BG_IMAGES.rose} alt="" loading="eager" decoding="async" />
      </div>
    </div>
  );
}
