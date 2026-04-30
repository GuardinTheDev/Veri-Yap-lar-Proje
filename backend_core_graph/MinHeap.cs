using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend_core_graph
{
    internal class MinHeap
    {
      public class HeapNode
        {
            public double Maliyet;
            public int DurakId;
        }

        List<HeapNode> heap = new List<HeapNode>();

        public bool IsEmpty()
        {
            if (heap.Count == 0)
                return true;
            else
                return false;
        }

        public void Insert(double maliyet,int durakid)
        {
            HeapNode yeni = new HeapNode();
            yeni.DurakId = durakid;
            yeni.Maliyet = maliyet;
            heap.Add(yeni);
            HeapifyUp(heap.Count-1);
        }

        public void HeapifyUp(int i)
        {
            while (i > 0)
            {
                int parent = (i - 1) / 2;
                if (heap[i].Maliyet < heap[parent].Maliyet)
                {
                    HeapNode temp = heap[parent];
                    heap[parent] = heap[i];
                    heap[i] = temp;
                    i = parent;
                }
                else
                    break;
          
            }
        }

        public HeapNode RemoveMin()
        {
            HeapNode min = heap[0];
            heap[0] = heap[heap.Count - 1];
            heap.RemoveAt(heap.Count - 1);
            HeapifyDown(0);
            return min;
        }


        public void HeapifyDown(int i)
        {
            int left = 2 * i + 1;
            int right = 2 * i + 2;
            int minimum = i;

            if (left < heap.Count && heap[left].Maliyet < heap[minimum].Maliyet)
            {
                minimum = left;
            }

            if(right < heap.Count && heap[right].Maliyet < heap[minimum].Maliyet)
            {
                minimum = right;
            }

            if(minimum != i)
            {
                HeapNode temp = heap[i];
                heap[i] = heap[minimum];
                heap[minimum] = temp;
                HeapifyDown(minimum);
                   
            }
          
        }


        public HeapNode Peek()
        {
            return heap[0];
        }
    }
}
