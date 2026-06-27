import { Text, View } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import { AudioOrb } from '../../ui/AudioOrb';
import { LipButton } from '../../ui/LipButton';
import { deviceTtsAudioService } from '../../../services/audio/deviceTtsAudioService';
import { Toasts } from './toastCatalog';
import type { Phrase } from '../../../constants/lessons/types';

export interface PhraseDetailSheetProps {
  phrase: Phrase;
  onDismiss: () => void;
}

function speakable(kannada: string): string {
  return kannada.replace(/\[name\]/g, '').trim();
}

/**
 * Bottom sheet showing a phrase's full breakdown (chunky_v3 §11). Renders inside
 * <BottomSheet> — the parent provides the 24px top radius, grab handle, dynamic
 * sizing, and dismiss.
 */
export function PhraseDetailSheet({ phrase, onDismiss }: PhraseDetailSheetProps) {
  const handlePlay = () => {
    const txt = speakable(phrase.kannada);
    if (!txt) return;
    deviceTtsAudioService.play(txt).catch((err) => {
      console.warn('[audio] phrase-detail play failed', err);
      Toasts.audioFailed(handlePlay);
    });
  };

  return (
    <BottomSheetScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        gap: moderateScale(16),
        paddingTop: moderateScale(8),
        paddingHorizontal: moderateScale(20),
        paddingBottom: moderateScale(36),
      }}
    >
      {/* Header row — phrase + play orb */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(16) }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(28),
              lineHeight: moderateScale(38),
              color: Colors.onSurface,
              includeFontPadding: false,
            }}
            maxFontSizeMultiplier={1.3}
            numberOfLines={3}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {phrase.transliteration}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(15),
              color: Colors.tertiary,
              marginTop: moderateScale(6),
            }}
            maxFontSizeMultiplier={1.4}
          >
            {phrase.english}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.notoSansKannada.regular,
              fontSize: moderateScale(14),
              color: Colors.tertiary,
              marginTop: moderateScale(6),
              opacity: 0.7,
            }}
            maxFontSizeMultiplier={1.4}
          >
            {speakable(phrase.kannada) || phrase.kannada}
          </Text>
        </View>
        <AudioOrb size={48} onPress={handlePlay} accessibilityLabel={`Hear: ${phrase.english}`} />
      </View>

      {phrase.gloss && phrase.gloss.length > 0 ? (
        <>
          <GoldRule label="Break it down" />
          <View style={{ gap: moderateScale(8) }}>
            {phrase.gloss.map((atom, idx) => (
              <View
                key={`${atom.atom}-${idx}`}
                style={{
                  backgroundColor: Colors.surfaceCreamLow,
                  borderRadius: Radius.tile,
                  padding: moderateScale(12),
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: moderateScale(10),
                }}
              >
                <View style={{ flexShrink: 1 }}>
                  {atom.transliteration ? (
                    <Text
                      style={{
                        fontFamily: Fonts.dmSans.bold,
                        fontSize: moderateScale(16),
                        color: Colors.onSurface,
                      }}
                      maxFontSizeMultiplier={1.4}
                    >
                      {atom.transliteration}
                    </Text>
                  ) : null}
                  <Text
                    style={{
                      fontFamily: Fonts.notoSansKannada.regular,
                      fontSize: moderateScale(13),
                      color: Colors.tertiary,
                      marginTop: moderateScale(2),
                      opacity: 0.7,
                    }}
                    maxFontSizeMultiplier={1.3}
                  >
                    {atom.atom}
                  </Text>
                </View>
                <View style={{ flex: 1 }} />
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.medium,
                    fontSize: moderateScale(13),
                    color: Colors.tertiary,
                    textAlign: 'right',
                  }}
                  maxFontSizeMultiplier={1.4}
                >
                  {atom.en}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {phrase.note ? (
        <View
          style={{
            backgroundColor: Colors.secondaryFixed,
            borderRadius: Radius.tile,
            padding: moderateScale(12),
            flexDirection: 'row',
            gap: moderateScale(10),
          }}
        >
          <Icons.sparkle size={moderateScale(16)} color={Colors.onSecondaryContainer} />
          <Text
            style={{
              flex: 1,
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(12),
              lineHeight: moderateScale(17),
              color: Colors.onSecondaryContainer,
            }}
            maxFontSizeMultiplier={1.4}
          >
            {phrase.note}
          </Text>
        </View>
      ) : null}

      {/* "Save" was a disabled "Coming soon" stub — removed until implemented so
          it doesn't ship as a dead button (audit Phase 5). */}
      <LipButton label="Got it" variant="primary" onPress={onDismiss} />
      <View style={{ height: Spacing.sm }} />
    </BottomSheetScrollView>
  );
}

function GoldRule({ label }: { label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(10) }}>
      <Dots />
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(10),
          letterSpacing: 2,
          color: Colors.secondary,
          textTransform: 'uppercase',
        }}
        maxFontSizeMultiplier={1.4}
      >
        {label}
      </Text>
      <Dots />
    </View>
  );
}

function Dots() {
  return (
    <View
      style={{
        flex: 1,
        borderBottomWidth: 1,
        borderColor: Colors.secondary,
        opacity: 0.35,
        borderStyle: 'dotted',
        height: 1,
      }}
    />
  );
}
