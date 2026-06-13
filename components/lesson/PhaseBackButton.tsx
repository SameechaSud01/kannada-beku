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
        width: moderateScale(38),
        height: moderateScale(38),
        borderRadius: Radius.full,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: Colors.hairline,
        borderBottomWidth: pressed ? 1 : 3,
        borderBottomColor: Colors.cardLip,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ translateY: pressed ? 2 : 0 }],
      })}
    >
      <Icons.stepBack size={20} color={Colors.primary} />
    </Pressable>
  );
}
