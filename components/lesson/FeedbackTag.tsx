import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { Icons } from '../../constants/icons';

interface FeedbackTagProps {
  kind: 'correct' | 'wrong';
}

/**
 * Icon + label shown on a revealed practice option so right/wrong is unmistakable
 * (spec_lesson_runner_ux §2.3) — background colour alone was ambiguous.
 */
export function FeedbackTag({ kind }: FeedbackTagProps) {
  const isCorrect = kind === 'correct';
  const Icon = isCorrect ? Icons.correct : Icons.wrong;
  const color = isCorrect ? Colors.onSuccessContainer : Colors.primary;
  const label = isCorrect ? 'Correct' : 'Try again';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.sm,
      }}
    >
      <Icon size={moderateScale(16)} color={color} />
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(13),
          color,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {label}
      </Text>
    </View>
  );
}
