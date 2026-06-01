import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';

interface GlyphCardProps {
  kannada: string;
  transliteration: string;
  example: string;
}

/**
 * Kannada-first card for vowel/consonant rows. Inverted text hierarchy is a
 * narrow exception to spec_text_hierarchy.md — the glyph IS the subject here,
 * not a label beside a more important romanisation. See
 * spec_beginners_guide.md §Text-hierarchy exception.
 */
export function GlyphCard({ kannada, transliteration, example }: GlyphCardProps) {
  return (
    <View
      style={{
        backgroundColor: Colors.surfaceContainerLow,
        borderRadius: Radius.lg,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.md,
        alignItems: 'center',
      }}
      accessibilityRole="text"
      accessibilityLabel={`${kannada}, transliteration ${transliteration}, ${example}`}
    >
      <Text
        style={{
          fontFamily: Fonts.notoSansKannada.bold,
          fontSize: moderateScale(48),
          lineHeight: moderateScale(72),
          color: Colors.onSurface,
        }}
        maxFontSizeMultiplier={1.2}
      >
        {kannada}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.lora.mediumItalic,
          fontSize: moderateScale(20),
          color: Colors.tertiary,
          marginTop: Spacing.xs,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {transliteration}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(12),
          color: Colors.tertiary,
          marginTop: moderateScale(2),
          textAlign: 'center',
        }}
        maxFontSizeMultiplier={1.4}
      >
        {example}
      </Text>
    </View>
  );
}
