import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius, Spacing } from '../../constants/spacing';

interface GlossTagProps {
  /** The register/gender qualifier, e.g. "neutral", "respectful", "he". */
  tag: string;
}

/**
 * Small chip that carries a gloss's register/gender qualifier beside the
 * English meaning, replacing inline "(…)" parentheses.
 * See spec_content_integrity §3.2 (D1).
 */
export function GlossTag({ tag }: GlossTagProps) {
  return (
    <View
      style={{
        alignSelf: 'center',
        backgroundColor: Colors.secondaryFixed,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: moderateScale(2),
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.medium,
          fontSize: moderateScale(11),
          letterSpacing: 0.3,
          color: Colors.onSecondaryContainer,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {tag}
      </Text>
    </View>
  );
}

export default GlossTag;
