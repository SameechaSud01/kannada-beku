import React from 'react';
import { View } from 'react-native';
import { Spacing } from '@/constants/spacing';
import ReplyOptionButton from './ReplyOptionButton';
import type { ConversationOption, OptionState } from '../types';

type Props = {
  options:     ConversationOption[];
  optionState: (optionId: string) => OptionState;
  onSelect:    (optionId: string) => void;
};

const ReplyOptionGrid: React.FC<Props> = ({ options, optionState, onSelect }) => (
  <View style={{ gap: Spacing.md }}>
    {options.map((option) => (
      <ReplyOptionButton
        key={option.id}
        option={option}
        state={optionState(option.id)}
        onPress={() => onSelect(option.id)}
      />
    ))}
  </View>
);

export default ReplyOptionGrid;
