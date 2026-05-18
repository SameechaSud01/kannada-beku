import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';

interface FillBlankPlaceholderProps {
  onSkip: () => void;
}

export function FillBlankPlaceholder({ onSkip }: FillBlankPlaceholderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Spacing.lg,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(18),
            color: Colors.onSurface,
            marginBottom: Spacing.sm,
            textAlign: 'center',
          }}
        >
          Fill-in-the-blank
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(13),
            color: Colors.tertiary,
            textAlign: 'center',
          }}
        >
          Not yet implemented — skipping.
        </Text>
      </View>

      <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
        <Pressable
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip this question"
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
            borderRadius: Radius.md,
            paddingVertical: Spacing.md + moderateScale(2),
            minHeight: moderateScale(44),
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(15), color: Colors.onPrimary }}>
            Skip this question →
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
