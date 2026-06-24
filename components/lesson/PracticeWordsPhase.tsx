import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
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
      <View style={{ paddingTop: insets.top + BACK_CHIP_TOP_RESERVE, paddingHorizontal: Spacing.lg }}>
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
            <AudioOrb onPress={handleReplay} playing={playing} size={72} accessibilityLabel="Replay audio" />
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
                index={idx}
                picked={picked}
                correctIndex={correctIndex}
                onPick={handlePickOption}
              />
            ))}
          </View>

          {picked !== null ? (
            <View
              style={{
                backgroundColor: Colors.surfaceCreamLow,
                borderRadius: Radius.chunky,
                borderBottomWidth: 4,
                borderBottomColor: Colors.cardLip,
                paddingVertical: Spacing.xl,
                paddingHorizontal: Spacing.lg,
                alignItems: 'center',
                marginTop: Spacing.xl,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(24),
                  color: Colors.onSurface,
                  textAlign: 'center',
                }}
                maxFontSizeMultiplier={1.2}
              >
                {word.transliteration}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.notoSansKannada.regular,
                  fontSize: moderateScale(14),
                  color: Colors.textFaint,
                  textAlign: 'center',
                  marginTop: Spacing.sm,
                }}
              >
                {word.kannada}
              </Text>
            </View>
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
                fontSize: moderateScale(38),
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
            >
              {word.kannada}
            </Text>
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
          >
            Say it out loud
          </Text>
        </ScrollView>
      )}

      {step === 'listen' && picked !== null && (
        <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
          <LipButton label="Next" onPress={onAdvance} icon={Icons.forward} />
        </View>
      )}

      {step === 'say' && (
        <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
          <LipButton label="I said it" onPress={handleISaidIt} icon={Icons.forward} />
        </View>
      )}
    </View>
  );
}
