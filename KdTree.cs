public class KdTree
{
    public void Insert(Node node)
    {

    }

    public Node FindNearest(float x, float y)
    {
        return null;
    }
}
using System;
using backend_core_graph;

namespace backend_core_graph
{
    public class KdTree
    {
        private class KdNode
        {
            public Durak Durak;
            public KdNode Left, Right;

            public KdNode(Durak durak)
            {
                Durak = durak;
                Left = null;
                Right = null;
            }
        }

        private KdNode root;

        public KdTree()
        {
            root = null;
        }

        // INSERT
        public void Insert(Durak durak)
        {
            root = InsertRec(root, durak, 0);
        }

        private KdNode InsertRec(KdNode node, Durak durak, int depth)
        {
            if (node == null)
                return new KdNode(durak);

            int axis = depth % 2;

            if (axis == 0)
            {
                if (durak.X < node.Durak.X)
                    node.Left = InsertRec(node.Left, durak, depth + 1);
                else
                    node.Right = InsertRec(node.Right, durak, depth + 1);
            }
            else
            {
                if (durak.Y < node.Durak.Y)
                    node.Left = InsertRec(node.Left, durak, depth + 1);
                else
                    node.Right = InsertRec(node.Right, durak, depth + 1);
            }

            return node;
        }

        // FIND NEAREST
        public Durak FindNearest(float x, float y)
        {
            if (root == null) return null;
            KdNode best = null;
            double bestDist = double.MaxValue;
            FindNearestRec(root, x, y, 0, ref best, ref bestDist);
            return best?.Durak;
        }

        private void FindNearestRec(KdNode node, double x, double y, 
            int depth, ref KdNode best, ref double bestDist)
        {
            if (node == null) return;

            double dist = Distance(node.Durak.X, node.Durak.Y, x, y);
            if (dist < bestDist)
            {
                bestDist = dist;
                best = node;
            }

            int axis = depth % 2;
            double diff = axis == 0 ? x - node.Durak.X : y - node.Durak.Y;

            KdNode first  = diff < 0 ? node.Left  : node.Right;
            KdNode second = diff < 0 ? node.Right : node.Left;

            FindNearestRec(first, x, y, depth + 1, ref best, ref bestDist);

            if (diff * diff < bestDist)
                FindNearestRec(second, x, y, depth + 1, ref best, ref bestDist);
        }

        private double Distance(double x1, double y1, double x2, double y2)
        {
            return Math.Sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        }
    }
}
