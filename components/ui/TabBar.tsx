import { View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
const SCRIM_HEIGHT = moderateScale(110);

/**
 * Floating chunky tab bar (chunky_v3 § TabBar). A white pill with a hairline
 * border, a 4px bottom lip and a soft ambient shadow; the active tab is a solid
 * red circle with a 3px redLip lip (replaces the old red glow). A bottom scrim
 * gradient (transparent → page cream) sits behind the pill so page content
 * fades out as it scrolls under the bar.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        alignItems: 'center',
        paddingTop: Spacing.sm,
        paddingBottom: insets.bottom + Spacing.md,
      }}
    >
      {/* Bottom scrim: content fades into the page cream behind the pill. */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(250,246,234,0)', Colors.surfaceCream]}
        style={[StyleSheet.absoluteFill, { top: undefined, height: SCRIM_HEIGHT }]}
      />

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
