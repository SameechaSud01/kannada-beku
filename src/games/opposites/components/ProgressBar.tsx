import React from 'react';
import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Radius } from '@/constants/spacing';

type Props = { current: number; total: number };

// chunky_v3: 8px gold fill on an ink@10% track.
const ProgressBar: React.FC<Props> = ({ current, total }) => (
  <View
    style={{
      height: moderateScale(8),
      width: '100%',
      borderRadius: Radius.full,
      backgroundColor: 'rgba(27,29,14,0.10)',
    }}
  >
    <View
      style={{
        height: '100%',
        borderRadius: Radius.full,
        backgroundColor: Colors.secondaryContainer,
        width: `${total > 0 ? (current / total) * 100 : 0}%`,
      }}
    />
  </View>
);

export default ProgressBar;
