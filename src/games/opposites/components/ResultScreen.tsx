import React from 'react';
import { View, Text, Pressable } from 'react-native';

type Props = {
  score: number;
  total: number;
  onReplay: () => void;
};

function getEmoji(score: number, total: number): string {
  const ratio = score / total;
  if (ratio === 1) return '🎉';
  if (ratio >= 0.7) return '😊';
  if (ratio >= 0.4) return '😅';
  return '📚';
}

function getTitle(score: number, total: number): string {
  const ratio = score / total;
  if (ratio === 1) return 'Perfect score!';
  if (ratio >= 0.7) return 'Well done!';
  if (ratio >= 0.4) return 'Keep practising!';
  return 'Keep learning!';
}

const ResultScreen: React.FC<Props> = ({ score, total, onReplay }) => (
  <View className='flex-1 items-center justify-center px-6 gap-y-4'>
    <Text className='text-5xl'>{getEmoji(score, total)}</Text>
    <Text className='text-xl font-bold text-gray-900'>{getTitle(score, total)}</Text>
    <Text className='text-5xl font-bold text-emerald-600'>{score}</Text>
    <Text className='text-sm text-gray-500'>out of {total} correct</Text>
    <Pressable
      className='w-full bg-emerald-600 rounded-2xl py-3.5 items-center mt-4'
      onPress={onReplay}
    >
      <Text className='text-white font-bold text-base'>Play again ▸</Text>
    </Pressable>
  </View>
);

export default ResultScreen;
