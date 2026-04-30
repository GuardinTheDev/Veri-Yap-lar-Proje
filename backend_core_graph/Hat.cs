using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend_core_graph
{
    internal class Hat
    {
        public string HatAd {  get; set; }
        public double Mesafe { get; set; }
        public double Sure { get; set; }
        public Durak Baslangic { get; set; }
        public Durak Hedef {  get; set; }

        public Hat(string hatad,double mesafe,double sure,Durak baslangic, Durak hedef )
        {
            HatAd = hatad;
            Mesafe = mesafe;
            Sure = sure;
            Baslangic = baslangic;
            Hedef = hedef;
        }

       
    }
}
