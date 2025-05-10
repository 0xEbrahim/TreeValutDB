import { IBTree } from "../types/BTree";
import BTreeNode from "./BTreeNode";

class BTree<T extends { compareTo(other: T): number }> implements IBTree<T> {
  rootNode: BTreeNode<T>;
  size: number;

  constructor(t?: number) {
    this.rootNode = new BTreeNode<T>(t);
    this.size = 0;
  }

  search(value: T): T | undefined {
    return this._search(this.rootNode, value);
  }

  insert(value: T): boolean {
    return this._insert(this.rootNode, value);
  }

  delete(value: T): boolean {
    if (this.search(value) === undefined) return false;
    return this._delete(this.rootNode, value);
  }

  split(node: BTreeNode<T>): void {
    this._split(node);
  }

  private _insert(node: BTreeNode<T>, value: T): boolean {
    let index = this._findInsertionIndex(node, value);
    if (index < node.keys.length && node.keys[index].compareTo(value) === 0) {
      return false;
    }

    if (node.isLeaf) {
      node.keys = [
        ...node.keys.slice(0, index),
        value,
        ...node.keys.slice(index),
      ];
      if (node.keys.length > 2 * node.t - 1) {
        this.split(node);
      }
      return true;
    } else {
      return this._insert(node.children[index], value);
    }
  }

  private _delete(node: BTreeNode<T>, value: T): boolean {
    let index = this._findInsertionIndex(node, value);

    if (index < node.keys.length && node.keys[index].compareTo(value) === 0) {
      if (node.isLeaf) {
        node.keys.splice(index, 1);
      } else {
        const predecessor = this._getPredecessor(node, index);
        node.keys[index] = predecessor;
        this._delete(node.children[index], predecessor);
        return true;
      }
    } else {
      const child = node.children[index];
      this._delete(child, value);
    }

    if (node !== this.rootNode && node.keys.length < node.t - 1) {
      const parent = node.parent!;
      const curIndex = parent.children.indexOf(node);

      let leftSibling: BTreeNode<T> | null =
        curIndex > 0 ? parent.children[curIndex - 1] : null;
      let rightSibling: BTreeNode<T> | null =
        curIndex + 1 < parent.children.length
          ? parent.children[curIndex + 1]
          : null;

      if (leftSibling && leftSibling.keys.length > node.t - 1) {
        const borrowedKey = leftSibling.keys.pop()!;
        const parentKey = parent.keys[curIndex - 1];
        parent.keys[curIndex - 1] = borrowedKey;
        node.keys.unshift(parentKey);
        if (!node.isLeaf) {
          const borrowedChild = leftSibling.children.pop()!;
          node.children.unshift(borrowedChild);
          borrowedChild.parent = node;
        }
      } else if (rightSibling && rightSibling.keys.length > node.t - 1) {
        const borrowedKey = rightSibling.keys.shift()!;
        const parentKey = parent.keys[curIndex];
        parent.keys[curIndex] = borrowedKey;
        node.keys.push(parentKey);
        if (!node.isLeaf) {
          const borrowedChild = rightSibling.children.shift()!;
          node.children.push(borrowedChild);
          borrowedChild.parent = node;
        }
      } else {
        if (leftSibling) {
          const parentKey = parent.keys[curIndex - 1];
          leftSibling.keys.push(parentKey, ...node.keys);
          if (!node.isLeaf) {
            for (const child of node.children) {
              child.parent = leftSibling;
              leftSibling.children.push(child);
            }
          }
          parent.keys.splice(curIndex - 1, 1);
          parent.children.splice(curIndex, 1);
        } else if (rightSibling) {
          const parentKey = parent.keys[curIndex];
          node.keys.push(parentKey, ...rightSibling.keys);
          if (!node.isLeaf) {
            for (const child of rightSibling.children) {
              child.parent = node;
              node.children.push(child);
            }
          }
          parent.keys.splice(curIndex, 1);
          parent.children.splice(curIndex + 1, 1);
        }

        if (parent !== this.rootNode && parent.keys.length < parent.t - 1) {
          this._delete(parent, parent.keys[0]);
        }
      }
    }

    if (this.rootNode.keys.length === 0 && !this.rootNode.isLeaf) {
      this.rootNode = this.rootNode.children[0];
      this.rootNode.parent = null;
    }

    return true;
  }

  private _search(node: BTreeNode<T>, value: T): T | undefined {
    const keys = node.keys;
    let l = 0,
      r = keys.length - 1;
    let found = 0;
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
    return this._search(node.children[l], value);
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

  private _getPredecessor(node: BTreeNode<T>, index: number): T {
    let cur = node.children[index];
    while (!cur.isLeaf) {
      cur = cur.children[cur.children.length - 1];
    }
    return cur.keys[cur.keys.length - 1];
  }
}

export default BTree;
