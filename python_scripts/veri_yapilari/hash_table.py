class HashTable:
    def __init__(self, boyut=1009):
        self.boyut = boyut
        self.tablo = [None] * boyut
        self.sayac = 0

    def _hash(self, anahtar):
        if isinstance(anahtar, int):
            return anahtar % self.boyut
        return hash(str(anahtar)) % self.boyut

    def ekle(self, anahtar, deger):
        indeks = self._hash(anahtar)
        baslangic = indeks
        while self.tablo[indeks] is not None:
            if self.tablo[indeks][0] == anahtar:
                self.tablo[indeks] = (anahtar, deger)
                return
            indeks = (indeks + 1) % self.boyut
            if indeks == baslangic:
                return
        self.tablo[indeks] = (anahtar, deger)
        self.sayac += 1

    def getir(self, anahtar):
        indeks = self._hash(anahtar)
        baslangic = indeks
        while self.tablo[indeks] is not None:
            if self.tablo[indeks][0] == anahtar:
                return self.tablo[indeks][1]
            indeks = (indeks + 1) % self.boyut
            if indeks == baslangic:
                break
        return None

    def var_mi(self, anahtar):
        return self.getir(anahtar) is not None

    def sil(self, anahtar):
        indeks = self._hash(anahtar)
        baslangic = indeks
        while self.tablo[indeks] is not None:
            if self.tablo[indeks][0] == anahtar:
                self.tablo[indeks] = None
                self.sayac -= 1
                return True
            indeks = (indeks + 1) % self.boyut
            if indeks == baslangic:
                break
        return False
