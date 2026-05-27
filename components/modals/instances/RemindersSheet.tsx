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

const DEFAULT_TIME = '19:00';

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

  async function enableReminder() {
    const granted = await hasNotificationPermission();
    if (granted) {
      const time = reminderTime ?? DEFAULT_TIME;
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
          const time = reminderTime ?? DEFAULT_TIME;
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
      enableReminder();
    } else {
      disableReminder();
    }
  }

  async function onPickerChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') setPickerOpen(false);
    if (event.type === 'dismissed' || !date) return;
    const next = timeStringFromDate(date);
    if (next === reminderTime) return;
    const saved = await persistTime(next);
    if (!saved) return;
    try {
      await scheduleDailyReminder(next);
      Toasts.reminderSet(formatTime(next));
    } catch (err) {
      console.warn('[reminders] reschedule failed', err);
    }
  }

  return (
    <BottomSheetView
      style={{
        paddingHorizontal: moderateScale(20),
        paddingTop: moderateScale(4),
        paddingBottom: moderateScale(28),
        gap: moderateScale(14),
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(20),
          color: Colors.onSurface,
          letterSpacing: -0.3,
        }}
        maxFontSizeMultiplier={1.3}
      >
        Reminders
      </Text>

      <View
        style={{
          backgroundColor: Colors.surfaceContainerHigh,
          borderRadius: Radius.lg,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
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
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(14),
              color: Colors.onSurface,
            }}
            maxFontSizeMultiplier={1.3}
          >
            Daily lesson reminder
          </Text>
          <Switch
            value={enabled}
            onValueChange={onToggle}
            trackColor={{ true: Colors.primary, false: Colors.surfaceContainerHighest }}
            thumbColor={Colors.onPrimary}
            accessibilityLabel="Daily lesson reminder"
          />
        </View>

        {enabled ? (
          <Pressable
            onPress={() => setPickerOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={`Reminder time, ${formatTime(reminderTime ?? DEFAULT_TIME)}`}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: moderateScale(14),
              paddingHorizontal: Spacing.lg,
              minHeight: moderateScale(56),
              backgroundColor: Colors.surfaceContainerHighest,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                flex: 1,
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(14),
                color: Colors.onSurface,
              }}
              maxFontSizeMultiplier={1.3}
            >
              Time
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(14),
                color: Colors.primary,
              }}
              maxFontSizeMultiplier={1.3}
            >
              {formatTime(reminderTime ?? DEFAULT_TIME)}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(12),
          lineHeight: moderateScale(18),
          color: Colors.tertiary,
          textAlign: 'center',
          paddingHorizontal: Spacing.sm,
        }}
        maxFontSizeMultiplier={1.4}
      >
        We&apos;ll send one nudge a day. Tap the time to change it.
      </Text>

      {pickerOpen && enabled ? (
        <View
          style={{
            backgroundColor: Colors.surfaceContainerHigh,
            borderRadius: Radius.lg,
            paddingVertical: Spacing.md,
            alignItems: 'center',
          }}
        >
          <DateTimePicker
            value={pickerDateFor(reminderTime ?? DEFAULT_TIME)}
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
    </BottomSheetView>
  );
}
