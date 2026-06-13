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

// chunky_v3: correct/partial = goldPale (reward), wrong = redPale (error).
// No green/teal — warm-only palette.
const stateStyles: Record<AnswerState, StateStyle> = {
  unanswered: { borderColor: Colors.hairline,          backgroundColor: '#ffffff' },
  correct:    { borderColor: Colors.goldLip,           backgroundColor: Colors.secondaryFixed },
  partial:    { borderColor: Colors.goldLip,           backgroundColor: Colors.warningContainerLow },
  wrong:      { borderColor: Colors.primaryContainer,  backgroundColor: Colors.errorContainerLow },
};

const AnswerInput: React.FC<Props> = ({ value, onChange, onSubmit, answerState, disabled }) => {
  const { borderColor, backgroundColor } = stateStyles[answerState];

  return (
    <View
      style={{
        borderWidth: 2,
        borderColor,
        backgroundColor,
        borderRadius: Radius.chunky,
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
