import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { READING_ROWS, TRY_IT } from '../../constants/guide';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { Toasts } from '../modals/instances/toastCatalog';
import { AudioOrb } from '../ui/AudioOrb';

/**
 * Step 4 — "Reading + try it". A capital/lowercase comparison card (capitals
 * red, lowercase deep-gold) + a goldPale "TRY IT" card with a gold AudioOrb.
 */
export function StepReading() {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, []);

  const handlePlay = () => {
    setPlaying(true);
    deviceTtsAudioService
      .play(TRY_IT.kannada)
      .catch((err) => {
        console.warn('[guide_reading] play failed', err);
        Toasts.audioFailed(handlePlay);
      })
      .finally(() => setPlaying(false));
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
        Capital letters curl the tongue; lowercase ones stay forward at the teeth. Same letter, two sounds.
      </Text>

      {/* Comparison card */}
      <View
        style={{
          backgroundColor: '#ffffff',
          borderRadius: Radius.chunky,
          borderWidth: 1,
          borderColor: Colors.hairline,
          borderBottomWidth: 4,
          borderBottomColor: Colors.cardLip,
          paddingVertical: moderateScale(6),
          paddingHorizontal: moderateScale(16),
          marginBottom: Spacing.lg,
        }}
      >
        {READING_ROWS.map((row, idx) => (
          <View
            key={row.symbol}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: moderateScale(12),
              borderTopWidth: idx === 0 ? 0 : 1,
              borderTopColor: Colors.hairline,
            }}
            accessibilityRole="text"
            accessibilityLabel={`${row.symbol} ${row.example}`}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(18),
                color: row.isCapital ? Colors.primaryContainer : Colors.secondary,
                minWidth: moderateScale(56),
              }}
              maxFontSizeMultiplier={1.3}
            >
              {row.symbol}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.regular,
                fontSize: moderateScale(14),
                color: Colors.tertiary,
                flex: 1,
              }}
              maxFontSizeMultiplier={1.4}
            >
              {row.example}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(11.5),
                color: row.isCapital ? Colors.primary : Colors.onSecondaryContainer,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
              maxFontSizeMultiplier={1.3}
            >
              {row.isCapital ? 'curled' : 'teeth'}
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
        accessibilityLabel={`Try it: ${TRY_IT.transliteration}, ${TRY_IT.kannada}, meaning ${TRY_IT.english}`}
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
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: moderateScale(10), flexWrap: 'wrap' }}>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(22),
                color: Colors.secondary,
              }}
              maxFontSizeMultiplier={1.3}
            >
              {TRY_IT.transliteration}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.notoSansKannada.bold,
                fontSize: moderateScale(22),
                color: Colors.onSecondaryContainer,
              }}
              maxFontSizeMultiplier={1.2}
            >
              {TRY_IT.kannada}
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
            “{TRY_IT.english}” — the doubled ‘LL’ lingers, tongue curled.
          </Text>
        </View>

        <AudioOrb
          size={44}
          color="#ffffff"
          iconColor={Colors.secondary}
          lipColor={Colors.goldLip}
          playing={playing}
          onPress={handlePlay}
          accessibilityLabel={`Hear ${TRY_IT.transliteration}`}
        />
      </View>
    </View>
  );
}
