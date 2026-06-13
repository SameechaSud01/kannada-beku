import { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { OptionCard } from '../../components/onboarding/OptionCard';
import { LipButton } from '../../components/ui/LipButton';
import { useUserStore } from '../../stores/useUserStore';

const GOALS = [
  { value: 'spoken' as const, label: 'Spoken only', subtitle: 'I want to speak and understand Kannada' },
  { value: 'written' as const, label: 'Written only', subtitle: 'I want to read and write Kannada script' },
  { value: 'both' as const, label: 'Both', subtitle: 'I want the full experience' },
];

export default function GoalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<'spoken' | 'written' | 'both' | null>(
    useUserStore.getState().learningMode
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surfaceCream,
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.xxl,
      }}
    >
      <ProgressDots total={6} current={2} />

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
          Step 2 of 5
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
          What do you want to learn?
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
          Choose your learning focus
        </Text>

        <View style={{ gap: Spacing.md }}>
          {GOALS.map((goal) => (
            <OptionCard
              key={goal.value}
              label={goal.label}
              subtitle={goal.subtitle}
              selected={selected === goal.value}
              onPress={() => setSelected(goal.value)}
            />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        <View style={{ flex: 1 }}>
          <LipButton label="Back" variant="secondary" onPress={() => router.back()} />
        </View>
        <View style={{ flex: 1 }}>
          <LipButton
            label="Continue"
            variant="primary"
            disabled={!selected}
            icon={Icons.forward}
            onPress={() => {
              if (selected) {
                useUserStore.getState().setLearningMode(selected);
                router.push('/onboarding/motivation');
              }
            }}
          />
        </View>
      </View>
    </View>
  );
}
