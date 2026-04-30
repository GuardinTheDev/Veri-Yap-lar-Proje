using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend_core_graph
{
    internal class Multigraph
    {
        public List<Durak> duraklar = new List<Durak>();
        public List<Hat> hatlar = new List<Hat>();

        public void DurakEkle(Durak d)
        {
            duraklar.Add(d);
        }

        public void HatEkle(Hat hat)
        {
            hatlar.Add(hat);
        }

        public List<Hat> KomsuHatlarGetir(int durakid)
        {
            List<Hat> sonuc = new List<Hat>();
            for (int i = 0; i < hatlar.Count; i++)
            {
                if (hatlar[i].Baslangic.ID == durakid)
                {
                    sonuc.Add(hatlar[i]);
                }
            }
            return sonuc;
        }
    }
}