/**
 * The scrambled akshara tray (spec_dictation_syllable_builder §2). Placed tiles
 * dim in place so the tray doesn't reflow.
 */
import React from 'react';
import { View } from 'react-native';
import { Spacing } from '@/constants/spacing';
import AksharaTile from './AksharaTile';
import type { Tile } from '../hooks/useDictationGame';

type Props = {
  tray: Tile[];
  placed: string[];
  disabled: boolean;
  onTap: (id: string) => void;
};

const SyllableTray: React.FC<Props> = ({ tray, placed, disabled, onTap }) => (
  <View
    style={{
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      justifyContent: 'center',
    }}
  >
    {tray.map((t) => {
      const isPlaced = placed.includes(t.id);
      return (
        <AksharaTile
          key={t.id}
          char={t.char}
          tone="tray"
          disabled={disabled || isPlaced}
          onPress={() => onTap(t.id)}
        />
      );
    })}
  </View>
);

export default SyllableTray;
