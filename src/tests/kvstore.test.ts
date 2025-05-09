import Engine from "../core/HashMapEngine";

beforeEach(() => {
  Engine.clear();
});

describe("Test Key-Value storage", () => {
  test("Setting then check if exist", () => {
    Engine.set("name", "Ibrahim");
    expect(Engine.has("name")).toBe(true);
    expect(Engine.has("class")).toBe(false);
  });

  test("Setting then try to get the value before and after overwritting", () => {
    Engine.set("name", "Ibrahim");
    Engine.set("class", "Eng");
    Engine.set("age", "17");
    expect(Engine.get("name")).toBe("Ibrahim");
    expect(Engine.get("class")).toBe("Eng");
    expect(Engine.get("age")).toBe("17");
    Engine.set("name", "Khaled");
    expect(Engine.get("name")).toBe("Khaled");
  });

  test("Setting then check if exist, then delete and recheck", () => {
    Engine.set("name", "Ibrahim");
    expect(Engine.has("name")).toBe(true);
    expect(Engine.delete("name")).toBe(true);
    expect(Engine.has("name")).toBe(false);
    expect(Engine.get("name")).toBe(undefined);
    expect(Engine.delete("name")).toBe(false);
  });

  test("Unusual behaviour", () => {
    Engine.set("", "empty");
    expect(Engine.get("")).toBe("empty");

    Engine.set("🚀", "rocket");
    expect(Engine.get("🚀")).toBe("rocket");
  });
});
