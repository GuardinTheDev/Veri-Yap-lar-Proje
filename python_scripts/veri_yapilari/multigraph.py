class Multigraph:
    def __init__(self):
        self.duraklar = {}
        self.komsuluk = {}

    def durak_ekle(self, durak_id, ad, x, y):
        self.duraklar[durak_id] = {"ID": durak_id, "Ad": ad, "X": x, "Y": y}
        if durak_id not in self.komsuluk:
            self.komsuluk[durak_id] = []

    def hat_ekle(self, baslangic_id, hedef_id, hat_ad, mesafe, sure):
        if baslangic_id not in self.komsuluk:
            self.komsuluk[baslangic_id] = []
        self.komsuluk[baslangic_id].append({
            "HedefID": hedef_id,
            "HatAd": hat_ad,
            "Mesafe": mesafe,
            "Sure": sure
        })

    def komsu_getir(self, durak_id):
        return self.komsuluk.get(durak_id, [])

    def tum_duraklar(self):
        return list(self.duraklar.values())

    def durak_getir(self, durak_id):
        return self.duraklar.get(durak_id)

    def tum_hatlar(self):
        hatlar = []
        for baslangic_id, komsular in self.komsuluk.items():
            for k in komsular:
                hatlar.append({
                    "BaslangicID": baslangic_id,
                    "HedefID": k["HedefID"],
                    "HatAd": k["HatAd"],
                    "Mesafe": k["Mesafe"],
                    "Sure": k["Sure"]
                })
        return hatlar
