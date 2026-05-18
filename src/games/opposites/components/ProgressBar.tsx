import React from 'react';
import { View } from 'react-native';

type Props = { current: number; total: number };

const ProgressBar: React.FC<Props> = ({ current, total }) => (
  <View className='h-1.5 w-full rounded-full bg-gray-200'>
    <View
      className='h-full rounded-full bg-emerald-600'
      style={{ width: `${(current / total) * 100}%` }}
    />
  </View>
);

export default ProgressBar;
