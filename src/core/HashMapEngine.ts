import { KeyValueStore } from "../types/kv";

class HashMapEngine implements KeyValueStore {
  private map: Map<string, string>;
  constructor() {
    this.map = new Map();
  }
  set(key: string, value: string): void {
    this.map.set(key, value);
  }
  get(key: string): string | undefined {
    return this.get(key);
  }
  delete(key: string): boolean {
    return this.delete(key);
  }
  has(key: string): boolean {
    return this.has(key);
  }
}
const engine = new HashMapEngine();
export default engine;
