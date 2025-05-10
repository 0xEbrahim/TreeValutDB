import { IBTree } from "../types/BTree";

class BTree<T extends { compareTo(other: T): number }> implements IBTree<T> {
  rootNode: BTreeNode<T>;
  size: number;
  constructor() {
    this.rootNode = new BTreeNode<T>();
    this.size = 0;
  }
  search(value: T): T | undefined {
    return this._search(this.rootNode, value);
  }

  insert(value: T): void {
    throw new Error("Method not implemented.");
  }
  delete(value: T): boolean {
    throw new Error("Method not implemented.");
  }
  split(node: BTreeNode<T>): void {
    this._split(node);
  }

  private _search(node: BTreeNode<T>, value: T): T | undefined {
    const keys = node.keys;
    let l = 0,
      r = keys.length - 1;
    let found = -1;
    while (l <= r) {
      let mid = Math.floor((l + r) / 2);
      let cmp = keys[mid].compareTo(value);
      if (cmp === 0) {
        return keys[mid];
      } else if (cmp < 0) {
        l = mid + 1;
        found = mid;
      } else {
        r = mid - 1;
      }
    }
    if (node.isLeaf) {
      return undefined;
    }
    const childIndex = found + 1;
    return this._search(node.children[childIndex], value);
  }

  private _split(node: BTreeNode<T>): void {
    let mid = Math.floor((node.keys.length - 1) / 2);
    let value = node.keys[mid];

    let leftNode: BTreeNode<T> = new BTreeNode<T>();
    let rightNode: BTreeNode<T> = new BTreeNode<T>();

    let parent = node.parent;
    if (parent === null) {
      parent = new BTreeNode<T>();
      this.rootNode = parent;
    }
    let insertionIndex = this._findInsertionIndex(parent, value);
    parent.keys = [
      ...parent.keys.slice(0, insertionIndex),
      value,
      ...parent.keys.slice(insertionIndex),
    ];

    for (let i = 0; i < mid; i++) {
      leftNode.keys.push(node.keys[i]);
    }
    for (let i = mid + 1; i < node.keys.length; i++) {
      rightNode.keys.push(node.keys[i]);
    }

    if (!node.isLeaf) {
      for (let i = 0; i <= mid; i++) {
        leftNode.children.push(node.children[i]);
        node.children[i].parent = leftNode;
      }

      for (let i = mid + 1; i < node.children.length; i++) {
        rightNode.children.push(node.children[i]);
        node.children[i].parent = rightNode;
      }
    } else {
      leftNode.isLeaf = rightNode.isLeaf = true;
    }

    let index = -1;
    for (let i = 0; i < parent.children.length; i++) {
      if (parent.children[i] === node) {
        index = i;
        break;
      }
    }
    parent.children.splice(index, 1);
    parent.children.push(leftNode);
    parent.children.push(rightNode);

    leftNode.parent = parent;
    rightNode.parent = parent;

    if (parent.children.length > 2 * parent.t - 1) {
      this._split(parent);
    }
  }

  private _findInsertionIndex(node: BTreeNode<T>, value: T): number {
    let l = 0;
    let r = node.keys.length - 1;
    let insertionIndex: number = 0;
    while (l <= r) {
      let midParent = Math.floor((l + r) / 2);
      let cmp = node.keys[midParent].compareTo(value);
      if (cmp === 0) {
        insertionIndex = midParent;
        break;
      } else if (cmp < 0) {
        insertionIndex = midParent + 1;
        l = midParent + 1;
      } else {
        r = midParent - 1;
      }
    }
    return insertionIndex;
  }
}
