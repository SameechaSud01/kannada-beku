import { withTimeout, TimeoutError } from '../../lib/withTimeout';

describe('withTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves with the promise value when it settles before the deadline', async () => {
    const result = withTimeout(Promise.resolve('ok'), 1000, 'test');
    await expect(result).resolves.toBe('ok');
  });

  it('rejects with the promise error when it fails before the deadline', async () => {
    const boom = new Error('boom');
    await expect(withTimeout(Promise.reject(boom), 1000, 'test')).rejects.toBe(boom);
  });

  it('rejects with TimeoutError when the deadline passes first', async () => {
    const never = new Promise<string>(() => {});
    const result = withTimeout(never, 1000, 'stalled-read');
    jest.advanceTimersByTime(1001);
    await expect(result).rejects.toBeInstanceOf(TimeoutError);
    await expect(result).rejects.toThrow('stalled-read timed out after 1000ms');
  });

  it('accepts thenables (supabase query builders are not real Promises)', async () => {
    const thenable: PromiseLike<number> = {
      then: (onFulfilled) => Promise.resolve(42).then(onFulfilled),
    };
    await expect(withTimeout(thenable, 1000, 'thenable')).resolves.toBe(42);
  });

  it('clears its timer once settled (no open handle after resolution)', async () => {
    await withTimeout(Promise.resolve('done'), 1000, 'test');
    expect(jest.getTimerCount()).toBe(0);
  });
});
