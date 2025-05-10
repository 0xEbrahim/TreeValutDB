export interface IBTree<T extends { compareTo(other: T): number }> {
  insert(value: T): void;
  delete(value: T): boolean;
  split(node: BTreeNode<T>): void;
  search(value: T): T | undefined;
}
