import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';

export type LockTileProps = {
  /** Outer square size (pre-scale). Defaults to 40 (Learn/game rows). */
  size?: number;
  iconSize?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * The one canonical "locked" object (chunky_v3 § State semantics): a
 * `warningContainerLow` tile with a burnt-orange `warningContainer` lock glyph.
 * Shared by Learn rows, game-selector rows and the Lesson-Locked modal so
 * "locked" reads as one consistent thing — "not yet," not "broken."
 */
export function LockTile({ size = 40, iconSize = 20, radius = Radius.tile, style }: LockTileProps) {
  const dim = moderateScale(size);
  return (
    <View
      style={[
        {
          width: dim,
          height: dim,
          borderRadius: radius,
          backgroundColor: Colors.warningContainerLow,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Icons.locked size={moderateScale(iconSize)} color={Colors.warningContainer} strokeWidth={2} />
    </View>
  );
}
