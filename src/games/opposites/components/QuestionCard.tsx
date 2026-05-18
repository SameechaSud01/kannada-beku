import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  word: string;
  tr: string;
  meaning: string;
  streak: number;
};

const QuestionCard: React.FC<Props> = ({ word, tr, meaning, streak }) => (
  <View className='rounded-2xl bg-gray-100 p-6 w-full items-center'>
    <Text className='text-xs uppercase tracking-widest text-gray-400 mb-2'>
      find the opposite of
    </Text>
    <Text
      className='text-5xl text-center text-gray-900'
      style={{ fontFamily: 'NotoSansKannada_700Bold' }}
    >
      {word}
    </Text>
    <Text className='text-sm italic text-gray-500 mt-1'>{tr}</Text>
    <Text className='text-xs text-gray-400 mt-0.5'>({meaning})</Text>

    {streak >= 2 && (
      <View className='absolute top-3 right-3 bg-amber-100 rounded-full px-2 py-0.5'>
        <Text className='text-amber-800 text-xs font-semibold'>🔥 {streak}</Text>
      </View>
    )}
  </View>
);

export default QuestionCard;
