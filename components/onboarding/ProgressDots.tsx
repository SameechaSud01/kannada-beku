import { View } from 'react-native';
import { Colors } from '../../constants/colors';

interface ProgressDotsProps {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? 28 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === current ? Colors.primary : '#E0DDD0',
          }}
        />
      ))}
    </View>
  );
}
