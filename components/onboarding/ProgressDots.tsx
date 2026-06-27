import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';

interface ProgressDotsProps {
  total: number;
  current: number;
}

/**
 * Chunky kit v3 step indicator: the active step is a 22px-wide red bar
 * (primaryContainer); inactive steps are small ink@~15% dots.
 */
export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
      }}
    >
      {Array.from({ length: total }, (_, i) => {
        const active = i === current;
        return (
          <View
            key={i}
            style={{
              width: active ? moderateScale(22) : moderateScale(8),
              height: moderateScale(8),
              borderRadius: active ? Radius.full : moderateScale(4),
              backgroundColor: active ? Colors.primaryContainer : 'rgba(27,29,14,0.15)',
            }}
          />
        );
      })}
    </View>
  );
}
