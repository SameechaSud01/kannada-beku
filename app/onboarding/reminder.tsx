import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { IntakeStepShell } from '../../components/onboarding/IntakeStepShell';
import { TimeWheelPicker } from '../../components/ui/TimeWheelPicker';
import { useUserStore } from '../../stores/useUserStore';
import { useDailyReminder } from '../../hooks/useDailyReminder';

const DEFAULT_TIME = '19:00';

/**
 * Intake step 4 · Reminder (spec_onboarding_reminder_step.md, amended
 * 2026-07-13): a soft opt-in so users set a daily nudge once, up front, instead
 * of never discovering it in Profile. The time is chosen on the shared
 * TimeWheelPicker; "Remind me" runs the permission → schedule flow (via the
 * shared `useDailyReminder` hook); "Not now" (Skip) advances with nothing set.
 * Every branch proceeds — a reminder must never trap the user in onboarding.
 */
export default function ReminderScreen() {
  const router = useRouter();
  const persisted = useUserStore((s) => s.dailyReminderTime);
  const { applyTime } = useDailyReminder();
  const [selected, setSelected] = useState<string>(persisted ?? DEFAULT_TIME);

  const proceed = () => router.push('/onboarding/greeting');

  const handleSetReminder = () => {
    applyTime(selected, { onSettled: proceed });
  };

  return (
    <IntakeStepShell
      step={4}
      title="What time suits you?"
      subtitle="Set a time to practice. One short nudge a day, and you can change it or turn it off whenever."
      onSkip={proceed}
      skipLabel="Not now"
      onBack={() => router.back()}
      onContinue={handleSetReminder}
      continueLabel="Remind me"
    >
      <View style={{ paddingTop: Spacing.xxl, gap: Spacing.xl }}>
        {/* Bell hero — echoes the PermissionDialog icon so the ask feels of a piece. */}
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: moderateScale(76),
              height: moderateScale(76),
              borderRadius: Radius.full,
              backgroundColor: Colors.secondaryFixed,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.bell size={moderateScale(36)} color={Colors.onSecondaryContainer} />
          </View>
        </View>

        <TimeWheelPicker value={selected} onChange={setSelected} />
      </View>
    </IntakeStepShell>
  );
}
