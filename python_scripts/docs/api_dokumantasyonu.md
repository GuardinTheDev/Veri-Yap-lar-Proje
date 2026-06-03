# AI Servisi API Dokumantasyonu

## Calistirma

```bash
cd python_scripts
pip install -r requirements.txt
python -m uvicorn ai_service:app --host 0.0.0.0 --port 8000
```

Swagger UI: http://localhost:8000/docs

## Endpointler

### GET /saglik
Yanit: `{"durum": "aktif", "durak_sayisi": 20, "hat_sayisi": 350}`

### GET /duraklar
Yanit: `[{"ID": 1, "Ad": "Ozluce", "X": 40.2468, "Y": 28.9247}, ...]`

### GET /duraklar/{durak_id}
Yanit: `{"durak": {...}, "baglanti_sayisi": 15, "baglantilar": [...]}`

### GET /hatlar
Yanit: `[{"BaslangicID": 1, "HedefID": 2, "HatAd": "T1", "Mesafe": 5.75, "Sure": 7.5}, ...]`

### POST /en-yakin
Istek: `{"x": 40.22, "y": 28.90, "k": 5}`
Yanit: `{"konum": {...}, "en_yakin_duraklar": [{"ID": 7, "Ad": "Altinsehir", "Mesafe": 0.94}, ...]}`

### POST /rota-hesapla
Istek: `{"kullanici_x": 40.22, "kullanici_y": 28.90, "baslangic_id": 1, "hedef_id": 10}`
Yanit: `{"rota_detay": [...], "analiz": {"yuruyus_suresi_dk": 3.2, "toplam_maliyet_dk": 23.6, ...}}`

### POST /tam-rota
Istek: `{"kullanici_x": 40.22, "kullanici_y": 28.90, "hedef_x": 40.18, "hedef_y": 28.95, "k": 3}`
En yakin duraklari bulur + en iyi rotayi hesaplar.

## Docker

```bash
docker build -t ai-servisi ./python_scripts
docker run -p 8000:8000 ai-servisi
```
