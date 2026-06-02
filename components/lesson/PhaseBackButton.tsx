import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';

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
      style={({ pressed }) => ({
        position: 'absolute',
        top: insets.top + Spacing.sm,
        left: Spacing.lg + moderateScale(40) + Spacing.sm,
        zIndex: 10,
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: Radius.full,
        backgroundColor: Colors.surfaceContainerHigh,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <Icons.stepBack size={20} color={Colors.primary} />
    </Pressable>
  );
}
