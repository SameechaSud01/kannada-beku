import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { Slot, useRouter, useSegments, type ErrorBoundaryProps } from 'expo-router';
import * as Sentry from '@sentry/react-native';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  NotoSansKannada_400Regular,
  NotoSansKannada_500Medium,
  NotoSansKannada_700Bold,
} from '@expo-google-fonts/noto-sans-kannada';
import {
  BalooTamma2_400Regular,
  BalooTamma2_500Medium,
  BalooTamma2_600SemiBold,
  BalooTamma2_700Bold,
  BalooTamma2_800ExtraBold,
} from '@expo-google-fonts/baloo-tamma-2';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../stores/useAuthStore';
import { useUserStore } from '../stores/useUserStore';
import { useProgressStore } from '../stores/progressStore';
import { supabase } from '../services/api/supabase';
import { fetchUserRow } from '../services/api/users';
import { syncOnboardingToSupabase } from '../services/api/onboarding';
import { fetchCompletedLessons, recordLessonCompletion } from '../services/api/progress';
import { fetchLessonIdBySlug } from '../services/api/lessons';
import { fetchGameMasteryByLesson } from '../services/api/gameMastery';
import { useSyncQueueStore } from '../stores/syncQueueStore';
import { flushSyncQueue } from '../services/progress/syncQueue';
import * as Network from 'expo-network';
import { Audio } from 'expo-av';
import { isKannadaVoiceAvailable } from '../services/audio/deviceTtsAudioService';
import { ModalHost, useModal } from '../components/modals/ModalHost';
import { ToastHost } from '../components/modals/ToastHost';
import { Toasts } from '../components/modals/instances/toastCatalog';
import { BrandSplash } from '../components/states/BrandSplash';
import { ErrorState } from '../components/states/ErrorState';
import { TTSUnavailableDialog } from '../components/modals/instances/TTSUnavailableDialog';
import { scheduleDailyReminder, hasNotificationPermission } from '../lib/reminders';
import * as Linking from 'expo-linking';
import { Colors } from '../constants/colors';

SplashScreen.preventAutoHideAsync();

// Crash reporting (audit B2). Init is a no-op without a DSN, so local/dev runs
// and any build missing EXPO_PUBLIC_SENTRY_DSN simply don't report. Disabled in
// __DEV__ so development errors never reach the dashboard.
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
Sentry.init({
  dsn: SENTRY_DSN,
  enabled: !!SENTRY_DSN && !__DEV__,
  tracesSampleRate: 0.2,
});

/**
 * Root error boundary (audit B2). Expo Router renders this in place of the tree
 * when any descendant route throws during render, so an uncaught error shows a
 * recoverable screen instead of a white screen — and the crash is reported.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
        <ErrorState
          title="Something went wrong"
          body="The app hit an unexpected error. Try again — if it keeps happening, restart the app."
          onRetry={retry}
        />
      </View>
    </SafeAreaProvider>
  );
}

// React Navigation's DefaultTheme paints scenes + nav chrome with a cool grey
// (rgb(242,242,242)) that reads as "whitespace" against our warm page cream
// (e.g. behind the floating tab bar during transitions). Override the theme
// background to the page cream so no grey can leak anywhere in the navigator.
const CreamNavTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: Colors.surfaceCream },
};

const queryClient = new QueryClient();

/**
 * Server-first hydration for lesson completions (spec_progress_persistence).
 * Pulls the server list, backfills any local-only slugs to the server with
 * score=null, then merges the union into useProgressStore. Routing is not
 * blocked on this — the store update triggers re-renders once it resolves.
 */
async function hydrateCompletions(userId: string) {
  const serverCompletions = await fetchCompletedLessons(userId);
  const serverSlugs = serverCompletions.map((c) => c.slug);
  const serverSet = new Set(serverSlugs);

  const localOnly = useProgressStore
    .getState()
    .completedLessons.filter((slug) => !serverSet.has(slug));

  // Backfill local-only slugs concurrently. Each slug keeps its own try/catch so
  // one failure can't abort the rest; ordering is irrelevant because the union is
  // merged below. record_lesson_completion is personal-best idempotent, so a
  // concurrent write can never lower an existing score.
  await Promise.all(
    localOnly.map(async (slug) => {
      try {
        const lessonId = await fetchLessonIdBySlug(slug);
        if (!lessonId) {
          console.warn('[progress] backfill skipped, no lesson for slug', slug);
          return;
        }
        await recordLessonCompletion(lessonId, null);
      } catch (err) {
        console.warn('[progress] backfill failed for slug', slug, err);
      }
    }),
  );

  useProgressStore.getState().hydrateFromServerCompletions([...serverSlugs, ...localOnly]);
}

