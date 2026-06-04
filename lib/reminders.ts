import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_ID = 'kannada-beku-daily-reminder';
// Pre-rename id — cancelled alongside the current one so the old "ಕನ್ನಡ ಬಾ"
// reminder doesn't linger or duplicate after the rebrand.
const LEGACY_REMINDER_ID = 'kannada-baa-daily-reminder';
const ANDROID_CHANNEL_ID = 'daily-reminders';

/**
 * Ensure the Android notification channel exists. iOS has no-op channels.
 * Safe to call repeatedly — `setNotificationChannelAsync` is idempotent.
 */
async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Returns true if the user has notification permission granted.
 * Does NOT request permission — caller must request before scheduling.
 */
export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Request notification permission from the OS. Returns true if granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule the daily reminder for the given time. Cancels any prior schedule
 * with the same id so re-calling is safe (no duplicates).
 *
 * @param time `'HH:MM'` 24h. Validated lightly — caller passes from picker.
 */
export async function scheduleDailyReminder(time: string): Promise<void> {
  await ensureAndroidChannel();
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => undefined);
  await Notifications.cancelScheduledNotificationAsync(LEGACY_REMINDER_ID).catch(() => undefined);
  const [hourStr, minuteStr] = time.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return;
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'ಕನ್ನಡ ಬೇಕು',
      body: "Time for today's lesson.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => undefined);
  await Notifications.cancelScheduledNotificationAsync(LEGACY_REMINDER_ID).catch(() => undefined);
}
