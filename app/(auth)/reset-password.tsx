import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { supabase } from '../../services/api/supabase';
import { setNewPassword } from '../../services/api/auth';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import { ExitBackButton } from '../../components/ui/ExitBackButton';
import { useUserStore } from '../../stores/useUserStore';

const INPUT_STYLE = {
  fontFamily: Fonts.dmSans.regular,
  fontSize: moderateScale(15),
  backgroundColor: Colors.surfaceContainerHighest,
  borderWidth: moderateScale(0.5),
  borderColor: Colors.outlineVariant,
  borderRadius: Radius.md,
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.md,
  marginBottom: Spacing.md,
  color: Colors.onSurface,
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    code?: string;
    token_hash?: string;
    error?: string;
    error_code?: string;
  }>();
  const url = Linking.useURL();
  const exchanged = useRef(false);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  // Exchange the recovery link's `?code=` for a session, exactly once.
  // AppGate early-returns while we're on this screen so the new session does
  // not bounce us away before the password is set (spec_password_reset.md).
  useEffect(() => {
    if (exchanged.current) return;

    // expo-router consumes the inbound deep link and exposes its query string
    // via useLocalSearchParams (Linking.useURL is often null here). Parse the
    // raw URL too as a cold-start fallback.
    const fromUrl = url ? Linking.parse(url).queryParams ?? {} : {};
    const pick = (key: string): string | null => {
      const v = (params as Record<string, unknown>)[key] ?? fromUrl[key];
      return typeof v === 'string' ? v : null;
    };
    const code = pick('code');
    const tokenHash = pick('token_hash');
    const errCode = pick('error') ?? pick('error_code');

    if (errCode) {
      exchanged.current = true;
      Toasts.resetLinkInvalid();
      router.replace('/(auth)/forgot-password');
      return;
    }
    if (!code && !tokenHash) return; // wait for the params to arrive

    // Supabase recovery links arrive in one of two shapes depending on the
    // email template: PKCE (`?code=`) → exchangeCodeForSession, or token-hash
    // (`?token_hash=...&type=recovery`) → verifyOtp.
    exchanged.current = true;
    (async () => {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
      } else if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          type: 'recovery',
          token_hash: tokenHash,
        });
        if (error) throw error;
      }
      setReady(true);
    })().catch((err) => {
      console.warn('[auth] reset verification failed', err);
      Toasts.resetLinkInvalid();
      router.replace('/(auth)/forgot-password');
    });
  }, [params, url, router]);

  const lengthOk = password.length >= 8;
  const matchOk = password === confirm;
  const canSubmit = lengthOk && matchOk && confirm.length > 0;

  const helper =
    password.length > 0 && !lengthOk
      ? 'Use at least 8 characters'
      : confirm.length > 0 && !matchOk
        ? "Passwords don't match"
        : null;

  const submit = async () => {
    if (!canSubmit || saving) return;
    Keyboard.dismiss();
    setSaving(true);
    try {
      await setNewPassword(password);
      Toasts.passwordUpdated();
      // The recovery session is a full session. Route in; the gate self-corrects
      // the onboarded/un-onboarded target once the DB row hydrates.
      const onboarded = useUserStore.getState().hasCompletedOnboarding;
      router.replace(onboarded ? '/(tabs)' : '/onboarding/welcome');
    } catch (err) {
      console.warn('[auth] set new password failed', err);
      Toasts.preferenceSaveFailed();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.surface }}
    >
      <ExitBackButton skipConfirm />
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: Spacing.xxl,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        {!ready ? (
          <View style={{ alignItems: 'center' }}>
            <ActivityIndicator color={Colors.primary} />
            <Text
              style={{
                fontFamily: Fonts.dmSans.regular,
                fontSize: moderateScale(14),
                color: Colors.tertiary,
                marginTop: Spacing.md,
              }}
            >
              Verifying your reset link…
            </Text>
          </View>
        ) : (
          <>
            <View style={{ marginBottom: Spacing.xl }}>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(22),
                  color: Colors.onSurface,
                  marginBottom: Spacing.xs,
                }}
              >
                Set a new password
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: moderateScale(14),
                  color: Colors.tertiary,
                }}
              >
                Choose a new password for your account.
              </Text>
            </View>

            <TextInput
              placeholder="New password (min 8 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!saving}
              style={INPUT_STYLE}
              placeholderTextColor={Colors.tertiary}
            />
            <TextInput
              placeholder="Confirm new password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoCapitalize="none"
              editable={!saving}
              onSubmitEditing={submit}
              style={INPUT_STYLE}
              placeholderTextColor={Colors.tertiary}
            />

            {helper && (
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: moderateScale(12),
                  color: Colors.tertiary,
                  marginBottom: Spacing.sm,
                }}
              >
                {helper}
              </Text>
            )}

            <Pressable
              onPress={submit}
              disabled={!canSubmit || saving}
              accessibilityRole="button"
              style={({ pressed }) => ({
                backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
                borderRadius: Radius.md,
                paddingVertical: Spacing.md + moderateScale(2),
                alignItems: 'center',
                opacity: !canSubmit || saving ? 0.5 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
                marginTop: Spacing.sm,
              })}
            >
              {saving ? (
                <ActivityIndicator color={Colors.onPrimary} />
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.bold,
                    fontSize: moderateScale(14),
                    color: Colors.onPrimary,
                    letterSpacing: 0.5,
                  }}
                >
                  UPDATE PASSWORD
                </Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
