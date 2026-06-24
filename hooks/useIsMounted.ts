import { useEffect, useRef } from 'react';

/**
 * Ref that tracks whether the component is still mounted. Guard async
 * `.then`/`.finally` setState callbacks with `if (!mounted.current) return` to
 * avoid "state update on an unmounted component" warnings and wasted work after
 * a fast unmount — e.g. tapping an audio orb then navigating away before
 * playback resolves (audit H5/H6).
 */
export function useIsMounted() {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return mounted;
}
