import path from "path";
import fs from "fs";
import { KeyValueStore } from "../types/kv";
import PersistanceEngine from "./PersistenceEngine";
class HashMapEngine implements KeyValueStore {
  private map: Map<string, string>;
  private dataFilePath: string;
  private tempFilePath: string;
  private counter: number;
  constructor() {
    this.map = new Map();
    this.counter = 0;
    this.dataFilePath = path.join(__dirname, "../data/data.log");
    this.tempFilePath = path.join(__dirname, "../data/temp.log");
    this.loadFromLog();
  }

  set(key: string, value: string): void {
    PersistanceEngine.append(key, value);
    this.counter++;
    if (this.counter > 100000) this.size();
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
    this.size();
    return false;
  }
  has(key: string): boolean {
    return this.map.has(key);
  }
  clear(): void {
    this.map.clear();
  }

  private loadFromLog() {
    try {
      if (!fs.existsSync(this.dataFilePath)) return;
      let logs: string | Array<string> = fs
        .readFileSync(this.dataFilePath)
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
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  private compact() {
    try {
      fs.writeFileSync(this.tempFilePath, "");
      for (let [key, value] of this.map) {
        fs.appendFileSync(this.tempFilePath, `SET ${key} ${value}\n`);
      }
      fs.renameSync(this.tempFilePath, this.dataFilePath);
    } catch (err: any) {
      fs.writeFileSync(this.tempFilePath, "");
      throw new Error(err.message);
    }
  }

  private size() {
    try {
      this.counter++;
      if (this.counter > 100000) {
        const stats = fs.statSync(this.dataFilePath);
        if (stats.size >= 4000000) this.compact();
      }
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}
const engine = new HashMapEngine();
export default engine;
