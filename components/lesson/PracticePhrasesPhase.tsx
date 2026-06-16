import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
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
import { AudioOrb } from '../ui/AudioOrb';
import { useUserStore } from '../../stores/useUserStore';
import { useProgressStore } from '../../stores/progressStore';
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
  const [playing, setPlaying] = useState(false);

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
    setPlaying(true);
    deviceTtsAudioService
      .play(phrase.kannada)
      .catch((err) => {
        console.warn('[practice_phrases] replay failed', err);
      })
      .finally(() => setPlaying(false));
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
          current={practicePhrasesIndex + 1}
          total={total}
          label={`${sectionLabel ? `${sectionLabel} · ` : ''}Phrase ${practicePhrasesIndex + 1} of ${total} — ${step === 'listen' ? 'Listen' : 'Say it'}`}
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
                  fontSize: moderateScale(20),
                  lineHeight: moderateScale(28),
                  color: Colors.onSurface,
                  textAlign: 'center',
                }}
                maxFontSizeMultiplier={1.2}
              >
                {phrase.transliteration}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.notoSansKannada.regular,
                  fontSize: moderateScale(13),
                  color: Colors.textFaint,
                  textAlign: 'center',
                  marginTop: Spacing.sm,
                }}
              >
                {phrase.kannada}
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
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
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
              borderRadius: Radius.chunky,
              borderBottomWidth: 4,
              borderBottomColor: Colors.goldLip,
              paddingVertical: Spacing.lg,
              paddingHorizontal: Spacing.lg,
              marginBottom: Spacing.xl,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
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
              backgroundColor: Colors.surfaceCreamLow,
              borderRadius: Radius.chunky,
              borderBottomWidth: 4,
              borderBottomColor: Colors.cardLip,
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
                fontSize: moderateScale(13),
                color: Colors.textFaint,
                textAlign: 'center',
                marginTop: Spacing.md,
              }}
            >
              {phrase.kannada}
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
