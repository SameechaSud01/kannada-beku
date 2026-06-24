import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Shadows } from '../../constants/shadows';
import { Icons } from '../../constants/icons';
import { ChunkyCircle } from './ChunkyLip';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';

const TAB_ICONS: Record<string, { icon: TablerIcon; label: string }> = {
  index: { icon: Icons.tabHome, label: 'Home' },
  learn: { icon: Icons.tabLearn, label: 'Learn' },
  practice: { icon: Icons.tabPractice, label: 'Practice' },
  profile: { icon: Icons.tabProfile, label: 'Profile' },
};

const TAB_ICON_SIZE = 20;
const SLOT = moderateScale(46); // icon-only slot
const PILL_LIP = 4; // white pill bottom lip
const ACTIVE_LIP = 3; // active red circle lip

/**
 * Vertical space the floating bar occupies above the safe-area inset (pill +
 * top padding). Scroll screens pad their content by TAB_BAR_CLEARANCE +
 * insets.bottom so nothing hides permanently behind the floating pill.
 */
export const TAB_BAR_CLEARANCE = moderateScale(88);

/**
 * Floating chunky tab bar (chunky_v3 § TabBar). A white pill with a hairline
 * border, a 4px bottom lip and a soft ambient shadow; the active tab is a solid
 * red circle with a 3px redLip lip. The bar is absolutely positioned and
 * transparent so the page scrolls full-height behind the pill — it floats, and
 * reserves no opaque strip (an in-flow bar reserved a strip that exposed the
 * grey nav background, which read as "whitespace" behind the bar).
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        paddingTop: Spacing.sm,
        paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.lg,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: Radius.full,
          borderWidth: 1,
          borderColor: Colors.hairline,
          borderBottomWidth: PILL_LIP,
          borderBottomColor: Colors.cardLip,
          paddingHorizontal: moderateScale(7),
          paddingVertical: moderateScale(7),
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
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isFocused ? (
                <ChunkyCircle
                  size={SLOT}
                  depth={ACTIVE_LIP}
                  bg={Colors.primaryContainer}
                  lipColor={Colors.redLip}
                  faceStyle={Shadows.tabActive}
                >
                  <Icon
                    size={moderateScale(TAB_ICON_SIZE)}
                    color={Colors.onPrimary}
                    strokeWidth={2}
                  />
                </ChunkyCircle>
              ) : (
                <Icon
                  size={moderateScale(TAB_ICON_SIZE)}
                  color={Colors.tertiary}
                  strokeWidth={2}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
