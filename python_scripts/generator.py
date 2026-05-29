import json
import random
import math

durak_isimleri = [
    "Ozluce", "Gorukle", "Fatih Sultan Mehmet", "Nilufer", "Besevler",
    "Ihsaniye", "Altinsehir", "Ertugrul", "Yuzuncuyil", "Ataevler",
    "Kestel", "Demirtas", "Hamitler", "Emek", "Organize Sanayi",
    "Sehir Hastanesi", "Terminal", "Kultur Park", "Osmangazi", "Muradiye"
]

hat_adlari = ["T1", "T2", "M1", "M2", "11A", "38T", "F1", "F2", "55K", "22D", "3C", "45A"]


def mesafe_hesapla(x1, y1, x2, y2):
    R = 6371
    dx = math.radians(x2 - x1)
    dy = math.radians(y2 - y1)
    a = math.sin(dx / 2) ** 2 + math.cos(math.radians(x1)) * math.cos(math.radians(x2)) * math.sin(dy / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    return round(R * c, 2)


def veri_uret(durak_sayisi=20):
    duraklar = []
    for i in range(1, durak_sayisi + 1):
        durak = {
            "ID": i,
            "Ad": durak_isimleri[i - 1],
            "X": round(random.uniform(40.15, 40.30), 4),
            "Y": round(random.uniform(28.80, 29.00), 4)
        }
        duraklar.append(durak)

    hatlar = []
    for i in range(len(duraklar)):
        for j in range(i + 1, len(duraklar)):
            d1 = duraklar[i]
            d2 = duraklar[j]
            mesafe = mesafe_hesapla(d1["X"], d1["Y"], d2["X"], d2["Y"])

            if mesafe < 10.0:
                hat_sayisi = random.randint(1, 2)
                for _ in range(hat_sayisi):
                    hat_ad = random.choice(hat_adlari)
                    hiz = random.uniform(20, 50)
                    sure = round((mesafe / hiz) * 60, 1)

                    hatlar.append({
                        "HatAd": hat_ad,
                        "Mesafe": mesafe,
                        "Sure": sure,
                        "BaslangicID": d1["ID"],
                        "HedefID": d2["ID"]
                    })
                    hatlar.append({
                        "HatAd": hat_ad,
                        "Mesafe": mesafe,
                        "Sure": sure,
                        "BaslangicID": d2["ID"],
                        "HedefID": d1["ID"]
                    })

    return duraklar, hatlar


duraklar, hatlar = veri_uret()

with open('test_sehir.json', 'w', encoding='utf-8') as f:
    json.dump(duraklar, f, indent=4, ensure_ascii=False)

with open('test_hatlar.json', 'w', encoding='utf-8') as f:
    json.dump(hatlar, f, indent=4, ensure_ascii=False)

print(f"{len(duraklar)} durak ve {len(hatlar)} hat verisi uretildi.")