export class ExpiringCache<T> {
  private readonly values = new Map<string, { value: T; expiresAt: number }>();

  constructor(private readonly ttlMs: number) {}

  get(key: string): T | undefined {
    const item = this.values.get(key);
    if (!item) return undefined;
    if (item.expiresAt <= Date.now()) {
      this.values.delete(key);
      return undefined;
    }
    return item.value;
  }

  set(key: string, value: T): void {
    this.values.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  clear(): void {
    this.values.clear();
  }
}
