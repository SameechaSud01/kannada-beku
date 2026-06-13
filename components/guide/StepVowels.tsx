import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { VOWEL_PAIRS, VOWEL_LONERS_NOTE, type VowelPair } from '../../constants/guide';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { Toasts } from '../modals/instances/toastCatalog';
import { AudioOrb } from '../ui/AudioOrb';

/**
 * Step 2 — "Vowels come in pairs". Five short→long rows (long glyph in red, gold
 * chevron between), each with a 32px gold AudioOrb that speaks the long vowel.
 */
export function StepVowels() {
  // Which row's orb is mid-playback (index), so only one ping animates at once.
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, []);

  const handlePlay = (idx: number, pair: VowelPair) => {
    setPlayingIdx(idx);
    deviceTtsAudioService
      .play(`${pair.short.kannada} ${pair.long.kannada}`)
      .catch((err) => {
        console.warn('[guide_vowels] play failed', err);
        Toasts.audioFailed(() => handlePlay(idx, pair));
      })
      .finally(() => setPlayingIdx((cur) => (cur === idx ? null : cur)));
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
        {VOWEL_PAIRS.map((pair, idx) => (
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
              playing={playingIdx === idx}
              onPress={() => handlePlay(idx, pair)}
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
        }}
        maxFontSizeMultiplier={1.4}
      >
        {VOWEL_LONERS_NOTE}
      </Text>
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
