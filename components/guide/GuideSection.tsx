import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';

interface GuideSectionProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function GuideSection({ title, subtitle, children }: GuideSectionProps) {
  return (
    <View style={{ marginBottom: Spacing.xxxl }}>
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(20),
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
          marginBottom: Spacing.lg,
        }}
        maxFontSizeMultiplier={1.4}
      >
        {subtitle}
      </Text>
      <View style={{ gap: Spacing.md }}>{children}</View>
    </View>
  );
}
