from veri_yapilari.kd_tree import KdTree


def en_yakin_duraklari_bul(duraklar, hedef_x, hedef_y, k=5):
    agac = KdTree()
    for d in duraklar:
        agac.ekle(d["ID"], d["X"], d["Y"])
    sonuclar = agac.en_yakin_k(hedef_x, hedef_y, k)
    cikti = []
    for durak_id, mesafe, x, y in sonuclar:
        durak_bilgi = None
        for d in duraklar:
            if d["ID"] == durak_id:
                durak_bilgi = d
                break
        cikti.append({
            "ID": durak_id,
            "Ad": durak_bilgi["Ad"] if durak_bilgi else "",
            "X": x,
            "Y": y,
            "Mesafe": round(mesafe * 111, 2)
        })
    return cikti
