import { useCallback, useState } from 'react';
import { GUIDE_STEP_COUNT } from '../../constants/guide';
import { GuideStepShell } from './GuideStepShell';
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

  return (
    <GuideStepShell
      step={step}
      onBack={handleBack}
      ctaLabel={STEP_CTAS[step - 1]}
      onCta={handleCta}
      ctaDisabled={step >= GUIDE_STEP_COUNT && finishing}
    >
      {step === 1 && <StepThings />}
      {step === 2 && <StepVowels />}
      {step === 3 && <StepConsonants onOpenChart={onOpenChart} />}
      {step === 4 && <StepReading />}
    </GuideStepShell>
  );
}
