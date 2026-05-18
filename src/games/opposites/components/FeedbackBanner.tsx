import React from 'react';
import { View, Text } from 'react-native';
import type { AnswerState } from '../types';

type Props = {
  answerState: AnswerState;
  streak: number;
};

const FeedbackBanner: React.FC<Props> = ({ answerState, streak }) => {
  if (answerState === 'unanswered') return null;

  const isCorrect = answerState === 'correct';
  const message = isCorrect
    ? streak >= 3
      ? '🔥 Correct! On a roll!'
      : '✓ Correct!'
    : '✗ Wrong!';

  return (
    <View className={`self-center px-4 py-1.5 rounded-full ${isCorrect ? 'bg-emerald-100' : 'bg-red-100'}`}>
      <Text className={`text-sm font-semibold ${isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>
        {message}
      </Text>
    </View>
  );
};

export default FeedbackBanner;
