interface WindowState {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, WindowState>();

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export function checkRateLimit(key: string, options: RateLimitOptions): {
  ok: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const current = memoryStore.get(key);

  if (!current || current.resetAt < now) {
    const resetAt = now + options.windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return { ok: true, remaining: options.limit - 1, resetAt };
  }

  current.count += 1;
  memoryStore.set(key, current);

  if (current.count > options.limit) {
    return { ok: false, remaining: 0, resetAt: current.resetAt };
  }

  return {
    ok: true,
    remaining: options.limit - current.count,
    resetAt: current.resetAt,
  };
}
