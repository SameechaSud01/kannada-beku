/**
 * Bounded await for network reads (spec_scalability_offline_fixes Phase 4).
 *
 * Supabase-js has no per-request timeout, so a stalled (not failed) connection
 * can hang a query indefinitely and pin screens in their loading state. This
 * races the request against a timer so callers surface their error/fallback
 * path instead. Note: the underlying request is not aborted — only the await
 * is released; PostgREST requests are cheap enough that this is acceptable.
 */

export const DEFAULT_TIMEOUT_MS = 10_000;

export class TimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`${label} timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

export async function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new TimeoutError(label, ms)), ms);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
