namespace backend_core_graph
{
    public class KdTreeNode
    {
        public Durak Durak;
        public KdTreeNode Left;
        public KdTreeNode Right;

        public KdTreeNode(Durak durak)
        {
            Durak = durak;
            Left = null;
            Right = null;
        }
    }
}

