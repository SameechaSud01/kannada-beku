import { Pressable, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius, Spacing } from '../../constants/spacing';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';

export type LipButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'gold';

export type LipButtonProps = {
  label: string;
  onPress?: () => void;
  /**
   * Visual rung (chunky_v3 § State semantics):
   * - `primary`   red face / redLip lip (the one action-red per screen)
   * - `secondary` white face + 2px tan border + tan lip (supporting action)
   * - `tertiary`  quiet text button, no lip (muted)
   * - `gold`      reward CTA (gold face / goldLip lip)
   */
  variant?: LipButtonVariant;
  /** Override the variant's face colour. */
  color?: string;
  /** Override the variant's lip colour. */
  lip?: string;
  /** Override the variant's text/icon colour. */
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

type VariantStyle = {
  face: string;
  lip: string;
  fg: string;
  /** Inset border (top/left/right) width + colour, for the tan secondary rung. */
  borderWidth?: number;
  borderColor?: string;
  /** Tertiary is a flat text button — no lip, no fill. */
  flat?: boolean;
};

const VARIANTS: Record<LipButtonVariant, VariantStyle> = {
  primary: { face: Colors.primaryContainer, lip: Colors.redLip, fg: Colors.onPrimary },
  secondary: {
    face: '#ffffff',
    lip: Colors.interactiveSecondaryLip,
    fg: Colors.onSurface,
    borderWidth: 2,
    borderColor: Colors.interactiveSecondary,
  },
  tertiary: { face: 'transparent', lip: 'transparent', fg: Colors.tertiary, flat: true },
  gold: { face: Colors.secondaryContainer, lip: Colors.goldLip, fg: Colors.onSecondaryContainer },
};

/**
 * Chunky tactile button with a solid bottom "lip" (chunky_v3). RN can't render
 * hard-offset box-shadows, so the lip is a `borderBottom` that follows the
 * rounded corners. On press the face drops `DEPTH/2`px and the lip shrinks, so
 * the bottom edge stays put — a physical key-press feel (~80ms).
 *
 * Disabled uses the formal recipe: `surfaceContainerHighest` fill + `textFaint`
 * label, flat (no lip), no press-translate, full opacity — never grey-out by
 * lowering opacity.
 */
export function LipButton({
  label,
  onPress,
  variant = 'primary',
  color,
  lip,
  fg,
  icon: Icon,
  small = false,
  disabled = false,
  fullWidth = true,
  style,
  accessibilityLabel,
}: LipButtonProps) {
  const v = VARIANTS[variant];
  const face = color ?? v.face;
  const lipColor = lip ?? v.lip;
  const fgColor = disabled ? Colors.textFaint : (fg ?? v.fg);
  const hasLip = !disabled && !v.flat;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => {
        const dropped = hasLip && pressed;
        return [
          {
            width: fullWidth ? '100%' : undefined,
            alignSelf: fullWidth ? undefined : 'center',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
            backgroundColor: disabled ? Colors.surfaceContainerHighest : face,
            borderRadius: small ? Radius.lg : moderateScale(15),
            paddingVertical: small ? Spacing.sm : Spacing.md,
            paddingHorizontal: fullWidth ? (small ? Spacing.lg : Spacing.xl) : moderateScale(40),
            // Inset border for the tan secondary rung (top/left/right only).
            borderTopWidth: !disabled && v.borderWidth ? v.borderWidth : 0,
            borderLeftWidth: !disabled && v.borderWidth ? v.borderWidth : 0,
            borderRightWidth: !disabled && v.borderWidth ? v.borderWidth : 0,
            borderColor: !disabled ? v.borderColor : undefined,
            // The lip.
            borderBottomWidth: hasLip ? (dropped ? DEPTH / 2 : DEPTH) : (!disabled && v.borderWidth ? v.borderWidth : 0),
            borderBottomColor: hasLip ? lipColor : v.borderColor,
            transform: [{ translateY: dropped ? DEPTH / 2 : 0 }],
          },
          style,
        ];
      }}
    >
      <Text
        maxFontSizeMultiplier={1.3}
        style={{
          fontFamily: Fonts.baloo.bold,
          fontSize: moderateScale(small ? 14.5 : 16.5),
          color: fgColor,
          letterSpacing: 0.1,
        }}
      >
        {label}
      </Text>
      {Icon ? (
        // View keeps the icon baseline aligned with the label text.
        <View>
          <Icon size={moderateScale(18)} color={fgColor} strokeWidth={2.4} />
        </View>
      ) : null}
    </Pressable>
  );
}
