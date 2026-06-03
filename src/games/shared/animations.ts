/**
 * Shared game animation hooks (spec_game_polish §2).
 *
 * Extracted verbatim from the gold-standard
 * `src/games/opposites/components/OptionButton.tsx` so every game shares one
 * feedback vocabulary. RN built-in `Animated` only (no Reanimated).
 */
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { moderateScale } from 'react-native-size-matters';

const LIFT_PX = moderateScale(7);
const LIFT_SCALE = 1.04;

/**
 * The `[LOCKED]` wrong-answer shake: translateX 6 → -6 → 4 → 0, 50ms each.
 * Returns a `translateX` value to spread into a transform; runs whenever
 * `active` transitions to true.
 */
export function useShake(active: boolean): Animated.Value {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    Animated.sequence([
      Animated.timing(translateX, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 4, duration: 50, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [active, translateX]);

  return translateX;
}

export type CorrectLift = {
  translateY: Animated.Value;
  scale: Animated.Value;
  /** opacity for the fade-in checkmark (0 → 1) */
  checkProgress: Animated.Value;
  /** scale for the fade-in checkmark (0.6 → 1) */
  checkScale: Animated.AnimatedInterpolation<number>;
};

/**
 * The correct/reveal "lift": spring translateY -7 + scale 1.04, plus a
 * fade-in checkmark progress value. The consumer renders the actual checkmark
 * icon and the shadow elevation off `isLifted`.
 */
export function useCorrectLift(isLifted: boolean): CorrectLift {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const checkProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: isLifted ? -LIFT_PX : 0,
        damping: 15,
        stiffness: 180,
        mass: 1,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: isLifted ? LIFT_SCALE : 1,
        damping: 15,
        stiffness: 180,
        mass: 1,
        useNativeDriver: true,
      }),
      Animated.timing(checkProgress, {
        toValue: isLifted ? 1 : 0,
        duration: isLifted ? 180 : 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isLifted, translateY, scale, checkProgress]);

  const checkScale = checkProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return { translateY, scale, checkProgress, checkScale };
}

/**
 * Advance fade-in (opacity 0 → 1 in 240ms), keyed on a changing value (e.g.
 * the question/turn index). Matches the `[LOCKED]` phrase-advance fade.
 */
export function useAdvanceFade(key: unknown): Animated.Value {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [key, opacity]);

  return opacity;
}

/**
 * Result-screen entrance: scale 0.9 → 1 + fade-in spring, run once on mount.
 */
export function useEntrance(): { opacity: Animated.Value; scale: Animated.Value } {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 14,
        stiffness: 160,
        mass: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return { opacity, scale };
}
