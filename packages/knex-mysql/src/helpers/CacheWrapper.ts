import hasher from 'node-object-hash';

interface Hasher {
  hash: (x: unknown) => string;
}

interface Cacher {
  get: <K = string, V = unknown>(key: K) => V;
  set: <K = string, V = unknown>(key: K, value: V, ttl: number) => Promise<V>;
  del: <K>(key: K) => Promise<void>;
}

interface Options {
  hasher?: Hasher;
  cacher?: Cacher;
  ttl?: number;
}

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class CacheWrapper {
  hasher: Hasher;
  cacher?: Cacher;

  ttl: number;

  cachingTasks: Set<string>;

  constructor(options?: Options) {
    this.hasher = hasher();
    this.ttl = options?.ttl ?? 0;
    this.cachingTasks = new Set();

    this.cacher = options?.cacher;
  }

  async get<T = unknown>(arg: unknown, raw: () => Promise<T>): Promise<T> {
    if (this.cacher) {
      const hash = this.hasher.hash(arg);
      const result = await this.cacher.get(hash);

      if (result) return result as T;

      if (this.cachingTasks.has(hash)) {
        await wait(25);
        return this.get(arg, raw);
      }

      const found = await raw();
      this.cachingTasks.add(hash);

      await this.cacher
        .set(hash, found, this.ttl)
        .finally(() => this.cachingTasks.delete(hash));

      return found;
    }

    return raw();
  }
}
