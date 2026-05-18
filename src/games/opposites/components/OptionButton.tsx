import React from 'react';
import { Pressable, View, Text } from 'react-native';
import type { Option } from '../types';

export type OptionState = 'default' | 'correct' | 'wrong' | 'reveal' | 'disabled';

type Props = {
  option: Option;
  state: OptionState;
  onPress: () => void;
};

const STATE_CLASSES: Record<OptionState, { border: string; bg: string; text: string }> = {
  default:  { border: 'border-gray-200',   bg: 'bg-white',       text: 'text-gray-900' },
  correct:  { border: 'border-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-900' },
  wrong:    { border: 'border-red-400',     bg: 'bg-red-50',      text: 'text-red-900' },
  reveal:   { border: 'border-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-900' },
  disabled: { border: 'border-gray-100',   bg: 'bg-gray-50',     text: 'text-gray-400' },
};

const GLOSS_CLASSES: Record<OptionState, string> = {
  default:  'text-gray-500',
  correct:  'text-emerald-700',
  wrong:    'text-red-700',
  reveal:   'text-emerald-700',
  disabled: 'text-gray-400',
};

const OptionButton: React.FC<Props> = ({ option, state, onPress }) => {
  const { border, bg, text } = STATE_CLASSES[state];

  return (
    <Pressable
      onPress={onPress}
      disabled={state !== 'default'}
      className={`border rounded-2xl p-4 items-center justify-center ${border} ${bg}`}
      style={{ minHeight: 80 }}
    >
      <Text
        className={`text-2xl text-center ${text}`}
        style={{ fontFamily: 'NotoSansKannada_700Bold' }}
      >
        {option.kn}
      </Text>
      <Text className={`text-xs text-center mt-1 ${GLOSS_CLASSES[state]}`}>
        {option.en}
      </Text>
    </Pressable>
  );
};

export default OptionButton;
