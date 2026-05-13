import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { OptionCard } from '../../components/onboarding/OptionCard';
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

const MAX_SELECTIONS = 3;

export default function MotivationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleMotivation = (motivation: string) => {
    setSelected((prev) => {
      if (prev.includes(motivation)) {
        return prev.filter((m) => m !== motivation);
      }
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, motivation];
    });
  };

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
      <ProgressDots total={4} current={2} />

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
          Step 2 of 3
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 28,
            color: '#1B1D0E',
            marginBottom: 8,
          }}
        >
          Why are you learning{'\n'}Kannada?
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: 15,
            color: '#464646',
            marginBottom: 24,
          }}
        >
          Pick up to {MAX_SELECTIONS} ({selected.length}/{MAX_SELECTIONS} selected)
        </Text>

        <View style={{ gap: 10 }}>
          {MOTIVATIONS.map((motivation) => (
            <OptionCard
              key={motivation}
              label={motivation}
              selected={selected.includes(motivation)}
              onPress={() => toggleMotivation(motivation)}
            />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
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
            if (selected.length > 0) {
              useUserStore.setState({ motivations: selected });
              router.push('/onboarding/commitment');
            }
          }}
          style={({ pressed }) => ({
            flex: 2,
            backgroundColor: selected.length > 0 ? (pressed ? '#8D0020' : Colors.primaryContainer) : '#C8C4B0',
            borderRadius: 16,
            paddingVertical: 18,
            alignItems: 'center',
            transform: [{ scale: pressed && selected.length > 0 ? 0.97 : 1 }],
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
