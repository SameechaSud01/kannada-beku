import React from 'react';
import { Animated, Pressable, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';
import { useShake, useCorrectLift } from '../../shared/animations';
import type { OptionState, QuizOption } from '../types';

type Props = {
  option:  QuizOption;
  state:   OptionState;
  onPress: () => void;
};

const BG: Record<OptionState, string> = {
  default:  Colors.surface,
  correct:  Colors.secondaryFixed,
  wrong:    Colors.errorContainerLow,
  reveal:   Colors.secondaryFixed,
  disabled: Colors.surfaceContainerHigh,
};

const BORDER: Record<OptionState, string> = {
  default:  Colors.outlineVariant,
  correct:  Colors.secondary,
  wrong:    Colors.primary,
  reveal:   Colors.secondary,
  disabled: Colors.surfaceDim,
};

const QuizOptionButton: React.FC<Props> = ({ option, state, onPress }) => {
  const isLifted = state === 'correct' || state === 'reveal';
  const isWrong = state === 'wrong';

  const translateX = useShake(isWrong);
  // Full-width stacked options signal "correct" via shadow elevation + gold
  // fill + fade-in checkmark — no translate/scale, so rows never crowd or
  // grow wider than their siblings.
  const { checkProgress, checkScale } = useCorrectLift(isLifted);

  return (
    <Animated.View
      style={{
        transform: [{ translateX }],
        shadowColor: Colors.onSurface,
        shadowOpacity: isLifted ? 0.18 : 0.06,
        shadowOffset: { width: 0, height: isLifted ? moderateScale(6) : moderateScale(2) },
        shadowRadius: isLifted ? moderateScale(10) : moderateScale(4),
        elevation: isLifted ? 6 : 2,
        borderRadius: Radius.xl,
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={state !== 'default'}
        accessibilityRole="button"
        accessibilityLabel={`${option.primary}${option.secondary ? `, ${option.secondary}` : ''}`}
        accessibilityState={{ selected: isLifted, disabled: state !== 'default' }}
        style={{
          borderRadius: Radius.xl,
          borderWidth: 1.5,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          backgroundColor: BG[state],
          borderColor: BORDER[state],
          // Sized to fit a two-line (transliteration + Kannada) option so that
          // single-line English options occupy the same box — the correct-state
          // card looks identical in both kn→en and en→kn directions.
          minHeight: moderateScale(68),
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: option.secondary ? Fonts.dmSans.bold : Fonts.dmSans.medium,
            fontSize: moderateScale(16),
            color: Colors.onSurface,
            textAlign: 'center',
          }}
          maxFontSizeMultiplier={1.3}
        >
          {option.primary}
        </Text>
        {option.secondary ? (
          <Text
            style={{
              fontFamily: Fonts.notoSansKannada.regular,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
              textAlign: 'center',
              marginTop: moderateScale(2),
            }}
            maxFontSizeMultiplier={1.3}
          >
            {option.secondary}
          </Text>
        ) : null}
        {isLifted && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: Spacing.sm,
              right: Spacing.sm,
              opacity: checkProgress,
              transform: [{ scale: checkScale }],
            }}
          >
            <Icons.correct size={moderateScale(18)} color={Colors.secondary} />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default QuizOptionButton;
