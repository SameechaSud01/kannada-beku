import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';

interface LessonProgressBarProps {
  current: number;
  total: number;
  label: string;
}

export function LessonProgressBar({ current, total, label }: LessonProgressBarProps) {
  const pct = total > 0 ? Math.min(1, Math.max(0, current / total)) : 0;
  return (
    <View>
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(11.5),
          color: Colors.textFaint,
          textAlign: 'center',
          marginBottom: Spacing.sm,
          letterSpacing: 0.4,
        }}
        maxFontSizeMultiplier={1.4}
      >
        {label}
      </Text>
      <View
        style={{
          height: moderateScale(9),
          backgroundColor: 'rgba(27,29,14,0.10)',
          borderRadius: Radius.full,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${pct * 100}%`,
            height: '100%',
            backgroundColor: Colors.secondaryContainer,
            borderRadius: Radius.full,
          }}
        />
      </View>
    </View>
  );
}
