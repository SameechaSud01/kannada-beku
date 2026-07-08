import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { IntakeStepShell } from '../../components/onboarding/IntakeStepShell';
import { useUserStore } from '../../stores/useUserStore';

const MAX_LEN = 30;

/**
 * Intake step 1 · Name (spec_onboarding_audit_fixes.md): top-anchored so the
 * layout doesn't jump when the keyboard opens, autofocused input, and a
 * neutral input at rest — hairline border + card lip; red is reserved for the
 * caret and the focus ring (the old red border read as an error state).
 */
export default function NameScreen() {
  const router = useRouter();
  const persisted = useUserStore.getState().displayName ?? '';
  const [name, setName] = useState(persisted);

  const trimmed = name.trim();
  const valid = trimmed.length >= 1 && trimmed.length <= MAX_LEN;

  const handleContinue = () => {
    if (!valid) return;
    useUserStore.getState().setDisplayName(trimmed);
    // We only teach spoken Kannada now, so the learning-focus choice is gone —
    // default everyone to 'spoken'.
    useUserStore.getState().setLearningMode('spoken');
    Keyboard.dismiss();
    router.push('/onboarding/motivation');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <IntakeStepShell
        step={1}
        title="What should we call you?"
        subtitle="So lessons can greet you properly — Namaskāra!"
        onBack={() => router.back()}
        onContinue={handleContinue}
        continueDisabled={!valid}
      >
        <View style={{ paddingTop: moderateScale(26) }}>
          <TextInput
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleContinue}
            autoFocus
            placeholder="Your name"
            placeholderTextColor={Colors.textFaint}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={MAX_LEN}
            returnKeyType="done"
            accessibilityLabel="Your name"
            selectionColor={Colors.primaryContainer}
            cursorColor={Colors.primaryContainer}
            style={{
              backgroundColor: '#ffffff',
              // Neutral even while focused — a red border reads as an error
              // state (audit finding 3); red is the caret's job.
              borderWidth: 1,
              borderColor: Colors.hairlineStrong,
              borderRadius: moderateScale(16),
              borderBottomWidth: moderateScale(4),
              borderBottomColor: Colors.cardLip,
              paddingHorizontal: moderateScale(18),
              paddingVertical: moderateScale(17),
              fontFamily: Fonts.baloo.bold,
              fontSize: moderateScale(19),
              color: Colors.onSurface,
            }}
          />
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(13.5),
              color: Colors.inkFaint,
              marginTop: Spacing.md,
            }}
            maxFontSizeMultiplier={1.4}
          >
            Just a first name is perfect.
          </Text>
        </View>
      </IntakeStepShell>
    </KeyboardAvoidingView>
  );
}
