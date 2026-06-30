import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';

interface StepHeadingProps {
  /** Optional small uppercase eyebrow above the title (e.g. "Lesson 0", "Retroflex"). */
  eyebrow?: string;
  /** Eyebrow colour. Defaults to the Mysore red primary. */
  eyebrowColor?: string;
  title: string;
  subtitle: string;
}

/**
 * Shared title block for the paced guide steps — optional eyebrow, a big Baloo
 * title, and a muted subtitle. Keeps the seven step screens visually identical
 * (spec_lesson0_redesign.md).
 */
export function StepHeading({
  eyebrow,
  eyebrowColor = Colors.primary,
  title,
  subtitle,
}: StepHeadingProps) {
  return (
    <View style={{ paddingTop: moderateScale(6) }}>
      {eyebrow ? (
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(12),
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: eyebrowColor,
            marginBottom: moderateScale(6),
          }}
          maxFontSizeMultiplier={1.3}
        >
          {eyebrow}
        </Text>
      ) : null}
      <Text
        style={{
          fontFamily: Fonts.baloo.extrabold,
          fontSize: moderateScale(30),
          color: Colors.onSurface,
          letterSpacing: -0.5,
          // Baloo extrabold has tall ascenders; a tight lineHeight clips the
          // tops of glyphs against the first line box. ~1.4× gives them room.
          lineHeight: moderateScale(42),
          includeFontPadding: true,
        }}
        maxFontSizeMultiplier={1.2}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(16),
          lineHeight: moderateScale(24),
          color: Colors.tertiary,
          marginTop: Spacing.md,
          marginBottom: Spacing.xxl,
        }}
        maxFontSizeMultiplier={1.4}
      >
        {subtitle}
      </Text>
    </View>
  );
}
