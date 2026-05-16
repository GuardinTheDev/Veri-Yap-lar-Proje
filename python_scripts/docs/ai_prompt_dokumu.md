# AI Prompt Dokumu

Bu dokuman, proje gelistirme surecinde GenAI aracilarina (ChatGPT, Gemini vb.)
gonderilenp promptlarin dokumunu icermektedir.

## 1. Sentetik Veri Uretimi Promptlari

### Prompt 1.1 - Durak Verisi Uretimi
```
Bursa ili Nilufer ilcesi bolgesinde 20 adet toplu tasima duragi icin
gercekci durak isimleri uret. Her durak icin ID (int), Ad (string),
X (enlem, 40.15-40.30 arasi), Y (boylam, 28.80-29.00 arasi) bilgilerini
JSON formatinda olustur. Turkce karakter kullanma.
```

### Prompt 1.2 - Hat ve Kenar Verisi Uretimi
```
20 durakli bir toplu tasima agi icin duraklar arasi hat baglantilari uret.
Her hat icin HatAd (T1, M1, 11A gibi), Mesafe (km), Sure (dakika),
BaslangicID ve HedefID bilgilerini JSON formatinda olustur.
Ayni iki durak arasinda birden fazla hat olabilir (multigraph).
Cift yonlu baglantilar olustur (A->B ve B->A).
```

## 2. Veri Yapisi Tasarimi Promptlari

### Prompt 2.1 - KD-Tree Tasarimi
```
2 boyutlu koordinat duzleminde en yakin K nokta aramasini verimli yapabilecek
bir KD-Tree veri yapisi tasarla. Insert ve KNN (K-Nearest Neighbors) islemleri
olmali. Python ile sifirdan (from scratch) yaz, standart kutuphane kullanma.
Ortalama O(log N) arama karmasikligi hedefle.
```

### Prompt 2.2 - Min-Heap Tasarimi
```
Dijkstra algoritmasi icin Min-Heap (priority queue) veri yapisi tasarla.
Ekle, cikar (extract-min) ve peek islemleri olmali.
HeapifyUp ve HeapifyDown ile logaritmik zamanda islem yapmali.
Python ile sifirdan yaz.
```

### Prompt 2.3 - Hash Table Tasarimi
```
Open addressing (linear probing) ile calisan bir Hash Table yaz.
Hash fonksiyonu: anahtar % 1009 (C# backend ile uyumlu).
Ekle, getir, sil, var_mi islemleri olmali. Python ile sifirdan yaz.
```

### Prompt 2.4 - Multigraph Tasarimi
```
Komsuluk listesi (adjacency list) tabanli bir Multigraph veri yapisi tasarla.
Ayni iki dugum arasinda birden fazla kenar desteklemeli.
Durak ekleme, hat ekleme, komsu getirme islemleri olmali.
C# backenddeki Multigraph.cs yapisiyla uyumlu alan adlari kullan.
```

## 3. Algoritma Promptlari

### Prompt 3.1 - Dijkstra Algoritmasi
```
Min-Heap kullanan Dijkstra en kisa yol algoritmasini Python ile yaz.
Multigraph uzerinde calismali.
Rota, toplam mesafe, toplam sure ve aktarma noktalarini dondur.
Aktarma: farkli hat adlari arasinda gecis yapildiginda tespit edilmeli.
```

### Prompt 3.2 - KNN Algoritmasi
```
KD-Tree uzerinde K-Nearest Neighbors aramasini gerceklestir.
Koordinat mesafesini km cinsine cevir (yaklasik *111 katsayisi).
Sonuclari mesafeye gore sirala ve durak bilgileriyle birlikte dondur.
```

### Prompt 3.3 - Rota Maliyet Modeli
```
Toplu tasima rota maliyet modelini Python ile tasarla.
Toplam maliyet = yuruyus suresi + ulasim suresi + (aktarma sayisi x 5dk ceza)
Haversine formulu ile gercekci mesafe hesapla.
Yuruyus hizi 5 km/saat olarak kabul et.
```

## 4. Mikroservis Tasarimi Promptlari

### Prompt 4.1 - FastAPI Servisi
```
Python FastAPI ile bir AI mikroservisi tasarla.
Endpointler:
- GET /saglik: servis durumu
- GET /duraklar: tum duraklar
- POST /en-yakin: KNN ile en yakin K durak
- POST /rota-hesapla: Dijkstra ile en kisa rota
- POST /tam-rota: KNN + Dijkstra kombinasyonu ile tam rota optimizasyonu
Veriyi JSON dosyalarindan yukle. CORS destegi ekle.
```

### Prompt 4.2 - Docker Konfigurasyonu
```
Python FastAPI uygulamasi icin Dockerfile yaz.
python:3.11-slim base image kullan.
Build sirasinda generator.py calistirarak test verilerini uret.
Port 8000 uzerinden servis sun.
```

## 5. Dokumantasyon Promptlari

### Prompt 5.1 - Big-O Analizi
```
Projede kullanilan tum veri yapilari ve algoritmalar icin
zaman ve uzay karmasikligi (Big-O) analizi tablolari olustur.
Her islem icin ortalama ve en kotu durum karmasikligini belirt.
```
