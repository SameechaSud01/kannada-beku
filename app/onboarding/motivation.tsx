import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { OptionCard } from '../../components/onboarding/OptionCard';
import { ChunkyPressable } from '../../components/ui/ChunkyPressable';
import { LipButton } from '../../components/ui/LipButton';
import { useUserStore } from '../../stores/useUserStore';

const MOTIVATIONS = [
  "Don't want to feel like an outsider",
  'Connect better with Kannadiga friends',
  'Navigate daily life in Bengaluru',
  'Stop getting overcharged (auto, markets)',
  'Impress someone special',
  'Understand Kannada slang and humour',
  'Read signboards and menus',
  'Career / professional reasons',
];

const OTHER_LABEL = 'Other';
const MAX_SELECTIONS = 3;
const OTHER_MAX_LEN = 60;

export default function MotivationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Seed from store so selections survive back-nav. A stored value not in the
  // preset list is the user's previous "Other" free text — restore it as such.
  const [selected, setSelected] = useState<string[]>(() => {
    const stored = useUserStore.getState().motivations;
    return stored.filter((m) => MOTIVATIONS.includes(m));
  });
  const initialOther = (() => {
    const stored = useUserStore.getState().motivations;
    return stored.find((m) => !MOTIVATIONS.includes(m)) ?? '';
  })();
  const [otherChecked, setOtherChecked] = useState(initialOther.length > 0);
  const [otherText, setOtherText] = useState(initialOther);

  const otherTrimmed = otherText.trim();
  const filledCount = selected.length + (otherChecked && otherTrimmed.length > 0 ? 1 : 0);

  const toggleMotivation = (motivation: string) => {
    setSelected((prev) => {
      if (prev.includes(motivation)) {
        return prev.filter((m) => m !== motivation);
      }
      if (prev.length >= MAX_SELECTIONS) {
        return prev;
      }
      return [...prev, motivation];
    });
  };

  const toggleOther = () => {
    setOtherChecked((prev) => !prev);
  };

  const canContinue = filledCount > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    const finalList = [...selected];
    if (otherChecked && otherTrimmed.length > 0) {
      finalList.push(otherTrimmed);
    }
    useUserStore.getState().setMotivations(finalList);
    router.push('/onboarding/commitment');
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
        <ProgressDots total={5} current={2} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: Spacing.xl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
            Step 2 of 4
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
            Why are you learning{'\n'}Kannada?
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(15),
              color: Colors.tertiary,
              marginBottom: Spacing.xxl,
            }}
            maxFontSizeMultiplier={1.4}
          >
            Pick up to {MAX_SELECTIONS} ({filledCount}/{MAX_SELECTIONS} selected)
          </Text>

          <View style={{ gap: moderateScale(10) }}>
            {MOTIVATIONS.map((motivation) => (
              <OptionCard
                key={motivation}
                label={motivation}
                selected={selected.includes(motivation)}
                onPress={() => toggleMotivation(motivation)}
              />
            ))}
            <OtherOptionCard
              checked={otherChecked}
              text={otherText}
              onToggle={toggleOther}
              onChangeText={setOtherText}
            />
          </View>
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl }}>
          <View style={{ flex: 1 }}>
            <LipButton label="Back" variant="secondary" onPress={() => router.back()} />
          </View>
          <View style={{ flex: 1 }}>
            <LipButton label="Continue" variant="primary" disabled={!canContinue} icon={Icons.forward} onPress={handleContinue} />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

interface OtherOptionCardProps {
  checked: boolean;
  text: string;
  onToggle: () => void;
  onChangeText: (value: string) => void;
}

function OtherOptionCard({ checked, text, onToggle, onChangeText }: OtherOptionCardProps) {
  return (
    <ChunkyPressable
      onPress={onToggle}
      accessibilityLabel={OTHER_LABEL}
      bg={checked ? '#fff5f5' : '#ffffff'}
      lip={checked ? 4 : 3}
      lipColor={checked ? 'rgba(145,0,27,0.25)' : Colors.cardLip}
      border
      borderWidth={2}
      borderColor={checked ? Colors.primaryContainer : 'rgba(27,29,14,0.10)'}
      radius={Radius.chunky}
      style={{ padding: moderateScale(18) }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          style={{
            flex: 1,
            fontFamily: Fonts.baloo.bold,
            fontSize: moderateScale(16),
            color: Colors.onSurface,
            marginRight: Spacing.md,
          }}
          maxFontSizeMultiplier={1.4}
        >
          {OTHER_LABEL}
        </Text>
        {checked && (
          <View
            style={{
              width: moderateScale(26),
              height: moderateScale(26),
              borderRadius: Radius.full,
              backgroundColor: Colors.primaryContainer,
              borderBottomWidth: 2,
              borderBottomColor: Colors.redLip,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.check size={moderateScale(15)} color={Colors.onPrimary} strokeWidth={2.8} />
          </View>
        )}
      </View>
      {checked && (
        <TextInput
          value={text}
          onChangeText={onChangeText}
          placeholder="Tell us your reason…"
          placeholderTextColor={Colors.textFaint}
          autoCapitalize="sentences"
          autoCorrect
          maxLength={OTHER_MAX_LEN}
          accessibilityLabel="Your own reason"
          style={{
            marginTop: Spacing.md,
            backgroundColor: '#ffffff',
            borderWidth: moderateScale(1),
            borderColor: 'rgba(27,29,14,0.10)',
            borderRadius: moderateScale(10),
            paddingHorizontal: moderateScale(12),
            paddingVertical: moderateScale(10),
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(15),
            color: Colors.onSurface,
          }}
        />
      )}
    </ChunkyPressable>
  );
}
