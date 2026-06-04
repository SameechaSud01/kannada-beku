import React from 'react';
import { View } from 'react-native';
import { Spacing } from '@/constants/spacing';
import QuizOptionButton from './QuizOptionButton';
import type { OptionState, QuizOption } from '../types';

type Props = {
  options:     QuizOption[];
  optionState: (optionId: string) => OptionState;
  onSelect:    (optionId: string) => void;
};

const QuizOptionGrid: React.FC<Props> = ({ options, optionState, onSelect }) => (
  <View style={{ gap: Spacing.md }}>
    {options.map((option) => (
      <QuizOptionButton
        key={option.id}
        option={option}
        state={optionState(option.id)}
        onPress={() => onSelect(option.id)}
      />
    ))}
  </View>
);

export default QuizOptionGrid;
