import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { OptionCard } from '../../components/onboarding/OptionCard';
import { useUserStore } from '../../stores/useUserStore';

const COMMITMENTS = [
  { value: 5 as const, label: '5 min / day', subtitle: 'Quick daily habit' },
  { value: 10 as const, label: '10 min / day', subtitle: 'Steady progress' },
  { value: 20 as const, label: '20 min / day', subtitle: 'Serious learner' },
];

export default function CommitmentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<5 | 10 | 20 | null>(null);

  const handleFinish = () => {
    if (!selected) return;

    // Collect data from this screen + previous screens via navigation params
    // Since Expo Router doesn't pass params between stack screens easily,
    // we read the goal screen's selection from the store (not yet saved)
    // and the motivation screen's selection similarly.
    // For a cleaner approach, we accumulate state and save on final screen.

    // We need to collect all onboarding data. Since each screen manages local state,
    // we'll use a simple approach: read from previous screens via route params
    // isn't possible in Expo Router stacks, so we store intermediate state in the store.
    // Let's use a pragmatic approach — collect from the global onboarding state accumulator.

    // For now, save with defaults — the goal and motivation screens should have
    // passed their data forward. We'll use the approach of reading from the store
    // which gets set in each screen's "continue" handler.

    const store = useUserStore.getState();
    useUserStore.getState().setOnboarding({
      learningMode: store.learningMode ?? 'both',
      motivations: store.motivations.length > 0 ? store.motivations : [],
      dailyGoalMinutes: selected,
    });

    router.replace('/(tabs)');
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FBFBE2',
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.xxl,
      }}
    >
      <ProgressDots total={4} current={3} />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(11),
            letterSpacing: 2,
            color: '#464646',
            textTransform: 'uppercase',
            marginBottom: Spacing.sm,
          }}
        >
          Step 3 of 3
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(28),
            color: '#1B1D0E',
            marginBottom: Spacing.sm,
          }}
        >
          How much time can{'\n'}you commit?
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(15),
            color: '#464646',
            marginBottom: Spacing.xxxl,
          }}
        >
          Set your daily learning goal
        </Text>

        <View style={{ gap: Spacing.md }}>
          {COMMITMENTS.map((item) => (
            <OptionCard
              key={item.value}
              label={item.label}
              subtitle={item.subtitle}
              selected={selected === item.value}
              onPress={() => setSelected(item.value)}
            />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: '#E4E4CC',
            borderRadius: moderateScale(16),
            paddingVertical: moderateScale(18),
            alignItems: 'center',
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(16), color: '#1B1D0E' }}>
            Back
          </Text>
        </Pressable>
        <Pressable
          onPress={handleFinish}
          style={({ pressed }) => ({
            flex: 2,
            backgroundColor: selected ? (pressed ? '#8D0020' : Colors.primaryContainer) : '#C8C4B0',
            borderRadius: moderateScale(16),
            paddingVertical: moderateScale(18),
            alignItems: 'center',
            transform: [{ scale: pressed && selected ? 0.97 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(16), color: '#FFFFFF' }}>
            Let's Go!
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
