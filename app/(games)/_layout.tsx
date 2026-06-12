import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';

export default function GamesLayout() {
  const session = useAuthStore((s) => s.session);
  const authLoading = useAuthStore((s) => s.isLoading);

  // When the user is logged out (e.g. token-refresh sign-out or a reload that
  // restored them onto a game route), redirect during render so the param-less
  // teardown of these screens never flashes the "Game not found" fallback.
  // Wait for auth to settle so a cold start into a game route doesn't bounce a
  // user whose session is still loading.
  if (!authLoading && !session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
