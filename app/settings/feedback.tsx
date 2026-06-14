import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { LipButton } from '../../components/ui/LipButton';
import { useAuthStore } from '../../stores/useAuthStore';
import { submitFeedback } from '../../services/api/feedback';
import { Toasts } from '../../components/modals/instances/toastCatalog';

const MAX_LEN = 1000;

export default function FeedbackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?.id);

  const [message, setMessage] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const trimmed = message.trim();
  const canSubmit = trimmed.length > 0 && !submitting;

  async function handleSubmit() {
    if (!userId || !trimmed || submitting) return;
    Keyboard.dismiss();
    setSubmitting(true);
    try {
      await submitFeedback(userId, { message: trimmed });
      Toasts.feedbackSent();
      router.replace('/(tabs)/profile');
    } catch (err) {
      console.warn('[feedback] submit failed', err);
      Toasts.preferenceSaveFailed();
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: Spacing.md,
          paddingHorizontal: Spacing.xxl,
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(14),
        }}
      >
        <Pressable
          onPress={() => router.replace('/(tabs)/profile')}
          accessibilityRole="button"
          accessibilityLabel="Back to profile"
          hitSlop={12}
          style={({ pressed }) => ({
            width: moderateScale(40),
            height: moderateScale(40),
            borderRadius: Radius.full,
            backgroundColor: Colors.surfaceContainerHighest,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Icons.back size={20} color={Colors.primary} />
        </Pressable>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(20),
            color: Colors.onSurface,
            letterSpacing: -0.3,
          }}
          maxFontSizeMultiplier={1.3}
        >
          Send feedback
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.xxl,
          paddingBottom: insets.bottom + Spacing.xxl,
          paddingTop: Spacing.md,
          gap: moderateScale(16),
        }}
        keyboardShouldPersistTaps="handled"
      >
        <SectionHeader label="Your feedback" />
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(14),
            color: Colors.tertiary,
            lineHeight: moderateScale(20),
          }}
          maxFontSizeMultiplier={1.4}
        >
          Tell us what's working, what's not, or what you'd love to see next. We read
          every message.
        </Text>

        <TextInput
          value={message}
          onChangeText={setMessage}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Type your feedback…"
          placeholderTextColor={Colors.textFaint}
          multiline
          numberOfLines={6}
          maxLength={MAX_LEN}
          accessibilityLabel="Your feedback"
          style={{
            minHeight: moderateScale(140),
            backgroundColor: '#ffffff',
            borderWidth: moderateScale(2),
            borderColor: focused ? Colors.primaryContainer : 'rgba(27,29,14,0.10)',
            borderRadius: moderateScale(16),
            borderBottomWidth: moderateScale(4),
            borderBottomColor: focused ? 'rgba(145,0,27,0.20)' : Colors.cardLip,
            paddingHorizontal: moderateScale(18),
            paddingVertical: moderateScale(16),
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(16),
            color: Colors.onSurface,
            textAlignVertical: 'top',
          }}
        />
        <Text
          style={{
            alignSelf: 'flex-end',
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(12),
            color: Colors.textFaint,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {trimmed.length}/{MAX_LEN}
        </Text>

        <LipButton
          label="Send feedback"
          variant="primary"
          onPress={handleSubmit}
          disabled={!canSubmit}
          icon={Icons.forward}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontFamily: Fonts.dmSans.bold,
        fontSize: moderateScale(11),
        letterSpacing: 2.5,
        color: Colors.tertiary,
        textTransform: 'uppercase',
      }}
      maxFontSizeMultiplier={1.4}
    >
      {label}
    </Text>
  );
}
