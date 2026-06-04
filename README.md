# Veri-Yapilari-Proje
# 🚌 Akıllı Toplu Taşıma ve Navigasyon Sistemi

Bir şehrin toplu taşıma ağını graf yapısı ile modelleyen, en kısa rotayı hesaplayan ve harita üzerinde görselleştiren akıllı navigasyon sistemi.

---

## 👥 Ekip

```text
+----------------+-------------------+---------------+------------+--------------------------------------------------------------+
| Geliştirici    | İsim              | Github İsmi   | Öğrenci No | Odak Alanı                                                   |
+----------------+-------------------+---------------+------------+--------------------------------------------------------------+
| 1. Geliştirici | Eylem Cafcav      | eylem837      | 032490074  | KdTree - Mekansal Arama (C#)                                 |
| 2. Geliştirici | Zeynep Özer       | Zeynep-zer    | 032490068  | Multigraph, MinHeap, Hashtable - Çekirdek Veri Yapıları (C#) |
| 3. Geliştirici | Mehmet Alp Bilgin | cryobyte-py   | 032490077  | A*, KNN, Rota Analizi Algoritmaları (Python)                 |
| 4. Geliştirici | Burak Şenol       | Burakss06     | 032490072  | Sentetik Veri Üretimi ve AI Servisi (Python/FastAPI)         |
| 5. Geliştirici | Emre Korkut       | GuardinTheDev | 032490069  | React GUI, Harita Entegrasyonu, Sistem Birleştirme           |
+----------------+-------------------+---------------+------------+--------------------------------------------------------------+
```

---

## 🏗️ Sistem Mimarisi

```
┌─────────────────────┐        ┌──────────────────────────┐
│   React Frontend    │◄──────►│   C# Backend (ASP.NET)   │
│   Port: 5173        │        │   Port: 5000             │
│   Leaflet Harita    │        │                          │
│   OSRM Rota Çizimi  │        │   Veri Yapıları:         │
└─────────────────────┘        │   - Multigraph           │
                                │   - MinHeap              │
                                │   - Hashtable            │
                                │   - KdTree               │
                                └──────────────────────────┘

┌──────────────────────────┐
│   Python AI Servisi      │
│   FastAPI — Port: 8000   │
│   - A*             │
│   - KNN                  │
│   - Rota Maliyet Analizi │
└──────────────────────────┘
```

**Veri Akışı:**
1. `generator.py` çalışır → `test_sehir.json` ve `test_hatlar.json` üretilir
2. C# backend JSON'ları okur → Hashtable ve KdTree'ye yükler
3. Python servisi JSON'ları okur → kendi veri yapılarına yükler
4. React frontend her iki servise istek atar → Leaflet haritasında gösterir

---

## 🚀 Projeyi Başlatma

