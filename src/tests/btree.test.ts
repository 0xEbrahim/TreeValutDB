import BTree from "../core/BTree";
import BTreeNode from "../core/BTreeNode";

interface TestType<T> {
  value: T;
  compareTo(other: TestType<T>): number;
}

class NumberKey implements TestType<number> {
  constructor(public value: number) {}
  compareTo(other: NumberKey): number {
    return this.value - other.value;
  }
}

class StringKey implements TestType<string> {
  constructor(public value: string) {}
  compareTo(other: StringKey): number {
    return this.value.localeCompare(other.value);
  }
}

class DateKey implements TestType<Date> {
  constructor(public value: Date) {}
  compareTo(other: DateKey): number {
    return this.value.getTime() - other.value.getTime();
  }
}

class ComplexKey implements TestType<{ id: number; name: string }> {
  constructor(public value: { id: number; name: string }) {}
  compareTo(other: ComplexKey): number {
    return (
      this.value.id - other.value.id ||
      this.value.name.localeCompare(other.value.name)
    );
  }
}

const validateTree = <T>(
  node: BTreeNode<TestType<T>>,
  t: number,
  isRoot: boolean = true
) => {
  if (!node) throw new Error("Node is undefined");
  if (isRoot) {
    if (node.isLeaf) {
      expect(node.keys.length).toBeLessThanOrEqual(2 * t - 1);
    } else {
      expect(node.keys.length).toBeGreaterThanOrEqual(1);
    }
  } else {
    expect(node.keys.length).toBeGreaterThanOrEqual(t - 1);
    expect(node.keys.length).toBeLessThanOrEqual(2 * t - 1);
  }
  for (let i = 1; i < node.keys.length; i++) {
    expect(node.keys[i - 1].compareTo(node.keys[i])).toBeLessThanOrEqual(0);
  }
  if (!node.isLeaf) {
    expect(node.children.length).toBe(node.keys.length + 1);
    node.children.forEach((child) => {
      expect(child.parent).toBe(node);
      validateTree(child, t, false);
    });
  }
};

describe("BTree Implementation Tests", () => {
  describe("Basic Operations", () => {
    const t = 2;
    let tree: BTree<NumberKey>;

    beforeEach(() => {
      tree = new BTree<NumberKey>(t);
    });

    test("should initialize empty tree", () => {
      expect(tree.rootNode.keys).toHaveLength(0);
      expect(tree.rootNode.isLeaf).toBe(true);
    });

    test("should insert and search single element", () => {
      expect(tree.insert(new NumberKey(5))).toBe(true);
      expect(tree.search(new NumberKey(5))?.value).toBe(5);
      validateTree(tree.rootNode, t);
    });

    test("should reject duplicates", () => {
      tree.insert(new NumberKey(5));
      expect(tree.insert(new NumberKey(5))).toBe(false);
      validateTree(tree.rootNode, t);
    });

    test("should delete existing element", () => {
      tree.insert(new NumberKey(5));
      expect(tree.delete(new NumberKey(5))).toBe(true);
      expect(tree.search(new NumberKey(5))).toBeUndefined();
      validateTree(tree.rootNode, t);
    });
  });

  describe("Type-Specific Tests", () => {
    test("should handle number keys", () => {
      const tree = new BTree<NumberKey>(2);
      [5, 3, 7, 1].forEach((v) => tree.insert(new NumberKey(v)));
      validateTree(tree.rootNode, 2);
      expect(tree.search(new NumberKey(5))?.value).toBe(5);
    });

    test("should handle string keys", () => {
      const tree = new BTree<StringKey>(2);
      ["apple", "banana", "cherry"].forEach((v) =>
        tree.insert(new StringKey(v))
      );
      validateTree(tree.rootNode, 2);
      expect(tree.search(new StringKey("banana"))?.value).toBe("banana");
    });

    test("should handle date keys", () => {
      const tree = new BTree<DateKey>(2);
      const dates = [new Date(2023, 0, 1), new Date(2022, 5, 15)];
      dates.forEach((v) => tree.insert(new DateKey(v)));
      validateTree(tree.rootNode, 2);
      expect(tree.search(new DateKey(dates[1]))?.value).toEqual(dates[1]);
    });

    test("should handle complex objects", () => {
      const tree = new BTree<ComplexKey>(2);
      const items = [
        { id: 3, name: "Charlie" },
        { id: 1, name: "Alice" },
      ];
      items.forEach((v) => tree.insert(new ComplexKey(v)));
      validateTree(tree.rootNode, 2);
      expect(tree.search(new ComplexKey(items[1]))?.value).toEqual(items[1]);
    });
  });

  describe("Large Scale Tests", () => {
    test("should handle 1000 items", () => {
      const tree = new BTree<NumberKey>(2);
      const values = Array.from({ length: 1000 }, (_, i) => i + 1);
      values.forEach((v) => tree.insert(new NumberKey(v)));
      validateTree(tree.rootNode, 2);
      values.forEach((v) => {
        expect(tree.search(new NumberKey(v))?.value).toBe(v);
      });
    });

    test("should handle varying t values", () => {
      const tValues = [2, 3, 5, 10];
      tValues.forEach((t) => {
        const tree = new BTree<NumberKey>(t);
        const values = Array.from({ length: 100 }, (_, i) => i + 1);
        values.forEach((v) => tree.insert(new NumberKey(v)));
        validateTree(tree.rootNode, t);
      });
    });

    test("should handle 10,000 items with t=10", () => {
      const tree = new BTree<NumberKey>(10);
      const values = Array.from({ length: 10000 }, (_, i) => i + 1);
      values.forEach((v) => tree.insert(new NumberKey(v)));
      validateTree(tree.rootNode, 10);
    });

    test("should handle mixed operations", () => {
      const tree = new BTree<NumberKey>(3);
      const values = Array.from({ length: 1000 }, (_, i) => i + 1);
      values.forEach((v) => {
        tree.insert(new NumberKey(v));
        if (v % 3 === 0) tree.delete(new NumberKey(v));
      });
      validateTree(tree.rootNode, 3);
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty tree operations", () => {
      const tree = new BTree<NumberKey>(2);
      expect(tree.delete(new NumberKey(1))).toBe(false);
      expect(tree.search(new NumberKey(1))).toBeUndefined();
    });

    test("should handle sequential duplicates", () => {
      const tree = new BTree<NumberKey>(2);
      for (let i = 0; i < 10; i++) {
        tree.insert(new NumberKey(42));
      }
      validateTree(tree.rootNode, 2);
    });

    test("should handle root node splits", () => {
      const tree = new BTree<NumberKey>(2);
      [1, 2, 3, 4, 5].forEach((v) => tree.insert(new NumberKey(v)));
      validateTree(tree.rootNode, 2);
    });

    test("should handle root node merges", () => {
      const tree = new BTree<NumberKey>(2);
      [1, 2, 3, 4, 5].forEach((v) => tree.insert(new NumberKey(v)));
      [5, 4, 3, 2, 1].forEach((v) => tree.delete(new NumberKey(v)));
      validateTree(tree.rootNode, 2);
    });
  });
});
