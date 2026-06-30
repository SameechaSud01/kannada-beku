import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { splitGloss } from '../../utils/gloss';
import { fitFontSize } from '../../utils/fontScale';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { BACK_CHIP_TOP_RESERVE } from '../ui/ExitBackButton';
import { useIsMounted } from '../../hooks/useIsMounted';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { LessonProgressBar } from './LessonProgressBar';
import { SpeedControl } from './SpeedControl';
import { AnswerOption } from './AnswerOption';
import { LipButton } from '../ui/LipButton';
import { AudioOrb } from '../ui/AudioOrb';
import { useUserStore } from '../../stores/useUserStore';
import { useProgressStore } from '../../stores/progressStore';
import type { Word } from '../../constants/lessons/types';

type SayRating = 'hard' | 'ok' | 'easy';

interface PracticeWordsPhaseProps {
  words: Word[];
  practiceWordIndex: number;
  step: 'listen' | 'say';
  /** Sub-part name; shown on the progress label when the lesson is split. */
  sectionLabel?: string;
  /** Pool to draw wrong answers from (full lesson vocab); defaults to `words`. */
  distractorPool?: Word[];
  onAdvance: () => void;
}

function pickDistractors(pool: Word[], current: Word): Word[] {
  const candidates = pool.filter((w) => w !== current);
  // Take up to 2 distinct distractors. The modulo approach used to repeat the
  // same word when only one candidate existed, rendering it twice (audit Phase 4).
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

export function PracticeWordsPhase({
  words,
  practiceWordIndex,
  step,
  sectionLabel,
  distractorPool,
  onAdvance,
}: PracticeWordsPhaseProps) {
  const insets = useSafeAreaInsets();
  const word = words[practiceWordIndex];
  const total = words.length;
  const autoReplay = useUserStore((s) => s.autoReplay);

  const [picked, setPicked] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  // Calm "say it" self-check: how the rep felt (no scoring, just self-awareness).
  const [rating, setRating] = useState<SayRating | null>(null);
  const mounted = useIsMounted();
  const options = useMemo<Word[]>(() => {
    if (!word) return [];
    const distractors = pickDistractors(distractorPool ?? words, word);
    const all = [word, ...distractors];
    return all.sort(() => Math.random() - 0.5);
    // re-shuffle on each new word + step entry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceWordIndex, step]);

  const correctIndex = options.findIndex((o) => o === word);

  useEffect(() => {
    setPicked(null);
    setRating(null);
  }, [practiceWordIndex, step]);

  useEffect(() => {
    if (!word || !autoReplay) return;
    deviceTtsAudioService.play(word.kannada).catch((err) => {
      console.warn('[practice_words] auto-play failed', err);
    });
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, [word?.kannada, step, autoReplay]);

  if (!word) return null;

  const handleReplay = () => {
    setPlaying(true);
    deviceTtsAudioService
      .play(word.kannada)
      .catch((err) => {
        console.warn('[practice_words] replay failed', err);
      })
      .finally(() => {
        if (mounted.current) setPlaying(false);
      });
  };

  const handlePickOption = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
  };

  const handleISaidIt = () => {
    // Daily-goal "Speak": one rep counted when the learner confirms they spoke it.
    useProgressStore.getState().recordSpeak();
    onAdvance();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <View
        style={{ paddingTop: insets.top + BACK_CHIP_TOP_RESERVE, paddingHorizontal: Spacing.lg }}
      >
        <LessonProgressBar
          current={practiceWordIndex + 1}
          total={total}
          label={`${sectionLabel ? `${sectionLabel} · ` : ''}Word ${practiceWordIndex + 1} of ${total} — ${step === 'listen' ? 'Listen' : 'Say it'}`}
        />
      </View>

      {step === 'listen' ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.xxl,
            paddingBottom: Spacing.lg,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: Spacing.xxl, gap: Spacing.md }}>
            <AudioOrb
              onPress={handleReplay}
              playing={playing}
              size={72}
              accessibilityLabel="Replay audio"
            />
            <SpeedControl onRateChange={handleReplay} />
          </View>

          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
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
                transliteration={opt.transliteration}
                index={idx}
                picked={picked}
                correctIndex={correctIndex}
                onPick={handlePickOption}
              />
            ))}
          </View>

          {picked !== null ? (
            <WhyBanner word={word} picked={options[picked]} correct={picked === correctIndex} />
          ) : null}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.xxl,
            paddingBottom: Spacing.lg,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: Colors.surfaceCreamLow,
              borderRadius: Radius.chunky,
              borderBottomWidth: 4,
              borderBottomColor: Colors.cardLip,
              paddingVertical: Spacing.xxxl,
              paddingHorizontal: Spacing.lg,
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(
                  fitFontSize(word.transliteration, { max: 38, min: 24, comfortable: 10 }),
                ),
                lineHeight: moderateScale(50),
                color: Colors.onSurface,
                textAlign: 'center',
              }}
              maxFontSizeMultiplier={1.2}
              adjustsFontSizeToFit
              numberOfLines={2}
            >
              {word.transliteration}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(16),
                color: Colors.tertiary,
                textAlign: 'center',
                marginTop: Spacing.md,
              }}
              maxFontSizeMultiplier={1.3}
            >
              {word.english}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.notoSansKannada.regular,
                fontSize: moderateScale(14),
                color: Colors.textFaint,
                textAlign: 'center',
                marginTop: Spacing.lg,
              }}
              maxFontSizeMultiplier={1.3}
            >
              {word.kannada}
            </Text>

            {word.syllables && word.syllables.length > 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: Spacing.sm,
                  marginTop: Spacing.lg,
                }}
              >
                {word.syllables.map((syll, i) => (
                  <View
                    key={`${syll}-${i}`}
                    style={{
                      backgroundColor: Colors.secondaryFixed,
                      borderRadius: Radius.tile,
                      borderBottomWidth: 2,
                      borderBottomColor: Colors.goldLip,
                      paddingVertical: moderateScale(6),
                      paddingHorizontal: Spacing.md,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.dmSans.bold,
                        fontSize: moderateScale(17),
                        color: Colors.onSecondaryContainer,
                      }}
                      maxFontSizeMultiplier={1.3}
                    >
                      {syll}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={{ alignItems: 'center', marginTop: Spacing.xxl, gap: Spacing.md }}>
            <AudioOrb
              onPress={handleReplay}
              playing={playing}
              size={56}
              color={Colors.secondaryFixed}
              iconColor={Colors.secondary}
              lipColor={Colors.goldLip}
              accessibilityLabel="Replay audio"
            />
            <SpeedControl onRateChange={handleReplay} />
          </View>

          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(15),
              color: Colors.onSurface,
              marginTop: Spacing.xl,
              textAlign: 'center',
            }}
            maxFontSizeMultiplier={1.3}
          >
            Listen, then say it out loud
          </Text>

          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
              marginTop: Spacing.xl,
              textAlign: 'center',
            }}
            maxFontSizeMultiplier={1.3}
          >
            Said it? How did it feel?
          </Text>
          <SelfRate value={rating} onPick={setRating} />
        </ScrollView>
      )}

      {step === 'listen' && picked !== null && (
        <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
          <LipButton label="Next" onPress={onAdvance} icon={Icons.forward} />
        </View>
      )}

      {step === 'say' && rating !== null && (
        <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
          <LipButton label="Next" onPress={handleISaidIt} icon={Icons.forward} />
        </View>
      )}
    </View>
  );
}

