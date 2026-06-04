using System;
using System.Collections.Generic;
using System.ComponentModel.Design.Serialization;
using System.Reflection.Emit;

namespace backend_core_graph{
    internal class AStarAlgorithm
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
            HashSet<Durak> closedSet = new HashSet<Durak>();
            Dictionary<Durak, double> gScore = new Dictionary<Durak, double>();
            Dictionary<Durak, Durak> cameFrom = new Dictionary<Durak, Durak>();
            Dictionary<Durak, Hat> hatUsed = new Dictionary<Durak, Hat>();
            
            int AktarmaMultiplier = 10;
            
            MinHeap openList = new MinHeap();
            openList.Insert(0, start.ID);
            gScore[start] = 0;
            hatUsed[start] = null;

            while(openList.Count > 0) {
                var minNode = openList.RemoveMin();
                Durak currentStop = graph.findDurakByID(minNode.DurakId);
                
                if(currentStop.ID == goal.ID) {
                    return ReconstructPath(cameFrom, currentStop);
                }
                
                // Skip if already processed
                if (closedSet.Contains(currentStop)) {
                    continue;
                }
                
                closedSet.Add(currentStop);
                
                var neighborList = currentStop.getNeighbor();
                foreach(var neighbor in neighborList) {   
                    Durak next = neighbor.Item1;
                    Hat hat = neighbor.Item2;
                    
                    if (closedSet.Contains(next)) {
                        continue;
                    }
                    
                    double gCost = gScore[currentStop];
                    
                    // Check if line changes from previous line used to reach currentStop
                    if (hatUsed.ContainsKey(currentStop)) {
                        Hat previousHat = hatUsed[currentStop];
                        if (previousHat != null && hat != previousHat) {
                            gCost += AktarmaMultiplier;
                        }
                    }
                    
                    gCost += hat.Duraklar.Find(node => node.currentDurak.ID == currentStop.ID).distanceToNext;
                    
                    // If we found a better path, update it
                    if (!gScore.ContainsKey(next) || gCost < gScore[next]) {
                        cameFrom[next] = currentStop;
                        gScore[next] = gCost;
                        hatUsed[next] = hat;
                        double fCost = gCost + Heuristic(next, goal);
                        openList.Insert(fCost, next.ID);
                    }
                }
            }
            return null; // No path found
        }
    }
}

