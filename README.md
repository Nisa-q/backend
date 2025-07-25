# Gerçek Zamanlı Katana Crawler Projesi

Next.js ve Flask tabanlı, Katana ile gerçek zamanlı URL toplama ve yönetim sistemi.

## Özellikler
- Katana ile otomatik web crawler (backend üzerinden)
- Bulunan URL'leri listeleme, filtreleme ve server-side pagination (frontend)
- Crawler geçmişi ve job sonuçları
- Modern arayüz (Next.js + Tailwind CSS)
- Docker ile kolay kurulum

## Proje Yapısı

```
crawler-projesi/
├── crawler-backend/                # Flask + Katana backend
│   ├── app.py                      # Ana Flask uygulaması ve API endpoint'leri
│   ├── Dockerfile                  # Backend için Docker imajı
│   ├── requirements.txt            # Python bağımlılıkları
│   └── venv/                       # Sanal Python ortamı (geliştirici için)
│
├── crawler-frontend/               # Next.js frontend
│   ├── Dockerfile                  # Frontend için Docker imajı
│   ├── package.json                # NPM bağımlılıkları ve scriptler
│   ├── docker-compose.yml          # Tüm sistemi başlatmak için Docker Compose dosyası
│   ├── public/                     # Statik dosyalar (ikonlar, görseller)
│   └── src/
│       ├── app/
│       │   ├── page.js             # Ana dashboard sayfası
│       │   ├── layout.js           # Genel layout
│       │   ├── loading.js          # Yükleniyor ekranı
│       │   ├── globals.css         # Global stiller
│       │   ├── urls/               # URL tablosu sayfası
│       │   │   └── page.js
│       │   ├── history/            # Crawler geçmişi sayfası
│       │   │   └── page.js
│       │   ├── commands/           # Komut çıktıları sayfası
│       │   │   └── page.js
│       │   └── api/
│       │       └── crawler/
│       │           ├── urls/           # /api/crawler/urls endpoint'i (proxy)
│       │           │   └── route.js
│       │           ├── total_urls/     # /api/crawler/total_urls endpoint'i (proxy)
│       │           │   └── route.js
│       │           ├── history/        # /api/crawler/history endpoint'i (proxy)
│       │           ├── run/            # /api/crawler/run endpoint'i (proxy)
│       │           └── job_result/     # /api/crawler/job_result endpoint'i (proxy)
│       ├── components/
│       │   └── ui/                 # UI bileşenleri (Button, Card, Table, Input, vs.)
│       └── lib/                    # Yardımcı fonksiyonlar
│
├── docker-compose.yml              # Tüm sistemi başlatmak için ana Docker Compose dosyası
└── README.md                       # Proje dokümantasyonu (bu dosya)
```
- **crawler-backend/**: Flask API, Katana entegrasyonu ve tüm backend iş mantığı burada.
- **crawler-frontend/**: Next.js tabanlı modern arayüz, API proxy endpoint'leri ve UI bileşenleri burada.
- **docker-compose.yml**: Tüm sistemi tek komutla başlatmak için.
- **README.md**: Proje dokümantasyonu.

## Ortam Değişkenleri

### Frontend (crawler-frontend/.env.local)
Bir `.env.local` dosyası oluşturun:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (crawler-backend/.env)
Varsayılan olarak özel bir .env gerekmez. Katana binary'si backend Docker imajında otomatik kurulur.

## Kurulum

### Backend
Backend dizinine gidin:
```
cd crawler-backend
```
Docker ile başlatmak için:
```
docker-compose down
docker-compose up --build
```
Backend varsayılan olarak http://localhost:5000 adresinde çalışır.

### Frontend
Frontend dizinine gidin:
```
cd crawler-frontend
```
Bağımlılıkları yükleyin:
```
npm install
```
Geliştirici modunda başlatın:
```
npm run dev
```
Frontend varsayılan olarak http://localhost:3000 adresinde çalışır.

## Kullanım
- http://localhost:3000 adresini tarayıcıda açın.
- URL tablosunda bulunan URL'leri görebilir, filtreleyebilir ve sayfalar arasında gezebilirsiniz.
- Crawler geçmişi ve job sonuçlarını inceleyebilirsiniz.
- Yeni URL ekleme frontend arayüzünde yoktur; crawl işlemleri backend üzerinden otomatik yapılır.

## Teknolojiler
- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Flask, Python, Katana (ProjectDiscovery)
- **Gerçek Zamanlı Crawler:** Katana
- **Container:** Docker, Docker Compose

## Notlar
- Katana büyük sitelerde uzun sürebilir, timeout 120 saniyedir.
- Tüm veriler backend'de bellek içindedir (in-memory).
- Frontend ve backend ayrı Docker konteynerlerinde çalışır. 