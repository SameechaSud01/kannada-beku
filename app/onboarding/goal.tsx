import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { OptionCard } from '../../components/onboarding/OptionCard';
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
        backgroundColor: '#FBFBE2',
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 24,
      }}
    >
      <ProgressDots total={4} current={1} />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 11,
            letterSpacing: 2,
            color: '#464646',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Step 1 of 3
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 28,
            color: '#1B1D0E',
            marginBottom: 8,
          }}
        >
          What do you want{'\n'}to learn?
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: 15,
            color: '#464646',
            marginBottom: 32,
          }}
        >
          Choose your learning focus
        </Text>

        <View style={{ gap: 12 }}>
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

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: '#E4E4CC',
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: 'center',
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 16, color: '#1B1D0E' }}>
            Back
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            if (selected) {
              useUserStore.getState().setLearningMode(selected);
              router.push('/onboarding/motivation');
            }
          }}
          style={({ pressed }) => ({
            flex: 2,
            backgroundColor: selected ? (pressed ? '#8D0020' : Colors.primary) : '#C8C4B0',
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: 'center',
            transform: [{ scale: pressed && selected ? 0.97 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 16, color: '#FFFFFF' }}>
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
