import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Shadows } from '../../constants/shadows';
import { Icons } from '../../constants/icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';

const TAB_ICONS: Record<string, { icon: TablerIcon; label: string }> = {
  index: { icon: Icons.tabHome, label: 'Home' },
  learn: { icon: Icons.tabLearn, label: 'Learn' },
  practice: { icon: Icons.tabPractice, label: 'Practice' },
  profile: { icon: Icons.tabProfile, label: 'Profile' },
};

const TAB_ICON_SIZE = 19; // DESIGN.md §TabBar
const SLOT = moderateScale(48); // ≥44pt touch target

/**
 * Floating icon-only tab bar (DESIGN.md §TabBar, Amendment B). A centred
 * rounded-`full` pill that floats above the bottom inset; the active tab is a
 * solid red circle with a soft red glow. No labels. The surrounding strip uses
 * the page background so the pill reads as floating on the page.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        alignItems: 'center',
        paddingTop: Spacing.sm,
        paddingBottom: insets.bottom + Spacing.md,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.surfaceContainerHigh,
          borderRadius: Radius.full,
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.sm,
          gap: Spacing.xs,
          ...Shadows.floatingNav,
        }}
      >
        {state.routes.map((route, index) => {
          const tabInfo = TAB_ICONS[route.name];
          if (!tabInfo) return null;
          const isFocused = state.index === index;
          const Icon = tabInfo.icon;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={tabInfo.label}
              accessibilityState={{ selected: isFocused }}
              style={{
                width: SLOT,
                height: SLOT,
                borderRadius: Radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isFocused ? Colors.primaryContainer : 'transparent',
                ...(isFocused ? Shadows.tabActive : null),
              }}
            >
              <Icon
                size={moderateScale(TAB_ICON_SIZE)}
                color={isFocused ? Colors.onPrimary : Colors.tertiary}
                strokeWidth={2}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
