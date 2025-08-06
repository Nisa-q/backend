# WEB CRAWLER PROJESİ - DETAYLI ANALİZ

## 🎯 PROJE GENEL BAKIŞ

Bu proje, **Katana** aracını kullanarak web sitelerini tarayan ve bulunan URL'leri yöneten bir **Full-Stack Web Crawler** uygulamasıdır.

### Teknoloji Stack'i:
- **Backend**: Python Flask + SQLite
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Crawler Tool**: Katana (ProjectDiscovery)
- **Database**: SQLite
- **State Management**: TanStack Query (React Query)

---

## 🏗️ BACKEND MİMARİSİ (Flask - Python)

### Ana Dosya: `app.py`

#### Kullanılan Kütüphaneler:
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import uuid, time, subprocess, requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
```

#### Veritabanı Modelleri:

1. **Job Tablosu**:
   - `id`: Benzersiz görev kimliği (UUID)
   - `result`: Görev sonucu
   - `job_type`: Görev tipi (command_runner/katana_crawler)
   - `command`: Çalıştırılan komut
   - `url`: Taranan URL
   - `found_urls`: Bulunan URL'ler (JSON string)
   - `created_at`: Oluşturulma zamanı

2. **History Tablosu**:
   - Tüm görevlerin geçmişini tutar
   - Durum bilgisi, sonuç sayısı, zaman damgası

3. **Url Tablosu**:
   - Bulunan tüm URL'leri saklar
   - Durum bilgisi (success/pending)
   - Taranma zamanı

4. **Points Tablosu**:
   - Puan sistemi (gelecek özellikler için)

#### Ana Fonksiyonlar:

1. **`katana_crawl(site_url)`**:
   ```python
   def katana_crawl(site_url):
       result = subprocess.check_output([
           "katana", "-u", site_url, "-o", "stdout"
       ], stderr=subprocess.STDOUT, timeout=120, text=True)
   ```
   - Katana aracını subprocess ile çalıştırır
   - 120 saniye timeout
   - Bulunan URL'leri parse eder

2. **API Endpoint'leri**:
   - `POST /run_job`: Yeni görev başlatır
   - `GET /job_result/<task_id>`: Görev sonucunu getirir
   - `GET /history`: Görev geçmişini listeler
   - `GET /urls`: URL listesini getirir (sayfalama ile)
   - `GET /total_urls`: Toplam URL sayısı
   - `GET /points`: Puan bilgisi

---

## 🎨 FRONTEND MİMARİSİ (Next.js + React)

### Proje Yapısı:
```
src/
├── app/
│   ├── api/crawler/          # API route handlers
│   ├── commands/            # Komut çalıştırma sayfası
│   ├── history/             # Geçmiş sayfası
│   ├── urls/                # URL listesi sayfası
│   ├── globals.css          # Global stiller
│   ├── layout.js            # Ana layout
│   └── page.js              # Ana sayfa (Dashboard)
└── components/ui/           # UI bileşenleri
```

### API Route Handlers (Next.js App Router):

1. **`history.js`**: Flask backend'den geçmiş verilerini proxy eder
2. **`job-result.js`**: Görev sonuçlarını getirir
3. **`run.js`**: Yeni görev başlatır
4. **`total-urls.js`**: Toplam URL sayısını getirir
5. **`urls.js`**: URL listesi ve yeni crawl işlemleri

### Ana Sayfalar:

#### 1. Dashboard (`page.js`):
- Toplam çalıştırma sayısı
- Toplam URL sayısı
- Son çalıştırma zamanı
- Diğer sayfalara navigasyon

#### 2. Commands Sayfası (`commands/page.js`):
- **Komut Çalıştırıcı**: Terminal komutları çalıştırır
- **Katana Crawler**: URL girip crawl başlatır
- Sonuçları real-time gösterir
- URL geçmişini tabloda listeler

#### 3. History Sayfası (`history/page.js`):
- Tüm crawler geçmişini gösterir
- Durum bilgileri (Tamamlandı/Başarısız/Çalışıyor)
- İstatistikler (Toplam, Başarılı, Başarısız)

#### 4. URLs Sayfası (`urls/page.js`):
- Bulunan tüm URL'leri listeler
- Sayfalama (10'ar 10'ar)
- Arama ve filtreleme
- Durum bazlı filtreleme

---

## ⚙️ KATANA CRAWLER İŞLEYİŞİ

### Katana Nedir?
Katana, ProjectDiscovery tarafından geliştirilen hızlı bir web crawler'dır.

### Crawl Butonu İşlem Sırası:

1. **Frontend'de Buton Tıklanır**:
   ```javascript
   const runKatana = async () => {
     const response = await fetch("/api/crawler/run", {
       method: "POST",
       body: JSON.stringify({ job_name: "katana_crawler", url })
     });
   }
   ```

2. **Next.js API Route (`run.js`)**:
   ```javascript
   const flaskRes = await fetch('http://backend:5000/run_job', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(body)
   });
   ```

3. **Flask Backend (`app.py`)**:
   ```python
   elif job_name == "katana_crawler":
       url = data.get("url")
       found_urls = katana_crawl(url)  # Katana çalıştırılır
   ```

4. **Katana Subprocess Çalıştırılır**:
   ```python
   result = subprocess.check_output([
       "katana", "-u", site_url, "-o", "stdout"
   ], stderr=subprocess.STDOUT, timeout=120, text=True)
   ```

5. **URL'ler Parse Edilir**:
   ```python
   found_urls = set()
   for line in result.splitlines():
       if line.startswith("http://") or line.startswith("https://"):
           found_urls.add(line)
   ```

6. **Veritabanına Kaydedilir**:
   - Job tablosuna görev bilgisi
   - History tablosuna geçmiş kaydı
   - Url tablosuna bulunan URL'ler
   - Yeni URL'ler existing_urls ile karşılaştırılır

7. **Frontend'e Sonuç Döner**:
   - Task ID ile birlikte başarı mesajı
   - URL listesi güncellenir
   - Geçmiş sayfası güncellenir

---

## 🗄️ VERİTABANI İŞLEMLERİ

### SQLite Yapılandırması:
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///crawler.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
```

