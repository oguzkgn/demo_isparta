import { useState } from 'react';

const MAX_FOTO = 900_000;
const MAX_VIDEO = 4_000_000;

export default function MediaUpload({ resim, videoUrl, onResim, onVideoUrl }) {
  const [hata, setHata] = useState('');

  const fotoSec = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setHata('Lütfen bir görsel dosyası seçin.');
      return;
    }
    if (file.size > MAX_FOTO) {
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

  const videoSec = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setHata('Lütfen bir video dosyası seçin (MP4, WebM).');
      return;
    }
    if (file.size > MAX_VIDEO) {
      setHata('Video en fazla 4 MB olabilir.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onVideoUrl(reader.result);
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

      <label className="media-label">Ürün Videosu (isteğe bağlı)</label>
      <div className="media-row">
        <input type="file" accept="video/mp4,video/webm,video/*" onChange={videoSec} />
        <input
          type="url"
          placeholder="veya YouTube / video linki"
          value={videoUrl?.startsWith('data:') ? '' : (videoUrl || '')}
          onChange={(e) => onVideoUrl(e.target.value)}
        />
      </div>
      {videoUrl && (
        <div className="media-preview media-preview-video">
          {videoUrl.startsWith('data:') ? (
            <video src={videoUrl} controls muted playsInline />
          ) : (
            <a href={videoUrl} target="_blank" rel="noreferrer">Video linkini aç</a>
          )}
        </div>
      )}
      {hata && <p className="media-error">{hata}</p>}
    </div>
  );
}
