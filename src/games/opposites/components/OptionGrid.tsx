import React from 'react';
import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { splitGloss } from '@/utils/gloss';
import OptionButton, { type OptionState } from './OptionButton';
import type { Option, AnswerState } from '../types';

type Props = {
  opts: Option[];
  answerState: AnswerState;
  selectedOpt: string | null;
  correctAnswer: string;
  onSelect: (kn: string) => void;
};

function deriveState(
  kn: string,
  selectedOpt: string | null,
  answerState: AnswerState,
  correctAnswer: string,
): OptionState {
  if (answerState === 'unanswered') return 'default';
  if (kn === selectedOpt && answerState === 'correct') return 'correct';
  if (kn === selectedOpt && answerState === 'wrong') return 'wrong';
  if (kn === correctAnswer && answerState === 'wrong') return 'reveal';
  return 'disabled';
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const GAP = moderateScale(10);

const OptionGrid: React.FC<Props> = ({
  opts,
  answerState,
  selectedOpt,
  correctAnswer,
  onSelect,
}) => {
  // If ANY option carries a gloss tag, every tile reserves the tag's height —
  // so all tiles are identical in size whether or not they have a tag.
  const reserveTag = opts.some((o) => Boolean(splitGloss(o.en).tag));

  return (
    <View style={{ gap: GAP }}>
      {chunk(opts, 2).map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap: GAP, alignItems: 'stretch' }}>
          {row.map((opt) => (
            <View key={opt.kn} style={{ flex: 1 }}>
              <OptionButton
                option={opt}
                state={deriveState(opt.kn, selectedOpt, answerState, correctAnswer)}
                onPress={() => onSelect(opt.kn)}
                reserveTag={reserveTag}
              />
            </View>
          ))}
          {/* keep a lone trailing tile at half width */}
          {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
        </View>
      ))}
    </View>
  );
};

export default OptionGrid;
