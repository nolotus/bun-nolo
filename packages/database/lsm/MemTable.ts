// src/MemTable.ts
export class MemTable {
  private table: Map<string, string>;

  constructor() {
    this.table = new Map();
  }

  set(key: string, value: string): void {
    this.table.set(key, value);
  }

  get(key: string): string | undefined {
    return this.table.get(key);
  }

  delete(key: string): void {
    this.table.set(key, "__deleted__");
  }

  getAllEntries(): [string, string][] {
    return Array.from(this.table.entries());
  }

  clear(): void {
    this.table.clear();
  }

  isEmpty(): boolean {
    return this.table.size === 0;
  }
}
