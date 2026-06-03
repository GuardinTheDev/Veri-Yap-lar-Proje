using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend_core_graph
{   
    
    internal class HatNode
    {
        public Durak currentDurak { get; set; }
        public Durak nextDurak { get; set; }
        public int distanceToNext { get; set; }
    }
    internal class Hat
    {   
        // durakları tek yönlüymüş gibi düşün, çift yönlü hatlar için iki tane hat oluştur
        public string HatAd {  get; set; }
        public double Mesafe { get; set; }
        public double Sure { get; set; }
        public Durak Baslangic { get; set; }
        public Durak Hedef {  get; set; }
        public List<HatNode> Duraklar { get; set; } //hattın linked listi

        

        public Hat(string hatad,double mesafe,double sure,Durak baslangic, Durak hedef )
        {
            HatAd = hatad;
            Mesafe = mesafe;
            Sure = sure;
            Baslangic = baslangic;
            Hedef = hedef;
            Duraklar = new List<HatNode>();
            Duraklar.Add(new HatNode { currentDurak = baslangic, nextDurak = null });
            Duraklar.Add(new HatNode { currentDurak = hedef, nextDurak = null });
            Duraklar[0].nextDurak = Duraklar[1].currentDurak;
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
            Duraklar.Add(new HatNode { currentDurak = NewDurak, nextDurak =  ConvertToNode(prevDurak).nextDurak, distanceToNext = dist });
            ConvertToNode(prevDurak).nextDurak = NewDurak;
        }
        
    }
}
