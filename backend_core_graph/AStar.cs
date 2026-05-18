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
        List<Durak> closedList = new List<Durak>();

        int AktarmaMultiplier = 10;
        Durak baslangicDurak = start;


        
        MinHeap openList = new MinHeap();
        openList.Insert(0, baslangicDurak.ID);
        Durak currentStop = baslangicDurak;
        Hat currentHat = null;
        while(openList.Count > 0) {
            var neighborList = currentStop.getNeighbor();
            if(currentStop.ID == goal.ID)
                {
                    return ReconstructPath(new Dictionary<Durak, Durak>(), currentStop);
                }
            
            foreach(var neighbor in neighborList)
                {   
                    double gCost = 0;
                    Durak next = neighbor.Item1;
                    Hat hat = neighbor.Item2;
                    if (currentHat != null && hat.HatAd != currentHat.HatAd)
                    {
                        gCost += AktarmaMultiplier;
                    }
                    gCost += hat.Duraklar.Find(node => node.currentDurak.ID == currentStop.ID).distanceToNext;
                    double fCost = gCost + Heuristic(next, goal);
                    if (closedList.Contains(next))
                    {
                        continue;
                    }
                    openList.Insert(fCost, next.ID);
                    
                }
            closedList.Add(currentStop);
            var minNode = openList.RemoveMin();
            currentStop = graph.findDurakByID(minNode.DurakId);
        }
        return null;
    }
}
}