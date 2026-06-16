import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { BackChip } from './BackChip';
import { useReducedMotion } from './useReducedMotion';

export type SystemStateScreenProps = {
  /** Show the white back chip top-left (full-screen standalone states). */
  back?: boolean;
  onBack?: () => void;
  /** The hero — typically an <IconWell> (or any node). */
  well: ReactNode;
  title: string;
  body?: string;
  /** CTAs (a column of <LipButton>s), rendered in the bottom action zone. */
  actions?: ReactNode;
  /** Footnote under the actions (textFaint). */
  note?: string;
  /** Extra content between body and actions (rare). */
  children?: ReactNode;
  bg?: string;
};

/**
 * Full-screen state scaffold (st-shared.jsx StateScaffold): a centred hero +
 * Baloo title + DM Sans body, optional back chip, and a bottom action zone with
 * an optional footnote. Hero / title / body / actions rise+fade in, staggered
 * 0 → 220 ms (skipped under reduce-motion). Backs the error, offline and empty
 * full-screens.
 */
export function SystemStateScreen({
  back = false,
  onBack,
  well,
  title,
  body,
  actions,
  note,
  children,
  bg = Colors.surfaceCreamLow,
}: SystemStateScreenProps) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {back ? <BackChip onPress={onBack} /> : null}

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: moderateScale(34),
        }}
      >
        <Rise reduced={reduced} delay={0}>
          {well}
        </Rise>

        <Rise reduced={reduced} delay={80}>
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(24),
              lineHeight: moderateScale(28),
              letterSpacing: -0.3,
              marginTop: Spacing.xxl,
              color: Colors.onSurface,
              textAlign: 'center',
            }}
            maxFontSizeMultiplier={1.3}
          >
            {title}
          </Text>
        </Rise>

        {body ? (
          <Rise reduced={reduced} delay={140}>
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(14.5),
                lineHeight: moderateScale(22),
                color: Colors.tertiary,
                marginTop: Spacing.md,
                maxWidth: moderateScale(290),
                textAlign: 'center',
              }}
              maxFontSizeMultiplier={1.4}
            >
              {body}
            </Text>
          </Rise>
        ) : null}

        {children}
      </View>

      {actions ? (
        <Rise reduced={reduced} delay={220} style={{ alignSelf: 'stretch' }}>
          <View
            style={{
              paddingHorizontal: Spacing.xxl,
              paddingBottom: insets.bottom + moderateScale(30),
              gap: Spacing.sm,
            }}
          >
            {actions}
            {note ? (
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(12),
                  color: Colors.textFaint,
                  textAlign: 'center',
                  marginTop: Spacing.xs,
                }}
                maxFontSizeMultiplier={1.3}
              >
                {note}
              </Text>
            ) : null}
          </View>
        </Rise>
      ) : null}
    </View>
  );
}

function Rise({
  children,
  delay,
  reduced,
  style,
}: {
  children: ReactNode;
  delay: number;
  reduced: boolean;
  style?: object;
}) {
  if (reduced) return <View style={[{ alignItems: 'center' }, style]}>{children}</View>;
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(440)}
      style={[{ alignItems: 'center' }, style]}
    >
      {children}
    </Animated.View>
  );
}
