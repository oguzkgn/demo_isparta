import { useState } from 'react';

const MAX_BOYUT = 900_000;

export default function MediaUpload({ resim, videoUrl, onResim, onVideoUrl }) {
  const [hata, setHata] = useState('');

  const fotoSec = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setHata('Lütfen bir görsel dosyası seçin.');
      return;
    }
    if (file.size > MAX_BOYUT) {
      setHata('Görsel en fazla 900 KB olabilir.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onResim(reader.result);
      setHata('');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="media-upload">
      <label className="media-label">Ürün Fotoğrafı</label>
      <div className="media-row">
        <input type="file" accept="image/*" onChange={fotoSec} />
        <input
          type="url"
          placeholder="veya görsel linki yapıştırın"
          value={resim?.startsWith('data:') ? '' : (resim || '')}
          onChange={(e) => onResim(e.target.value)}
        />
      </div>
      {resim && (
        <div className="media-preview">
          <img src={resim} alt="Önizleme" />
        </div>
      )}
      <label className="media-label">Video Linki (isteğe bağlı)</label>
      <input
        type="url"
        placeholder="YouTube veya video URL"
        value={videoUrl || ''}
        onChange={(e) => onVideoUrl(e.target.value)}
      />
      {hata && <p className="media-error">{hata}</p>}
    </div>
  );
}
