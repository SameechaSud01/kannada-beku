import { Pressable, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';

export type StreakPillProps = {
  streak: number;
  onPress: () => void;
};

/**
 * Gold-wash streak pill (top bar, Home + Profile). The flame does a quick wiggle
 * on tap; the parent decides whether to fire the streak celebration (only on a
 * real milestone day).
 */
export function StreakPill({ streak, onPress }: StreakPillProps) {
  const rot = useSharedValue(0);
  const flameStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));

  const handle = () => {
    rot.value = withSequence(
      withTiming(-12, { duration: 90, easing: Easing.out(Easing.ease) }),
      withTiming(10, { duration: 90 }),
      withTiming(0, { duration: 90 }),
    );
    onPress();
  };

  return (
    <Pressable
      onPress={handle}
      accessibilityRole="button"
      accessibilityLabel={`Current streak: ${streak} day${streak === 1 ? '' : 's'}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(4),
        backgroundColor: Colors.secondaryFixed,
        borderRadius: Radius.full,
        paddingVertical: moderateScale(6),
        paddingLeft: moderateScale(9),
        paddingRight: moderateScale(12),
        borderWidth: 1,
        borderColor: Colors.goldLip,
        borderBottomWidth: 3,
        borderBottomColor: Colors.goldLip,
      }}
    >
      <Animated.View style={flameStyle}>
        <Icons.streak size={moderateScale(17)} color={Colors.primaryContainer} />
      </Animated.View>
      <Text
        style={{
          fontFamily: Fonts.baloo.extrabold,
          fontSize: moderateScale(16),
          color: Colors.secondary,
          fontVariant: ['tabular-nums'],
        }}
        maxFontSizeMultiplier={1.2}
      >
        {streak} {streak === 1 ? 'day' : 'days'}
      </Text>
    </Pressable>
  );
}
