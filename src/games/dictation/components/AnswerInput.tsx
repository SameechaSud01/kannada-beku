import React from 'react';
import { TextInput, View } from 'react-native';
import { Colors } from '../../../../constants/colors';
import { Fonts } from '../../../../constants/fonts';
import { Radius, Spacing } from '../../../../constants/spacing';
import type { AnswerState } from '../types';

type Props = {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  answerState: AnswerState;
  disabled: boolean;
};

type StateStyle = { borderColor: string; backgroundColor: string };

const stateStyles: Record<AnswerState, StateStyle> = {
  unanswered: { borderColor: Colors.surfaceDim,        backgroundColor: Colors.surface },
  correct:    { borderColor: '#2d7a5f',                backgroundColor: '#edf7f3' },
  partial:    { borderColor: '#b07d2a',                backgroundColor: '#fdf5e6' },
  wrong:      { borderColor: Colors.primaryContainer,  backgroundColor: '#fdf0f2' },
};

const AnswerInput: React.FC<Props> = ({ value, onChange, onSubmit, answerState, disabled }) => {
  const { borderColor, backgroundColor } = stateStyles[answerState];

  return (
    <View
      style={{
        borderWidth: 2,
        borderColor,
        backgroundColor,
        borderRadius: Radius.lg,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        returnKeyType='done'
        autoCapitalize='none'
        autoCorrect={false}
        spellCheck={false}
        editable={!disabled}
        placeholder='type the word in English...'
        placeholderTextColor={Colors.tertiary}
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: 18,
          color: Colors.onSurface,
        }}
      />
    </View>
  );
};

export default AnswerInput;
