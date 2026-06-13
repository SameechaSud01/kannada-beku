import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing } from '../../../constants/spacing';
import { Halo } from '../Halo';
import { LipButton } from '../../ui/LipButton';
import { DialogBody, DialogEyebrow, DialogTitle } from './_dialogChrome';

export interface LessonInfoDialogProps {
  lessonNumber: number;
  lessonTitle: string;
  description: string;
  phraseCount: number;
  estimatedMinutes: number;
  locked?: boolean;
  prevLessonNumber?: number;
  prevLessonTitle?: string;
  onDismiss: () => void;
}

export function LessonInfoDialog({
  lessonNumber,
  lessonTitle,
  description,
  phraseCount,
  estimatedMinutes,
  locked,
  prevLessonNumber,
  prevLessonTitle,
  onDismiss,
}: LessonInfoDialogProps) {
  const stats =
    phraseCount > 0
      ? `${phraseCount} phrases · ~${estimatedMinutes} min`
      : `~${estimatedMinutes} min`;

  return (
    <View style={{ gap: moderateScale(14) }}>
      <View style={{ alignItems: 'center' }}>
        <Halo icon="info" iconSize={26} stroke={2.2} iconColor={Colors.secondary} />
      </View>
      <DialogEyebrow>Lesson {lessonNumber}</DialogEyebrow>
      <DialogTitle>{lessonTitle}</DialogTitle>
      <DialogBody>{description}</DialogBody>
      <View style={{ alignItems: 'center', paddingVertical: Spacing.xs }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(13),
            color: Colors.onSurface,
            textAlign: 'center',
          }}
          maxFontSizeMultiplier={1.4}
        >
          {stats}
        </Text>
      </View>
      {locked && prevLessonNumber && prevLessonTitle ? (
        <DialogBody>
          Complete{' '}
          <DialogBody.Strong>
            Lesson {prevLessonNumber} · {prevLessonTitle}
          </DialogBody.Strong>{' '}
          to unlock.
        </DialogBody>
      ) : null}
      <LipButton label="Got it" variant="primary" onPress={onDismiss} />
    </View>
  );
}
