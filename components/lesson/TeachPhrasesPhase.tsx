import { useEffect, useMemo, useState } from 'react';
import { logger } from '../../lib/logger';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { BACK_CHIP_TOP_RESERVE } from '../ui/ExitBackButton';
import { useIsMounted } from '../../hooks/useIsMounted';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { useProgressStore } from '../../stores/progressStore';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import { LessonProgressBar } from './LessonProgressBar';
import { LipButton } from '../ui/LipButton';
import { AudioOrb } from '../ui/AudioOrb';
import { useUserStore } from '../../stores/useUserStore';
import { GlossTag } from '../ui/GlossTag';
import { splitGloss } from '../../utils/gloss';
import { fitFontSize } from '../../utils/fontScale';
import type { Phrase, Word } from '../../constants/lessons/types';

interface TeachPhrasesPhaseProps {
  phrases: Phrase[];
  words: Word[];
  phraseIndex: number;
  lessonNo: number;
  /** Sub-part name; shown on the progress label when the lesson is split. */
  sectionLabel?: string;
  onAdvance: () => void;
}

const HIGHLIGHT_MS = 600;

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[?.,!]+$/g, '');
}

export function TeachPhrasesPhase({
  phrases,
  words,
  phraseIndex,
  lessonNo,
  sectionLabel,
  onAdvance,
}: TeachPhrasesPhaseProps) {
  const insets = useSafeAreaInsets();
  const phrase = phrases[phraseIndex];
  const total = phrases.length;
  const isLast = phraseIndex >= total - 1;
  const [highlightedChip, setHighlightedChip] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const mounted = useIsMounted();
  const autoReplay = useUserStore((s) => s.autoReplay);

  const chips = useMemo(() => {
    if (!phrase) return [];
    return phrase.transliteration
      .split(/\s+/)
      .filter(Boolean)
      .map((chip) => {
        const match = words.find((w) => normalize(w.transliteration) === normalize(chip));
        return { chip, match };
      });
  }, [phrase, words]);

  useEffect(() => {
    if (!phrase || !autoReplay) return;
    if (lessonNo >= 1) useProgressStore.getState().recordListen();
    deviceTtsAudioService.play(phrase.kannada).catch((err) => {
      logger.warn('teach_phrases', 'auto-play failed', { err });
    });
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, [phrase?.kannada, autoReplay]);

  if (!phrase) return null;

  const { text: englishText, tag } = splitGloss(phrase.english);

  const handleReplay = () => {
    if (lessonNo >= 1) useProgressStore.getState().recordListen();
    setPlaying(true);
    deviceTtsAudioService
      .play(phrase.kannada)
      .catch((err) => {
        logger.warn('teach_phrases', 'replay failed', { err });
        Toasts.audioFailed(handleReplay);
      })
      .finally(() => {
        if (mounted.current) setPlaying(false);
      });
  };

  const handleChipTap = (idx: number, kannadaText: string) => {
    if (!kannadaText) return;
    // Ignore taps while a chip is mid-highlight so rapid taps don't overlap audio.
    if (highlightedChip !== null) return;
    if (lessonNo >= 1) useProgressStore.getState().recordListen();
    setHighlightedChip(idx);
    deviceTtsAudioService.play(kannadaText).catch(() => undefined);
    setTimeout(() => setHighlightedChip((cur) => (cur === idx ? null : cur)), HIGHLIGHT_MS);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surfaceCream }}>
      <View
        style={{ paddingTop: insets.top + BACK_CHIP_TOP_RESERVE, paddingHorizontal: Spacing.lg }}
      >
        <LessonProgressBar
          current={phraseIndex + 1}
          total={total}
          label={`${sectionLabel ? `${sectionLabel} · ` : ''}Phrase ${phraseIndex + 1} of ${total}`}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.xl,
          paddingBottom: Spacing.lg,
        }}
      >
        {/* Word chips row */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Spacing.sm,
            marginBottom: Spacing.xl,
            justifyContent: 'center',
          }}
        >
          {chips.map((c, idx) => {
            const isHighlighted = highlightedChip === idx;
            return (
              <Pressable
                key={`${c.chip}-${idx}`}
                onPress={() => handleChipTap(idx, c.match?.kannada ?? '')}
                disabled={!c.match?.kannada}
                accessibilityRole="button"
                accessibilityLabel={`Hear ${c.chip}`}
                style={({ pressed }) => ({
                  backgroundColor: isHighlighted ? Colors.secondaryFixed : '#ffffff',
                  borderRadius: Radius.tile,
                  borderWidth: 1,
                  borderColor: isHighlighted ? Colors.goldLip : Colors.hairline,
                  borderBottomWidth: pressed ? 1 : 3,
                  borderBottomColor: isHighlighted ? Colors.goldLip : Colors.cardLip,
                  paddingVertical: Spacing.sm,
                  paddingHorizontal: Spacing.md,
                  alignItems: 'center',
                  minWidth: moderateScale(64),
                  transform: [{ translateY: pressed ? 2 : 0 }],
                })}
              >
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.bold,
                    fontSize: moderateScale(15),
                    color: Colors.onSurface,
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  {c.chip}
                </Text>
                {c.match ? (
                  <Text
                    style={{
                      fontFamily: Fonts.notoSansKannada.regular,
                      fontSize: moderateScale(11),
                      color: Colors.tertiary,
                      marginTop: moderateScale(2),
                    }}
                    maxFontSizeMultiplier={1.3}
                  >
                    {c.match.kannada}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {/* Full phrase display */}
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
              fontSize: moderateScale(
                fitFontSize(phrase.transliteration, { max: 28, min: 18, comfortable: 18 }),
              ),
              lineHeight: moderateScale(38),
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
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(15),
              color: Colors.tertiary,
              textAlign: 'center',
              marginTop: Spacing.md,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {englishText}
          </Text>
          {tag ? (
            <View style={{ marginTop: Spacing.sm }}>
              <GlossTag tag={tag} />
            </View>
          ) : null}
          <Text
            style={{
              fontFamily: Fonts.notoSansKannada.regular,
              fontSize: moderateScale(13),
              color: Colors.textFaint,
              textAlign: 'center',
              marginTop: Spacing.md,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {phrase.kannada}
          </Text>
        </View>

        <View style={{ alignItems: 'center', marginTop: Spacing.xxl }}>
          <AudioOrb
            onPress={handleReplay}
            playing={playing}
            size={64}
            accessibilityLabel="Hear the full phrase again"
          />
        </View>

        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(12),
            color: Colors.tertiary,
            textAlign: 'center',
            marginTop: Spacing.lg,
          }}
        >
          Tap a word to hear it on its own
        </Text>
      </ScrollView>

      <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
        <LipButton
          label={isLast ? 'Start practising phrases' : 'Got it'}
          onPress={onAdvance}
          accessibilityLabel={isLast ? 'Start practising phrases' : 'Got it, next phrase'}
          icon={Icons.forward}
        />
      </View>
    </View>
  );
}
