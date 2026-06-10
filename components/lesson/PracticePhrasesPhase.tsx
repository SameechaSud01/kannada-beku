import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { BACK_CHIP_TOP_RESERVE } from '../ui/ExitBackButton';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { LessonProgressBar } from './LessonProgressBar';
import { SpeedControl } from './SpeedControl';
import { AnswerOption } from './AnswerOption';
import { LipButton } from '../ui/LipButton';
import { useUserStore } from '../../stores/useUserStore';
import type { Phrase } from '../../constants/lessons/types';

interface PracticePhrasesPhaseProps {
  phrases: Phrase[];
  practicePhrasesIndex: number;
  step: 'listen' | 'say';
  /** Sub-part name; shown on the progress label when the lesson is split. */
  sectionLabel?: string;
  /** Pool to draw wrong answers from (full lesson phrases); defaults to `phrases`. */
  distractorPool?: Phrase[];
  onAdvance: () => void;
}

const CORRECT_DELAY_MS = 800;
const WRONG_DELAY_MS = 1000;

function pickDistractors(pool: Phrase[], current: Phrase): Phrase[] {
  const candidates = pool.filter((ph) => ph !== current);
  if (candidates.length === 0) return [];
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  const picks: Phrase[] = [];
  for (let i = 0; i < 2; i++) {
    picks.push(shuffled[i % shuffled.length]);
  }
  return picks;
}

export function PracticePhrasesPhase({
  phrases,
  practicePhrasesIndex,
  step,
  sectionLabel,
  distractorPool,
  onAdvance,
}: PracticePhrasesPhaseProps) {
  const insets = useSafeAreaInsets();
  const phrase = phrases[practicePhrasesIndex];
  const total = phrases.length;
  const autoReplay = useUserStore((s) => s.autoReplay);
  const [picked, setPicked] = useState<number | null>(null);

  const options = useMemo<Phrase[]>(() => {
    if (!phrase) return [];
    const distractors = pickDistractors(distractorPool ?? phrases, phrase);
    return [phrase, ...distractors].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practicePhrasesIndex, step]);

  const correctIndex = options.findIndex((o) => o === phrase);

  useEffect(() => {
    setPicked(null);
  }, [practicePhrasesIndex, step]);

  useEffect(() => {
    if (!phrase || !autoReplay) return;
    deviceTtsAudioService.play(phrase.kannada).catch((err) => {
      console.warn('[practice_phrases] auto-play failed', err);
    });
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, [phrase?.kannada, step, autoReplay]);

  if (!phrase) return null;

  const handleReplay = () => {
    deviceTtsAudioService.play(phrase.kannada).catch((err) => {
      console.warn('[practice_phrases] replay failed', err);
    });
  };

  const handlePickOption = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    const isCorrect = idx === correctIndex;
    setTimeout(() => {
      onAdvance();
    }, isCorrect ? CORRECT_DELAY_MS : WRONG_DELAY_MS);
  };

  const handleISaidIt = () => {
    onAdvance();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={{ paddingTop: insets.top + BACK_CHIP_TOP_RESERVE, paddingHorizontal: Spacing.lg }}>
        <LessonProgressBar
          current={practicePhrasesIndex + 1}
          total={total}
          label={`${sectionLabel ? `${sectionLabel} · ` : ''}Phrase ${practicePhrasesIndex + 1} of ${total} — ${step === 'listen' ? 'Listen' : 'Say it'}`}
        />
      </View>

      {step === 'listen' ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.xxl,
            paddingBottom: Spacing.lg,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: Spacing.xxl, gap: Spacing.md }}>
            <Pressable
              onPress={handleReplay}
              accessibilityRole="button"
              accessibilityLabel="Replay audio"
              hitSlop={8}
              style={({ pressed }) => ({
                width: moderateScale(72),
                height: moderateScale(72),
                borderRadius: Radius.full,
                backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: pressed ? 0.94 : 1 }],
              })}
            >
              <Icons.audio size={moderateScale(30)} color={Colors.onPrimary} />
            </Pressable>
            <SpeedControl onRateChange={handleReplay} />
          </View>

          <Text
            style={{
              fontFamily: Fonts.baloo.bold,
              fontSize: moderateScale(20),
              color: Colors.onSurface,
              textAlign: 'center',
              marginBottom: Spacing.xl,
            }}
            maxFontSizeMultiplier={1.2}
          >
            What does this mean?
          </Text>

          <View style={{ gap: Spacing.md }}>
            {options.map((opt, idx) => (
              <AnswerOption
                key={`${opt.english}-${idx}`}
                label={opt.english}
                index={idx}
                picked={picked}
                correctIndex={correctIndex}
                onPick={handlePickOption}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.xxl,
            paddingBottom: Spacing.lg,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.baloo.bold,
              fontSize: moderateScale(18),
              color: Colors.onSurface,
              textAlign: 'center',
              marginBottom: Spacing.lg,
            }}
            maxFontSizeMultiplier={1.2}
          >
            How do you say this?
          </Text>

          <View
            style={{
              backgroundColor: Colors.secondaryFixed,
              borderRadius: Radius.xl,
              paddingVertical: Spacing.lg,
              paddingHorizontal: Spacing.lg,
              marginBottom: Spacing.xl,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(16),
                color: Colors.onSecondaryContainer,
                textAlign: 'center',
              }}
            >
              {phrase.english}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: Colors.surfaceContainerLow,
              borderRadius: Radius.xl,
              paddingVertical: Spacing.xxl,
              paddingHorizontal: Spacing.lg,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(26),
                lineHeight: moderateScale(36),
                color: Colors.onSurface,
                textAlign: 'center',
              }}
              maxFontSizeMultiplier={1.2}
              adjustsFontSizeToFit
              numberOfLines={3}
            >
              {phrase.transliteration}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.notoSansKannada.regular,
                fontSize: moderateScale(12),
                color: Colors.tertiary,
                textAlign: 'center',
                marginTop: Spacing.md,
                opacity: 0.7,
              }}
            >
              {phrase.kannada}
            </Text>
          </View>

          <View style={{ alignItems: 'center', marginTop: Spacing.xxl, gap: Spacing.md }}>
            <Pressable
              onPress={handleReplay}
              accessibilityRole="button"
              accessibilityLabel="Replay audio"
              hitSlop={8}
              style={({ pressed }) => ({
                width: moderateScale(56),
                height: moderateScale(56),
                borderRadius: Radius.full,
                backgroundColor: pressed ? Colors.surfaceContainerHigh : Colors.surfaceContainerHighest,
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <Icons.audio size={moderateScale(24)} color={Colors.primary} />
            </Pressable>
            <SpeedControl onRateChange={handleReplay} />
          </View>
        </ScrollView>
      )}

      {step === 'say' && (
        <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
          <LipButton label="I said it" onPress={handleISaidIt} icon={Icons.forward} />
        </View>
      )}
    </View>
  );
}
