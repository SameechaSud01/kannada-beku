import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Radius } from '../../constants/spacing';
import { Icons, type IconName } from '../../constants/icons';

export interface HaloProps {
  icon: IconName;
  /** Outer circle size in design units (will be scaled). */
  size?: number;
  /** Icon size. */
  iconSize?: number;
  /** Tabler stroke width. */
  stroke?: number;
  iconColor?: string;
  /**
   * Well fill colour. Defaults to a soft gold-pale tonal well. Locked / warning
   * dialogs pass `Colors.warningContainerLow`; the icon colour follows.
   */
  bg?: string;
  /** @deprecated chunky kit uses a flat tonal well — kept for call-site compat. */
  glowFrom?: string;
  /** @deprecated kept for call-site compat. */
  glowTo?: string;
}

/**
 * Centered icon well used by dialog chrome (chunky_v3 §11). Restyled from the
 * old radial-gradient halo to a flat tonal circle: a soft tinted disc with a
 * centered Tabler glyph. The fill defaults to gold-pale; lock/warning dialogs
 * pass `warningContainerLow` so the well matches the `LockTile` on the row that
 * opened it. API unchanged so existing dialogs keep working.
 */
export function Halo({
  icon,
  size = 72,
  iconSize = 28,
  stroke = 2.2,
  iconColor = Colors.secondary,
  bg = Colors.secondaryFixed,
}: HaloProps) {
  const dim = moderateScale(size);
  const IconCmp = Icons[icon];
  return (
    <View
      style={{
        width: dim,
        height: dim,
        borderRadius: Radius.full,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <IconCmp size={moderateScale(iconSize)} color={iconColor} strokeWidth={stroke} />
    </View>
  );
}
