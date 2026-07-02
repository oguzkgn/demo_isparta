import MediaUpload from './MediaUpload';

export default function ListingFormFields({ form, setForm, kategoriler, konumlar }) {
  return (
    <>
      <label>
        İlan Başlığı
        <input
          value={form.ad}
          onChange={(e) => setForm({ ...form, ad: e.target.value })}
          required
          placeholder="Örn: Isparta Lavanta Kolonyası 400ml"
        />
      </label>
      <MediaUpload
        resim={form.resim}
        videoUrl={form.videoUrl}
        onResim={(v) => setForm({ ...form, resim: v })}
        onVideoUrl={(v) => setForm({ ...form, videoUrl: v })}
      />
      <label>
        Ürün Açıklaması
        <textarea
          value={form.aciklama}
          onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
          rows={5}
          placeholder="Ürününüzü detaylı anlatın: malzeme, kullanım, teslimat bilgisi..."
          required
        />
      </label>
      <div className="form-row">
        <label>
          Fiyat (TL)
          <input type="number" min="1" value={form.fiyat} onChange={(e) => setForm({ ...form, fiyat: e.target.value })} required />
        </label>
        <label>
          Stok
          <input type="number" min="0" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Marka
          <input value={form.marka} onChange={(e) => setForm({ ...form, marka: e.target.value })} placeholder="Mağaza markanız" />
        </label>
        <label>
          Kategori
          <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
            {kategoriler.map((k) => <option key={k.id} value={k.id}>{k.ad}</option>)}
            {!kategoriler.length && <option value="lavanta">Lavanta & Gül</option>}
          </select>
        </label>
      </div>
      <label>
        Mahalle
        <select value={form.konum} onChange={(e) => setForm({ ...form, konum: e.target.value })}>
          {konumlar.map((k) => <option key={k} value={k}>{k.replace(/^\s*⭐\s*/, '')}</option>)}
        </select>
      </label>
    </>
  );
}