const SAY_RATINGS: { key: SayRating; label: string; icon: (typeof Icons)['ratingOk'] }[] = [
  { key: 'hard', label: 'Tricky', icon: Icons.ratingHard },
  { key: 'ok', label: 'Got it', icon: Icons.ratingOk },
  { key: 'easy', label: 'Easy', icon: Icons.ratingEasy },
];

/**
 * Calm "say it" self-check. No mic, no scoring — the learner just notes how the
 * rep felt, which keeps the speaking step honest and gives a sense of progress.
 */
function SelfRate({ value, onPick }: { value: SayRating | null; onPick: (r: SayRating) => void }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginTop: Spacing.md,
      }}
    >
      {SAY_RATINGS.map(({ key, label, icon: Icon }) => {
        const active = value === key;
        return (
          <Pressable
            key={key}
            onPress={() => onPick(key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.xs,
              backgroundColor: active ? Colors.secondaryFixed : '#ffffff',
              borderRadius: Radius.full,
              borderWidth: active ? 0 : 1,
              borderColor: Colors.hairline,
              borderBottomWidth: 2,
              borderBottomColor: active ? Colors.goldLip : Colors.cardLip,
              paddingVertical: moderateScale(8),
              paddingHorizontal: Spacing.md,
              transform: [{ translateY: pressed ? 1 : 0 }],
            })}
          >
            <Icon
              size={moderateScale(17)}
              color={active ? Colors.onSecondaryContainer : Colors.tertiary}
              strokeWidth={2}
            />
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(13),
                color: active ? Colors.onSecondaryContainer : Colors.tertiary,
              }}
              maxFontSizeMultiplier={1.3}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Calm-flow answer feedback: instead of just revealing the right word, it
 * explains *why* — naming what the learner chose vs. what they actually heard,
 * so a wrong pick becomes a comparison rather than a dead end.
 */
function WhyBanner({ word, picked, correct }: { word: Word; picked: Word; correct: boolean }) {
  const heardEn = splitGloss(word.english).text;
  const pickedEn = splitGloss(picked.english).text;
  const bold = { fontFamily: Fonts.dmSans.bold, color: Colors.onSurface };

  return (
    <Animated.View
      entering={FadeInDown.duration(280)}
      style={{
        backgroundColor: correct ? Colors.successContainerLow : '#ffffff',
        borderRadius: Radius.chunky,
        borderWidth: correct ? 0 : 1,
        borderColor: Colors.hairline,
        borderBottomWidth: 4,
        borderBottomColor: correct ? Colors.successLip : Colors.cardLip,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.xl,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(14),
          lineHeight: moderateScale(21),
          color: correct ? Colors.onSuccessContainer : Colors.tertiary,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {correct ? (
          <>
            <Text style={bold}>{word.transliteration}</Text> ({word.kannada}) means{' '}
            <Text style={bold}>{heardEn}</Text>.
          </>
        ) : (
          <>
            “{pickedEn}” is <Text style={bold}>{picked.transliteration}</Text>. The word you heard,{' '}
            <Text style={bold}>{word.transliteration}</Text> ({word.kannada}), means{' '}
            <Text style={bold}>{heardEn}</Text>.
          </>
        )}
      </Text>
    </Animated.View>
  );
}
