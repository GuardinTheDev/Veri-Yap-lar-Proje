using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend_core_graph
{
    internal class Hashtable
    {
        Durak[] Durak_dizisi = new Durak[1009];

        int Hashfonk(int id)
        {
            return id % 1009;
        }

        public void Durak_Ekle(Durak d)
        {
            Durak_dizisi[Hashfonk(d.ID)] = d;
        }

        public Durak Durak_Getir(int id)
        {
            return Durak_dizisi[Hashfonk(id)];
        }



    }
}
