import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Halo } from '../Halo';
import { LipButton } from '../../ui/LipButton';
import { DialogBody, DialogEyebrow, DialogTitle } from './_dialogChrome';

export interface LearningTimeInfoDialogProps {
  minutes: 5 | 10 | 20;
  onDismiss: () => void;
}

const COPY: Record<5 | 10 | 20, { title: string; body: string }> = {
  5: {
    title: '5 minutes a day',
    body: 'Best for building the habit. About one short lesson or a quick game. Small, steady wins.',
  },
  10: {
    title: '10 minutes a day',
    body: 'A solid daily rhythm. Finish a lesson and revisit one drill, or chain two short games.',
  },
  20: {
    title: '20 minutes a day',
    body: 'Serious pace. A full lesson plus practice — you’ll see noticeable progress week over week.',
  },
};

/**
 * Informational dialog explaining what a daily-time choice unlocks
 * (chunky_v3 §11). Non-destructive, backdrop-tap dismisses.
 */
export function LearningTimeInfoDialog({ minutes, onDismiss }: LearningTimeInfoDialogProps) {
  const { title, body } = COPY[minutes];

  return (
    <View style={{ gap: moderateScale(14) }}>
      <View style={{ alignItems: 'center' }}>
        <Halo icon="clock" iconSize={26} stroke={2.2} iconColor={Colors.secondary} />
      </View>
      <DialogEyebrow>Daily goal</DialogEyebrow>
      <DialogTitle>{title}</DialogTitle>
      <DialogBody>{body}</DialogBody>
      <LipButton label="Got it" variant="primary" onPress={onDismiss} />
    </View>
  );
}
