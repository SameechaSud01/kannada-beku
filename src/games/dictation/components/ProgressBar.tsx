import React from 'react';
import { View } from 'react-native';
import { Colors } from '../../../../constants/colors';

type Props = { current: number; total: number };

const ProgressBar: React.FC<Props> = ({ current, total }) => (
  <View style={{ height: 6, width: '100%', borderRadius: 999, backgroundColor: Colors.surfaceContainerHigh }}>
    <View
      style={{
        height: '100%',
        borderRadius: 999,
        backgroundColor: Colors.primary,
        width: `${(current / total) * 100}%`,
      }}
    />
  </View>
);

export default ProgressBar;
