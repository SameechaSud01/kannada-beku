import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Icons } from '../../constants/icons';
import { ChunkyCircle } from './ChunkyLip';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';

export type AudioOrbProps = {
  onPress?: () => void;
  /** Drives the expanding "ping" ring while audio plays. */
  playing?: boolean;
  size?: number;
  color?: string;
  iconColor?: string;
  /** Hard bottom-edge ("lip") colour. Defaults to deep maroon (`redLip`). Use `goldLip` for the gold variant. */
  lipColor?: string;
  icon?: TablerIcon;
  accessibilityLabel?: string;
  disabled?: boolean;
};

/**
 * Red round audio button with a decorative concentric "ping" ring that expands
 * and fades on a loop while `playing` (spec_playful_redesign §AudioOrb). The
 * ping is purely visual — playback stays with expo-speech as today.
 */
export function AudioOrb({
  onPress,
  playing = false,
  size = 56,
  color = Colors.primaryContainer,
  iconColor = Colors.onPrimary,
  lipColor = Colors.redLip,
  icon,
  accessibilityLabel = 'Play audio',
  disabled = false,
}: AudioOrbProps) {
  const dim = moderateScale(size);
  const lip = Math.max(2, Math.round(dim * 0.055)); // ~3px chunky lip at size 56
  const Icon: TablerIcon = icon ?? Icons.audio;

  const ping = useSharedValue(0);

  useEffect(() => {
    if (playing) {
      ping.value = 0;
      ping.value = withRepeat(
        withTiming(1, { duration: 1300, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      );
    } else {
      cancelAnimation(ping);
      ping.value = 0;
    }
    return () => cancelAnimation(ping);
  }, [playing, ping]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + ping.value * 0.9 }],
    opacity: 0.5 * (1 - ping.value),
  }));

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={moderateScale(8)}
      style={{
        width: dim,
        height: dim,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: color,
          },
          ringStyle,
        ]}
      />
      <ChunkyCircle size={dim} depth={lip} bg={color} lipColor={lipColor}>
        <Icon size={moderateScale(size * 0.42)} color={iconColor} strokeWidth={2} />
      </ChunkyCircle>
    </Pressable>
  );
}
