using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend_core_graph
{   
    
    public class HatNode
    {
        public Durak currentDurak { get; set; }
        public HatNode nextDurak { get; set; }
        public int distanceToNext { get; set; }
        public int localID { get; set;}
    }
    public class Hat
    {   
        // durakları tek yönlüymüş gibi düşün, çift yönlü hatlar için iki tane hat oluştur
        public string HatAd {  get; set; }
        public double Mesafe { get; set; }
        public double Sure { get; set; }
        public Durak Baslangic { get; set; }
        public Durak Hedef {  get; set; }
        public List<HatNode> Duraklar { get; set; } //hattın linked listi

        

        public Hat(string hatad,double mesafe,double sure,Durak baslangic=null, Durak hedef=null )
        {
            HatAd = hatad;
            Mesafe = mesafe;
            Sure = sure;
            Baslangic = baslangic;
            Hedef = hedef;
            Duraklar = new List<HatNode>();
            if(baslangic != null) Duraklar.Add(new HatNode { currentDurak = baslangic, nextDurak = null });
            if(hedef != null) Duraklar.Add(new HatNode { currentDurak = hedef, nextDurak = null });
            if((baslangic != null)&&(hedef != null)) Duraklar[0].nextDurak = Duraklar[1];
        }

        public Durak FindDurakByID(int durakID)
        {
            foreach(HatNode node in Duraklar)
            {
                if(node.currentDurak.ID == durakID)
                {
                    return node.currentDurak;
                }
            }
            throw new ArgumentException("Durak bulunamadi");
        }

        public HatNode ConvertToNode(Durak durak)
        {
            foreach(HatNode node in Duraklar)
            {
                if(node.currentDurak.ID == durak.ID)
                {
                    return node;
                }
            }
            throw new ArgumentException("Durak bulunamadi");
        }
        
        public void AddDurak(int prevDurakID, Durak NewDurak, int dist)
        {
            Durak prevDurak = FindDurakByID(prevDurakID);
            HatNode newHatDurak = new HatNode { currentDurak = NewDurak, nextDurak =  ConvertToNode(prevDurak).nextDurak, distanceToNext = dist };
            Duraklar.Add(newHatDurak);
            ConvertToNode(prevDurak).nextDurak = newHatDurak;
        }
        public void AddDurak(HatNode prevDurak, Durak NewDurak, int dist)
        {   
            HatNode next = prevDurak.nextDurak;
            HatNode newHatDurak = new HatNode { currentDurak = NewDurak, nextDurak = prevDurak.nextDurak, distanceToNext = dist };
            Duraklar.Add(newHatDurak);
            prevDurak.nextDurak = newHatDurak;
        }
        
    }
}
