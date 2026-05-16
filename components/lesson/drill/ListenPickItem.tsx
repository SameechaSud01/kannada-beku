import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, ScrollView } from 'react-native';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { deviceTtsAudioService } from '../../../services/audio/deviceTtsAudioService';
import { DrillFeedback, type DrillResult } from './DrillFeedback';
import type { Phrase } from '../../../constants/lessons/types';

const AUTO_ADVANCE_MS = 1000;

interface ListenPickItemProps {
  target: Phrase;
  distractors: Phrase[];
  onResolve: (correct: boolean) => void;
}

function speakable(phrase: Phrase): string {
  return phrase.kannada.replace(/\[name\]/g, '').trim();
}

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function ListenPickItem({ target, distractors, onResolve }: ListenPickItemProps) {
  const options = useMemo(() => shuffle([target, ...distractors]), [target.id]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [result, setResult] = useState<DrillResult>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Auto-play on mount.
  useEffect(() => {
    deviceTtsAudioService.play(speakable(target)).catch((err) => {
      console.warn('[audio] listen_pick auto-play failed', err);
    });
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, [target.id]);

  // Auto-advance on correct.
  useEffect(() => {
    if (result !== 'correct') return;
    const timer = setTimeout(() => onResolve(true), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [result, onResolve]);

  const handleSelect = (id: string) => {
    if (result) return; // answer already locked
    setSelectedId(id);
    if (id === target.id) {
      setResult('correct');
    } else {
      setResult('incorrect');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleReplay = () => {
    deviceTtsAudioService.play(speakable(target)).catch((err) => {
      console.warn('[audio] listen_pick replay failed', err);
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.xl,
        }}
      >
        <Pressable
          onPress={handleReplay}
          accessibilityRole="button"
          accessibilityLabel="Play the phrase"
          style={({ pressed }) => ({
            alignSelf: 'center',
            backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
            borderRadius: Radius.full,
            width: 84,
            height: 84,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.lg,
            shadowColor: Colors.primaryContainer,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 4,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text style={{ fontSize: 32 }}>🔊</Text>
        </Pressable>

        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: 14,
            color: Colors.tertiary,
            textAlign: 'center',
            marginBottom: Spacing.xl,
            letterSpacing: 0.3,
          }}
        >
          Which one did you hear?
        </Text>

        <View style={{ gap: Spacing.md }}>
          {options.map((opt) => {
            const isSelected = selectedId === opt.id;
            const isCorrect = opt.id === target.id;
            const showRight = result !== null && isCorrect;
            const showWrong = result === 'incorrect' && isSelected && !isCorrect;
            const locked = result !== null;
            const wiggle =
              showWrong
                ? { transform: [{ translateX: shakeAnim }] }
                : null;

            return (
              <Animated.View key={opt.id} style={wiggle}>
                <Pressable
                  onPress={() => handleSelect(opt.id)}
                  disabled={locked}
                  accessibilityRole="button"
                  accessibilityLabel={opt.transliteration}
                  accessibilityState={{ selected: isSelected, disabled: locked }}
                  style={({ pressed }) => ({
                    backgroundColor: showRight
                      ? Colors.secondaryFixed
                      : showWrong
                        ? Colors.surfaceContainerHigh
                        : pressed
                          ? Colors.surfaceContainerHigh
                          : Colors.surfaceContainerHighest,
                    borderWidth: showRight || showWrong ? 2 : 1,
                    borderColor: showRight || showWrong ? Colors.primaryContainer : Colors.outlineVariant,
                    borderRadius: Radius.lg,
                    paddingVertical: Spacing.md + 2,
                    paddingHorizontal: Spacing.lg,
                    minHeight: 56,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.lora.italic,
                      fontSize: 17,
                      color: showWrong ? Colors.tertiary : Colors.onSurface,
                      flexShrink: 1,
                    }}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                  >
                    {opt.transliteration}
                  </Text>
                  {showRight && (
                    <Text style={{ fontSize: 18, color: Colors.primaryContainer, fontFamily: Fonts.dmSans.bold }}>
                      ✓
                    </Text>
                  )}
                  {showWrong && (
                    <Text style={{ fontSize: 18, color: Colors.primaryContainer, fontFamily: Fonts.dmSans.bold }}>
                      ✕
                    </Text>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {result === 'correct' && (
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: 13,
              color: Colors.primaryContainer,
              textAlign: 'center',
              marginTop: Spacing.lg,
            }}
          >
            ✓ Correct
          </Text>
        )}
      </ScrollView>

      <DrillFeedback
        result={result}
        correctPhrase={target}
        onContinue={() => onResolve(false)}
      />
    </View>
  );
}
