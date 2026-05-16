import math


class KdNode:
    def __init__(self, durak_id, x, y):
        self.durak_id = durak_id
        self.x = x
        self.y = y
        self.left = None
        self.right = None


class KdTree:
    def __init__(self):
        self.root = None

    def ekle(self, durak_id, x, y):
        self.root = self._ekle(self.root, durak_id, x, y, 0)

    def _ekle(self, node, durak_id, x, y, derinlik):
        if node is None:
            return KdNode(durak_id, x, y)
        eksen = derinlik % 2
        if eksen == 0:
            if x < node.x:
                node.left = self._ekle(node.left, durak_id, x, y, derinlik + 1)
            else:
                node.right = self._ekle(node.right, durak_id, x, y, derinlik + 1)
        else:
            if y < node.y:
                node.left = self._ekle(node.left, durak_id, x, y, derinlik + 1)
            else:
                node.right = self._ekle(node.right, durak_id, x, y, derinlik + 1)
        return node

    def _mesafe(self, x1, y1, x2, y2):
        return math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)

    def en_yakin_k(self, x, y, k):
        sonuclar = []
        self._knn(self.root, x, y, k, 0, sonuclar)
        sonuclar.sort(key=lambda s: s[1])
        return sonuclar[:k]

    def _knn(self, node, x, y, k, derinlik, sonuclar):
        if node is None:
            return
        mesafe = self._mesafe(x, y, node.x, node.y)
        if len(sonuclar) < k:
            sonuclar.append((node.durak_id, mesafe, node.x, node.y))
            sonuclar.sort(key=lambda s: s[1])
        elif mesafe < sonuclar[-1][1]:
            sonuclar[-1] = (node.durak_id, mesafe, node.x, node.y)
            sonuclar.sort(key=lambda s: s[1])
        eksen = derinlik % 2
        if eksen == 0:
            fark = x - node.x
        else:
            fark = y - node.y
        if fark < 0:
            yakin = node.left
            uzak = node.right
        else:
            yakin = node.right
            uzak = node.left
        self._knn(yakin, x, y, k, derinlik + 1, sonuclar)
        if len(sonuclar) < k or abs(fark) < sonuclar[-1][1]:
            self._knn(uzak, x, y, k, derinlik + 1, sonuclar)
