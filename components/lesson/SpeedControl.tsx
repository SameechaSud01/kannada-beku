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

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Playback speed ${rateLabel(ttsRate)}, tap to change`}
      hitSlop={8}
      style={({ pressed }) => ({
        minWidth: moderateScale(54),
        minHeight: moderateScale(44),
        paddingHorizontal: Spacing.md,
        borderRadius: Radius.full,
        backgroundColor: Colors.surfaceContainerHighest,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(13),
          color: Colors.primary,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {rateLabel(ttsRate)}
      </Text>
    </Pressable>
  );
}
