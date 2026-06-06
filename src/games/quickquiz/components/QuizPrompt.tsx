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
        backgroundColor: Colors.surfaceContainerHighest,
        borderRadius: Radius.xl,
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
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: Colors.tertiary,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {isKn ? 'What does this mean?' : 'Pick the Kannada'}
      </Text>
      <Text
        style={{
          fontFamily: isKn ? Fonts.notoSansKannada.bold : Fonts.dmSans.bold,
          fontSize: moderateScale(28),
          color: Colors.onSurface,
          textAlign: 'center',
        }}
        maxFontSizeMultiplier={1.3}
      >
        {question.prompt}
      </Text>
      {question.promptSub ? (
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
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
