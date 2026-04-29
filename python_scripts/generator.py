import json
import random

# 1. Boş bir liste oluşturuyoruz. Bu liste tüm durakların verisini tutacak.
sehir_verisi = []

# 2. Döngü ile 10 adet rastgele durak (node) üretiyoruz.
for i in range(1, 11):
    # Her bir durak için Python Dictionary (Sözlük) yapısında veri oluşturuyoruz.
    durak = {
        "id": f"D{i}", # Issue görevinde tartışacağın String ID yapısı (D1, D2 vb.)
        "x": random.randint(0, 100), # 0-100 arası rastgele X koordinatı
        "y": random.randint(0, 100)  # 0-100 arası rastgele Y koordinatı
    }
    sehir_verisi.append(durak) # Üretilen durağı ana listeye ekliyoruz.

# 3. Veriyi JSON dosyasına yazma (Serialization)
dosya_yolu = 'test_sehir.json'

# 'w' (write) modunda dosyayı açıyoruz. encoding='utf-8' Türkçe veya farklı karakterlerde çökme olmaması için zorunludur.
with open(dosya_yolu, 'w', encoding='utf-8') as f:
    json.dump(sehir_verisi, f, indent=4) # indent=4 kodu okunabilir şekilde hizalar.

print(f"Başarılı: Test verileri '{dosya_yolu}' konumuna kaydedildi.")