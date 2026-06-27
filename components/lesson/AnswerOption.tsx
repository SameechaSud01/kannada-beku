import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
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
import { Icons } from '../../constants/icons';
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

  // Chunky white option card. On reveal:
  //  - correct → goldPale fill + 2px goldLip border + a gold check circle
  //  - wrong   → redPale fill + 2px red2 border (wrong stays red — it's an error)
  const showCorrect = reveal && isCorrect;
  const showWrong = reveal && isPicked && !isCorrect;

  let bg = '#ffffff';
  let fg = Colors.onSurface;
  let borderColor = Colors.hairline;
  let borderWidth = 1;
  if (showCorrect) {
    bg = Colors.secondaryFixed;
    fg = Colors.onSecondaryContainer;
    borderColor = Colors.goldLip;
    borderWidth = 2;
  } else if (showWrong) {
    bg = Colors.errorContainerLow;
    fg = Colors.primary;
    borderColor = Colors.primaryContainer;
    borderWidth = 2;
  }

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={() => onPick(index)}
        disabled={reveal}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          backgroundColor: bg,
          borderRadius: Radius.chunky,
          borderWidth,
          borderColor,
          borderBottomWidth: 4,
          borderBottomColor: showCorrect
            ? Colors.goldLip
            : showWrong
              ? Colors.primaryContainer
              : Colors.cardLip,
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing.lg,
          minHeight: moderateScale(56),
          transform: [{ translateY: pressed && !reveal ? 2 : 0 }],
        })}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(15), color: fg }}
            maxFontSizeMultiplier={1.3}
          >
            {label}
          </Text>
          {showCorrect ? <FeedbackTag kind="correct" /> : null}
          {showWrong ? <FeedbackTag kind="wrong" /> : null}
        </View>
        {showCorrect ? (
          <View
            style={{
              width: moderateScale(28),
              height: moderateScale(28),
              borderRadius: Radius.full,
              backgroundColor: Colors.secondaryContainer,
              borderBottomWidth: 2,
              borderBottomColor: Colors.goldLip,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.check
              size={moderateScale(16)}
              color={Colors.onSecondaryContainer}
              strokeWidth={2.6}
            />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}
