import { useCallback, useEffect, useState } from 'react';
import { GUIDE_STEP_COUNT, GUIDE_STEP_CTAS } from '../../constants/guide';
import { fetchGuideContent, FALLBACK_GUIDE, type GuideContent } from '../../services/api/guide';
import { GuideStepShell } from './GuideStepShell';
import { GuideLoading } from './GuideLoading';
import { StepWelcome } from './StepWelcome';
import { StepVowelSounds } from './StepVowelSounds';
import { StepShortLong } from './StepShortLong';
import { StepRetroflex } from './StepRetroflex';
import { StepDoubles } from './StepDoubles';
import { StepRhythm } from './StepRhythm';
import { StepRecap } from './StepRecap';

interface GuideFlowProps {
  /**
   * Called when the user backs out of step 1 (the entry point). In the
   * standalone guide this is `router.back()`; in onboarding it can be a no-op
   * or route to the previous onboarding step.
   */
  onExit: () => void;
  /** Called when the final step's CTA is pressed (finish onboarding / dismiss guide). */
  onFinish: () => void;
  /** Disables the final CTA (e.g. while an onboarding sync is in flight). */
  finishing?: boolean;
  /**
   * Overrides the final step's CTA label. Onboarding keeps the default
   * "Start Lesson 1" framing; the standalone re-entry uses "Back to lessons".
   */
  finalCtaLabel?: string;
}

/**
 * The paced, listen-first Kannada-basics flow — 7 steps: Welcome → Vowel sounds →
 * Short vs long → Retroflex → Doubles → Rhythm → Recap (redesign 2026-06-30,
 * spec_lesson0_redesign.md). Owns step navigation and renders the shared shell;
 * the two host screens (/guide standalone and /onboarding/basics) supply the
 * exit + finish wiring.
 */
export function GuideFlow({ onExit, onFinish, finishing = false, finalCtaLabel }: GuideFlowProps) {
  // 1-based current step.
  const [step, setStep] = useState(1);
  // Guide content is DB-sourced (falls back to the bundled copy on any failure).
  const [guide, setGuide] = useState<GuideContent | null>(null);

  useEffect(() => {
    let alive = true;
    // fetchGuideContent() already falls back to bundled copy on errors, but a
    // network *stall* never resolves — race a timeout so the loader can't hang
    // forever during first-run onboarding (issue ISS-08).
    const timeout = new Promise<GuideContent>((resolve) => {
      setTimeout(() => resolve(FALLBACK_GUIDE), 6000);
    });
    Promise.race([fetchGuideContent(), timeout]).then((g) => {
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
      ctaLabel={
        step >= GUIDE_STEP_COUNT && finalCtaLabel ? finalCtaLabel : GUIDE_STEP_CTAS[step - 1]
      }
      onCta={handleCta}
      ctaDisabled={step >= GUIDE_STEP_COUNT && finishing}
    >
      {step === 1 && <StepWelcome welcomePoints={guide.welcomePoints} />}
      {step === 2 && <StepVowelSounds vowels={guide.vowels} />}
      {step === 3 && <StepShortLong shortLong={guide.shortLong} />}
      {step === 4 && <StepRetroflex rows={guide.retroflexRows} />}
      {step === 5 && <StepDoubles doubles={guide.doubles} />}
      {step === 6 && <StepRhythm rhythm={guide.rhythm} />}
      {step === 7 && <StepRecap recap={guide.recap} />}
    </GuideStepShell>
  );
}
