export default function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden="true">
      <div className="wave-scene">
        <div className="wave-flag wave-lavender wave-1">
          <div className="flag-face flag-front" />
          <div className="flag-face flag-back" />
        </div>
        <div className="wave-flag wave-rose wave-2">
          <div className="flag-face flag-front" />
          <div className="flag-face flag-back" />
        </div>
        <div className="wave-flag wave-lavender wave-3">
          <div className="flag-face flag-front" />
          <div className="flag-face flag-back" />
        </div>
        <div className="wave-flag wave-rose wave-4">
          <div className="flag-face flag-front" />
          <div className="flag-face flag-back" />
        </div>
      </div>
      <div className="floating-petals">
        {['🌸', '🌹', '💜', '🌿', '🌺', '🪻'].map((icon, i) => (
          <span key={i} className={`petal petal-${i + 1}`}>{icon}</span>
        ))}
      </div>
    </div>
  );
}
