import { useState } from 'react';
import { View, Text, Pressable, Switch, Platform } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { moderateScale } from 'react-native-size-matters';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useUserStore } from '../../../stores/useUserStore';
import { updateDailyReminderTime } from '../../../services/api/users';
import {
  scheduleDailyReminder,
  cancelDailyReminder,
  hasNotificationPermission,
  requestNotificationPermission,
} from '../../../lib/reminders';
import { useModal } from '../ModalHost';
import { PermissionDialog } from './PermissionDialog';
import { Toasts } from './toastCatalog';
import { LipButton } from '../../ui/LipButton';

const DEFAULT_TIME = '19:00';
/** Quick-pick presets (chunky_v3 §11 time chips). "Custom" opens the native picker. */
const PRESET_TIMES = ['08:00', '13:00', '19:00', '21:00'] as const;

function formatTime(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return time;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  } catch {
    return time;
  }
}

function pickerDateFor(time: string): Date {
  const [hStr, mStr] = time.split(':');
  const d = new Date();
  d.setHours(Number(hStr) || 19, Number(mStr) || 0, 0, 0);
  return d;
}

function timeStringFromDate(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function RemindersSheet() {
  const userId = useAuthStore((s) => s.user?.id);
  const reminderTime = useUserStore((s) => s.dailyReminderTime);
  const setReminder = useUserStore((s) => s.setDailyReminderTime);
  const recordDenial = useUserStore((s) => s.recordPermissionDenial);
  const modal = useModal();

  const [pickerOpen, setPickerOpen] = useState(false);
  const enabled = !!reminderTime;

  async function persistTime(time: string | null) {
    if (!userId) return false;
    const previous = useUserStore.getState().dailyReminderTime;
    setReminder(time);
    try {
      await updateDailyReminderTime(userId, time);
      return true;
    } catch (err) {
      console.warn('[reminders] updateDailyReminderTime failed', err);
      setReminder(previous);
      Toasts.preferenceSaveFailed();
      return false;
    }
  }

  /** Persist + (re)schedule a concrete time, requesting permission if needed. */
  async function applyTime(time: string) {
    const granted = await hasNotificationPermission();
    if (granted) {
      const saved = await persistTime(time);
      if (!saved) return;
      try {
        await scheduleDailyReminder(time);
        Toasts.reminderSet(formatTime(time));
      } catch (err) {
        console.warn('[reminders] scheduleDailyReminder failed', err);
      }
      return;
    }
    modal.show({
      kind: 'dialog',
      component: PermissionDialog,
      props: {
        kind: 'notifications',
        onAllow: async () => {
          modal.dismiss();
          const ok = await requestNotificationPermission();
          if (!ok) {
            recordDenial('notifications');
            Toasts.notificationsDenied();
            return;
          }
          const saved = await persistTime(time);
          if (!saved) return;
          try {
            await scheduleDailyReminder(time);
            Toasts.reminderSet(formatTime(time));
          } catch (err) {
            console.warn('[reminders] scheduleDailyReminder failed', err);
          }
        },
        onDeny: () => {
          modal.dismiss();
          recordDenial('notifications');
        },
      },
    });
  }

  async function disableReminder() {
    const saved = await persistTime(null);
    if (!saved) return;
    try {
      await cancelDailyReminder();
    } catch (err) {
      console.warn('[reminders] cancelDailyReminder failed', err);
    }
  }

  function onToggle(next: boolean) {
    if (next) {
      applyTime(reminderTime ?? DEFAULT_TIME);
    } else {
      disableReminder();
    }
  }

  function onChipPress(time: string) {
    if (time === reminderTime) return;
    applyTime(time);
  }

  async function onPickerChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') setPickerOpen(false);
    if (event.type === 'dismissed' || !date) return;
    const next = timeStringFromDate(date);
    if (next === reminderTime) return;
    await applyTime(next);
  }

  const selectedTime = reminderTime ?? DEFAULT_TIME;
  const isCustom = enabled && !PRESET_TIMES.includes(selectedTime as (typeof PRESET_TIMES)[number]);

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

      {enabled ? (
        <View style={{ gap: moderateScale(10) }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(11),
              letterSpacing: 1.4,
              color: Colors.tertiary,
              textTransform: 'uppercase',
            }}
            maxFontSizeMultiplier={1.4}
          >
            Time
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: moderateScale(8) }}>
            {PRESET_TIMES.map((t) => (
              <TimeChip
                key={t}
                label={formatTime(t)}
                selected={enabled && selectedTime === t}
                onPress={() => onChipPress(t)}
              />
            ))}
            <TimeChip
              label={isCustom ? formatTime(selectedTime) : 'Custom'}
              selected={isCustom}
              onPress={() => setPickerOpen((v) => !v)}
            />
          </View>
        </View>
      ) : null}

      {pickerOpen && enabled ? (
        <View
          style={{
            backgroundColor: Colors.surfaceCreamLow,
            borderRadius: Radius.tile,
            paddingVertical: Spacing.md,
            alignItems: 'center',
          }}
        >
          <DateTimePicker
            value={pickerDateFor(selectedTime)}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onPickerChange}
          />
          {Platform.OS === 'ios' ? (
            <Pressable
              onPress={() => setPickerOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Done"
              style={({ pressed }) => ({
                paddingVertical: moderateScale(10),
                paddingHorizontal: Spacing.lg,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(14),
                  color: Colors.primary,
                }}
                maxFontSizeMultiplier={1.3}
              >
                Done
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <LipButton
        label="Save reminder"
        variant="primary"
        onPress={() => modal.dismiss()}
        accessibilityLabel="Save reminder and close"
      />
    </BottomSheetView>
  );
}

/** Time preset chip — selected = goldPale fill + goldLip lip (chunky_v3). */
function TimeChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={{
        paddingVertical: moderateScale(9),
        paddingHorizontal: moderateScale(14),
        borderRadius: Radius.full,
        backgroundColor: selected ? Colors.secondaryFixed : '#ffffff',
        borderWidth: selected ? 0 : 1,
        borderColor: Colors.hairline,
        borderBottomWidth: 3,
        borderBottomColor: selected ? Colors.goldLip : Colors.cardLip,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.baloo.bold,
          fontSize: moderateScale(13.5),
          color: selected ? Colors.onSecondaryContainer : Colors.onSurface,
          fontVariant: ['tabular-nums'],
        }}
        maxFontSizeMultiplier={1.3}
      >
        {label}
      </Text>
    </Pressable>
  );
}
