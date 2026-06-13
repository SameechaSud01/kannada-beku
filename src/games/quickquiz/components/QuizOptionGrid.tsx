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

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// chunky_v3 §9: 2×2 chunky option cards.
const QuizOptionGrid: React.FC<Props> = ({ options, optionState, onSelect }) => (
  <View style={{ gap: Spacing.md }}>
    {chunk(options, 2).map((row, ri) => (
      <View key={ri} style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'stretch' }}>
        {row.map((option) => (
          <QuizOptionButton
            key={option.id}
            option={option}
            state={optionState(option.id)}
            onPress={() => onSelect(option.id)}
          />
        ))}
        {/* Keep a lone trailing tile at half width. */}
        {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
      </View>
    ))}
  </View>
);

export default QuizOptionGrid;
