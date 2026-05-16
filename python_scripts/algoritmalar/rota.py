import math

YURUYUS_HIZI = 5.0
AKTARMA_CEZASI = 5.0


def haversine(x1, y1, x2, y2):
    R = 6371
    dx = math.radians(x2 - x1)
    dy = math.radians(y2 - y1)
    a = math.sin(dx / 2) ** 2 + math.cos(math.radians(x1)) * math.cos(math.radians(x2)) * math.sin(dy / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    return round(R * c, 3)


def yuruyus_suresi(kullanici_x, kullanici_y, durak_x, durak_y):
    mesafe_km = haversine(kullanici_x, kullanici_y, durak_x, durak_y)
    sure_dk = (mesafe_km / YURUYUS_HIZI) * 60
    return round(sure_dk, 1)


def toplam_maliyet(yuruyus_dk, ulasim_dk, aktarma_sayisi):
    return round(yuruyus_dk + ulasim_dk + aktarma_sayisi * AKTARMA_CEZASI, 1)


def rota_analizi(kullanici_x, kullanici_y, baslangic_durak, hedef_durak, dijkstra_sonuc):
    yuruyus = yuruyus_suresi(kullanici_x, kullanici_y, baslangic_durak["X"], baslangic_durak["Y"])
    ulasim = dijkstra_sonuc["toplam_sure"]
    aktarma = dijkstra_sonuc["aktarma_sayisi"]
    maliyet = toplam_maliyet(yuruyus, ulasim, aktarma)
    return {
        "yuruyus_suresi_dk": yuruyus,
        "yuruyus_mesafe_km": haversine(kullanici_x, kullanici_y, baslangic_durak["X"], baslangic_durak["Y"]),
        "ulasim_suresi_dk": ulasim,
        "aktarma_sayisi": aktarma,
        "toplam_maliyet_dk": maliyet,
        "rota": dijkstra_sonuc["rota"],
        "aktarmalar": dijkstra_sonuc["aktarmalar"]
    }
