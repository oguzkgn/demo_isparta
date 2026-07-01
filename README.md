# demo_isparta

Isparta'nın yerel alışveriş platformu — Trendyol tarzı, pembe/mor tema, lavanta & gül detayları.

## Proje yapısı

```
demo_isparta/
├── backend/     → Express + MongoDB API (Render)
└── frontend/    → React + Vite (Vercel)
```

## Lokal çalıştırma

```bash
cd backend && npm install && npm start
cd frontend && npm install && npm run dev
```

- Frontend: http://localhost:3001
- API: http://localhost:5002

## Deploy (Render)

### 1. MongoDB Atlas

1. [MongoDB Atlas](https://cloud.mongodb.com) → **Database Access** → kullanıcı: `demo_isparta`, şifre: (Atlas'ta belirlediğiniz)
2. **Network Access** → `0.0.0.0/0` ekle (Render IP'leri değişkendir)
3. **Connect** → Drivers → connection string kopyala:
   ```
   mongodb+srv://demo_isparta:SIFRE@cluster0.xxxxx.mongodb.net/demo_isparta?retryWrites=true&w=majority
   ```

### 2. Render — API (`demo-isparta`)

[Render Dashboard](https://dashboard.render.com) → servis **demo-isparta** → **Environment**:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Atlas connection string (yukarıdaki) |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://demo-isparta-web.onrender.com` |

**Settings** kontrol:
- Root Directory: `backend`
- Build: `npm install`
- Start: `npm start`
- Health Check: `/api/health`

GitHub repo bağlıysa `main` branch push otomatik deploy tetikler.

### 3. Render — Frontend (`demo-isparta-web`)

Blueprint veya yeni **Static Site**:
- Root Directory: `frontend`
- Build: `npm install && npm run build`
- Publish: `dist`
- Env: `VITE_API_URL=https://demo-isparta.onrender.com`

Canlı adres: `https://demo-isparta-web.onrender.com`

### 4. Test

```bash
curl https://demo-isparta.onrender.com/api/health
curl https://demo-isparta.onrender.com/api/urunler
```

İlk istek free planda 30–60 sn sürebilir (cold start).

## Deploy (Vercel — alternatif frontend)

| Platform | Root Directory | Env |
|----------|----------------|-----|
| **Vercel** | `frontend` | `VITE_API_URL=https://demo-isparta.onrender.com` |
| **Render** | `backend` | `MONGO_URI`, `FRONTEND_URL` |

## Özellikler

- Ürün arama, kategori, Isparta mahalle filtresi
- Sepet · Lavanta & gül kategorisi
- Pembe-beyaz / mor-beyaz tema, gül & lavanta arka plan
