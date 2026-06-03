class MinHeap:
    def __init__(self):
        self.heap = []

    def bos_mu(self):
        return len(self.heap) == 0

    def ekle(self, maliyet, durak_id):
        self.heap.append((maliyet, durak_id))
        self._yukari(len(self.heap) - 1)

    def cikar(self):
        if self.bos_mu():
            return None
        en_kucuk = self.heap[0]
        son = self.heap.pop()
        if not self.bos_mu():
            self.heap[0] = son
            self._asagi(0)
        return en_kucuk

    def peek(self):
        if self.bos_mu():
            return None
        return self.heap[0]

    def _yukari(self, i):
        while i > 0:
            ebeveyn = (i - 1) // 2
            if self.heap[i][0] < self.heap[ebeveyn][0]:
                self.heap[i], self.heap[ebeveyn] = self.heap[ebeveyn], self.heap[i]
                i = ebeveyn
            else:
                break

    def _asagi(self, i):
        while True:
            sol = 2 * i + 1
            sag = 2 * i + 2
            en_kucuk = i
            if sol < len(self.heap) and self.heap[sol][0] < self.heap[en_kucuk][0]:
                en_kucuk = sol
            if sag < len(self.heap) and self.heap[sag][0] < self.heap[en_kucuk][0]:
                en_kucuk = sag
            if en_kucuk != i:
                self.heap[i], self.heap[en_kucuk] = self.heap[en_kucuk], self.heap[i]
                i = en_kucuk
            else:
                break
