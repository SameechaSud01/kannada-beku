import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { GuideContent } from '../../components/guide/GuideContent';
import { useUserStore } from '../../stores/useUserStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { completeOnboarding } from '../../services/api/users';
import { Toasts } from '../../components/modals/instances/toastCatalog';

/**
 * Step 6 of 6 — Beginners' Guide primer (forced once during onboarding).
 * See spec_beginners_guide.md.
 */
export default function BasicsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (submitting) return;

    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      Toasts.sessionLost();
      return;
    }

    const { displayName, learningMode, motivations, dailyGoalMinutes } =
      useUserStore.getState();

    // Defensive — flow should have these set, but if any prior step's data is
    // missing, route back to that step instead of submitting a half-form.
    if (!learningMode) {
      router.replace('/onboarding/goal');
      return;
    }
    if (motivations.length === 0) {
      router.replace('/onboarding/motivation');
      return;
    }
    if (!dailyGoalMinutes) {
      router.replace('/onboarding/commitment');
      return;
    }

    setSubmitting(true);
    try {
      const row = await completeOnboarding(userId, {
        name: displayName ?? null,
        learning_mode: learningMode,
        motivations,
        daily_goal_minutes: dailyGoalMinutes,
      });
      useUserStore.getState().hydrateFromUserRow(row);
      useUserStore.getState().setHasSeenBasicsGuide(true);
      router.replace('/(tabs)');
    } catch (err) {
      // spec_security_hardening.md §6: don't trap the user if the sync fails.
      // Capture answers, mark local onboarding done, route forward — boot path
      // retries on next session.
      console.warn('[onboarding] completeOnboarding failed; queued for retry', err);
      useUserStore.getState().setOnboarding({
        displayName: displayName ?? undefined,
        learningMode,
        motivations,
        dailyGoalMinutes,
      });
      useUserStore.getState().setPendingOnboardingSync({
        displayName: displayName ?? undefined,
        learningMode,
        motivations,
        dailyGoalMinutes,
      });
      router.replace('/(tabs)');
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        paddingTop: insets.top + Spacing.xl,
      }}
    >
      <View style={{ paddingHorizontal: Spacing.xxl }}>
        <ProgressDots total={6} current={5} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Spacing.xxl,
          paddingTop: Spacing.xxl,
          paddingBottom: moderateScale(140) + insets.bottom,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(11),
            letterSpacing: 2,
            color: Colors.tertiary,
            textTransform: 'uppercase',
            marginBottom: Spacing.sm,
          }}
          maxFontSizeMultiplier={1.4}
        >
          Step 5 of 5
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(28),
            color: Colors.onSurface,
            marginBottom: Spacing.sm,
          }}
          maxFontSizeMultiplier={1.3}
        >
          Before you start
        </Text>
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
          A quick guide to how Kannada sounds. You can revisit this anytime from the Learn tab.
        </Text>

        <GuideContent />
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: Spacing.xxl,
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
          backgroundColor: Colors.surface,
        }}
      >
        <Pressable
          onPress={handleContinue}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel="Continue to the home screen"
          accessibilityState={{ busy: submitting }}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
            borderRadius: moderateScale(16),
            paddingVertical: moderateScale(18),
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: moderateScale(56),
            opacity: submitting ? 0.7 : 1,
            transform: [{ scale: pressed && !submitting ? 0.97 : 1 }],
          })}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(16),
                color: Colors.onPrimary,
              }}
            >
              Continue
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
