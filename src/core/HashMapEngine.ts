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
    if (this.map.has(key)) return this.map.get(key);
    return undefined;
  }
  delete(key: string): boolean {
    if (this.map.has(key)) {
      this.map.delete(key);
      return true;
    }
    return false;
  }
  has(key: string): boolean {
    return this.map.has(key);
  }
  clear(): void {
    this.map.clear();
  }
}
const engine = new HashMapEngine();
export default engine;
