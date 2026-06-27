import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { signInWithGoogle, signInWithApple } from '../../services/api/auth';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { supabase } from '../../services/api/supabase';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import { GoogleGLogo } from '../../components/auth/GoogleGLogo';
import { Icons } from '../../constants/icons';
import { LipButton } from '../../components/ui/LipButton';
import { ChunkyPressable } from '../../components/ui/ChunkyPressable';

// Shared input chrome for the email + password fields (chunky kit v3):
// white face, 1px ink@14% border, a 3px ink@6% bottom lip, radius 14.
const INPUT_STYLE = {
  fontFamily: Fonts.dmSans.regular,
  fontSize: moderateScale(15),
  backgroundColor: '#ffffff',
  borderWidth: 1,
  borderColor: 'rgba(27,29,14,0.14)',
  borderBottomWidth: 3,
  borderBottomColor: Colors.cardLip,
  borderRadius: Radius.lg,
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.md,
  color: Colors.onSurface,
} as const;

const EMAIL_RE = /^\S+@\S+\.\S+$/;

// Sign-up password policy: 8+ chars, at least one uppercase letter and one special character.
const PW_UPPER_RE = /[A-Z]/;
const PW_SPECIAL_RE = /[^A-Za-z0-9]/;
const PW_MIN_LEN = 8;
const isStrongPassword = (pw: string) =>
  pw.length >= PW_MIN_LEN && PW_UPPER_RE.test(pw) && PW_SPECIAL_RE.test(pw);

type Mode = 'login' | 'signup';