### Veri Akışı:
1. **Crawl İşlemi Başlar** → Job tablosuna kayıt
2. **Katana Çalışır** → URL'ler bulunur
3. **URL'ler Filtrelenir** → Mevcut URL'ler çıkarılır
4. **Yeni URL'ler Kaydedilir** → Url tablosuna eklenir
5. **Geçmiş Güncellenir** → History tablosuna kayıt

---

## 🎨 FRONTEND TEKNOLOJİLERİ

### Tailwind CSS v4:
- Modern utility-first CSS framework
- Custom color system ve spacing
- Responsive design
- Dark mode desteği

### TanStack Query:
```javascript
const { data: history, isLoading, error } = useQuery({
  queryKey: ["crawler-history"],
  queryFn: async () => {
    const response = await fetch("/api/crawler/history");
    return response.json();
  }
});
```

### UI Bileşenleri:
- **Radix UI**: Accessible component primitives
- **Lucide React**: Modern icon library
- **Class Variance Authority**: Type-safe component variants

---

## 🔄 PROJE ÇALIŞMA AKIŞI

### 1. Uygulama Başlatma:
```bash
# Backend
python app.py  # Port 5000

# Frontend  
npm run dev    # Port 3000
```

### 2. Kullanıcı Etkileşimi:
1. Ana sayfada dashboard görüntülenir
2. Commands sayfasında URL girilir
3. "Katana ile Crawl" butonuna basılır
4. İşlem başlar, task ID döner
5. Sonuçlar real-time güncellenir

### 3. Veri Yönetimi:
- Tüm işlemler SQLite'da saklanır
- API'ler RESTful yapıda
- Frontend state management ile senkronize

---

## 🛠️ KULLANILAN ARAÇLAR VE KÜTÜPHANELER

### Backend:
- **Flask**: Web framework
- **SQLAlchemy**: ORM
- **Flask-CORS**: Cross-origin requests
- **BeautifulSoup**: HTML parsing
- **Subprocess**: Katana çalıştırma
- **UUID**: Benzersiz ID'ler
- **Regex**: URL pattern matching

### Frontend:
- **Next.js 15**: React framework
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **TanStack Query**: Server state
- **Radix UI**: Component primitives

### DevOps:
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Git**: Version control

---

## 📊 PERFORMANS VE GÜVENLİK

### Performans Optimizasyonları:
- Sayfalama ile büyük veri setleri
- Lazy loading
- Caching ile API çağrıları
- Debounced search

### Güvenlik Önlemleri:
- CORS yapılandırması
- Input validation
- SQL injection koruması (SQLAlchemy ORM)
- Timeout değerleri

---

## 🎯 STAJ DEFTERİ İÇİN ÖNEMLİ NOKTALAR

### Öğrenilen Teknolojiler:
1. **Full-Stack Development**: Frontend + Backend entegrasyonu
2. **API Design**: RESTful API tasarımı
3. **Database Management**: SQLite ile veri yönetimi
4. **Process Management**: Subprocess ile external tool entegrasyonu
5. **Modern React**: Hooks, Context, Query management
6. **CSS Framework**: Tailwind CSS ile modern styling
7. **TypeScript**: Type-safe development

### Karşılaşılan Zorluklar:
1. **Async Operations**: Crawler işlemlerinin asenkron yönetimi
2. **Error Handling**: Timeout ve hata durumları
3. **State Management**: Frontend-backend senkronizasyonu
4. **Performance**: Büyük veri setlerinin optimizasyonu

### Çözüm Yaklaşımları:
1. **Modüler Mimari**: Ayrı backend/frontend
2. **API Gateway Pattern**: Next.js API routes
3. **Database Normalization**: İlişkisel tablo tasarımı
4. **Component Architecture**: Reusable UI components

Bu proje, modern web development'in tüm aşamalarını kapsayan kapsamlı bir örnektir!