### Ön Koşul
- [Docker](https://www.docker.com/) kurulu olmalı

### Tek Komutla Başlat

```bash
docker-compose up --build
```

Bu komut otomatik olarak:
- Python servisi ile sentetik veri üretir
- C# backend'i derler ve başlatır
- React frontend'i başlatır

### Servis Adresleri

| Servis | Adres |
|---|---|
| Frontend (React) | http://localhost:5173 |
| Backend (C# API) | http://localhost:5000 |
| AI Servisi (Python) | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

---

## 📦 Proje Yapısı

```
Veri-Yap-lar-Proje/
│
├── backend_core_graph/          → C# Backend
│   ├── Durak.cs                 → Durak modeli (düğüm/vertex)
│   ├── Hat.cs                   → Hat modeli (kenar/edge)
│   ├── Multigraph.cs            → Graf yapısı
│   ├── MinHeap.cs               → A* için öncelik kuyruğu
│   ├── Hashtable.cs             → O(1) durak erişimi
│   ├── KdTree.cs                → Mekansal arama ağacı
│   ├── KdTreeNode.cs            → KdTree düğüm modeli
│   ├── Program.cs               → ASP.NET API endpoint'leri
│   └── Dockerfile
│
├── gui/                         → React Frontend
│   └── src/
│       ├── App.jsx              → Ana uygulama (Leaflet harita)
│       └── main.jsx
│   └── Dockerfile
│
├── python_scripts/              → Python AI Servisi
│   ├── ai_service.py            → FastAPI servisi
│   ├── generator.py             → Sentetik veri üretici
│   ├── test_sehir.json          → Üretilen durak verileri
│   ├── test_hatlar.json         → Üretilen hat verileri
│   ├── algoritmalar/
│   │   ├── a_star.py          → En kısa yol algoritması
│   │   ├── knn.py               → K en yakın komşu
│   │   └── rota.py              → Rota maliyet analizi
│   ├── veri_yapilari/           → Python veri yapıları
│   ├── docs/
│   │   ├── karmasiklik_analizi.md
│   │   ├── api_dokumantasyonu.md
│   │   └── ai_prompt_dokumu.md
│   ├── requirements.txt
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## 🔌 C# Backend API Endpoint'leri (Port: 5000)

| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/api/duraklar` | Hashtable'dan tüm durakları listeler |
| GET | `/api/hatlar` | Tüm hatları listeler |
| GET | `/api/enyakin-durak?lat=40.22&lng=28.90` | KdTree ile en yakın durağı bulur |
| GET | `/api/duraktan-gecen-hatlar?id=1` | Durağa bağlı hatları listeler |
| POST | `/api/rota-bul` | Başlangıç-hedef arası rota döner |

**POST /api/rota-bul örnek istek:**
```json
{
  "kullanici_x": 40.22,
  "kullanici_y": 28.90,
  "baslangic_id": 1,
  "hedef_id": 10
}
```

---

## 🐍 Python AI Servisi Endpoint'leri (Port: 8000)

| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/saglik` | Servis durumu ve istatistikler |
| GET | `/duraklar` | Tüm durakları listeler |
| GET | `/duraklar/{id}` | Tek durak detayı ve komşuları |
| GET | `/hatlar` | Tüm hatları listeler |
| POST | `/en-yakin` | KNN ile en yakın K durağı bulur |
| POST | `/rota-hesapla` | A* ile rota hesaplar |
| POST | `/tam-rota` | KNN + A* ile tam rota optimizasyonu |

---

## 🗂️ Veri Yapıları ve Big-O Analizi

### Multigraph (C# + Python)
Toplu taşıma ağını Multigraph olarak modelleyen yapı. Aynı iki durak arasında birden fazla hat desteklenir.

| İşlem | Ortalama | En Kötü |
|---|---|---|
| Durak Ekleme | O(1) | O(1) |
| Hat Ekleme | O(1) | O(1) |
| Komşu Getirme | O(E) | O(E) |
| Uzay Karmaşıklığı | O(V+E) | O(V+E) |

---

### MinHeap (C# + Python)
A* algoritması için **sıfırdan** yazılmıştır. Hazır kütüphane kullanılmamıştır.

| İşlem | Ortalama | En Kötü |
|---|---|---|
| Insert (ekle) | O(log N) | O(log N) |
| RemoveMin (cikar) | O(log N) | O(log N) |
| Peek | O(1) | O(1) |
| Uzay Karmaşıklığı | O(N) | O(N) |

---

### Hashtable (C# + Python)
1000+ durak arasında O(1) erişim sağlar. Hash fonksiyonu: `id % 1009`. Collision çözümü: Linear Probing.

| İşlem | Ortalama | En Kötü |
|---|---|---|
| Ekleme | O(1) | O(N) |
| Arama | O(1) | O(N) |
| Uzay Karmaşıklığı | O(N) | O(N) |

---

### KdTree (C# + Python)
Kullanıcı konumuna en yakın durağı hızlıca bulur. Her seviyede X veya Y eksenine göre uzayı ikiye böler.

| İşlem | Ortalama | En Kötü |
|---|---|---|
| Ekleme | O(log N) | O(N) |
| En Yakın Arama | O(log N) | O(N) |
| Uzay Karmaşıklığı | O(N) | O(N) |

---

### A* Algoritması
MinHeap ile çalışan en kısa yol algoritması. Aktarma noktalarını otomatik tespit eder.

| Metrik | Karmaşıklık |
|---|---|
| Zaman | O((V + E) log V) |
| Uzay | O(V + E) |

---

### KNN Algoritması
KdTree üzerinde çalışan K en yakın komşu algoritması.

| Metrik | Ortalama | En Kötü |
|---|---|---|
| Zaman | O(K log N) | O(N) |
| Uzay | O(N) | O(N) |

---

### Rota Maliyet Modeli

```
Toplam Maliyet = Yürüyüş Süresi + Ulaşım Süresi + (Aktarma Sayısı × 5 dakika)
```

- Yürüyüş hızı: 5 km/saat
- Aktarma cezası: 5 dakika
- Mesafe hesabı: Haversine formülü (gerçekçi küresel mesafe)

| İşlem | Karmaşıklık |
|---|---|
| Haversine Hesabı | O(1) |
| Yürüyüş Süresi | O(1) |
| Toplam Maliyet | O(1) |

---

## 📥 JSON Veri Formatı

**Durak (test_sehir.json):**
```json
{"ID": 1, "Ad": "Ozluce", "X": 40.2468, "Y": 28.9247}
```

**Hat (test_hatlar.json):**
```json
{"HatAd": "T1", "Mesafe": 5.75, "Sure": 7.5, "BaslangicID": 1, "HedefID": 2}
```

---

## ⚡ Performans Notları

- Sistem 20 durak ve 100+ hat ile test edilmiştir
- KdTree ve Hashtable ile O(log N) ve O(1) erişim hızı sağlanmıştır
- Görselleştirme karmaşıklığını azaltmak için hat filtreleme uygulanmıştır
- OSRM entegrasyonu ile gerçekçi kıvrımlı rota çizimi yapılmaktadır

---

## 📚 Detaylı Dokümantasyon,

Projenin Raporu Main içerisinde Veri-Yapıları_Grup23_Proje5_Raporu.pdf belgesidir.  
Daha fazla bilgi için `python_scripts/docs/` klasörüne bakın:

- `karmasiklik_analizi.md` — Tüm veri yapılarının Big-O analizi
- `api_dokumantasyonu.md` — Python AI servisi API detayları
- `ai_prompt_dokumu.md` — Geliştirme sürecinde kullanılan promptlar
