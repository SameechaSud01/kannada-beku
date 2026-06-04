/**
 * Typewriter reveal for a chat line (spec_conversations_runner §8).
 *
 * Phases: 'dots' (typing indicator) → 'typing' (characters appear) → 'done'.
 * Reveals by Unicode code point (`Array.from`) rather than UTF-16 unit so
 * Kannada surrogate-free clusters don't tear too badly mid-reveal.
 */
import { useEffect, useState } from 'react';

export type TypewriterPhase = 'dots' | 'typing' | 'done';

const DOTS_MS = 450;
const CHAR_MS = 35;

export function useTypewriter(text: string): { shown: string; phase: TypewriterPhase } {
  const [shown, setShown] = useState('');
  const [phase, setPhase] = useState<TypewriterPhase>('dots');

  useEffect(() => {
    const chars = Array.from(text);
    setShown('');
    setPhase('dots');

    let charTimer: ReturnType<typeof setInterval> | null = null;
    const startTimer = setTimeout(() => {
      setPhase('typing');
      let i = 0;
      charTimer = setInterval(() => {
        i += 1;
        setShown(chars.slice(0, i).join(''));
        if (i >= chars.length) {
          if (charTimer) clearInterval(charTimer);
          setPhase('done');
        }
      }, CHAR_MS);
    }, DOTS_MS);

    return () => {
      clearTimeout(startTimer);
      if (charTimer) clearInterval(charTimer);
    };
  }, [text]);

  return { shown, phase };
}
