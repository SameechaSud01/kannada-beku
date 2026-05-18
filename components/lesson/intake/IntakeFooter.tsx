import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';

interface IntakeFooterProps {
  canAdvance: boolean;
  onAdvance: () => void;
  isLastPhrase: boolean;
}

export function IntakeFooter({ canAdvance, onAdvance, isLastPhrase }: IntakeFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
      <Pressable
        onPress={canAdvance ? onAdvance : undefined}
        disabled={!canAdvance}
        accessibilityRole="button"
        accessibilityLabel={isLastPhrase ? 'Start drill' : 'Next phrase'}
        style={({ pressed }) => ({
          backgroundColor: !canAdvance
            ? Colors.surfaceDim
            : pressed
              ? Colors.primary
              : Colors.primaryContainer,
          borderRadius: Radius.md,
          paddingVertical: Spacing.md + moderateScale(2),
          alignItems: 'center',
          minHeight: moderateScale(44),
          justifyContent: 'center',
          transform: [{ scale: pressed && canAdvance ? 0.96 : 1 }],
        })}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(15),
            color: Colors.onPrimary,
          }}
        >
          {isLastPhrase ? 'Start drill →' : 'Next phrase →'}
        </Text>
      </Pressable>
    </View>
  );
}
