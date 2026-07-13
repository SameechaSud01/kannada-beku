import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { IntakeStepShell } from '../../components/onboarding/IntakeStepShell';
import { ChunkyPressable } from '../../components/ui/ChunkyPressable';
import { useUserStore } from '../../stores/useUserStore';

type Minutes = 5 | 10 | 20;

const DEFAULT_MINUTES: Minutes = 10;

// Detail lives in the subtitle — the old (i) info icons were dead weight
// (audit finding 6, spec_onboarding_audit_fixes.md).
const COMMITMENTS: { value: Minutes; label: string; subtitle: string; badge?: string }[] = [
  { value: 5, label: '5 min / day', subtitle: 'Quick daily habit · about one scenario' },
  {
    value: 10,
    label: '10 min / day',
    subtitle: 'Steady progress · scenario + practice',
    badge: 'Most popular',
  },
  { value: 20, label: '20 min / day', subtitle: 'Serious learner · everything, daily' },
];

/**
 * Intake step 3 · Time (spec_onboarding_audit_fixes.md): 3 radio cards, 10 min
 * preselected ("Most popular") so Continue is never disabled, Skip keeps the
 * default and moves on.
 */
export default function CommitmentScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Minutes>(
    useUserStore.getState().dailyGoalMinutes ?? DEFAULT_MINUTES,
  );

  const proceed = () => {
    useUserStore.getState().setDailyGoalMinutes(selected);
    router.push('/onboarding/reminder');
  };

  return (
    <IntakeStepShell
      step={3}
      title="How much time can you commit?"
      subtitle="Your daily goal — you can change it anytime in Profile."
      onSkip={proceed}
      onBack={() => router.back()}
      onContinue={proceed}
    >
      <View style={{ gap: Spacing.md, paddingTop: Spacing.xxl }}>
        {COMMITMENTS.map((item) => (
          <CommitmentCard
            key={item.value}
            label={item.label}
            subtitle={item.subtitle}
            badge={item.badge}
            selected={selected === item.value}
            onPress={() => setSelected(item.value)}
          />
        ))}
      </View>
    </IntakeStepShell>
  );
}

interface CommitmentCardProps {
  label: string;
  subtitle: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}

function CommitmentCard({ label, subtitle, badge, selected, onPress }: CommitmentCardProps) {
  return (
    <ChunkyPressable
      onPress={onPress}
      accessibilityLabel={label}
      bg={selected ? Colors.redSoft : '#ffffff'}
      // ChunkyPressable's bottom edge IS the lip — selected needs a 2px red
      // lip so the border wraps all the way around (no gap at the bottom).
      lip={selected ? 2 : 3}
      lipColor={selected ? Colors.primaryContainer : Colors.cardLip}
      border
      borderWidth={2}
      borderColor={selected ? Colors.primaryContainer : 'rgba(27,29,14,0.10)'}
      radius={Radius.chunky}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.lg,
        paddingVertical: moderateScale(16),
        paddingHorizontal: moderateScale(18),
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <Text
            style={{
              fontFamily: Fonts.baloo.bold,
              fontSize: moderateScale(18),
              color: Colors.onSurface,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {label}
          </Text>
          {badge ? (
            <View
              style={{
                backgroundColor: Colors.secondaryFixed,
                borderRadius: Radius.full,
                paddingHorizontal: moderateScale(9),
                paddingTop: moderateScale(3),
                paddingBottom: moderateScale(2),
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(11),
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  color: Colors.onSecondaryContainer,
                }}
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
              >
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(13.5),
            color: Colors.tertiary,
            marginTop: moderateScale(3),
          }}
          maxFontSizeMultiplier={1.4}
        >
          {subtitle}
        </Text>
      </View>
      {/* 24px round radio — white dot when selected. */}
      <View
        style={{
          width: moderateScale(24),
          height: moderateScale(24),
          borderRadius: Radius.full,
          backgroundColor: selected ? Colors.primaryContainer : 'transparent',
          borderWidth: selected ? 0 : 2,
          borderColor: 'rgba(27,29,14,0.18)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected ? (
          <View
            style={{
              width: moderateScale(8),
              height: moderateScale(8),
              borderRadius: Radius.full,
              backgroundColor: Colors.onPrimary,
            }}
          />
        ) : null}
      </View>
    </ChunkyPressable>
  );
}
