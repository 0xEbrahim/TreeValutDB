import path from "path";
import fs from "fs";
import { IPersistence } from "../types/persistence";

class PersistenceEngine implements IPersistence {
  private filePath: string;
  constructor() {
    this.filePath = path.join(__dirname, "../data/data.log");
    if (!fs.existsSync(path.dirname(this.filePath))) {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    }
  }
  append(key: string, value?: string): void {
    const text: string =
      value === undefined ? `DEL ${key}\n` : `SET ${key} ${value}`;

    fs.appendFileSync(this.filePath, text);
  }
}

const Engine = new PersistenceEngine();
export default Engine;
