import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { ChunkyCircle } from './ChunkyLip';
import { useModal } from '../../components/modals/ModalHost';
import {
  ExitLessonDialog,
  type ExitLessonVariant,
} from '../../components/modals/instances/ExitLessonDialog';

interface ExitBackButtonProps {
  /** Skip the confirm dialog entirely (e.g., on screens that aren't mid-flow). */
  skipConfirm?: boolean;
  /** Which copy variant to show — defaults to "lesson". */
  variant?: ExitLessonVariant;
  floating?: boolean;
}

/**
 * Vertical space the floating back chip occupies below `insets.top`, plus a
 * small breathing gap. Screens that render the floating chip should offset
 * their top content by `insets.top + BACK_CHIP_TOP_RESERVE` so the chip
 * doesn't overlap titles, cards, or progress bars.
 */
export const BACK_CHIP_TOP_RESERVE = Spacing.sm + moderateScale(40) + Spacing.sm;

export function ExitBackButton({
  skipConfirm,
  variant = 'lesson',
  floating = true,
}: ExitBackButtonProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const modal = useModal();

  const onPress = () => {
    if (skipConfirm) {
      router.back();
      return;
    }
    modal.show({
      kind: 'dialog',
      component: ExitLessonDialog,
      props: {
        variant,
        onConfirm: () => {
          modal.dismiss();
          router.back();
        },
        onCancel: () => modal.dismiss(),
      },
      blockBackdropDismiss: true,
      blockHardwareBack: true,
    });
  };

  const floatingStyle = floating
    ? {
        position: 'absolute' as const,
        top: insets.top + Spacing.sm,
        left: Spacing.lg,
        zIndex: 10,
      }
    : {};

  // White chunky circle, matching PhaseBackButton so close + back read as one
  // family of controls (spec_lesson_flow_fixed §2).
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Exit lesson"
      hitSlop={12}
      style={{ ...floatingStyle, width: moderateScale(40), height: moderateScale(40) }}
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
          <Icons.close size={20} color={Colors.primary} />
        </ChunkyCircle>
      )}
    </Pressable>
  );
}
