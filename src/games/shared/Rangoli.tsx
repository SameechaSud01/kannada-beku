/**
 * Generative rangoli/kolam reward (spec_game_polish §4).
 *
 * A mandala drawn with react-native-svg whose petal count scales with the
 * score ratio, blooming in on mount (scale + rotate + fade via `Animated` on a
 * wrapping View — the SVG itself is static, which keeps the animation on the
 * native driver and avoids per-frame SVG prop updates).
 *
 * Not an icon — an illustration — so it sits outside the icon-map rule
 * (DESIGN §Icons rule 4). Colors come from the mandala tokens.
 */
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Svg, { Circle, Ellipse, G } from 'react-native-svg';
import { Colors } from '@/constants/colors';

type Props = {
  /** 0..1 — drives how full / ornate the mandala is. */
  ratio: number;
  size?: number;
};

const CENTER = 60; // viewBox is 120×120
const MIN_PETALS = 6;
const MAX_PETALS = 14;

const Rangoli: React.FC<Props> = ({ ratio, size = moderateScale(120) }) => {
  const clamped = Math.max(0, Math.min(1, ratio));
  // Even count keeps the mandala symmetric.
  const raw = Math.round(MIN_PETALS + clamped * (MAX_PETALS - MIN_PETALS));
  const petals = raw % 2 === 0 ? raw : raw + 1;
  const step = 360 / petals;

  const bloom = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    bloom.setValue(0);
    Animated.spring(bloom, {
      toValue: 1,
      damping: 12,
      stiffness: 120,
      mass: 1,
      useNativeDriver: true,
    }).start();
  }, [bloom]);

  const scale = bloom.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const rotate = bloom.interpolate({ inputRange: [0, 1], outputRange: ['-20deg', '0deg'] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{ width: size, height: size, opacity: bloom, transform: [{ scale }, { rotate }] }}
    >
      <Svg width={size} height={size} viewBox="0 0 120 120">
        {/* outer petal ring */}
        <G>
          {Array.from({ length: petals }).map((_, i) => (
            <Ellipse
              key={`outer-${i}`}
              cx={CENTER}
              cy={CENTER - 30}
              rx={moderateScale(7)}
              ry={moderateScale(22)}
              fill={i % 2 === 0 ? Colors.secondaryFixed : Colors.secondary}
              opacity={0.9}
              transform={`rotate(${i * step} ${CENTER} ${CENTER})`}
            />
          ))}
        </G>
        {/* inner petal ring, offset half a step */}
        <G>
          {Array.from({ length: petals }).map((_, i) => (
            <Ellipse
              key={`inner-${i}`}
              cx={CENTER}
              cy={CENTER - 16}
              rx={moderateScale(5)}
              ry={moderateScale(12)}
              fill={Colors.secondaryFixed}
              transform={`rotate(${i * step + step / 2} ${CENTER} ${CENTER})`}
            />
          ))}
        </G>
        <Circle cx={CENTER} cy={CENTER} r={moderateScale(12)} fill={Colors.secondary} />
        <Circle cx={CENTER} cy={CENTER} r={moderateScale(6)} fill={Colors.secondaryFixed} />
      </Svg>
    </Animated.View>
  );
};

export default Rangoli;
