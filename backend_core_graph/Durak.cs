using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend_core_graph
{
    internal class Durak
    {
        public int ID { get; set; }
        public double X { get; set; }
        public double Y {  get; set; }
        public string Ad { get; set; }

        public Durak(int id, double x, double y,string ad) {
            ID = id;
            X = x;
            Y = y;
            Ad = ad;
        }
    }
}
