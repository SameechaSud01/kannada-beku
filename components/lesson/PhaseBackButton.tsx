import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { ChunkyCircle } from '../ui/ChunkyLip';

interface PhaseBackButtonProps {
  onPress: () => void;
}

/**
 * In-lesson "previous step" control. Steps one phase/step backward within the
 * lesson runner — distinct from the exit-lesson chip (`ExitBackButton`), which
 * leaves the whole lesson. Floats top-left, just right of the exit chip
 * (spec_lesson_runner_ux §2.2).
 */
export function PhaseBackButton({ onPress }: PhaseBackButtonProps) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Previous step"
      hitSlop={12}
      style={{
        position: 'absolute',
        top: insets.top + Spacing.sm,
        left: Spacing.lg + moderateScale(40) + Spacing.sm,
        zIndex: 10,
      }}
    >
      {({ pressed }) => (
        <ChunkyCircle
          size={moderateScale(38)}
          depth={moderateScale(3)}
          bg="#ffffff"
          lipColor={Colors.cardLip}
          border
          borderColor={Colors.hairline}
          pressed={pressed}
        >
          <Icons.stepBack size={20} color={Colors.primary} />
        </ChunkyCircle>
      )}
    </Pressable>
  );
}
