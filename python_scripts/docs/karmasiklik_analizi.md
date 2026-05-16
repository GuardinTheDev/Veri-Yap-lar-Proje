# Zaman ve Uzay Karmasikligi Analizi (Big-O)

## Veri Yapilari

### KD-Tree (kd_tree.py)
| Islem | Ortalama | En Kotu |
|-------|----------|---------|
| Ekleme (ekle) | O(log N) | O(N) |
| KNN Arama (en_yakin_k) | O(log N) | O(N) |
| Uzay Karmasikligi | O(N) | O(N) |

KD-Tree, 2 boyutlu koordinat uzayinda durak aramasi icin kullanilmaktadir.
Her ekleme isleminde agac dengeli kaldiginda logaritmik performans saglar.
KNN sorgusunda budama (pruning) sayesinde gereksiz alt agaclar atlanir.

### Min-Heap (min_heap.py)
| Islem | Ortalama | En Kotu |
|-------|----------|---------|
| Ekleme (ekle) | O(log N) | O(log N) |
| Minimum Cikarma (cikar) | O(log N) | O(log N) |
| Peek | O(1) | O(1) |
| Uzay Karmasikligi | O(N) | O(N) |

Min-Heap, Dijkstra algoritmasinda en dusuk maliyetli dugumu secmek icin kullanilir.
HeapifyUp ve HeapifyDown islemleri agac yuksekligi kadar adim atar.

### Hash Table (hash_table.py)
| Islem | Ortalama | En Kotu |
|-------|----------|---------|
| Ekleme (ekle) | O(1) | O(N) |
| Arama (getir) | O(1) | O(N) |
| Silme (sil) | O(1) | O(N) |
| Uzay Karmasikligi | O(N) | O(N) |

Open addressing (linear probing) ile cakisma cozumu yapilmaktadir.
Hash fonksiyonu: anahtar % 1009 (C# backend ile ayni).
En kotu durum tum anahtarlar ayni slota duserse olusur, pratikte nadir gorulen bir senaryodur.

### Multigraph (multigraph.py)
| Islem | Ortalama | En Kotu |
|-------|----------|---------|
| Durak Ekleme (durak_ekle) | O(1) | O(1) |
| Hat Ekleme (hat_ekle) | O(1) | O(1) |
| Komsu Getirme (komsu_getir) | O(1) | O(1) |
| Tum Hatlari Listeleme | O(E) | O(E) |
| Uzay Karmasikligi | O(V + E) | O(V + E) |

V = durak sayisi, E = hat (kenar) sayisi.
Komsuluk listesi (adjacency list) yaklasimi ile her dugumun komsularina O(1) erisim saglanir.
Ayni iki durak arasinda birden fazla hat desteklenir (multigraph ozelligi).

## Algoritmalar

### Dijkstra Algoritmasi (dijkstra.py)
| Metrik | Karmasiklik |
|--------|-------------|
| Zaman | O((V + E) log V) |
| Uzay | O(V + E) |

Min-Heap ile oncelik kuyrugu kullanilarak en dusuk maliyetli dugum secilir.
Her dugum en fazla bir kez ziyaret edilir.
Aktarma tespiti: farkli hat adlari karsilastirilarak otomatik olarak belirlenir.

### KNN Algoritmasi (knn.py)
| Metrik | Ortalama | En Kotu |
|--------|----------|---------|
| Zaman | O(log N) | O(N) |
| Uzay | O(N) | O(N) |

KD-Tree uzerinde budamali arama yapilir.
Sonuclar mesafeye gore siralanarak en yakin K durak dondurulur.

### Rota Maliyet Modeli (rota.py)
| Metrik | Karmasiklik |
|--------|-------------|
| Haversine Mesafe Hesabi | O(1) |
| Yuruyus Suresi Hesabi | O(1) |
| Toplam Maliyet Hesabi | O(1) |

Toplam maliyet = yuruyus suresi + ulasim suresi + (aktarma sayisi x 5 dakika ceza).
Haversine formuluyle gercekci mesafe hesaplanir (duz koordinat farki yerine kure uzerinde).
