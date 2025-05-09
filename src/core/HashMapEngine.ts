import path from "path";
import fs from "fs";
import { KeyValueStore } from "../types/kv";
import PersistanceEngine from "./PersistenceEngine";
class HashMapEngine implements KeyValueStore {
  private map: Map<string, string>;
  private filePath: string;
  constructor() {
    this.map = new Map();
    this.filePath = path.join(__dirname, "../data/data.log");
    this.loadFromLog();
  }

  set(key: string, value: string): void {
    PersistanceEngine.append(key, value);
    this.map.set(key, value);
  }
  get(key: string): string | undefined {
    if (this.map.has(key)) return this.map.get(key);
    return undefined;
  }
  delete(key: string): boolean {
    if (this.map.has(key)) {
      PersistanceEngine.append(key);
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

  private loadFromLog() {
    if (!fs.existsSync(this.filePath)) return;
    let logs: string | Array<string> = fs
      .readFileSync(this.filePath)
      .toString();
    logs = logs.split("\n");
    for (let log of logs) {
      log = log.trim();
      if (!log) continue;
      const elements = log.split(" ");
      const op = elements[0];
      if (op === "SET") {
        this.map.set(elements[1], elements.slice(2).join(" "));
      } else if (op === "DEL") {
        this.map.delete(elements[1]);
      }
    }
  }
}
const engine = new HashMapEngine();
export default engine;
