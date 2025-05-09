export interface IPersistence {
  append(key: string, value: string): void;
  append(key: string): void;
}
