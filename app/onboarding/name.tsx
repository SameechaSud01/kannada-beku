import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { LipButton } from '../../components/ui/LipButton';
import { useUserStore } from '../../stores/useUserStore';

const MAX_LEN = 30;

export default function NameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const persisted = useUserStore.getState().displayName ?? '';
  const [name, setName] = useState(persisted);
  const [focused, setFocused] = useState(false);

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
      style={{ flex: 1, backgroundColor: Colors.surfaceCream }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.xxl,
        }}
      >
        <ProgressDots total={5} current={1} />

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(11),
              letterSpacing: 2,
              color: Colors.tertiary,
              textTransform: 'uppercase',
              marginBottom: Spacing.sm,
            }}
            maxFontSizeMultiplier={1.4}
          >
            Step 1 of 4
          </Text>
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(27),
              color: Colors.onSurface,
              letterSpacing: -0.4,
              lineHeight: moderateScale(38),
              marginBottom: Spacing.sm,
            }}
            maxFontSizeMultiplier={1.3}
          >
            What should we{'\n'}call you?
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(15),
              color: Colors.tertiary,
              marginBottom: Spacing.xxxl,
            }}
            maxFontSizeMultiplier={1.4}
          >
            We'll use this throughout the app.
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={handleContinue}
            placeholder="Your name"
            placeholderTextColor={Colors.textFaint}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={MAX_LEN}
            returnKeyType="done"
            accessibilityLabel="Your name"
            style={{
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
            }}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <View style={{ flex: 1 }}>
            <LipButton label="Back" variant="secondary" onPress={() => router.back()} />
          </View>
          <View style={{ flex: 1 }}>
            <LipButton label="Continue" variant="primary" onPress={handleContinue} disabled={!valid} icon={Icons.forward} />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
