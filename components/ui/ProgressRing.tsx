import { useEffect } from 'react';
import { View } from 'react-native';
import type { ReactNode } from 'react';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type ProgressRingProps = {
  /** 0–1. */
  progress: number;
  /** Outer diameter (pre-scale). */
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  /** Sweep from empty to `progress` on mount. */
  animated?: boolean;
  /** Centred content (e.g. a "13%" label). */
  children?: ReactNode;
};

/**
 * Gold progress ring (spec_playful_redesign — Home progress card, celebration
 * badge). SVG circle whose `strokeDashoffset` encodes progress; sweeps via
 * reanimated when `animated`.
 */
export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 8,
  color = Colors.secondaryContainer,
  trackColor = Colors.surfaceContainerHigh,
  animated = false,
  children,
}: ProgressRingProps) {
  const dim = moderateScale(size);
  const sw = moderateScale(strokeWidth);
  const r = (dim - sw) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));

  const sweep = useSharedValue(animated ? 0 : clamped);

  useEffect(() => {
    if (animated) {
      sweep.value = withTiming(clamped, {
        duration: 1000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    } else {
      sweep.value = clamped;
    }
  }, [animated, clamped, sweep]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circ * (1 - sweep.value),
  }));

  return (
    <View style={{ width: dim, height: dim, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={dim} height={dim} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={dim / 2} cy={dim / 2} r={r} stroke={trackColor} strokeWidth={sw} fill="none" />
        <AnimatedCircle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          stroke={color}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          animatedProps={animatedProps}
        />
      </Svg>
      {children}
    </View>
  );
}

export type RingSpec = {
  /** 0–1. */
  progress: number;
  color: string;
};

export type MultiProgressRingProps = {
  /** Outer → inner. The first ring is the largest. */
  rings: RingSpec[];
  /** Outer diameter (pre-scale). */
  size?: number;
  strokeWidth?: number;
  /** Gap between concentric rings (pre-scale). */
  gap?: number;
  animated?: boolean;
  children?: ReactNode;
};

/**
 * Concentric multi-ring progress (chunky_v3 — Home daily-goal card: outer
 * Listen / mid Speak / inner Practice). Each ring's track is its own colour at
 * ~16% so the rings read as nested gauges; centre content is layered over.
 */
export function MultiProgressRing({
  rings,
  size = 150,
  strokeWidth = 12,
  gap = 5,
  animated = false,
  children,
}: MultiProgressRingProps) {
  const dim = moderateScale(size);
  const sw = moderateScale(strokeWidth);
  const g = moderateScale(gap);

  return (
    <View style={{ width: dim, height: dim, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={dim} height={dim} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        {rings.map((ring, i) => {
          const r = (dim - sw) / 2 - i * (sw + g);
          if (r <= 0) return null;
          return (
            <MultiRing key={i} cx={dim / 2} cy={dim / 2} r={r} sw={sw} ring={ring} animated={animated} />
          );
        })}
      </Svg>
      {children}
    </View>
  );
}

function MultiRing({
  cx,
  cy,
  r,
  sw,
  ring,
  animated,
}: {
  cx: number;
  cy: number;
  r: number;
  sw: number;
  ring: RingSpec;
  animated: boolean;
}) {
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, ring.progress));
  const sweep = useSharedValue(animated ? 0 : clamped);

  useEffect(() => {
    if (animated) {
      sweep.value = withTiming(clamped, { duration: 600, easing: Easing.bezier(0.4, 0, 0.2, 1) });
    } else {
      sweep.value = clamped;
    }
  }, [animated, clamped, sweep]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circ * (1 - sweep.value),
  }));

  return (
    <>
      <Circle cx={cx} cy={cy} r={r} stroke={`${ring.color}40`} strokeWidth={sw} fill="none" />
      <AnimatedCircle
        cx={cx}
        cy={cy}
        r={r}
        stroke={ring.color}
        strokeWidth={sw}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        animatedProps={animatedProps}
      />
    </>
  );
}