const COPY: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  login: {
    title: 'Welcome back',
    subtitle: 'Log in to continue your Kannada journey.',
    cta: 'Log in',
  },
  signup: {
    title: 'Create your account',
    subtitle: 'Sign up to start learning Kannada today.',
    cta: 'Sign up',
  },
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);

  const handleSocial = async (provider: 'google' | 'apple') => {
    setLoading(true);
    const res = await (provider === 'google' ? signInWithGoogle() : signInWithApple());
    setLoading(false);
    // signedIn → AppGate routes away; cancelled → no-op.
    if (res.status === 'error') {
      console.warn(`[auth] ${provider} sign-in failed`, res.error);
      Toasts.socialSignInFailed();
    }
  };

  const isSignUp = mode === 'signup';
  const copy = COPY[mode];

  // Disable the CTA (formal disabled recipe) until required fields are present.
  const canSubmit =
    email.trim().length > 0 && password.length > 0 && (!isSignUp || confirm.length > 0);

  const switchMode = (next: Mode) => {
    setMode(next);
    setPassword('');
    setConfirm('');
  };

  // Live requirement checklist shown under the password fields in sign-up mode.
  const passwordRules = [
    { label: 'At least 8 characters', met: password.length >= PW_MIN_LEN },
    { label: 'One uppercase letter', met: PW_UPPER_RE.test(password) },
    { label: 'One special character (e.g. ! ? @ #)', met: PW_SPECIAL_RE.test(password) },
    { label: 'Passwords match', met: confirm.length > 0 && password === confirm },
  ];

  const handleAuth = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_RE.test(normalizedEmail)) {
      Toasts.invalidCredentials();
      return;
    }

    if (isSignUp) {
      if (!isStrongPassword(password) || password !== confirm) {
        Toasts.invalidCredentials();
        return;
      }
    } else if (password.length < 6) {
      Toasts.invalidCredentials();
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });
        if (error) throw error;
        // Defensive: only fires if someone re-enables email confirmation in Supabase.
        // Under the current "Confirm email" OFF setting, signUp returns a live session
        // and AppGate routes to onboarding — showing this toast then would be misleading.
        if (!data.session) {
          Toasts.confirmEmailPending();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      console.warn('[auth] error', error);
      Toasts.signInFailed();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.surfaceCream }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: Spacing.xxl,
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xxl,
        }}
      >
        {/* Hero */}
        <View style={{ alignItems: 'center', marginBottom: Spacing.xl }}>
          <Text
            style={{
              fontFamily: Fonts.baloo.bold,
              fontSize: moderateScale(34),
              color: Colors.primaryContainer,
              marginBottom: Spacing.sm,
            }}
          >
            Kannada Beku
          </Text>
          <Text
            style={{
              fontFamily: Fonts.notoSansKannada.bold,
              fontSize: moderateScale(18),
              color: Colors.primaryContainer,
              lineHeight: moderateScale(30),
            }}
          >
            ಕನ್ನಡ ಬೇಕು
          </Text>
        </View>

        {/* Mode segmented toggle — white active pill in an ink-tinted track */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(27,29,14,0.06)',
            borderRadius: Radius.full,
            padding: moderateScale(4),
            marginBottom: Spacing.xl,
          }}
        >
          <SegmentButton
            label="Log in"
            active={mode === 'login'}
            onPress={() => switchMode('login')}
          />
          <SegmentButton
            label="Sign up"
            active={mode === 'signup'}
            onPress={() => switchMode('signup')}
          />
        </View>

        {/* Mode-specific heading */}
        <View style={{ marginBottom: Spacing.xl }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(22),
              color: Colors.onSurface,
              marginBottom: Spacing.xs,
            }}
          >
            {copy.title}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(14),
              color: Colors.tertiary,
            }}
          >
            {copy.subtitle}
          </Text>
        </View>

        {/* Form */}
        <TextInput
          placeholder="Email"
          accessibilityLabel="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          maxFontSizeMultiplier={1.2}
          style={[INPUT_STYLE, { marginBottom: Spacing.md }]}
          placeholderTextColor={Colors.tertiary}
        />

        <PasswordInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          marginBottom={isSignUp ? Spacing.md : Spacing.xl}
        />

        {/* Confirm password + requirement checklist — sign-up mode only */}
        {isSignUp && (
          <>
            <PasswordInput
              placeholder="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              onSubmitEditing={handleAuth}
              marginBottom={Spacing.md}
            />

            <View style={{ marginBottom: Spacing.xl, gap: Spacing.xs }}>
              {passwordRules.map((rule) => {
                const RuleIcon = rule.met ? Icons.ruleMet : Icons.ruleUnmet;
                return (
                  <View
                    key={rule.label}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}
                  >
                    <RuleIcon
                      size={moderateScale(15)}
                      color={rule.met ? Colors.primaryContainer : Colors.textFaint}
                    />
                    <Text
                      style={{
                        fontFamily: Fonts.dmSans.regular,
                        fontSize: moderateScale(12.5),
                        color: rule.met ? Colors.onSurface : Colors.textFaint,
                      }}
                    >
                      {rule.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Forgot password — login mode only */}
        {!isSignUp && (
          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            accessibilityRole="button"
            hitSlop={10}
            style={{ alignSelf: 'flex-end', marginTop: -Spacing.md, marginBottom: Spacing.lg }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(13),
                color: Colors.primary,
              }}
            >
              Forgot password?
            </Text>
          </Pressable>
        )}

        {/* Submit — red primary; disabled recipe until required fields are present */}
        <LipButton
          label={loading ? 'Please wait…' : copy.cta}
          onPress={handleAuth}
          variant="primary"
          disabled={loading || !canSubmit}
        />

        {/* Social sign-in (spec_social_login.md) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl }}>
          <View
            style={{ flex: 1, height: moderateScale(0.5), backgroundColor: Colors.outlineVariant }}
          />
          <Text
            style={{
              marginHorizontal: Spacing.md,
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(12),
              color: Colors.tertiary,
            }}
          >
            or continue with
          </Text>
          <View
            style={{ flex: 1, height: moderateScale(0.5), backgroundColor: Colors.outlineVariant }}
          />
        </View>

        {/* Google — secondary (tan) chunky button with the red G */}
        <ChunkyPressable
          onPress={() => handleSocial('google')}
          disabled={loading}
          accessibilityLabel="Continue with Google"
          bg="#ffffff"
          lip={4}
          lipColor={Colors.interactiveSecondaryLip}
          border
          borderColor={Colors.interactiveSecondary}
          borderWidth={2}
          radius={Radius.lg}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: Spacing.md + moderateScale(2),
          }}
        >
          <GoogleGLogo size={18} />
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(14),
              color: Colors.onSurface,
              marginLeft: Spacing.sm,
            }}
          >
            Continue with Google
          </Text>
        </ChunkyPressable>

        {Platform.OS === 'ios' && appleAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={moderateScale(8)}
            style={{ height: moderateScale(48), marginTop: Spacing.md }}
            onPress={() => handleSocial('apple')}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type PasswordInputProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  marginBottom: number;
  onSubmitEditing?: () => void;
};

function PasswordInput({
  placeholder,
  value,
  onChangeText,
  marginBottom,
  onSubmitEditing,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const EyeIcon = visible ? Icons.eyeOff : Icons.eye;

  return (
    <View style={{ position: 'relative', marginBottom }}>
      <TextInput
        placeholder={placeholder}
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={onSubmitEditing}
        maxFontSizeMultiplier={1.2}
        style={[INPUT_STYLE, { paddingRight: moderateScale(48) }]}
        placeholderTextColor={Colors.tertiary}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        hitSlop={10}
        style={{
          position: 'absolute',
          right: Spacing.lg,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
        }}
      >
        <EyeIcon size={moderateScale(20)} color={Colors.tertiary} />
      </Pressable>
    </View>
  );
}

type SegmentButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function SegmentButton({ label, active, onPress }: SegmentButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={{
        flex: 1,
        backgroundColor: active ? '#ffffff' : 'transparent',
        borderRadius: Radius.full,
        borderBottomWidth: active ? 2 : 0,
        borderBottomColor: active ? 'rgba(27,29,14,0.12)' : 'transparent',
        paddingVertical: Spacing.sm + moderateScale(2),
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: active ? Fonts.dmSans.bold : Fonts.dmSans.medium,
          fontSize: moderateScale(14),
          color: active ? Colors.onSurface : Colors.tertiary,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
