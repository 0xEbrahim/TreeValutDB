class BTreeNode<T extends { compareTo(other: T): number }> {
  parent: BTreeNode<T> | null;
  keys: T[];
  t: number;
  children: BTreeNode<T>[];
  isLeaf: boolean;

  constructor(t: number = 4, isLeaf: boolean) {
    this.keys = [];
    this.t = t;
    this.children = [];
    this.isLeaf = isLeaf;
    this.parent = null;
  }
}

export default BTreeNode;
