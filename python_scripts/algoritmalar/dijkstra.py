from veri_yapilari.min_heap import MinHeap


def dijkstra(graf, baslangic_id, hedef_id):
    mesafeler = {}
    oncekiler = {}
    hat_bilgileri = {}

    for durak_id in graf.duraklar:
        mesafeler[durak_id] = float('inf')
    mesafeler[baslangic_id] = 0

    heap = MinHeap()
    heap.ekle(0, baslangic_id)
    ziyaret = set()

    while not heap.bos_mu():
        maliyet, mevcut = heap.cikar()

        if mevcut in ziyaret:
            continue
        ziyaret.add(mevcut)

        if mevcut == hedef_id:
            break

        for komsu in graf.komsu_getir(mevcut):
            hedef = komsu["HedefID"]
            yeni_mesafe = mesafeler[mevcut] + komsu["Mesafe"]

            if yeni_mesafe < mesafeler.get(hedef, float('inf')):
                mesafeler[hedef] = yeni_mesafe
                oncekiler[hedef] = mevcut
                hat_bilgileri[hedef] = komsu["HatAd"]
                heap.ekle(yeni_mesafe, hedef)

    rota = []
    mevcut = hedef_id
    while mevcut in oncekiler:
        rota.append(mevcut)
        mevcut = oncekiler[mevcut]
    rota.append(baslangic_id)
    rota.reverse()

    if mesafeler.get(hedef_id, float('inf')) == float('inf'):
        return {"rota": [], "toplam_mesafe": -1, "toplam_sure": -1, "aktarmalar": []}

    aktarmalar = []
    if len(rota) > 1:
        onceki_hat = hat_bilgileri.get(rota[1])
        for i in range(2, len(rota)):
            simdiki_hat = hat_bilgileri.get(rota[i])
            if simdiki_hat != onceki_hat:
                aktarmalar.append({
                    "DurakID": rota[i - 1],
                    "DurakAd": graf.durak_getir(rota[i - 1])["Ad"] if graf.durak_getir(rota[i - 1]) else "",
                    "OncekiHat": onceki_hat,
                    "YeniHat": simdiki_hat
                })
            onceki_hat = simdiki_hat

    toplam_sure = 0
    for i in range(1, len(rota)):
        for komsu in graf.komsu_getir(rota[i - 1]):
            if komsu["HedefID"] == rota[i] and komsu["HatAd"] == hat_bilgileri.get(rota[i]):
                toplam_sure += komsu["Sure"]
                break

    return {
        "rota": rota,
        "toplam_mesafe": round(mesafeler.get(hedef_id, -1), 2),
        "toplam_sure": round(toplam_sure, 1),
        "aktarmalar": aktarmalar,
        "aktarma_sayisi": len(aktarmalar)
    }
