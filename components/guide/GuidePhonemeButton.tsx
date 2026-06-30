import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius } from '../../constants/spacing';
import { useIsMounted } from '../../hooks/useIsMounted';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { Toasts } from '../modals/instances/toastCatalog';
import { AudioOrb } from '../ui/AudioOrb';
import { ChunkyPressable } from '../ui/ChunkyPressable';

interface GuidePhonemeButtonProps {
  /** The Kannada glyph/word to play and display (also the audio lookup key). */
  kannada: string;
  /** Romanized label shown under the glyph. */
  romanization: string;
  /** Optional small uppercase tag (e.g. "curled" / "teeth" / "held"). */
  note?: string;
  /** Accent: 'red' for the curled/capital sound, 'gold' (default) otherwise. */
  accent?: 'red' | 'gold';
}

/**
 * A single tappable phoneme tile — Kannada glyph + romanization + a gold/red
 * AudioOrb that plays the glyph on tap (onboarding-simplification 2026-06-22).
 * Audio is keyed by the Kannada text: bundled neural clip when available, else
 * on-device TTS (services/audio/deviceTtsAudioService). Each tile owns its own
 * playback state, so two side-by-side demos animate independently.
 */
export function GuidePhonemeButton({
  kannada,
  romanization,
  note,
  accent = 'gold',
}: GuidePhonemeButtonProps) {
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
      .play(kannada)
      .catch((err) => {
        console.warn('[guide_phoneme] play failed', err);
        Toasts.audioFailed(handlePlay);
      })
      .finally(() => {
        if (mounted.current) setPlaying(false);
      });
  };

  const isRed = accent === 'red';

  return (
    <ChunkyPressable
      accessibilityRole="none"
      border
      radius={Radius.chunky}
      style={{
        flex: 1,
        alignItems: 'center',
        gap: moderateScale(6),
        paddingVertical: moderateScale(14),
        paddingHorizontal: moderateScale(10),
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.notoSansKannada.bold,
          fontSize: moderateScale(30),
          color: Colors.onSurface,
        }}
        maxFontSizeMultiplier={1.2}
      >
        {kannada}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(15),
          color: isRed ? Colors.primaryContainer : Colors.secondary,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {romanization}
      </Text>
      {note ? (
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(10.5),
            color: isRed ? Colors.primary : Colors.onSecondaryContainer,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {note}
        </Text>
      ) : null}
      <AudioOrb
        size={40}
        color={isRed ? Colors.primaryContainer : '#ffffff'}
        iconColor={isRed ? Colors.onPrimary : Colors.secondary}
        lipColor={isRed ? Colors.redLip : Colors.goldLip}
        playing={playing}
        onPress={handlePlay}
        accessibilityLabel={`Hear ${romanization}`}
      />
    </ChunkyPressable>
  );
}
