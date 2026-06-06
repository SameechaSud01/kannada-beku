import { Pressable, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius, Spacing } from '../../constants/spacing';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';

export type LipButtonProps = {
  label: string;
  onPress?: () => void;
  /** Face colour. Defaults to brand red (`primaryContainer`). */
  color?: string;
  /** Hard bottom-edge ("lip") colour. Defaults to deep maroon (`redLip`). */
  lip?: string;
  /** Text/icon colour. Defaults to `onPrimary`. */
  fg?: string;
  /** Optional trailing icon (from the `Icons` map). */
  icon?: TablerIcon;
  small?: boolean;
  disabled?: boolean;
  /** Stretch to the parent's width (default). Set false for a compact pill. */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const DEPTH = 4; // resting lip height (px); shrinks to DEPTH/2 on press

/**
 * Chunky tactile button with a solid bottom "lip" (spec_playful_redesign
 * §Shadows → "lip" button). RN can't render hard-offset box-shadows, so the lip
 * is a `borderBottom` that follows the rounded corners. On press the face drops
 * `DEPTH/2`px and the lip shrinks, so the bottom edge stays put — a physical
 * key-press feel. Press timing is near-instant (prototype: ~.08s).
 */
export function LipButton({
  label,
  onPress,
  color = Colors.primaryContainer,
  lip = Colors.redLip,
  fg = Colors.onPrimary,
  icon: Icon,
  small = false,
  disabled = false,
  fullWidth = true,
  style,
  accessibilityLabel,
}: LipButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        {
          width: fullWidth ? '100%' : undefined,
          alignSelf: fullWidth ? undefined : 'center',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
          backgroundColor: color,
          borderRadius: small ? Radius.lg : moderateScale(15),
          paddingVertical: small ? Spacing.sm : Spacing.md,
          paddingHorizontal: fullWidth ? (small ? Spacing.lg : Spacing.xl) : moderateScale(40),
          borderBottomWidth: pressed ? DEPTH / 2 : DEPTH,
          borderBottomColor: lip,
          transform: [{ translateY: pressed ? DEPTH / 2 : 0 }],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Text
        maxFontSizeMultiplier={1.3}
        style={{
          fontFamily: Fonts.baloo.bold,
          fontSize: moderateScale(small ? 14.5 : 16.5),
          color: fg,
          letterSpacing: 0.1,
        }}
      >
        {label}
      </Text>
      {Icon ? (
        // View keeps the icon baseline aligned with the label text.
        <View>
          <Icon size={moderateScale(18)} color={fg} strokeWidth={2.4} />
        </View>
      ) : null}
    </Pressable>
  );
}
