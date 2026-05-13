import { useCallback } from 'react';
import { View } from 'react-native';
import { Spacing } from '../../../constants/spacing';
import { SayItControl } from '../intake/SayItControl';
import type { Phrase, SelfRating } from '../../../constants/lessons/types';

interface SpokenResponseProps {
  expected: Phrase;
  onRated: (rating: SelfRating) => void;
}

/**
 * Output-phase "Say it" wrapper. The state machine and UI are identical to
 * IntakePhase's SayItControl — record → playback → self-rate.
 */
export function SpokenResponse({ expected, onRated }: SpokenResponseProps) {
  const handleComplete = useCallback(
    (rating: SelfRating) => {
      onRated(rating);
    },
    [onRated],
  );

  return (
    <View style={{ marginTop: Spacing.lg }}>
      <SayItControl phrase={expected} onComplete={handleComplete} />
    </View>
  );
}
