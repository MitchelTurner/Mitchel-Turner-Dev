export type TtlCacheOptions<T> = {
  fresh?: boolean;
  /** When this returns false, the value is served but not stored. */
  cacheable?: (value: T) => boolean;
};

/**
 * In-process cache. A hit inside the TTL is returned as-is. After the TTL,
 * the last value is returned immediately and refreshed in the background.
 * Concurrent misses share one load.
 */
export function createTtlCache<T>(ttlMs: number) {
  const values = new Map<string, { storedAt: number; value: T }>();
  const inflight = new Map<string, Promise<T>>();

  function store(key: string, value: T, cacheable?: (value: T) => boolean) {
    if (!cacheable || cacheable(value)) {
      values.set(key, { storedAt: Date.now(), value });
    }
  }

  return {
    async get(
      key: string,
      loader: () => Promise<T>,
      options?: TtlCacheOptions<T>,
    ): Promise<T> {
      const hit = values.get(key);
      const fresh = options?.fresh === true;
      if (!fresh && hit && Date.now() - hit.storedAt < ttlMs) {
        return hit.value;
      }

      const start = () => {
        const job = loader()
          .then((value) => {
            store(key, value, options?.cacheable);
            return value;
          })
          .finally(() => {
            if (inflight.get(key) === job) inflight.delete(key);
          });
        inflight.set(key, job);
        return job;
      };

      if (!fresh && hit) {
        if (!inflight.has(key)) start();
        return hit.value;
      }

      const pending = inflight.get(key);
      if (!fresh && pending) return pending;
      return start();
    },
  };
}
