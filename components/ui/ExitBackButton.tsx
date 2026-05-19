import { Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';

interface ExitBackButtonProps {
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  title?: string;
  floating?: boolean;
}

export function ExitBackButton({
  message,
  confirmLabel = 'Exit',
  cancelLabel = 'Stay',
  title,
  floating = true,
}: ExitBackButtonProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const onPress = () => {
    if (!message) {
      router.back();
      return;
    }
    Alert.alert(title ?? 'Exit?', message, [
      { text: cancelLabel, style: 'cancel' },
      { text: confirmLabel, style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const floatingStyle = floating
    ? {
        position: 'absolute' as const,
        top: insets.top + Spacing.sm,
        left: Spacing.lg,
        zIndex: 10,
      }
    : {};

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={12}
      style={({ pressed }) => ({
        ...floatingStyle,
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: Radius.full,
        backgroundColor: Colors.surfaceContainerHighest,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <Icons.back size={20} color={Colors.primary} />
    </Pressable>
  );
}
