import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Tracks the OS "reduce motion" setting. System-state screens use this to drop
 * decorative entrances / floats / shimmer-as-decoration while keeping the
 * spinner (it *is* the loading signal). Mirrors the inline probe in
 * components/ui/Celebration.tsx, lifted into a shared hook.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((r) => {
      if (alive) setReduced(r);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (r) => {
      if (alive) setReduced(r);
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
