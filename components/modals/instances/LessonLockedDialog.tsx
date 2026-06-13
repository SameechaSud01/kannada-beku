import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { LipButton } from '../../ui/LipButton';
import { LockTile } from '../../ui/LockTile';
import { DialogBody, DialogTitle } from './_dialogChrome';

export interface LessonLockedDialogProps {
  /** 1-indexed lesson number being tapped. */
  lessonNumber: number;
  lessonTitle: string;
  prevLessonNumber: number;
  prevLessonTitle: string;
  onGoToPrev: () => void;
  onDismiss: () => void;
}

/**
 * Info dialog shown when the user taps a locked lesson on /(tabs)/learn
 * (chunky_v3 §11). The icon well is the canonical `LockTile` — a
 * `warningContainerLow` circle with a burnt-orange lock glyph — so the modal
 * reads as the same "locked" object as the row that opened it. Lighter 0.4
 * backdrop dim (non-destructive).
 */
export function LessonLockedDialog({
  lessonNumber,
  prevLessonNumber,
  prevLessonTitle,
  onGoToPrev,
  onDismiss,
}: LessonLockedDialogProps) {
  return (
    <View style={{ gap: moderateScale(14) }}>
      <View style={{ alignItems: 'center' }}>
        <LockTile size={64} iconSize={30} radius={moderateScale(32)} />
      </View>
      <DialogTitle>Lesson {lessonNumber} is locked</DialogTitle>
      <DialogBody>
        Finish{' '}
        <DialogBody.Strong>
          Lesson {prevLessonNumber} · {prevLessonTitle}
        </DialogBody.Strong>{' '}
        first to unlock it. We open lessons as you go — no shortcuts, no shaming.
      </DialogBody>
      <View style={{ gap: moderateScale(10), marginTop: moderateScale(2) }}>
        <LipButton label="Got it" variant="primary" onPress={onDismiss} />
        <LipButton label="Back to lessons" variant="secondary" onPress={onGoToPrev} />
      </View>
    </View>
  );
}
