import { useState } from 'react';
import { logger } from '../../lib/logger';
import { useRouter } from 'expo-router';
import { GuideFlow } from '../../components/guide/GuideFlow';
import { useUserStore } from '../../stores/useUserStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { completeOnboarding } from '../../services/api/users';
import { Toasts } from '../../components/modals/instances/toastCatalog';

/**
 * Final onboarding step — the Kannada-basics primer, shown once.
 * Chunky kit v3 §8: the 4-step paced flow (GuideFlow) replaces the old forced
 * swipe pager. Step 4's CTA finishes onboarding via the EXISTING
 * finishOnboarding path (unchanged) — see spec_beginners_guide.md and
 * spec_security_hardening.md §6.
 */
export default function BasicsScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const finishOnboarding = async () => {
    if (submitting) return;

    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      Toasts.sessionLost();
      return;
    }

    const { displayName, motivations, dailyGoalMinutes } = useUserStore.getState();

    // Learning-focus selection was removed — we only teach spoken Kannada now.
    const learningMode = useUserStore.getState().learningMode ?? 'spoken';

    // Personalization is skippable (spec_onboarding_audit_fixes.md): empty
    // motivations are a valid answer, and the time step defaults to 10.
    const goalMinutes = dailyGoalMinutes ?? 10;

    setSubmitting(true);
    try {
      const row = await completeOnboarding(userId, {
        name: displayName ?? null,
        learning_mode: learningMode,
        motivations,
        daily_goal_minutes: goalMinutes,
      });
      useUserStore.getState().hydrateFromUserRow(row);
      useUserStore.getState().setHasSeenBasicsGuide(true);
      router.replace('/(tabs)');
    } catch (err) {
      // spec_security_hardening.md §6: don't trap the user if the sync fails.
      // Capture answers, mark local onboarding done, route forward — boot path
      // retries on next session.
      logger.warn('onboarding', 'completeOnboarding failed; queued for retry', { err });
      useUserStore.getState().setOnboarding({
        displayName: displayName ?? undefined,
        learningMode,
        motivations,
        dailyGoalMinutes: goalMinutes,
      });
      useUserStore.getState().setPendingOnboardingSync({
        displayName: displayName ?? undefined,
        learningMode,
        motivations,
        dailyGoalMinutes: goalMinutes,
      });
      router.replace('/(tabs)');
    }
  };

  return (
    <GuideFlow
      // Step-1 back returns to the previous onboarding step (the greeting).
      onExit={() => router.replace('/onboarding/greeting')}
      onFinish={() => void finishOnboarding()}
      finishing={submitting}
    />
  );
}
