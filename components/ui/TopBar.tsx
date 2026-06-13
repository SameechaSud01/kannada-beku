import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { StreakPill } from './StreakPill';

export type TopBarProps = {
  streak: number;
  onStreakPress: () => void;
};

/**
 * Shared tab-screen top bar (chunky_v3 § Shared Components — "Top bar"):
 * the Kannada Beku wordmark left (English over Kannada), the gold StreakPill right, hairline bottom.
 * Sits over the cream page background on every tab.
 */
export function TopBar({ streak, onStreakPress }: TopBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + Spacing.sm,
        paddingBottom: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: Colors.hairline,
      }}
    >
      <View>
        <Text
          style={{
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(22),
            color: Colors.primary,
            letterSpacing: -0.3,
          }}
          maxFontSizeMultiplier={1.2}
        >
          Kannada Beku
        </Text>
        <Text
          style={{
            fontFamily: Fonts.notoSansKannada.bold,
            fontSize: moderateScale(12),
            color: Colors.primary,
            lineHeight: moderateScale(18),
          }}
          maxFontSizeMultiplier={1.2}
        >
          ಕನ್ನಡ ಬೇಕು
        </Text>
      </View>
      <StreakPill streak={streak} onPress={onStreakPress} />
    </View>
  );
}
