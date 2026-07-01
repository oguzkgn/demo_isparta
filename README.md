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

## Deploy

| Platform | Root Directory | Env |
|----------|----------------|-----|
| **Vercel** | `frontend` | `VITE_API_URL` |
| **Render** | `backend` | `MONGO_URI` |

## Özellikler

- Ürün arama, kategori, Isparta mahalle filtresi
- Sepet · Lavanta & gül kategorisi
- Pembe-beyaz / mor-beyaz tema, gül & lavanta arka plan
