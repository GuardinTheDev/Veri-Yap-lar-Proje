using System.Collections.Generic;
using System.IO;
namespace backend_core_graph
{
    internal class Program
    {   
        public void LoadJSON()
        {
            using (StreamReader reader = new StreamReader("../python_scripts/test_sehir.json"))
            {
                string json = reader.ReadToEnd();
                
            }
        }
        static void Main(string[] args)
        {
            Multigraph multigraph = new Multigraph();

        }
    }
}