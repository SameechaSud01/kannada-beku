import { useEffect } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';

export type BrandSpinnerProps = {
  size?: number;
  color?: string;
  track?: string;
  strokeWidth?: number;
};

/**
 * The in-app loading mark — a chunky red ring (~28% arc) spinning at 0.9 s/turn,
 * the branded replacement for ActivityIndicator (st-shared.jsx CKSpinner). The
 * spinner IS the loading signal, so it keeps spinning even under reduce-motion.
 */
export function BrandSpinner({
  size = 48,
  color = Colors.primaryContainer,
  track = 'rgba(27,29,14,0.10)',
  strokeWidth = 5,
}: BrandSpinnerProps) {
  const dim = moderateScale(size);
  const sw = moderateScale(strokeWidth);
  const c = dim / 2;
  const r = c - sw / 2;
  const circ = 2 * Math.PI * r;

  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(rot);
  }, [rot]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));

  return (
    <Animated.View style={[{ width: dim, height: dim }, style]}>
      <Svg width={dim} height={dim}>
        <Circle cx={c} cy={c} r={r} stroke={track} strokeWidth={sw} fill="none" />
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={color}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ * 0.28} ${circ}`}
        />
      </Svg>
    </Animated.View>
  );
}
