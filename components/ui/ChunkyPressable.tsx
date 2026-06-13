import { Pressable } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { Radius } from '../../constants/spacing';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ChunkyPressableProps = {
  children?: ReactNode;
  onPress?: () => void;
  /** Resting lip depth in px. Shrinks to 0 on press while the face drops `lip`px. */
  lip?: number;
  /** Hard bottom-edge ("lip") colour. Defaults to the neutral card lip. */
  lipColor?: string;
  /** Corner radius. Defaults to the chunky 16. */
  radius?: number;
  /** Face fill colour. Defaults to white. */
  bg?: string;
  /** 1px hairline border (white cards get one per the kit). */
  border?: boolean;
  borderColor?: string;
  borderWidth?: number;
  disabled?: boolean;
  /** Style applied to the pressable box itself (use for width / margins / padding). */
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'none';
};

const PRESS_MS = 80;

/**
 * Generic chunky lip-press surface (chunky_v3). Generalises `LipButton`'s
 * physical key-press feel to cards, chips, orbs and rows: on press-in the face
 * drops `lip`px (translateY) while the bottom lip shrinks to 0, so the bottom
 * edge stays put. Press timing is ~80ms (reanimated). Disabled surfaces are
 * flat — no lip, no translate, `surfaceContainerHighest` fill — and never
 * animate (chunky_v3 § State semantics).
 *
 * The pressable IS the styled box (single element), so width / flex / margins
 * passed via `style` resolve against the parent as expected.
 */
export function ChunkyPressable({
  children,
  onPress,
  lip = 4,
  lipColor = Colors.cardLip,
  radius = Radius.chunky,
  bg = '#ffffff',
  border = false,
  borderColor = Colors.hairline,
  borderWidth = 1,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityRole = 'button',
}: ChunkyPressableProps) {
  const press = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: press.value * lip }],
    borderBottomWidth: lip - press.value * lip,
  }));

  // Disabled: flat recipe, no animation, no press handler.
  if (disabled) {
    return (
      <Animated.View
        accessibilityRole={accessibilityRole === 'none' ? undefined : accessibilityRole}
        accessibilityState={{ disabled: true }}
        style={[
          { backgroundColor: Colors.surfaceContainerHighest, borderRadius: radius, borderBottomWidth: 0 },
          style,
        ]}
      >
        {children}
      </Animated.View>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        press.value = withTiming(1, { duration: PRESS_MS, easing: Easing.out(Easing.ease) });
      }}
      onPressOut={() => {
        press.value = withTiming(0, { duration: PRESS_MS, easing: Easing.out(Easing.ease) });
      }}
      accessibilityRole={accessibilityRole === 'none' ? undefined : accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          backgroundColor: bg,
          borderRadius: radius,
          borderBottomColor: lipColor,
          borderTopWidth: border ? borderWidth : 0,
          borderLeftWidth: border ? borderWidth : 0,
          borderRightWidth: border ? borderWidth : 0,
          borderColor: border ? borderColor : undefined,
        },
        animatedStyle,
        style,
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}
