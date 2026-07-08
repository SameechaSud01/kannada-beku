import { Pressable, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { rateLabel } from '../../constants/audio';
import { useTtsRate } from '../../hooks/useTtsRate';

interface SpeedControlProps {
  /** Called after the rate changes so the caller can re-play at the new rate. */
  onRateChange?: () => void;
}

/**
 * Compact in-lesson playback-speed control. Tapping cycles through the canonical
 * `RATE_OPTIONS` and writes the same persisted `ttsRate` as Settings → Audio
 * (spec_lesson_runner_ux §2.4).
 */
export function SpeedControl({ onRateChange }: SpeedControlProps) {
  const { ttsRate, cycleRate } = useTtsRate();

  const handlePress = () => {
    cycleRate();
    onRateChange?.();
  };

  // Quiet white utility chip — gold is reserved for reward beats, and playback
  // speed is a setting, not a reward (spec_lesson_flow_fixed §2).
  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Playback speed ${rateLabel(ttsRate)}, tap to change`}
      hitSlop={8}
      style={({ pressed }) => ({
        minWidth: moderateScale(54),
        minHeight: moderateScale(40),
        paddingHorizontal: Spacing.lg,
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
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(13),
          color: Colors.tertiary,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {rateLabel(ttsRate)}
      </Text>
    </Pressable>
  );
}
