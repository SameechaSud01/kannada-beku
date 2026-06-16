import React from 'react';
import { Animated, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { useAdvanceFade } from '../../shared/animations';
import type { QuizQuestion } from '../types';

type Props = { question: QuizQuestion };

const QuizPrompt: React.FC<Props> = ({ question }) => {
  const isKn = question.direction === 'kn-to-en';
  const opacity = useAdvanceFade(question.itemId);
  return (
    <Animated.View
      style={{
        backgroundColor: '#ffffff',
        borderRadius: Radius.chunky,
        borderWidth: 1,
        borderColor: Colors.hairline,
        borderBottomWidth: 4,
        borderBottomColor: Colors.cardLip,
        paddingVertical: Spacing.xl,
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
        gap: moderateScale(6),
        opacity,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(11),
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: Colors.tertiary,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {isKn ? 'What does this mean?' : 'Pick the Kannada'}
      </Text>
      <Text
        style={{
          // dmSans.bold (not Baloo) for the big prompt: Baloo ExtraBold's tall
          // line metrics clip ascenders/macrons (ā) at the top when constrained.
          // This matches the lesson word-display cards (Teach/PracticeWordsPhase).
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(38),
          lineHeight: moderateScale(50),
          color: Colors.onSurface,
          textAlign: 'center',
        }}
        maxFontSizeMultiplier={1.2}
        adjustsFontSizeToFit
        numberOfLines={2}
      >
        {question.prompt}
      </Text>
      {question.promptSub ? (
        <Text
          style={{
            // promptSub carries the Kannada word (kn→en) — Kannada font required.
            fontFamily: Fonts.notoSansKannada.regular,
            fontSize: moderateScale(16),
            color: Colors.tertiary,
            textAlign: 'center',
          }}
          maxFontSizeMultiplier={1.3}
        >
          {question.promptSub}
        </Text>
      ) : null}
    </Animated.View>
  );
};

export default QuizPrompt;
