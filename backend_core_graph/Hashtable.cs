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
            int index = Hashfonk(d.ID);
            while (Durak_dizisi[index] != null && Durak_dizisi[index].ID != d.ID)
            {
                index = (index + 1) % 1009;  // linear probing ekledim.
            }
            Durak_dizisi[index] = d;
        }

        public Durak Durak_Getir(int id)
        {
            int index = Hashfonk(id);
            while (Durak_dizisi[index] != null)
            {
                if (Durak_dizisi[index].ID == id)
                    return Durak_dizisi[index];
                index = (index + 1) % 1009;
            }
            return null;
        }

        public List<Durak> TumDuraklariGetir()
        {
            List<Durak> doluDuraklar = new List<Durak>();
            foreach (var durak in Durak_dizisi)
            {
                if (durak != null) // Boş (null) olmayan gerçek durakları topluyoruz
                {
                    doluDuraklar.Add(durak);
                }
            }
            return doluDuraklar;
        }

    }
}
