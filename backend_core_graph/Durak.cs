using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend_core_graph
{
    public class Durak
    {
        public int ID { get; set; }
        public double X { get; set; }
        public double Y {  get; set; }
        public string Ad { get; set; }
        public List<Tuple<Hat, int>> Hatlar { get; set; } //durağın ait olduğu hatlar ve o hatlardaki liste sırası

        public Durak() { }

        public Durak(int id, double x, double y,string ad) {
            ID = id;
            X = x;
            Y = y;
            Ad = ad;
            Hatlar = new List<Tuple<Hat, int>>();
        }
        public List<Tuple<Durak, Hat>> getNeighbor() 
        {
            var neighbors = new List<Tuple<Durak, Hat>>();
            foreach (var hatTuple in Hatlar)
            {
                Hat hat = hatTuple.Item1;
                int hatIndex = hatTuple.Item2;
                Durak neighbor = hat.Duraklar[hatIndex].nextDurak;
                if (neighbor != null)
                {
                    neighbors.Add(new Tuple<Durak, Hat>(neighbor, hat));
                }
            }
            return neighbors;
        }
    }
}

