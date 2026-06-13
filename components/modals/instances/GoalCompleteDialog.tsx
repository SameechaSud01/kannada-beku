import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Radius } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import { LipButton } from '../../ui/LipButton';
import { DialogBody, DialogEyebrow, DialogTitle } from './_dialogChrome';

export interface GoalCompleteDialogProps {
  goalMinutes: number;
  streakDays: number;
  onOneMore: () => void;
  onDone: () => void;
}

/**
 * Daily goal celebration dialog (chunky_v3 §11). Lighter version of the streak
 * takeover — fires the first time today the user crosses their minutes goal.
 * Gold reward ring well; red primary "One more" + secondary-tan "I'm done".
 */
export function GoalCompleteDialog({
  goalMinutes,
  streakDays,
  onOneMore,
  onDone,
}: GoalCompleteDialogProps) {
  const ringSize = moderateScale(96);
  const stroke = moderateScale(8);
  const r = (ringSize - stroke) / 2;

  return (
    <View style={{ gap: moderateScale(14) }}>
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: ringSize,
            height: ringSize,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          <Svg width={ringSize} height={ringSize} style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={r}
              stroke={Colors.secondaryFixed}
              strokeWidth={stroke}
              fill="transparent"
            />
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={r}
              stroke={Colors.secondaryContainer}
              strokeWidth={stroke}
              fill="transparent"
              strokeLinecap="round"
            />
          </Svg>
          <View style={{ position: 'absolute' }}>
            <Icons.check size={moderateScale(36)} color={Colors.secondary} strokeWidth={3} />
          </View>
        </View>
      </View>
      <DialogEyebrow>Today&apos;s {goalMinutes} minutes</DialogEyebrow>
      <DialogTitle>Done for today.</DialogTitle>
      <DialogBody>Proud of you — go eat some thindi.</DialogBody>
      <View
        style={{
          alignSelf: 'center',
          backgroundColor: Colors.secondaryFixed,
          borderRadius: Radius.full,
          paddingVertical: moderateScale(8),
          paddingHorizontal: moderateScale(14),
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(8),
          borderBottomWidth: 3,
          borderBottomColor: Colors.goldLip,
        }}
      >
        <Icons.flame size={moderateScale(15)} color={Colors.primaryContainer} strokeWidth={2} />
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(12.5),
            color: Colors.onSecondaryContainer,
            fontVariant: ['tabular-nums'],
          }}
          maxFontSizeMultiplier={1.3}
        >
          {streakDays}-day streak still alive
        </Text>
      </View>
      <View style={{ gap: moderateScale(10), marginTop: moderateScale(2) }}>
        <LipButton label="One more" variant="primary" onPress={onOneMore} icon={Icons.forward} />
        <LipButton label="I'm done" variant="secondary" onPress={onDone} />
      </View>
    </View>
  );
}
