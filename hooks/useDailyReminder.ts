import { logger } from '../lib/logger';
import { useAuthStore } from '../stores/useAuthStore';
import { useUserStore } from '../stores/useUserStore';
import { updateDailyReminderTime } from '../services/api/users';
import {
  scheduleDailyReminder,
  cancelDailyReminder,
  hasNotificationPermission,
  requestNotificationPermission,
} from '../lib/reminders';
import { useModal } from '../components/modals/ModalHost';
import { PermissionDialog } from '../components/modals/instances/PermissionDialog';
import { Toasts } from '../components/modals/instances/toastCatalog';

/** Format an `'HH:MM'` 24h string as a locale time (e.g. "7:00 PM"). */
export function formatTime(time: string): string {
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

/**
 * Shared daily-reminder orchestration used by both Profile → Reminders
 * ([RemindersSheet]) and the onboarding reminder step. Encapsulates the
 * permission → server-persist → schedule sequence (with optimistic rollback and
 * the pre-system PermissionDialog) so the two call sites don't duplicate it.
 *
 * `applyTime` always resolves the flow via `onSettled` — granted, denied, or
 * save-failed — so onboarding can advance regardless of the outcome (a reminder
 * is a nice-to-have; it must never trap the user in the flow).
 */
export function useDailyReminder() {
  const userId = useAuthStore((s) => s.user?.id);
  const setReminder = useUserStore((s) => s.setDailyReminderTime);
  const recordDenial = useUserStore((s) => s.recordPermissionDenial);
  const modal = useModal();

  /** Server-first write with optimistic local mirror + rollback on failure. */
  async function persistTime(time: string | null): Promise<boolean> {
    if (!userId) return false;
    const previous = useUserStore.getState().dailyReminderTime;
    setReminder(time);
    try {
      await updateDailyReminderTime(userId, time);
      return true;
    } catch (err) {
      logger.warn('reminders', 'updateDailyReminderTime failed', { err });
      setReminder(previous);
      Toasts.preferenceSaveFailed();
      return false;
    }
  }

  /** Persist + schedule a concrete time; toast on success. */
  async function commit(time: string): Promise<void> {
    const saved = await persistTime(time);
    if (!saved) return;
    try {
      await scheduleDailyReminder(time);
      Toasts.reminderSet(formatTime(time));
    } catch (err) {
      logger.warn('reminders', 'scheduleDailyReminder failed', { err });
    }
  }

  /**
   * Persist + (re)schedule `time`, requesting permission (via the in-app
   * PermissionDialog first) if not already granted. `onSettled` fires once the
   * flow resolves down every branch.
   */
  async function applyTime(time: string, opts?: { onSettled?: () => void }): Promise<void> {
    const settle = opts?.onSettled ?? (() => undefined);
    if (await hasNotificationPermission()) {
      await commit(time);
      settle();
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
            settle();
            return;
          }
          await commit(time);
          settle();
        },
        onDeny: () => {
          modal.dismiss();
          recordDenial('notifications');
          settle();
        },
      },
    });
  }

  async function disableReminder(): Promise<void> {
    const saved = await persistTime(null);
    if (!saved) return;
    try {
      await cancelDailyReminder();
    } catch (err) {
      logger.warn('reminders', 'cancelDailyReminder failed', { err });
    }
  }

  return { applyTime, disableReminder };
}
