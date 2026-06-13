import { useRouter } from 'expo-router';
import { GuideChart } from '../../components/guide/GuideChart';

/**
 * The full 34-letter consonant chart — reference screen linked from step 3 of
 * the Kannada-basics flow (chunky_v3 §8). Reachable from both the standalone
 * /guide and onboarding /basics flows.
 */
export default function GuideChartScreen() {
  const router = useRouter();
  return <GuideChart onBack={() => router.back()} />;
}
