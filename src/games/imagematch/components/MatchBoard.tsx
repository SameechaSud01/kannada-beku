import React from 'react';
import { View } from 'react-native';
import { Spacing } from '@/constants/spacing';
import WordTile from './WordTile';
import ImageTile from './ImageTile';
import type { Tile } from '../hooks/useImageMatchBoard';

type Props = {
  wordColumn: Tile[];
  imageColumn: Tile[];
  onWordTap: (id: string) => void;
  onImageTap: (id: string) => void;
};

const MatchBoard: React.FC<Props> = ({ wordColumn, imageColumn, onWordTap, onImageTap }) => (
  <View style={{ flexDirection: 'row', gap: Spacing.md }}>
    <View style={{ flex: 1, gap: Spacing.sm }}>
      {wordColumn.map(({ item, state }) => (
        <WordTile key={item.id} item={item} state={state} onPress={() => onWordTap(item.id)} />
      ))}
    </View>
    <View style={{ flex: 1, gap: Spacing.sm }}>
      {imageColumn.map(({ item, state }) => (
        <ImageTile
          key={item.id}
          item={item}
          state={state}
          imageUrl={item.imageUrl}
          onPress={() => onImageTap(item.id)}
        />
      ))}
    </View>
  </View>
);

export default MatchBoard;
