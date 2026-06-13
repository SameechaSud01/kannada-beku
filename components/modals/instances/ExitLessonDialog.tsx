import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Halo } from '../Halo';
import { LipButton } from '../../ui/LipButton';
import { DialogBody, DialogTitle } from './_dialogChrome';

export type ExitLessonVariant = 'lesson' | 'game';

export interface ExitLessonDialogProps {
  variant?: ExitLessonVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

const COPY: Record<ExitLessonVariant, { title: string; body: string; confirm: string }> = {
  lesson: {
    title: 'Exit lesson?',
    body: "You'll lose your progress on this lesson. The phrases you've already met are safe.",
    confirm: 'Exit',
  },
  game: {
    title: 'Exit this game?',
    body: "You'll lose this round. Your XP for already-completed rounds is safe.",
    confirm: 'Exit',
  },
};

/**
 * Destructive confirm (chunky_v3 §11). Renders inside <Dialog>. Caller triggers
 * the actual `router.back()` from onConfirm. Red primary confirm (destructive) +
 * secondary-tan Cancel; the well is redPale — this is a true loss, not a warning.
 */
export function ExitLessonDialog({ variant = 'lesson', onConfirm, onCancel }: ExitLessonDialogProps) {
  const copy = COPY[variant];
  return (
    <View style={{ gap: moderateScale(14) }}>
      <View style={{ alignItems: 'center' }}>
        <Halo
          icon="x"
          iconColor={Colors.primary}
          bg={Colors.errorContainerLow}
          stroke={2.4}
        />
      </View>
      <DialogTitle>{copy.title}</DialogTitle>
      <DialogBody>{copy.body}</DialogBody>
      <View style={{ gap: moderateScale(10), marginTop: moderateScale(2) }}>
        <LipButton
          label={copy.confirm}
          variant="primary"
          onPress={onConfirm}
          accessibilityLabel={`${copy.confirm}. Loses your progress.`}
        />
        <LipButton label="Cancel" variant="secondary" onPress={onCancel} />
      </View>
    </View>
  );
}