/**
 * Boot-time TTS voice probe (MODALS §6.9). Runs inside ModalHost so we can
 * show the warning dialog if the device has no kn-IN voice.
 */
function TtsProbe() {
  const modal = useModal();
  const hasSeen = useUserStore((s) => s.hasSeenTtsWarning);
  const userHydrated = useUserStore((s) => s.isHydrated);
  const setHasSeen = useUserStore((s) => s.setHasSeenTtsWarning);

  useEffect(() => {
    if (!userHydrated || hasSeen) return;
    isKannadaVoiceAvailable().then((available) => {
      if (available) return;
      modal.show({
        kind: 'dialog',
        component: TTSUnavailableDialog,
        props: {
          onOpenSettings: () => {
            setHasSeen(true);
            modal.dismiss();
            Linking.openSettings().catch(() => undefined);
          },
          onDismiss: () => {
            setHasSeen(true);
            modal.dismiss();
          },
        },
      });
    });
  }, [userHydrated, hasSeen, modal, setHasSeen]);

  return null;
}

function AppGate() {
  const router = useRouter();
  const segments = useSegments();
  const { session, isLoading: authLoading, setSession, setLoading } = useAuthStore();
  const hasCompletedOnboarding = useUserStore((s) => s.hasCompletedOnboarding);
  const storedUserId = useUserStore((s) => s.userId);
  const userHydrated = useUserStore((s) => s.isHydrated);
  const progressHydrated = useProgressStore((s) => s.isHydrated);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);

      // DB is the source of truth for onboarding completion. Hydrate the user
      // store from public.users on every session event so the local
      // hasCompletedOnboarding flag can't be stale across accounts. Routing
      // does not block on this — once the row resolves, the store update
      // triggers a re-run of the routing effect.
      const userId = session?.user?.id;
      if (!userId) return;
      fetchUserRow(userId)
        .then(async (row) => {
          if (!row) return;
          useUserStore.getState().hydrateFromUserRow(row);

          // Restore the server-persisted streak so it survives reinstall / a
          // new device (audit B4). No-op when local is already as fresh.
          useProgressStore
            .getState()
            .hydrateStreakFromServer(row.current_streak, row.last_active_date);

          // spec_security_hardening.md §6: if local says onboarding is done but
          // the DB row's flag is null, the prior sync silently failed. Retry
          // once now that we have a session.
          const pending = useUserStore.getState().pendingOnboardingSync;
          if (pending && !row.onboarding_completed_at) {
            const result = await syncOnboardingToSupabase({
              userId,
              name: pending.displayName ?? null,
              learningMode: pending.learningMode,
              motivations: pending.motivations,
              dailyGoalMinutes: pending.dailyGoalMinutes,
            });
            if (result.ok) {
              useUserStore.getState().setPendingOnboardingSync(null);
            }
            // On failure, leave the snapshot — we'll try again next boot. No
            // toast: user already completed onboarding from their POV.
          }

          // Re-arm the OS schedule on each sign-in so reinstalls / new devices
          // restore the user's chosen time (spec_profile_settings_wiring §3).
          if (row.daily_reminder_time) {
            try {
              const granted = await hasNotificationPermission();
              if (granted) await scheduleDailyReminder(row.daily_reminder_time);
            } catch (err) {
              console.warn('[reminders] boot re-arm failed', err);
            }
          }
        })
        .catch((err) => {
          console.warn('[auth] fetchUserRow failed', err);
        });

      hydrateCompletions(userId).catch((err) => {
        console.warn('[progress] hydrateCompletions failed', err);
      });

      // Prefetch game mastery in the background at login so the Profile page
      // finds it cached and renders without a loading skeleton.
      queryClient.prefetchQuery({
        queryKey: ['game-mastery', userId],
        queryFn: () => fetchGameMasteryByLesson(userId),
        staleTime: Infinity,
      });
    });

    // onAuthStateChange normally fires INITIAL_SESSION and clears loading, but
    // don't rely on it — release the boot gate here too, on both the success
    // and failure paths, or the app can hang on the splash forever (audit B1).
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session ?? null);
        setLoading(false);
      })
      .catch(async (err) => {
        if (err?.message?.toLowerCase().includes('refresh token')) {
          await supabase.auth.signOut().catch(() => {});
          setSession(null);
          Toasts.sessionLost();
        }
        setLoading(false);
      });

    // Hard fallback: if neither the auth event nor getSession resolves (e.g. a
    // stalled network on a cold start), force the gate open so the user reaches
    // a usable screen rather than an endless splash (audit B1).
    const bootFallback = setTimeout(() => setLoading(false), 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(bootFallback);
    };
  }, []);

  // Bind persisted per-user state to the current Supabase user; reset on user switch.
  // Runs before the routing effect below so onboarding/progress flags reflect the right user.
  useEffect(() => {
    if (!userHydrated || !progressHydrated) return;
    const currentUserId = session?.user?.id ?? null;
    if (!currentUserId) return;
    if (storedUserId === null) {
      useUserStore.getState().bindUser(currentUserId);
    } else if (storedUserId !== currentUserId) {
      useUserStore.getState().resetForUser(currentUserId);
      useProgressStore.getState().reset();
    }
  }, [session?.user?.id, storedUserId, userHydrated, progressHydrated]);

  // Offline outbox (TODO T019): drain any queued progress writes once we're
  // signed in and the queue has rehydrated — immediately (catch up on launch /
  // anything parked last session) and again whenever connectivity returns.
  const syncQueueHydrated = useSyncQueueStore((s) => s.isHydrated);
  useEffect(() => {
    if (!session?.user?.id || !syncQueueHydrated) return;
    flushSyncQueue();
    const sub = Network.addNetworkStateListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        flushSyncQueue();
      }
    });
    return () => sub.remove();
  }, [session?.user?.id, syncQueueHydrated]);

  useEffect(() => {
    if (authLoading || !userHydrated || !progressHydrated) return;

    // Wait one tick after a user switch so the store reset above lands before we read flags.
    const currentUserId = session?.user?.id ?? null;
    if (currentUserId && storedUserId !== null && storedUserId !== currentUserId) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const inResetPassword = inAuthGroup && (segments as string[])[1] === 'reset-password';

    // While completing a password reset, the recovery session must NOT trigger
    // any redirect — the user stays on reset-password to set a new password,
    // then the screen routes itself. (spec_password_reset.md)
    if (session && inResetPassword) return;

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding/welcome');
      } else {
        router.replace('/(tabs)');
      }
    } else if (session && !hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding/welcome');
    } else if (session && hasCompletedOnboarding && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [
    session,
    authLoading,
    segments,
    hasCompletedOnboarding,
    storedUserId,
    userHydrated,
    progressHydrated,
  ]);

  // Animated brand splash (Splash C) covers the boot hydration window — the gap
  // between the native splash hiding (fonts ready) and auth/stores resolving.
  // It fades out once the boot gate is clear AND a minimum on-screen time has
  // passed, so the reveal animation always gets to play (hydration is often
  // near-instant on a warm start).
  const MIN_SPLASH_MS = 3200;
  const booting = authLoading || !userHydrated || !progressHydrated;
  const [splashVisible, setSplashVisible] = useState(true);
  const [minElapsed, setMinElapsed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!booting && minElapsed) setSplashVisible(false);
  }, [booting, minElapsed]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <ThemeProvider value={CreamNavTheme}>
        <Slot />
      </ThemeProvider>
      {splashVisible ? (
        <Animated.View
          exiting={FadeOut.duration(350)}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}
        >
          <BrandSplash />
        </Animated.View>
      ) : null}
    </View>
  );
}

function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    NotoSansKannada_400Regular,
    NotoSansKannada_500Medium,
    NotoSansKannada_700Bold,
    BalooTamma2_400Regular,
    BalooTamma2_500Medium,
    BalooTamma2_600SemiBold,
    BalooTamma2_700Bold,
    BalooTamma2_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    }).catch((err) => {
      console.warn('[audio] setAudioModeAsync failed', err);
    });

    isKannadaVoiceAvailable().then((available) => {
      if (!available) {
        console.warn('[audio] Kannada TTS voice not available on this device.');
      }
    });
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ToastHost>
            <ModalHost>
              <TtsProbe />
              <AppGate />
            </ModalHost>
          </ToastHost>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Sentry.wrap enables native crash + performance instrumentation on the root
// component (audit B2). No-op at runtime when Sentry is disabled (no DSN).
export default Sentry.wrap(RootLayout);
