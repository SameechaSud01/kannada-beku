import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { ProgressDots } from '../onboarding/ProgressDots';

export type PhaseName = 'scenario' | 'intake' | 'drill' | 'output';

const PHASE_INDEX: Record<PhaseName, number> = {
  scenario: 0,
  intake: 1,
  drill: 2,
  output: 3,
};

interface PhaseHeaderProps {
  phase: PhaseName;
  intakeProgress?: { current: number; total: number };
  drillProgress?: { current: number; total: number };
}

export function PhaseHeader({ phase, intakeProgress, drillProgress }: PhaseHeaderProps) {
  const insets = useSafeAreaInsets();

  const label = intakeProgress
    ? `Phrase ${intakeProgress.current} of ${intakeProgress.total}`
    : drillProgress
      ? `Question ${drillProgress.current} of ${drillProgress.total}`
      : null;

  return (
    <View
      style={{
        paddingTop: insets.top + Spacing.lg,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <ProgressDots total={4} current={PHASE_INDEX[phase]} />
      {label && (
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(12),
            color: Colors.tertiary,
            textAlign: 'center',
            marginTop: Spacing.md,
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
      )}
    </View>
  );
}
