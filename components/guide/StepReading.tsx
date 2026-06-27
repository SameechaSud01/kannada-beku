import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { type GuideTryIt } from '../../services/api/guide';
import { useIsMounted } from '../../hooks/useIsMounted';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { Toasts } from '../modals/instances/toastCatalog';
import { AudioOrb } from '../ui/AudioOrb';
import { GuidePhonemeButton } from './GuidePhonemeButton';

/** A capital/lowercase audio comparison + its one-line insight. */
const COMPARISONS: {
  pair: [
    { kannada: string; romanization: string; note: string },
    { kannada: string; romanization: string; note: string },
  ];
  insight: string;
}[] = [
  {
    pair: [
      { kannada: 'ಟ', romanization: 'Ta', note: 'curled' },
      { kannada: 'ತ', romanization: 'ta', note: 'teeth' },
    ],
    insight: 'Capital letter = different sound. The shape tells you how to say it.',
  },
  {
    pair: [
      { kannada: 'ಡ', romanization: 'Da', note: 'curled' },
      { kannada: 'ದ', romanization: 'da', note: 'teeth' },
    ],
    insight: 'Same rule: capital = curled sound.',
  },
];

/**
 * Step 3 — "Reading it" (onboarding-simplification 2026-06-22). Listen → Notice:
 * lead with the Ta/ta · Da/da audio comparisons, surface the one-line pattern
 * below each, then the DB-sourced "TRY IT" word. The old explanatory prose box
 * was dropped — the audio does the teaching. Comparison glyphs are fixed UI
 * chrome; the try-it word stays DB-sourced.
 */
export function StepReading({ tryIt }: { tryIt: GuideTryIt }) {
  const [playing, setPlaying] = useState(false);
  const mounted = useIsMounted();

  useEffect(() => {
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, []);

  const handlePlay = () => {
    setPlaying(true);
    deviceTtsAudioService
      .play(tryIt.kannada)
      .catch((err) => {
        console.warn('[guide_reading] play failed', err);
        Toasts.audioFailed(handlePlay);
      })
      .finally(() => {
        if (mounted.current) setPlaying(false);
      });
  };

  return (
    <View>
      <Text
        style={{
          fontFamily: Fonts.baloo.extrabold,
          fontSize: moderateScale(26),
          color: Colors.onSurface,
          letterSpacing: -0.5,
          lineHeight: moderateScale(36),
        }}
        maxFontSizeMultiplier={1.2}
      >
        Reading it
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(15),
          lineHeight: moderateScale(22),
          color: Colors.tertiary,
          marginTop: Spacing.sm,
          marginBottom: Spacing.xl,
        }}
        maxFontSizeMultiplier={1.4}
      >
        You’ve heard the differences. Now notice the pattern.
      </Text>

      {/* Audio comparisons — listen first, pattern second */}
      <View style={{ gap: Spacing.lg, marginBottom: Spacing.lg }}>
        {COMPARISONS.map((cmp) => (
          <View key={cmp.pair[0].kannada}>
            <View style={{ flexDirection: 'row', gap: moderateScale(12) }}>
              <GuidePhonemeButton
                kannada={cmp.pair[0].kannada}
                romanization={cmp.pair[0].romanization}
                note={cmp.pair[0].note}
                accent="red"
              />
              <GuidePhonemeButton
                kannada={cmp.pair[1].kannada}
                romanization={cmp.pair[1].romanization}
                note={cmp.pair[1].note}
              />
            </View>
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(13),
                lineHeight: moderateScale(19),
                color: Colors.tertiary,
                marginTop: moderateScale(8),
                textAlign: 'center',
              }}
              maxFontSizeMultiplier={1.4}
            >
              {cmp.insight}
            </Text>
          </View>
        ))}
      </View>

      {/* TRY IT card */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(14),
          backgroundColor: Colors.secondaryFixed,
          borderRadius: Radius.chunky,
          borderBottomWidth: 5,
          borderBottomColor: Colors.goldLip,
          paddingVertical: moderateScale(16),
          paddingHorizontal: moderateScale(18),
        }}
        accessibilityRole="text"
        accessibilityLabel={`Try it: ${tryIt.transliteration}, ${tryIt.kannada}, meaning ${tryIt.english}`}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(11),
              letterSpacing: 1.4,
              color: Colors.onSecondaryContainer,
              textTransform: 'uppercase',
              marginBottom: moderateScale(4),
            }}
            maxFontSizeMultiplier={1.3}
          >
            Try it
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              gap: moderateScale(10),
              flexWrap: 'wrap',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(22),
                color: Colors.secondary,
              }}
              maxFontSizeMultiplier={1.3}
            >
              {tryIt.transliteration}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.notoSansKannada.bold,
                fontSize: moderateScale(22),
                color: Colors.onSecondaryContainer,
              }}
              maxFontSizeMultiplier={1.2}
            >
              {tryIt.kannada}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(12.5),
              color: Colors.onSecondaryContainer,
              marginTop: moderateScale(2),
            }}
            maxFontSizeMultiplier={1.4}
          >
            “{tryIt.english}” — the doubled ‘LL’ lingers, tongue curled.
          </Text>
        </View>

        <AudioOrb
          size={44}
          color="#ffffff"
          iconColor={Colors.secondary}
          lipColor={Colors.goldLip}
          playing={playing}
          onPress={handlePlay}
          accessibilityLabel={`Hear ${tryIt.transliteration}`}
        />
      </View>
    </View>
  );
}
