using System;
using System.Collections.Generic;

namespace backend_core_graph
{
    public class AStarAlgorithm
    {
        private List<Durak> ReconstructPath(Dictionary<Durak, Durak> cameFrom, Durak current)
        {
            List<Durak> totalPath = new List<Durak>();
            totalPath.Add(current);
            while (cameFrom.ContainsKey(current))
            {
                current = cameFrom[current];
                totalPath.Insert(0, current);
            }
            return totalPath;
        }

        double Heuristic(Durak a, Durak b) {
            return Math.Sqrt(Math.Pow(a.X - b.X, 2) + Math.Pow(a.Y - b.Y, 2));
        }

        public List<Durak> AStar(Durak start, Durak goal, Multigraph graph) {
            HashSet<int> closedList = new HashSet<int>();
            Dictionary<Durak, Durak> cameFrom = new Dictionary<Durak, Durak>();
            Dictionary<Durak, double> gScore = new Dictionary<Durak, double>();
            Dictionary<Durak, Hat> hatTakibi = new Dictionary<Durak, Hat>();

            int AktarmaMultiplier = 10;

            MinHeap openList = new MinHeap();
            openList.Insert(0, start.ID);
            gScore[start] = 0;

            // fonksiyonsa Count() şeklinde parantezli kullanmalısın.
            while(!openList.IsEmpty())
            {
                var minNode = openList.RemoveMin();

                // Multigraph içindeki Find özelliği ile durağı buluyoruz
                Durak currentStop = graph.duraklar.Find(d => d.ID == minNode.DurakId);

                if (currentStop == null) continue; // Hata koruması

                if(currentStop.ID == goal.ID)
                {
                    return ReconstructPath(cameFrom, currentStop);
                }

                closedList.Add(currentStop.ID);

                var neighborHatlar = graph.KomsuHatlarGetir(currentStop.ID);

                foreach(Hat hat in neighborHatlar)
                {
                    Durak next = (hat.Baslangic.ID == currentStop.ID) ? hat.Hedef : hat.Baslangic;

                    if (closedList.Contains(next.ID)) continue;

                    double currentGCost = gScore.ContainsKey(currentStop) ? gScore[currentStop] : double.MaxValue;

                    // Karmaşık arama işlemleri yerine doğrudan Hat.cs içindeki Mesafe'yi alıyoruz
                    double edgeCost = hat.Mesafe;
                    double tentativeGCost = currentGCost + edgeCost;

                    // Aktarma Kontrolü
                    Hat previousHat = hatTakibi.ContainsKey(currentStop) ? hatTakibi[currentStop] : null;
                    if (previousHat != null && hat.HatAd != previousHat.HatAd)
                    {
                        tentativeGCost += AktarmaMultiplier;
                    }

                    if (!gScore.ContainsKey(next) || tentativeGCost < gScore[next])
                    {
                        cameFrom[next] = currentStop;
                        hatTakibi[next] = hat;
                        gScore[next] = tentativeGCost;

                        double fCost = tentativeGCost + Heuristic(next, goal);
                        openList.Insert(fCost, next.ID);
                    }
                }
            }
            // Hedef bulunamazsa frontend'in çökmemesi için null yerine boş liste döndürüyoruz
            return new List<Durak>();
        }
    }
}
