import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Radius } from '../../constants/spacing';
import { useReducedMotion } from './useReducedMotion';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Default neutral shimmer tones (st-loading.jsx --c1 / --c2). Colored cards pass
// tonal overrides (e.g. white-alpha on red, rgba(120,89,0,…) on gold).
const TROUGH = '#e8e4d8';
const CREST = '#f4f1e8';

export type SkeletonProps = {
  /** Width — number or percentage (e.g. '64%'). */
  w?: DimensionValue;
  h?: number;
  radius?: number;
  /** Base / trough tone. */
  c1?: string;
  /** Crest (lighter) tone the sweep carries across. */
  c2?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * A single shimmer block — the atom of every skeleton screen. A 100°-ish gradient
 * (c1 → c2 → c1) sweeps left→right across the block once every 1.5 s (design
 * st-skel keyframe). Reduce-motion shows the static trough tone (no sweep).
 */
export function Skeleton({
  w = '100%',
  h = moderateScale(14),
  radius = moderateScale(8),
  c1 = TROUGH,
  c2 = CREST,
  style,
}: SkeletonProps) {
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const x = useSharedValue(0);

  useEffect(() => {
    if (reduced || width === 0) return;
    x.value = 0;
    x.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
    return () => cancelAnimation(x);
  }, [reduced, width, x]);

  // Sweep the crest from fully off-left (-width) to fully off-right (+width).
  const sweep = useAnimatedStyle(() => ({
    transform: [{ translateX: -width + x.value * 2 * width }],
  }));

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[
        { width: w, height: h, borderRadius: radius, backgroundColor: c1, overflow: 'hidden' },
        style,
      ]}
    >
      {!reduced && width > 0 ? (
        <AnimatedLinearGradient
          colors={[c1, c2, c1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[StyleSheet.absoluteFill, { width }, sweep]}
        />
      ) : null}
    </View>
  );
}

/** A white chunky card frame holding skeleton blocks (st-loading.jsx SkelCard). */
export function SkelCard({
  children,
  style,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: Colors.hairline,
          borderRadius: Radius.chunky,
          borderBottomWidth: 4,
          borderBottomColor: 'rgba(27,29,14,0.07)',
          padding: moderateScale(16),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
