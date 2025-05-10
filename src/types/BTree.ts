import BTreeNode from "../core/BTreeNode";

export interface IBTree<T extends { compareTo(other: T): number }> {
  insert(value: T): boolean;
  delete(value: T): boolean;
  split(node: BTreeNode<T>): void;
  search(value: T): T | undefined;
}
