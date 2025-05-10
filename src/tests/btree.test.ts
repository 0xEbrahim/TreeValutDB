import BTree from "./../core/BTree";

class ComparableString {
  constructor(public value: string) {}
  compareTo(other: ComparableString): number {
    return this.value.localeCompare(other.value);
  }
  toString() {
    return this.value;
  }
}

function wrap(arr: string[]): ComparableString[] {
  return arr.map((v) => new ComparableString(v));
}

describe("BTree", () => {
  let tree: BTree<ComparableString>;

  beforeEach(() => {
    tree = new BTree<ComparableString>(4);
  });

  test("Test insertion", () => {
    const values = wrap([
      "G",
      "F",
      "L",
      "E",
      "M",
      "N",
      "O",
      "S",
      "D",
      "U",
      "Q",
    ]);
    values.forEach((v) => tree.insert(v));
    expect(tree.search(new ComparableString("L"))).toBeDefined();
    expect(tree.delete(new ComparableString("L"))).toBe(true);
    expect(tree.search(new ComparableString("L"))).toBeUndefined();
  });

  test("Bulk Test", () => {
    let stringArray: ComparableString[] = Array.from(
      { length: 100 },
      (_, i) => new ComparableString(`Value ${i + 1}`)
    );
    stringArray.forEach((v) => tree.insert(v));
    expect(tree.search(new ComparableString("Value 99"))).toBeDefined();
    expect(tree.delete(new ComparableString("Value 105"))).toBe(false);
    expect(tree.delete(new ComparableString("Value 50"))).toBe(true);
    expect(tree.search(new ComparableString("Value 50"))).toBeUndefined();
  });
});
