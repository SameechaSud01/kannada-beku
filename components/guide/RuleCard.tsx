import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';

interface RuleCardProps {
  title: string;
  description: string;
  examples: Array<{ transliteration: string; english: string }>;
}

export function RuleCard({ title, description, examples }: RuleCardProps) {
  return (
    <View
      style={{
        backgroundColor: Colors.surfaceContainerLow,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(15),
          color: Colors.onSurface,
          marginBottom: Spacing.xs,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(13),
          lineHeight: moderateScale(19),
          color: Colors.tertiary,
          marginBottom: Spacing.md,
        }}
        maxFontSizeMultiplier={1.4}
      >
        {description}
      </Text>
      <View style={{ gap: Spacing.xs }}>
        {examples.map((ex) => (
          <View
            key={`${ex.transliteration}-${ex.english}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(15),
                color: Colors.onSurface,
                minWidth: moderateScale(72),
              }}
              maxFontSizeMultiplier={1.3}
            >
              {ex.transliteration}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.regular,
                fontSize: moderateScale(13),
                color: Colors.tertiary,
                flex: 1,
                textAlign: 'right',
              }}
              maxFontSizeMultiplier={1.4}
            >
              {ex.english}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
