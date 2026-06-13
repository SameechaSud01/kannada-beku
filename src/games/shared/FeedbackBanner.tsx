/**
 * Shared answer feedback banner (spec_game_polish §2; chunky_v3 §9).
 * `streak` is optional so games without that mechanic can reuse it.
 *
 * Correct = goldPale banner with a gold check circle ("Correct! · streak ×n").
 * Wrong stays red (redPale) — error ≠ warning (chunky_v3 rule 5).
 */
import React from 'react';
import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';

export type FeedbackState = 'unanswered' | 'correct' | 'wrong';

type Props = {
  state: FeedbackState;
  /** Current streak — when ≥2 on a correct answer, shows "· streak ×n". */
  streak?: number;
};

const FeedbackBanner: React.FC<Props> = ({ state, streak = 0 }) => {
  if (state === 'unanswered') return null;

  const isCorrect = state === 'correct';
  const showStreak = isCorrect && streak >= 2;
  const message = isCorrect ? 'Correct!' : 'Wrong!';

  // Surface + text tones: gold reward for correct, red error for wrong.
  const surface = isCorrect ? Colors.secondaryFixed : Colors.errorContainerLow;
  const textColor = isCorrect ? Colors.onSecondaryContainer : Colors.primary;
  // The leading glyph sits in a filled circle: gold check (correct) / red x (wrong).
  const circleBg = isCorrect ? Colors.secondaryContainer : Colors.primaryContainer;
  const Icon = isCorrect ? Icons.check : Icons.close;

  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(8),
        alignSelf: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: moderateScale(8),
        borderRadius: Radius.full,
        backgroundColor: surface,
      }}
    >
      <View
        style={{
          width: moderateScale(22),
          height: moderateScale(22),
          borderRadius: Radius.full,
          backgroundColor: circleBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={moderateScale(14)} color={Colors.onPrimary} strokeWidth={3} />
      </View>
      <Text
        style={{
          fontFamily: Fonts.baloo.bold,
          fontSize: moderateScale(14.5),
          color: textColor,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {message}
        {showStreak ? ` · streak ×${streak}` : ''}
      </Text>
    </View>
  );
};

export default FeedbackBanner;
