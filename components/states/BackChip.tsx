import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Icons } from '../../constants/icons';
import { ChunkyCircle } from '../ui/ChunkyLip';

export type BackChipProps = {
  onPress?: () => void;
};

/**
 * White chunky back chip pinned top-left on standalone full-screen states, so
 * the user is never trapped (README §Interactions). Defaults to router.back().
 */
export function BackChip({ onPress }: BackChipProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={{
        position: 'absolute',
        top: insets.top + moderateScale(12),
        left: moderateScale(18),
        zIndex: 2,
      }}
    >
      <ChunkyCircle
        size={moderateScale(40)}
        depth={moderateScale(3)}
        bg="#ffffff"
        lipColor="rgba(27,29,14,0.10)"
      >
        <Icons.back size={moderateScale(20)} color={Colors.primary} strokeWidth={2} />
      </ChunkyCircle>
    </Pressable>
  );
}
