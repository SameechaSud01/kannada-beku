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
