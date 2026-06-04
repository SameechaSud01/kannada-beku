import { LinearGradient } from 'expo-linear-gradient';
import type { LinearGradientProps } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

export type BrandGradientProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Override the two-stop colours. Defaults to the brand gradient. */
  colors?: LinearGradientProps['colors'];
};

/**
 * The single brand gradient (DESIGN.md → "Brand gradient"): a Mysore-red
 * `primaryContainer → primary` linear gradient at ~152°. Used ONLY on the Home
 * hook card, Profile avatar, Emergency header, and Auth background. Do not use
 * multi-hue gradients anywhere.
 *
 * The start/end points map the prototype's CSS `linear-gradient(152deg, …)`
 * (redHi 0% → red 82%) onto expo-linear-gradient's unit box.
 */
export function BrandGradient({ children, style, colors }: BrandGradientProps) {
  return (
    <LinearGradient
      // primaryContainer (bright) → primary (deep), matching the brand CTA stops.
      colors={colors ?? [Colors.primaryContainer, Colors.primary]}
      locations={[0, 0.82]}
      start={{ x: 0.27, y: 0.06 }}
      end={{ x: 0.73, y: 0.94 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}
