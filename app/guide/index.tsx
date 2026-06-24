import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { GuideFlow } from '../../components/guide/GuideFlow';
import { useUserStore } from '../../stores/useUserStore';

/**
 * Voluntary re-entry to the Kannada-basics guide from the Learn tab.
 * Chunky kit v3 §8: the 4-step paced flow (same as /onboarding/basics) instead
 * of the old free-swipe pager. Exiting and the final CTA both return to the
 * Learn tab (router.back), preserving today's standalone dismiss behaviour.
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

  const dismiss = () => router.back();

  return <GuideFlow onExit={dismiss} onFinish={dismiss} />;
}
