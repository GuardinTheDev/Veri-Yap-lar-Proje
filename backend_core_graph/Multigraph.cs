using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend_core_graph
{
    public class Multigraph
    {
        public List<Durak> duraklar = new List<Durak>();
        public Hashtable durakHashTable;
        public List<Hat> hatlar = new List<Hat>();

        public void DurakEkle(Durak d)
        {
            duraklar.Add(d);
            durakHashTable.Durak_Ekle(d);
        }

        public void HatEkle(Hat hat)
        {
            hatlar.Add(hat);
        }
        public Durak findDurakByID(int durakID)
        {
            foreach(Durak d in duraklar)
            {
                if(d.ID == durakID)
                {
                    return d;
                }
            }
            Console.WriteLine("Durak bulunamadi");
            return null;
        }

        public List<Hat> KomsuHatlarGetir(int durakid)
        {
            List<Hat> sonuc = new List<Hat>();
            for (int i = 0; i < hatlar.Count; i++)
            {
                if (hatlar[i].Baslangic.ID == durakid || hatlar[i].Hedef.ID == durakid)
                {
                    sonuc.Add(hatlar[i]);
                }
            }
            return sonuc;
        }
    }
}