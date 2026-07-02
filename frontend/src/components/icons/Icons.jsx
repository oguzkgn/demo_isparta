const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function IconHeart({ filled, size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.75}
      />
    </svg>
  );
}

export function IconCart({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...base} d="M6 6h15l-1.5 9h-12L6 6z" />
      <path {...base} d="M6 6 5 3H2" />
      <circle {...base} cx="9" cy="20" r="1" fill="currentColor" stroke="none" />
      <circle {...base} cx="18" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconUser({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...base} d="M20 21a8 8 0 0 0-16 0" />
      <circle {...base} cx="12" cy="8" r="4" />
    </svg>
  );
}

export function IconPackage({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...base} d="M12 22 3 17V7l9-5 9 5v10l-9 5z" />
      <path {...base} d="M12 22V12" />
      <path {...base} d="m3 7 9 5 9-5" />
    </svg>
  );
}

export function IconSearch({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <circle {...base} cx="11" cy="11" r="7" />
      <path {...base} d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconMapPin({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...base} d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
      <circle {...base} cx="12" cy="11" r="2" />
    </svg>
  );
}

export function IconStore({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...base} d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
      <path {...base} d="M3 9h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z" />
      <path {...base} d="M9 21V12h6v9" />
    </svg>
  );
}

export function IconStar({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" stroke="none" d="m12 2 3 7h7l-5.5 4.5 2 7L12 17l-6.5 3.5 2-7L2 9h7l3-7z" />
    </svg>
  );
}

export function IconTag({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...base} d="M20 12 12 20l-8-8V4h8l8 8z" />
      <circle {...base} cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
