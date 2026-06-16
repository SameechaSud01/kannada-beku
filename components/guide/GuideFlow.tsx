import { useCallback, useEffect, useState } from 'react';
import { GUIDE_STEP_COUNT } from '../../constants/guide';
import { fetchGuideContent, type GuideContent } from '../../services/api/guide';
import { GuideStepShell } from './GuideStepShell';
import { GuideLoading } from './GuideLoading';
import { StepThings } from './StepThings';
import { StepVowels } from './StepVowels';
import { StepConsonants } from './StepConsonants';
import { StepReading } from './StepReading';

interface GuideFlowProps {
  /**
   * Called when the user backs out of step 1 (the entry point). In the
   * standalone guide this is `router.back()`; in onboarding it can be a no-op
   * or route to the previous onboarding step.
   */
  onExit: () => void;
  /** Called when step 4's CTA is pressed (finish onboarding / dismiss guide). */
  onFinish: () => void;
  /** Open the full 34-letter chart reference screen (step 3 link). */
  onOpenChart: () => void;
  /** Disables the final CTA (e.g. while an onboarding sync is in flight). */
  finishing?: boolean;
}

const STEP_CTAS = [
  'Show me the vowels',
  'Next',
  'Next',
  'Done — start Lesson 1',
];

/**
 * The 4-step paced Kannada-basics flow (chunky_v3 §8). Owns step navigation and
 * renders the shared shell; the two host screens (/guide standalone and
 * /onboarding/basics) supply the exit + finish wiring.
 */
export function GuideFlow({ onExit, onFinish, onOpenChart, finishing = false }: GuideFlowProps) {
  // 1-based current step.
  const [step, setStep] = useState(1);
  // Guide content is DB-sourced (falls back to the bundled copy on any failure).
  const [guide, setGuide] = useState<GuideContent | null>(null);

  useEffect(() => {
    let alive = true;
    fetchGuideContent().then((g) => {
      if (alive) setGuide(g);
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleBack = useCallback(() => {
    if (step <= 1) {
      onExit();
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  }, [step, onExit]);

  const handleCta = useCallback(() => {
    if (step >= GUIDE_STEP_COUNT) {
      onFinish();
      return;
    }
    setStep((s) => Math.min(GUIDE_STEP_COUNT, s + 1));
  }, [step, onFinish]);

  if (!guide) {
    return <GuideLoading onBack={onExit} />;
  }

  return (
    <GuideStepShell
      step={step}
      onBack={handleBack}
      ctaLabel={STEP_CTAS[step - 1]}
      onCta={handleCta}
      ctaDisabled={step >= GUIDE_STEP_COUNT && finishing}
    >
      {step === 1 && <StepThings principles={guide.principles} />}
      {step === 2 && (
        <StepVowels vowelPairs={guide.vowelPairs} vowelLoners={guide.vowelLoners} />
      )}
      {step === 3 && (
        <StepConsonants families={guide.consonantFamilies} onOpenChart={onOpenChart} />
      )}
      {step === 4 && <StepReading readingRows={guide.readingRows} tryIt={guide.tryIt} />}
    </GuideStepShell>
  );
}
