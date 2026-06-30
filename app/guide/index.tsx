import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { GuideFlow } from '../../components/guide/GuideFlow';
import { useUserStore } from '../../stores/useUserStore';

/**
 * Voluntary re-entry to the Kannada-basics guide from the Learn tab.
 * Chunky kit v3 §8: the 4-step paced flow (same as /onboarding/basics) instead
 * of the old free-swipe pager. Step-1 back dismisses (router.back); the final
 * "Back to lessons" CTA routes to the Learn tab so it never lands on home.
 * See spec_beginners_guide.md.
 */
export default function GuideScreen() {
  const router = useRouter();
  const hasSeenBasicsGuide = useUserStore((s) => s.hasSeenBasicsGuide);
  const setHasSeenBasicsGuide = useUserStore((s) => s.setHasSeenBasicsGuide);

  useEffect(() => {
    if (!hasSeenBasicsGuide) {
      setHasSeenBasicsGuide(true);
    }
  }, [hasSeenBasicsGuide, setHasSeenBasicsGuide]);

  // Step-1 back just dismisses to wherever the guide was opened from.
  const dismiss = () => router.back();
  // Finishing the primer routes explicitly to the lessons list (not router.back,
  // which lands on home when the guide was opened from the home tab).
  const finish = () => router.replace('/(tabs)/learn');

  return (
    <GuideFlow onExit={dismiss} onFinish={finish} finalCtaLabel="Back to lessons" />
  );
}
