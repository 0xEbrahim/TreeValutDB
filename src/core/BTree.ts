import { IBTree } from "../types/BTree";
import BTreeNode from "./BTreeNode";

class BTree<T extends { compareTo(other: T): number }> implements IBTree<T> {
  rootNode: BTreeNode<T>;
  size: number;
  private t: number;

  constructor(t: number = 2) {
    this.t = t;
    this.rootNode = new BTreeNode<T>(t, true);
    this.size = 0;
  }
  split(node: BTreeNode<T>): void {
    return this._split(node);
  }

  search(value: T): T | undefined {
    return this._search(this.rootNode, value);
  }

  insert(value: T): boolean {
    if (this._insert(this.rootNode, value)) {
      this.size++;
      return true;
    }
    return false;
  }

  delete(value: T): boolean {
    if (this.search(value) === undefined) return false;
    if (this._delete(this.rootNode, value)) {
      this.size--;
      return true;
    }
    return false;
  }

  private _search(node: BTreeNode<T>, value: T): T | undefined {
    let index = 0;
    while (index < node.keys.length && value.compareTo(node.keys[index]) > 0) {
      index++;
    }

    if (index < node.keys.length && value.compareTo(node.keys[index]) === 0) {
      return node.keys[index];
    } else if (node.isLeaf) {
      return undefined;
    } else {
      return this._search(node.children[index], value);
    }
  }

  private _insert(node: BTreeNode<T>, value: T): boolean {
    let index = this._findInsertionIndex(node, value);

    if (index < node.keys.length && node.keys[index].compareTo(value) === 0) {
      return false; // Key already exists
    }

    if (node.isLeaf) {
      node.keys.splice(index, 0, value);
      if (node.keys.length > 2 * this.t - 1) {
        this._split(node);
      }
      return true;
    } else {
      const success = this._insert(node.children[index], value);
      if (node.children[index].keys.length > 2 * this.t - 1) {
        this._split(node.children[index]);
      }
      return success;
    }
  }

  private _split(node: BTreeNode<T>): void {
    const midIndex = Math.floor(node.keys.length / 2);
    const median = node.keys[midIndex];

    const left = new BTreeNode<T>(this.t, node.isLeaf);
    const right = new BTreeNode<T>(this.t, node.isLeaf);

    left.keys = node.keys.slice(0, midIndex);
    right.keys = node.keys.slice(midIndex + 1);

    if (!node.isLeaf) {
      left.children = node.children.slice(0, midIndex + 1);
      right.children = node.children.slice(midIndex + 1);
      left.children.forEach((child) => (child.parent = left));
      right.children.forEach((child) => (child.parent = right));
    }

    const parent = node.parent || new BTreeNode<T>(this.t, false);

    if (!node.parent) {
      parent.children.push(left, right);
      this.rootNode = parent;
    } else {
      const parentIndex = parent.children.indexOf(node);
      parent.children.splice(parentIndex, 1, left, right);
    }

    left.parent = parent;
    right.parent = parent;

    const insertIndex = this._findInsertionIndex(parent, median);
    parent.keys.splice(insertIndex, 0, median);

    if (parent.keys.length > 2 * this.t - 1) {
      this._split(parent);
    }
  }

  private _delete(node: BTreeNode<T>, value: T): boolean {
    let index = 0;
    while (index < node.keys.length && value.compareTo(node.keys[index]) > 0) {
      index++;
    }

    if (index < node.keys.length && value.compareTo(node.keys[index]) === 0) {
      if (node.isLeaf) {
        node.keys.splice(index, 1);
        this._handleUnderflow(node);
      } else {
        const predecessor = this._getPredecessor(node, index);
        node.keys[index] = predecessor;
        this._delete(node.children[index], predecessor);
      }
      return true;
    } else if (!node.isLeaf) {
      const deleted = this._delete(node.children[index], value);
      this._handleUnderflow(node.children[index]);
      return deleted;
    }
    return false;
  }

  private _handleUnderflow(node: BTreeNode<T>): void {
    if (!node) return;

    if (node.keys.length >= this.t - 1 || node === this.rootNode) return;

    const parent = node.parent!;
    const nodeIndex = parent.children.indexOf(node);

    if (nodeIndex > 0) {
      const leftSibling = parent.children[nodeIndex - 1];
      if (leftSibling.keys.length > this.t - 1) {
        const separatorIndex = nodeIndex - 1;
        node.keys.unshift(parent.keys[separatorIndex]);
        parent.keys[separatorIndex] = leftSibling.keys.pop()!;

        if (!node.isLeaf) {
          const borrowedChild = leftSibling.children.pop()!;
          node.children.unshift(borrowedChild);
          borrowedChild.parent = node;
        }
        return;
      }
    }

    if (nodeIndex < parent.children.length - 1) {
      const rightSibling = parent.children[nodeIndex + 1];
      if (rightSibling.keys.length > this.t - 1) {
        const separatorIndex = nodeIndex;
        node.keys.push(parent.keys[separatorIndex]);
        parent.keys[separatorIndex] = rightSibling.keys.shift()!;

        if (!node.isLeaf) {
          const borrowedChild = rightSibling.children.shift()!;
          node.children.push(borrowedChild);
          borrowedChild.parent = node;
        }
        return;
      }
    }

    if (nodeIndex > 0) {
      const leftSibling = parent.children[nodeIndex - 1];
      const separatorIndex = nodeIndex - 1;

      leftSibling.keys.push(parent.keys[separatorIndex], ...node.keys);
      parent.keys.splice(separatorIndex, 1);

      if (!node.isLeaf) {
        leftSibling.children.push(...node.children);
        node.children.forEach((child) => (child.parent = leftSibling));
      }

      parent.children.splice(nodeIndex, 1);
    } else {
      const rightSibling = parent.children[nodeIndex + 1];
      const separatorIndex = nodeIndex;

      node.keys.push(parent.keys[separatorIndex], ...rightSibling.keys);
      parent.keys.splice(separatorIndex, 1);

      if (!node.isLeaf) {
        node.children.push(...rightSibling.children);
        rightSibling.children.forEach((child) => (child.parent = node));
      }

      parent.children.splice(nodeIndex + 1, 1);
    }

    if (parent === this.rootNode && parent.keys.length === 0) {
      this.rootNode = parent.children[0];
      this.rootNode.parent = null;
    } else {
      this._handleUnderflow(parent);
    }
  }

  private _findInsertionIndex(node: BTreeNode<T>, value: T): number {
    let low = 0,
      high = node.keys.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (value.compareTo(node.keys[mid]) > 0) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  private _getPredecessor(node: BTreeNode<T>, index: number): T {
    let current = node.children[index];
    while (!current.isLeaf) {
      current = current.children[current.children.length - 1];
    }
    return current.keys[current.keys.length - 1];
  }
}

export default BTree;
