import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';

interface CultureCardProps {
  label: string;
  text: string;
}

export function CultureCard({ label, text }: CultureCardProps) {
  return (
    <View
      style={{
        backgroundColor: Colors.accentLight,
        borderWidth: 1,
        borderColor: Colors.accent,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: 9,
          letterSpacing: 1.2,
          color: '#8D6000',
          textTransform: 'uppercase',
          marginBottom: Spacing.sm,
        }}
      >
        KARNATAKA CULTURE
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: 12,
          fontStyle: 'italic',
          color: Colors.textBody,
          lineHeight: 12 * 1.6,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
