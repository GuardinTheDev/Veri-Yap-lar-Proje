import json
import random

sehir_verisi = []

for i in range(1, 11):
    durak = {
        "id": f"D{i}",
        "isim": "",
        "lat": round(random.uniform(40.15, 40.30), 4),
        "lng": round(random.uniform(28.80, 29.00), 4)
    }
    sehir_verisi.append(durak)

with open('test_sehir.json', 'w', encoding='utf-8') as f:
    json.dump(sehir_verisi, f, indent=4)

print("Guncel test verileri basariyla olusturuldu.")