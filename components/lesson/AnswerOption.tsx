import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { FeedbackTag } from './FeedbackTag';

export type AnswerOptionProps = {
  label: string;
  index: number;
  picked: number | null;
  correctIndex: number;
  onPick: (index: number) => void;
};

/**
 * A multiple-choice option for the practice phases. On reveal the correct option
 * turns gold and bounces; a wrong pick turns red and shakes (INTERACTIONS M2/M3,
 * spec_playful_redesign §Micro-interactions). Logic stays in the parent.
 */
export function AnswerOption({ label, index, picked, correctIndex, onPick }: AnswerOptionProps) {
  const reveal = picked !== null;
  const isCorrect = index === correctIndex;
  const isPicked = picked === index;

  const scale = useSharedValue(1);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (!reveal) {
      scale.value = 1;
      shakeX.value = 0;
      return;
    }
    if (isCorrect) {
      scale.value = withSequence(withSpring(1.06, { damping: 6, stiffness: 220 }), withSpring(1));
    } else if (isPicked) {
      shakeX.value = withSequence(
        withTiming(7, { duration: 50, easing: Easing.linear }),
        withTiming(-7, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(-4, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [reveal, isCorrect, isPicked, scale, shakeX]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shakeX.value }],
  }));

  let bg = Colors.surfaceContainerHighest;
  let fg = Colors.onSurface;
  if (reveal && isCorrect) {
    bg = Colors.secondaryContainer;
    fg = Colors.onSecondaryContainer;
  } else if (reveal && isPicked && !isCorrect) {
    bg = Colors.errorContainerLow;
    fg = Colors.primary;
  }

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={() => onPick(index)}
        disabled={reveal}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => ({
          backgroundColor: bg,
          borderRadius: Radius.lg,
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing.lg,
          minHeight: moderateScale(56),
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: pressed && !reveal ? 0.98 : 1 }],
        })}
      >
        <Text
          style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(15), color: fg, textAlign: 'center' }}
          maxFontSizeMultiplier={1.3}
        >
          {label}
        </Text>
        {reveal && isCorrect ? <FeedbackTag kind="correct" /> : null}
        {reveal && isPicked && !isCorrect ? <FeedbackTag kind="wrong" /> : null}
      </Pressable>
    </Animated.View>
  );
}
