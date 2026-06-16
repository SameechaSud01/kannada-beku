import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import {
  VOWEL_LONERS_NOTE,
  type VowelPair,
  type VowelLoner,
} from '../../constants/guide';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { Toasts } from '../modals/instances/toastCatalog';
import { AudioOrb } from '../ui/AudioOrb';

/**
 * Step 2 — "Vowels come in pairs". Five short→long rows (long glyph in red, gold
 * chevron between), each with a 32px gold AudioOrb that speaks the long vowel.
 * Vowel data is DB-sourced; the heading + loners caption are fixed UI chrome.
 */
export function StepVowels({
  vowelPairs,
  vowelLoners,
}: {
  vowelPairs: VowelPair[];
  vowelLoners: VowelLoner[];
}) {
  // Which orb is mid-playback (string key), so only one ping animates at once.
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, []);

  const handlePlay = (key: string, text: string, retry: () => void) => {
    setPlayingKey(key);
    deviceTtsAudioService
      .play(text)
      .catch((err) => {
        console.warn('[guide_vowels] play failed', err);
        Toasts.audioFailed(retry);
      })
      .finally(() => setPlayingKey((cur) => (cur === key ? null : cur)));
  };

  const playPair = (pair: VowelPair) =>
    handlePlay(`pair:${pair.short.kannada}`, `${pair.short.kannada} ${pair.long.kannada}`, () =>
      playPair(pair),
    );

  const playLoner = (loner: VowelLoner) =>
    handlePlay(`loner:${loner.kannada}`, loner.kannada, () => playLoner(loner));

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
        Vowels come in pairs
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
        A short sound and its longer twin. Tap to hear each pair.
      </Text>

      <View style={{ gap: moderateScale(11) }}>
        {vowelPairs.map((pair) => (
          <View
            key={pair.short.kannada}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              borderRadius: Radius.chunky,
              borderWidth: 1,
              borderColor: Colors.hairline,
              borderBottomWidth: 4,
              borderBottomColor: Colors.cardLip,
              paddingVertical: moderateScale(12),
              paddingHorizontal: moderateScale(14),
              gap: moderateScale(10),
            }}
            accessibilityRole="text"
            accessibilityLabel={`${pair.short.transliteration} as in ${pair.short.example}, lengthens to ${pair.long.transliteration} as in ${pair.long.example}`}
          >
            <VowelGlyph
              kannada={pair.short.kannada}
              translit={pair.short.transliteration}
              example={pair.short.example}
              color={Colors.onSurface}
            />

            <Icons.forward
              size={moderateScale(20)}
              color={Colors.goldLip}
              strokeWidth={2.4}
            />

            <VowelGlyph
              kannada={pair.long.kannada}
              translit={pair.long.transliteration}
              example={pair.long.example}
              color={Colors.primaryContainer}
            />

            <View style={{ flex: 1 }} />

            <AudioOrb
              size={32}
              color={Colors.secondaryFixed}
              iconColor={Colors.secondary}
              lipColor={Colors.goldLip}
              playing={playingKey === `pair:${pair.short.kannada}`}
              onPress={() => playPair(pair)}
              accessibilityLabel={`Hear ${pair.short.transliteration} and ${pair.long.transliteration}`}
            />
          </View>
        ))}
      </View>

      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(13),
          lineHeight: moderateScale(20),
          color: Colors.textFaint,
          marginTop: Spacing.lg,
          marginBottom: moderateScale(11),
        }}
        maxFontSizeMultiplier={1.4}
      >
        {VOWEL_LONERS_NOTE}
      </Text>

      <View style={{ flexDirection: 'row', gap: moderateScale(11) }}>
        {vowelLoners.map((loner) => (
          <View
            key={loner.kannada}
            style={{
              flex: 1,
              alignItems: 'center',
              backgroundColor: '#ffffff',
              borderRadius: Radius.chunky,
              borderWidth: 1,
              borderColor: Colors.hairline,
              borderBottomWidth: 4,
              borderBottomColor: Colors.cardLip,
              paddingVertical: moderateScale(12),
              paddingHorizontal: moderateScale(8),
              gap: moderateScale(8),
            }}
            accessibilityRole="text"
            accessibilityLabel={`${loner.transliteration} as in ${loner.example}`}
          >
            <VowelGlyph
              kannada={loner.kannada}
              translit={loner.transliteration}
              example={loner.example}
              color={Colors.onSurface}
            />
            <AudioOrb
              size={32}
              color={Colors.secondaryFixed}
              iconColor={Colors.secondary}
              lipColor={Colors.goldLip}
              playing={playingKey === `loner:${loner.kannada}`}
              onPress={() => playLoner(loner)}
              accessibilityLabel={`Hear ${loner.transliteration}`}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

function VowelGlyph({
  kannada,
  translit,
  example,
  color,
}: {
  kannada: string;
  translit: string;
  example: string;
  color: string;
}) {
  return (
    <View style={{ alignItems: 'center', width: moderateScale(58) }}>
      <Text
        style={{
          fontFamily: Fonts.notoSansKannada.bold,
          fontSize: moderateScale(30),
          lineHeight: moderateScale(48),
          color,
        }}
        maxFontSizeMultiplier={1.2}
      >
        {kannada}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(13),
          color,
          marginTop: moderateScale(1),
        }}
        maxFontSizeMultiplier={1.3}
      >
        {translit}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(11),
          color: Colors.tertiary,
        }}
        maxFontSizeMultiplier={1.3}
        numberOfLines={1}
      >
        {example}
      </Text>
    </View>
  );
}
