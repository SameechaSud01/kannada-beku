import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { useReducedMotion } from './useReducedMotion';

// Splash loader dot — quieter than a spinner (st-shared.jsx CKDots). Gold by default.
const DOT_GOLD = '#cf9a1c';

export type LoadingDotsProps = {
  color?: string;
  size?: number;
};

/** Three gold dots bouncing in a staggered wave. Reduce-motion → static row. */
export function LoadingDots({ color = DOT_GOLD, size = 8 }: LoadingDotsProps) {
  const reduced = useReducedMotion();
  const dot = moderateScale(size);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(7) }}>
      {[0, 1, 2].map((i) => (
        <Dot key={i} i={i} color={color} dot={dot} reduced={reduced} />
      ))}
    </View>
  );
}

function Dot({ i, color, dot, reduced }: { i: number; color: string; dot: number; reduced: boolean }) {
  const v = useSharedValue(0);
  // Precompute outside the worklet — moderateScale is plain JS and would throw on
  // the UI runtime (a worklet may only call worklets / captured constants).
  const lift = moderateScale(6);
  useEffect(() => {
    if (reduced) return;
    v.value = withDelay(
      i * 150,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 460, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 690, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
    return () => cancelAnimation(v);
  }, [i, reduced, v]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -lift * v.value }],
    opacity: 0.5 + 0.5 * v.value,
  }));

  return (
    <Animated.View
      style={[
        { width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color },
        reduced ? { opacity: 1 } : style,
      ]}
    />
  );
}
