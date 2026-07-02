import { useEffect, useState } from 'react';
import { apiUyandir } from '../api/client';

/** Render cold start — arka planda API'yi uyandırır */
export default function ApiWarmup() {
  const [durum, setDurum] = useState('uyandiriliyor');

  useEffect(() => {
    let iptal = false;
    apiUyandir()
      .then(() => { if (!iptal) setDurum('hazir'); })
      .catch(() => { if (!iptal) setDurum('hata'); });
    return () => { iptal = true; };
  }, []);

  if (durum !== 'uyandiriliyor') return null;

  return (
    <div className="api-warmup-banner" role="status">
      Sunucu bağlantısı kuruluyor… İlk açılış biraz sürebilir.
    </div>
  );
}
