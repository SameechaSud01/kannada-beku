import * as Linking from 'expo-linking';
import { Toast } from '../ToastHost';

/**
 * Standard toast triggers (MODALS §6.10). One call per row of the spec table —
 * keeps the strings and onTap behavior in a single source of truth.
 *
 * Strings duplicated lightly from copy.ts intentionally — these are system
 * feedback, not lesson copy, so they don't carry tone variants.
 */
export const Toasts = {
  reminderSet(time: string) {
    Toast.show({
      kind: 'success',
      id: 'reminder.set',
      title: `Reminder set — ${time} daily`,
    });
  },

  lessonSavedOffline() {
    Toast.show({
      kind: 'success',
      id: 'lesson.savedOffline',
      title: "Saved — we'll sync when you're back online",
    });
  },

  modeUpdated() {
    Toast.show({
      kind: 'success',
      id: 'mode.updated',
      title: 'App style updated',
    });
  },

  signedOut() {
    Toast.show({
      kind: 'success',
      id: 'signedOut',
      title: 'Signed out. See you soon.',
    });
  },

  audioFailed(onRetry?: () => void) {
    Toast.show({
      kind: 'error',
      id: 'audio.failed',
      title: "Couldn't play audio",
      subtitle: 'Tap to retry · check sound is on',
      onPress: onRetry,
    });
  },

  signInFailed() {
    Toast.show({
      kind: 'error',
      id: 'signIn.failed',
      title: "Couldn't sign you in",
      subtitle: 'Check your email and password and try again',
    });
  },

  invalidCredentials() {
    Toast.show({
      kind: 'error',
      id: 'signIn.invalid',
      title: 'Check your details',
      subtitle: 'Enter a valid email and a password of 8+ characters',
    });
  },

  confirmEmailPending() {
    Toast.show({
      kind: 'success',
      id: 'signUp.confirmPending',
      title: 'Check your email to confirm your account',
    });
  },

  socialSignInFailed() {
    Toast.show({
      kind: 'error',
      id: 'signIn.socialFailed',
      title: "Couldn't sign you in",
      subtitle: 'Please try again, or use email and password',
    });
  },

  resetEmailSent() {
    Toast.show({
      kind: 'success',
      id: 'reset.emailSent',
      title: 'Check your email for a reset link',
    });
  },

  resetLinkInvalid() {
    Toast.show({
      kind: 'error',
      id: 'reset.linkInvalid',
      title: 'That reset link is invalid or expired',
      subtitle: 'Request a new one to continue',
    });
  },

  passwordUpdated() {
    Toast.show({
      kind: 'success',
      id: 'reset.passwordUpdated',
      title: 'Password updated',
    });
  },

  sessionLost() {
    Toast.show({
      kind: 'error',
      id: 'session.lost',
      title: 'Please sign in again',
    });
  },

  onboardingSaveFailed() {
    Toast.show({
      kind: 'error',
      id: 'onboarding.saveFailed',
      title: "Couldn't save your answers. Try again.",
    });
  },

  networkOffline() {
    Toast.show({
      kind: 'error',
      id: 'network.offline',
      title: "You're offline",
      subtitle: "We'll keep your work safe until you're back",
    });
  },

  notificationsDenied() {
    Toast.show({
      kind: 'error',
      id: 'permission.notifDenied',
      title: 'Notifications are off',
      subtitle: 'Tap to open settings',
      onPress: () => {
        Linking.openSettings().catch(() => undefined);
      },
    });
  },

  preferenceSaveFailed() {
    Toast.show({
      kind: 'error',
      id: 'preference.saveFailed',
      title: "Couldn't save",
      subtitle: 'Check your connection and try again',
    });
  },

  feedbackSent() {
    Toast.show({
      kind: 'success',
      id: 'feedback.sent',
      title: 'Thanks — feedback sent!',
    });
  },

  partUnavailable() {
    Toast.show({
      kind: 'error',
      id: 'lesson.partUnavailable',
      title: "That part isn't available yet",
      subtitle: 'Starting the full lesson instead',
    });
  },

  basicsHomeNudge() {
    Toast.show({
      kind: 'success',
      id: 'basics.homeNudge',
      title: 'Tap "Kannada basics" on the Learn tab anytime to revisit the primer.',
    });
  },
};
