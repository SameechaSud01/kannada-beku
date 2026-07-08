import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { moderateScale } from 'react-native-size-matters';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { MOTIVATION_OPTIONS, MAX_MOTIVATIONS } from '../../constants/intake';
import { IntakeStepShell } from '../../components/onboarding/IntakeStepShell';
import { ChunkyPressable } from '../../components/ui/ChunkyPressable';
import { useUserStore } from '../../stores/useUserStore';

/**
 * Intake step 2 · Why (spec_onboarding_audit_fixes.md): 6 compact icon rows so
 * every option is visible above the fold, checkbox affordance, an "n of 3
 * picked" counter that appears only after the first pick, and a Skip
 * affordance — personalization is optional, so Continue is never disabled.
 */
export default function MotivationScreen() {
  const router = useRouter();

  // Seed from store so selections survive back-nav (values not in the preset
  // list — old presets or legacy "Other" free text — are dropped).
  const [selected, setSelected] = useState<string[]>(() => {
    const stored = useUserStore.getState().motivations;
    return stored.filter((m) => MOTIVATION_OPTIONS.some((o) => o.label === m));
  });

  const toggleMotivation = (motivation: string) => {
    setSelected((prev) => {
      if (prev.includes(motivation)) {
        return prev.filter((m) => m !== motivation);
      }
      if (prev.length >= MAX_MOTIVATIONS) {
        return prev;
      }
      return [...prev, motivation];
    });
  };

  const handleContinue = () => {
    useUserStore.getState().setMotivations(selected);
    router.push('/onboarding/commitment');
  };

  const handleSkip = () => {
    useUserStore.getState().setMotivations([]);
    router.push('/onboarding/commitment');
  };

  return (
    <IntakeStepShell
      step={2}
      title="Why are you learning Kannada?"
      subtitle="Pick what fits — we'll shape your lessons around it."
      onSkip={handleSkip}
      onBack={() => router.back()}
      onContinue={handleContinue}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: Spacing.lg, paddingBottom: Spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: moderateScale(10) }}>
          {MOTIVATION_OPTIONS.map((option) => (
            <MotivationRow
              key={option.label}
              label={option.label}
              Icon={option.Icon}
              selected={selected.includes(option.label)}
              onPress={() => toggleMotivation(option.label)}
            />
          ))}
        </View>
        {/* Counter appears only after the first pick (audit finding 5). */}
        {selected.length > 0 ? (
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(13),
              color: Colors.secondary,
              marginTop: Spacing.md,
            }}
            maxFontSizeMultiplier={1.3}
            accessibilityLiveRegion="polite"
          >
            {selected.length} of {MAX_MOTIVATIONS} picked
          </Text>
        ) : null}
      </ScrollView>
    </IntakeStepShell>
  );
}

interface MotivationRowProps {
  label: string;
  Icon: TablerIcon;
  selected: boolean;
  onPress: () => void;
}

function MotivationRow({ label, Icon, selected, onPress }: MotivationRowProps) {
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
        gap: Spacing.md,
        paddingVertical: moderateScale(10),
        paddingHorizontal: moderateScale(14),
      }}
    >
      <View
        style={{
          width: moderateScale(36),
          height: moderateScale(36),
          borderRadius: Radius.md,
          backgroundColor: selected ? '#ffffff' : Colors.surfaceCreamLow,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          size={moderateScale(19)}
          color={selected ? Colors.primaryContainer : Colors.tertiary}
          strokeWidth={2}
        />
      </View>
      <Text
        style={{
          flex: 1,
          fontFamily: Fonts.baloo.bold,
          fontSize: moderateScale(15.5),
          color: Colors.onSurface,
        }}
        // Compact single-line rows so all 6 options stay above the fold
        // (audit finding 5) — shrink slightly rather than wrap.
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        maxFontSizeMultiplier={1.3}
      >
        {label}
      </Text>
      <View
        style={{
          width: moderateScale(22),
          height: moderateScale(22),
          borderRadius: moderateScale(7),
          backgroundColor: selected ? Colors.primaryContainer : 'transparent',
          borderWidth: selected ? 0 : 2,
          borderColor: 'rgba(27,29,14,0.18)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected ? (
          <Icons.check size={moderateScale(13)} color={Colors.onPrimary} strokeWidth={3} />
        ) : null}
      </View>
    </ChunkyPressable>
  );
}
