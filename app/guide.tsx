import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { Spacing, Radius } from '../constants/spacing';
import { Icons } from '../constants/icons';
import { GuideContent } from '../components/guide/GuideContent';
import { useUserStore } from '../stores/useUserStore';

/**
 * Voluntary re-entry to the Beginners' Guide from the Learn tab.
 * Same content as /onboarding/basics, no ProgressDots, no sticky CTA.
 * See spec_beginners_guide.md.
 */
export default function GuideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hasSeenBasicsGuide = useUserStore((s) => s.hasSeenBasicsGuide);
  const setHasSeenBasicsGuide = useUserStore((s) => s.setHasSeenBasicsGuide);

  useEffect(() => {
    if (!hasSeenBasicsGuide) {
      setHasSeenBasicsGuide(true);
    }
  }, [hasSeenBasicsGuide, setHasSeenBasicsGuide]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: Spacing.md,
          paddingHorizontal: Spacing.xxl,
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(14),
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          style={({ pressed }) => ({
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
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(18),
            color: Colors.onSurface,
          }}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
        >
          Kannada basics
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Spacing.xxl,
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xxxl,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(15),
            lineHeight: moderateScale(22),
            color: Colors.tertiary,
            marginBottom: Spacing.xxl,
          }}
          maxFontSizeMultiplier={1.4}
        >
          A quick guide to how Kannada sounds.
        </Text>

        <GuideContent />
      </ScrollView>
    </View>
  );
}
