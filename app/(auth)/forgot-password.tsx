import { useState } from 'react';
import { logger } from '../../lib/logger';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { requestPasswordReset } from '../../services/api/auth';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import { ExitBackButton } from '../../components/ui/ExitBackButton';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

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

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalized)) {
      Toasts.invalidCredentials();
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    try {
      await requestPasswordReset(normalized);
      // Same confirmation regardless of whether an account exists — never leak
      // account existence (spec_password_reset.md rule 3).
      Toasts.resetEmailSent();
      setSent(true);
    } catch (err) {
      logger.warn('auth', 'password reset request failed', { err });
      Toasts.preferenceSaveFailed();
    } finally {
      setLoading(false);
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
        <View style={{ marginBottom: Spacing.xl }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(22),
              color: Colors.onSurface,
              marginBottom: Spacing.xs,
            }}
          >
            {sent ? 'Check your email' : 'Reset your password'}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(14),
              color: Colors.tertiary,
            }}
          >
            {sent
              ? `If an account exists for ${email.trim().toLowerCase()}, we've sent a link to set a new password.`
              : "Enter your email and we'll send you a link to set a new password."}
          </Text>
        </View>

        {!sent && (
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
            onSubmitEditing={submit}
            style={INPUT_STYLE}
            placeholderTextColor={Colors.tertiary}
          />
        )}

        <Pressable
          onPress={submit}
          disabled={loading}
          accessibilityRole="button"
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
            borderRadius: Radius.md,
            paddingVertical: Spacing.md + moderateScale(2),
            alignItems: 'center',
            opacity: loading ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
            marginTop: Spacing.sm,
          })}
        >
          {loading ? (
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
              {sent ? 'RESEND LINK' : 'SEND RESET LINK'}
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
