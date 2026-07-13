import { useState } from 'react';
import { View, Text, Switch } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { useUserStore } from '../../../stores/useUserStore';
import { useDailyReminder, formatTime } from '../../../hooks/useDailyReminder';
import { useModal } from '../ModalHost';
import { LipButton } from '../../ui/LipButton';
import { TimeWheelPicker } from '../../ui/TimeWheelPicker';

const DEFAULT_TIME = '19:00';

/**
 * Profile → Reminders sheet. Time is chosen on the shared TimeWheelPicker
 * (spec_onboarding_reminder_step §4 amendment, applied app-wide 2026-07-13 —
 * replaces the native DateTimePicker + quick-pick chips). The wheel edits a
 * local pending time; "Save reminder" commits it via `useDailyReminder`.
 * The enable toggle still applies immediately, as before.
 *
 * Show this sheet with `disableContentPanning: true` so the wheel's vertical
 * drags spin the columns instead of dragging the sheet.
 */
export function RemindersSheet() {
  const reminderTime = useUserStore((s) => s.dailyReminderTime);
  const { applyTime, disableReminder } = useDailyReminder();
  const modal = useModal();

  const [pendingTime, setPendingTime] = useState<string>(reminderTime ?? DEFAULT_TIME);
  const enabled = !!reminderTime;

  function onToggle(next: boolean) {
    if (next) {
      applyTime(pendingTime);
    } else {
      disableReminder();
    }
  }

  function onSave() {
    if (enabled && pendingTime !== reminderTime) {
      applyTime(pendingTime, { onSettled: () => modal.dismiss() });
    } else {
      modal.dismiss();
    }
  }

  return (
    <BottomSheetView
      style={{
        paddingHorizontal: moderateScale(20),
        paddingTop: moderateScale(4),
        paddingBottom: moderateScale(28),
        gap: moderateScale(16),
      }}
    >
      <View style={{ gap: moderateScale(3) }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(22),
            color: Colors.onSurface,
            letterSpacing: -0.3,
          }}
          maxFontSizeMultiplier={1.3}
        >
          Reminders
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(13.5),
            color: Colors.tertiary,
          }}
          maxFontSizeMultiplier={1.3}
        >
          One gentle nudge a day — never to shame you for missing one.
        </Text>
      </View>

      {/* Toggle row — gold track switch */}
      <View
        style={{
          backgroundColor: '#ffffff',
          borderRadius: Radius.chunky,
          borderWidth: 1,
          borderColor: Colors.hairline,
          borderBottomWidth: 4,
          borderBottomColor: Colors.cardLip,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: moderateScale(14),
          paddingHorizontal: Spacing.lg,
          minHeight: moderateScale(56),
          gap: Spacing.md,
        }}
      >
        <Text
          style={{
            flex: 1,
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(14.5),
            color: Colors.onSurface,
          }}
          maxFontSizeMultiplier={1.3}
        >
          Daily lesson reminder
        </Text>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ true: Colors.secondaryContainer, false: Colors.surfaceContainerHighest }}
          thumbColor="#ffffff"
          ios_backgroundColor={Colors.surfaceContainerHighest}
          accessibilityLabel="Daily lesson reminder"
        />
      </View>

      {enabled && reminderTime ? (
        <View style={{ gap: moderateScale(12) }}>
          {/* Saved-time card — always shows the COMMITTED time (updates only after
              Save), so a spun-but-unsaved wheel can't be mistaken for the set time. */}
          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: Radius.chunky,
              borderWidth: 1,
              borderColor: Colors.hairline,
              borderBottomWidth: 4,
              borderBottomColor: Colors.cardLip,
              paddingVertical: moderateScale(12),
              paddingHorizontal: Spacing.lg,
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.md,
            }}
            accessibilityLabel={`Current reminder, ${formatTime(reminderTime)}`}
          >
            <Text
              style={{
                flex: 1,
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(11),
                letterSpacing: 1.4,
                color: Colors.tertiary,
                textTransform: 'uppercase',
              }}
              maxFontSizeMultiplier={1.4}
            >
              Current reminder
            </Text>
            <Text
              style={{
                fontFamily: Fonts.baloo.extrabold,
                fontSize: moderateScale(22),
                color: Colors.onSurface,
                letterSpacing: -0.5,
                fontVariant: ['tabular-nums'],
              }}
              maxFontSizeMultiplier={1.3}
            >
              {formatTime(reminderTime)}
            </Text>
          </View>

          <TimeWheelPicker value={pendingTime} onChange={setPendingTime} />
        </View>
      ) : null}

      <LipButton
        label="Save reminder"
        variant="primary"
        onPress={onSave}
        accessibilityLabel="Save reminder and close"
      />
    </BottomSheetView>
  );
}
