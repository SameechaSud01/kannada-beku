import type { ReactNode } from 'react';
import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Radius } from '../../constants/spacing';

export type IconWellProps = {
  /** Diameter (pre-scale). */
  size?: number;
  /** Soft tinted fill behind the glyph. */
  bg: string;
  /** Optional 1.5px ring. */
  ring?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * A soft tinted circle holding a single glyph — the hero of every empty / error /
 * success state (st-shared.jsx IconWell).
 */
export function IconWell({ size = 104, bg, ring, children, style }: IconWellProps) {
  const dim = moderateScale(size);
  return (
    <View
      style={[
        {
          width: dim,
          height: dim,
          borderRadius: Radius.full,
          backgroundColor: bg,
          borderWidth: ring ? 1.5 : 0,
          borderColor: ring,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
