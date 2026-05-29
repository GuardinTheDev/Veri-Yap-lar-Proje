import json
import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from veri_yapilari.kd_tree import KdTree
from veri_yapilari.hash_table import HashTable
from veri_yapilari.multigraph import Multigraph
from algoritmalar.knn import en_yakin_duraklari_bul
from algoritmalar.dijkstra import dijkstra
from algoritmalar.rota import rota_analizi

app = FastAPI(title="Akilli Toplu Tasima AI Servisi", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graf = Multigraph()
durak_hash = HashTable()
kd_agac = KdTree()
duraklar_listesi = []


def veri_yukle():
    global duraklar_listesi
    veri_dizin = os.path.dirname(os.path.abspath(__file__))

    with open(os.path.join(veri_dizin, 'test_sehir.json'), 'r', encoding='utf-8') as f:
        duraklar = json.load(f)

    with open(os.path.join(veri_dizin, 'test_hatlar.json'), 'r', encoding='utf-8') as f:
        hatlar = json.load(f)

    for d in duraklar:
        graf.durak_ekle(d["ID"], d["Ad"], d["X"], d["Y"])
        durak_hash.ekle(d["ID"], d)
        kd_agac.ekle(d["ID"], d["X"], d["Y"])

    for h in hatlar:
        graf.hat_ekle(h["BaslangicID"], h["HedefID"], h["HatAd"], h["Mesafe"], h["Sure"])

    duraklar_listesi = duraklar


veri_yukle()


class KnnIstek(BaseModel):
    x: float
    y: float
    k: Optional[int] = 5


class RotaIstek(BaseModel):
    kullanici_x: float
    kullanici_y: float
    baslangic_id: int
    hedef_id: int


class TamRotaIstek(BaseModel):
    kullanici_x: float
    kullanici_y: float
    hedef_x: float
    hedef_y: float
    k: Optional[int] = 3


@app.get("/saglik")
def saglik():
    return {"durum": "aktif", "durak_sayisi": len(duraklar_listesi), "hat_sayisi": len(graf.tum_hatlar())}


@app.get("/duraklar")
def duraklar_getir():
    return graf.tum_duraklar()


@app.get("/duraklar/{durak_id}")
def durak_detay(durak_id: int):
    durak = durak_hash.getir(durak_id)
    if durak is None:
        return {"hata": "Durak bulunamadi"}
    komsular = graf.komsu_getir(durak_id)
    return {"durak": durak, "baglanti_sayisi": len(komsular), "baglantilar": komsular}


@app.get("/hatlar")
def hatlar_getir():
    return graf.tum_hatlar()


@app.post("/en-yakin")
def en_yakin(istek: KnnIstek):
    sonuclar = en_yakin_duraklari_bul(duraklar_listesi, istek.x, istek.y, istek.k)
    return {"konum": {"x": istek.x, "y": istek.y}, "en_yakin_duraklar": sonuclar}


@app.post("/rota-hesapla")
def rota_hesapla(istek: RotaIstek):
    sonuc = dijkstra(graf, istek.baslangic_id, istek.hedef_id)
    if sonuc["toplam_mesafe"] < 0:
        return {"hata": "Rota bulunamadi"}

    baslangic = graf.durak_getir(istek.baslangic_id)
    hedef = graf.durak_getir(istek.hedef_id)
    analiz = rota_analizi(istek.kullanici_x, istek.kullanici_y, baslangic, hedef, sonuc)

    durak_detaylari = []
    for did in sonuc["rota"]:
        d = graf.durak_getir(did)
        if d:
            durak_detaylari.append(d)

    return {
        "rota_detay": durak_detaylari,
        "analiz": analiz,
        "dijkstra": sonuc
    }


@app.post("/tam-rota")
def tam_rota(istek: TamRotaIstek):
    baslangic_adaylari = en_yakin_duraklari_bul(duraklar_listesi, istek.kullanici_x, istek.kullanici_y, istek.k)
    hedef_adaylari = en_yakin_duraklari_bul(duraklar_listesi, istek.hedef_x, istek.hedef_y, istek.k)

    en_iyi = None
    for ba in baslangic_adaylari:
        for ha in hedef_adaylari:
            sonuc = dijkstra(graf, ba["ID"], ha["ID"])
            if sonuc["toplam_mesafe"] < 0:
                continue
            baslangic_durak = graf.durak_getir(ba["ID"])
            hedef_durak = graf.durak_getir(ha["ID"])
            analiz = rota_analizi(istek.kullanici_x, istek.kullanici_y, baslangic_durak, hedef_durak, sonuc)
            if en_iyi is None or analiz["toplam_maliyet_dk"] < en_iyi["analiz"]["toplam_maliyet_dk"]:
                durak_detaylari = []
                for did in sonuc["rota"]:
                    d = graf.durak_getir(did)
                    if d:
                        durak_detaylari.append(d)
                en_iyi = {"rota_detay": durak_detaylari, "analiz": analiz, "dijkstra": sonuc}

    if en_iyi is None:
        return {"hata": "Uygun rota bulunamadi"}
    return en_iyi
