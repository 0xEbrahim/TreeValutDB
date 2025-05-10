class BTreeNode<T extends { compareTo(other: T): number }> {
  keys: T[];
  t: number;
  children: BTreeNode<T>[];
  isLeaf: boolean;

  constructor(t: number = 4) {
    this.keys = [];
    this.t = t;
    this.children = [];
    this.isLeaf = true;
  }
}
