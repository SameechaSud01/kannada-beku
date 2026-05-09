import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Lora_400Regular_Italic, Lora_500Medium_Italic } from '@expo-google-fonts/lora';
import {
  NotoSerifKannada_400Regular,
  NotoSerifKannada_500Medium,
  NotoSerifKannada_700Bold,
} from '@expo-google-fonts/noto-serif-kannada';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../stores/useAuthStore';
import { useUserStore } from '../stores/useUserStore';
import { useProgressStore } from '../stores/progressStore';
import { supabase } from '../services/api/supabase';

import '../global.css';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AppGate() {
  const router = useRouter();
  const segments = useSegments();
  const { session, isLoading: authLoading, setSession, setLoading } = useAuthStore();
  const hasCompletedOnboarding = useUserStore((s) => s.hasCompletedOnboarding);
  const userHydrated = useUserStore((s) => s.isHydrated);
  const progressHydrated = useProgressStore((s) => s.isHydrated);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading || !userHydrated || !progressHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

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
  }, [session, authLoading, segments, hasCompletedOnboarding, userHydrated, progressHydrated]);

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Lora_400Regular_Italic,
    Lora_500Medium_Italic,
    NotoSerifKannada_400Regular,
    NotoSerifKannada_500Medium,
    NotoSerifKannada_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AppGate />
    </QueryClientProvider>
  );
}
