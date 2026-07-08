import { Pressable } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Radius } from '../../constants/spacing';
import { Icons, type IconName } from '../../constants/icons';

export type RoundIconButtonVariant = 'primary' | 'ghost' | 'white';

export interface RoundIconButtonProps {
  icon: IconName;
  variant?: RoundIconButtonVariant;
  size?: number;
  onPress?: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
  style?: object;
}

const variantColors: Record<RoundIconButtonVariant, { bg: string; fg: string; pressedBg: string }> =
  {
    primary: {
      bg: Colors.primary,
      fg: Colors.onPrimary,
      pressedBg: Colors.primaryContainer,
    },
    ghost: {
      bg: Colors.surfaceContainerHighest,
      fg: Colors.primary,
      pressedBg: Colors.surfaceContainerHigh,
    },
    // White chip on cream pages (pushed-page back button) — hairline keeps it
    // reading as a control, not a floating glyph.
    white: {
      bg: Colors.surfaceContainerLowest,
      fg: Colors.onSurface,
      pressedBg: Colors.surfaceContainerLow,
    },
  };

export function RoundIconButton({
  icon,
  variant = 'primary',
  size = 44,
  onPress,
  accessibilityLabel,
  disabled,
  style,
}: RoundIconButtonProps) {
  const v = variantColors[variant];
  const IconCmp = Icons[icon];
  const dim = moderateScale(size);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={moderateScale(8)}
      style={({ pressed }) => ({
        width: dim,
        height: dim,
        borderRadius: Radius.full,
        borderWidth: variant === 'white' ? 1 : 0,
        borderColor: variant === 'white' ? Colors.hairline : undefined,
        backgroundColor: pressed && !disabled ? v.pressedBg : v.bg,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.45 : 1,
        transform: [{ scale: pressed && !disabled ? 0.94 : 1 }],
        ...style,
      })}
    >
      <IconCmp size={moderateScale(Math.round(size * 0.45))} color={v.fg} strokeWidth={2.2} />
    </Pressable>
  );
}
