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
          fontFamily: Fonts.baloo.extrabold,
          fontSize: moderateScale(38),
          // Kannada ottaksharas (subscript consonants) drop well below the
          // baseline + vowel signs rise above, so the glyph box needs ~1.6×.
          lineHeight: moderateScale(isKn ? 60 : 48),
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
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(14),
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
