# demo_isparta

*Isparta'nın yerel alışveriş platformu* 

Trendyol tarzında bir alışveriş platformu olarak tasarladım amacım yerel firmaları şirketleri vb.ticaret firmalarının e ticarete ayak uydurabilmesi ve teknolojiye adapte olma süreçlerinin hızlandırılması

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

## Deploy (Render — tek servis)

Frontend + API aynı adreste: `https://demo-isparta.onrender.com`

[Render Dashboard](https://dashboard.render.com) → **demo-isparta** → **Environment**:

| Key | Value |
|-----|-------|
| `MONGO_URI` | `mongodb+srv://demo_isparta:SIFRE@cluster0.gfoqtwo.mongodb.net/demo_isparta?retryWrites=true&w=majority` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | (Render otomatik üretebilir veya güçlü bir anahtar) |

**Settings** (Root Directory boş — repo kökü):
- Build: `npm install --prefix frontend && npm run build --prefix frontend && npm install --prefix backend`
- Start: `npm start --prefix backend`
- Health Check: `/api/health`

MongoDB Atlas **Network Access** → `0.0.0.0/0` ekleyin.

## Özellikler

- Ürün arama, kategori, Isparta mahalle filtresi, sıralama
- Ürün detay sayfası
- Kullanıcı kayıt / giriş / profil düzenleme / hesap silme
- Sepet (misafir: localStorage, üye: sunucu)
- Favoriler, sipariş oluşturma ve sipariş geçmişi
- Pembe-beyaz / mor-beyaz tema, gül & lavanta arka plan
