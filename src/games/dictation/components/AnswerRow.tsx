/**
 * The assembled-answer row (spec_dictation_syllable_builder §2). Shows placed
 * tiles (tap to pull back) plus empty slots for the remaining aksharas; shakes
 * on a wrong check.
 */
import React from 'react';
import { Animated, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { useShake } from '../../shared/animations';
import AksharaTile from './AksharaTile';
import type { Tile } from '../hooks/useDictationGame';
import type { AnswerState } from '../types';

type Props = {
  tray:         Tile[];
  placed:       string[];
  aksharaCount: number;
  answerState:  AnswerState;
  onRemove:     (index: number) => void;
};

const AnswerRow: React.FC<Props> = ({ tray, placed, aksharaCount, answerState, onRemove }) => {
  const translateX = useShake(answerState === 'wrong');
  const charById = new Map(tray.map((t) => [t.id, t.char]));
  const emptyCount = Math.max(0, aksharaCount - placed.length);
  const tone = answerState === 'correct' ? 'correct' : answerState === 'wrong' ? 'wrong' : 'placed';

  return (
    <Animated.View
      style={{
        transform: [{ translateX }],
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        justifyContent: 'center',
        minHeight: moderateScale(56),
        alignItems: 'center',
      }}
    >
      {placed.map((id, i) => (
        <AksharaTile
          key={id}
          char={charById.get(id) ?? ''}
          tone={tone}
          onPress={answerState === 'unanswered' ? () => onRemove(i) : undefined}
        />
      ))}
      {Array.from({ length: emptyCount }).map((_, i) => (
        <View
          key={`slot-${i}`}
          style={{
            minWidth: moderateScale(48),
            minHeight: moderateScale(48),
            borderRadius: Radius.md,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: Colors.outlineVariant,
            backgroundColor: Colors.surface,
          }}
        />
      ))}
    </Animated.View>
  );
};

export default AnswerRow;
