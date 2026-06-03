/**
 * Shared answer feedback banner (spec_game_polish §2).
 * Generalized from `opposites/components/FeedbackBanner.tsx` — `streak` and
 * `hintUsed` are optional so games without those mechanics (Quiz,
 * Conversations) can reuse it.
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
  /** Current streak — when ≥3 on a correct answer, shows the "on a roll" treatment. */
  streak?: number;
};

const FeedbackBanner: React.FC<Props> = ({ state, streak = 0 }) => {
  if (state === 'unanswered') return null;

  const isCorrect = state === 'correct';
  const isOnRoll = isCorrect && streak >= 3;
  const Icon = isOnRoll ? Icons.streak : isCorrect ? Icons.correct : Icons.wrong;
  const message = isOnRoll ? 'Correct! On a roll!' : isCorrect ? 'Correct!' : 'Wrong!';
  const textColor = isCorrect ? Colors.onSecondaryContainer : Colors.primary;

  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(6),
        alignSelf: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: moderateScale(6),
        borderRadius: Radius.full,
        backgroundColor: isCorrect ? Colors.secondaryFixed : Colors.surfaceDim,
      }}
    >
      <Icon size={moderateScale(14)} color={textColor} />
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(14),
          color: textColor,
        }}
      >
        {message}
      </Text>
    </View>
  );
};

export default FeedbackBanner;
