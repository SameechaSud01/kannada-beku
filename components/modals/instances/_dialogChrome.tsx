import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';

/**
 * Shared dialog text chrome (chunky_v3 §11). Every dialog uses the same
 * centered Baloo 800 ~19 title and DM Sans 13.5 muted body, so the modal layer
 * reads as one consistent kit. Internal to `instances/` — not a public UI prim.
 */

/** Optional uppercase eyebrow above the title (e.g. "DAILY GOAL"). */
export function DialogEyebrow({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: Fonts.dmSans.bold,
        fontSize: moderateScale(11),
        letterSpacing: 1.4,
        color: Colors.secondary,
        textAlign: 'center',
        textTransform: 'uppercase',
      }}
      maxFontSizeMultiplier={1.4}
    >
      {children}
    </Text>
  );
}

/** Centered Baloo 800 ~19 title. */
export function DialogTitle({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: Fonts.baloo.extrabold,
        fontSize: moderateScale(19),
        letterSpacing: -0.3,
        color: Colors.onSurface,
        textAlign: 'center',
      }}
      maxFontSizeMultiplier={1.3}
    >
      {children}
    </Text>
  );
}

/** Centered DM Sans 13.5 muted body. Use `<DialogBody.Strong>` to emphasise. */
export function DialogBody({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: Fonts.dmSans.medium,
        fontSize: moderateScale(13.5),
        lineHeight: moderateScale(20),
        color: Colors.tertiary,
        textAlign: 'center',
      }}
      maxFontSizeMultiplier={1.4}
    >
      {children}
    </Text>
  );
}

DialogBody.Strong = function DialogBodyStrong({ children }: { children: ReactNode }) {
  return <Text style={{ fontFamily: Fonts.dmSans.bold, color: Colors.onSurface }}>{children}</Text>;
};
