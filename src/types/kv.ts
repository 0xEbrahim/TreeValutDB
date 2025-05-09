export interface KeyValueStore {
  set(key: string, value: string): void;
  get(key: string): string | undefined;
  delete(key: string): boolean;
  has(key: string): boolean;
}
