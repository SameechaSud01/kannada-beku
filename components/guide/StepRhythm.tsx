import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { type RhythmSentence } from '../../constants/guide';
import { StepHeading } from './StepHeading';
import { ChunkyPressable } from '../ui/ChunkyPressable';
import { ChunkyCircle } from '../ui/ChunkyLip';
import { useGuideAudio } from './useGuideAudio';

/**
 * Fallback per-syllable beat when the audio duration is unknown (device-TTS
 * path). The bundled clip reports its real duration via onStart, and the
 * stepper paces itself to that instead.
 */
const FALLBACK_BEAT_MS = 420;

/**
 * Step 6 — "The rhythm". The useful sentence ನನಗೆ ಕನ್ನಡ ಬೇಕು broken into even
 * per-syllable beats. Audit fixes (spec_onboarding_audit_fixes.md): playing
 * steps a gold "beating" state across the chips in sequence, and "Hear the
 * beat" is a white pill with a gold play orb — never a gold button, so gold
 * doesn't compete with the red Next CTA.
 */
export function StepRhythm({ rhythm }: { rhythm: RhythmSentence }) {
  const { play } = useGuideAudio();
  const [beatIndex, setBeatIndex] = useState<number | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const hearTheBeat = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setBeatIndex(null);
    // Start stepping only once the audio actually starts, and pace the chips
    // to the clip's real (rate-adjusted) duration so the visual cue tracks
    // the audio instead of a fixed guess.
    play('rhythm', rhythm.kannada, ({ durationMillis }) => {
      const beatMs = durationMillis ? durationMillis / rhythm.syllables.length : FALLBACK_BEAT_MS;
      rhythm.syllables.forEach((_, i) => {
        timersRef.current.push(setTimeout(() => setBeatIndex(i), i * beatMs));
      });
      timersRef.current.push(
        setTimeout(() => setBeatIndex(null), rhythm.syllables.length * beatMs),
      );
    });
  };

  return (
    <View>
      <StepHeading
        title="The rhythm"
        subtitle="Kannada is even — every syllable gets its own beat. Tap to hear:"
      />

      <ChunkyPressable
        accessibilityRole="none"
        border
        radius={Radius.chunky}
        style={{
          paddingVertical: moderateScale(22),
          paddingHorizontal: moderateScale(18),
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.notoSansKannada.bold,
            fontSize: moderateScale(26),
            color: Colors.onSurface,
            textAlign: 'center',
            marginBottom: moderateScale(16),
          }}
          maxFontSizeMultiplier={1.2}
        >
          {rhythm.kannada}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: moderateScale(8),
          }}
        >
          {rhythm.syllables.map((syllable, i) => (
            // Syllables repeat (na, na, …) so index is part of the key.
            <BeatChip key={`${syllable}:${i}`} label={syllable} active={beatIndex === i} />
          ))}
        </View>

        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(13.5),
            color: Colors.inkFaint,
            textAlign: 'center',
            marginTop: moderateScale(16),
          }}
          maxFontSizeMultiplier={1.4}
        >
          {rhythm.english} — {rhythm.transliteration}
        </Text>

        <HearTheBeatPill onPress={hearTheBeat} />
      </ChunkyPressable>
    </View>
  );
}

function BeatChip({ label, active }: { label: string; active: boolean }) {
  const lip = moderateScale(2);
  return (
    <View style={{ paddingBottom: lip }}>
      {/* Gold lip under the beating chip — a full copy of the shape so it
          follows the rounded corners at the chip's intrinsic width. */}
      {active ? (
        <View
          style={{
            position: 'absolute',
            top: lip,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: Radius.md,
            backgroundColor: Colors.goldLip,
          }}
        />
      ) : null}
      <View
        style={{
          backgroundColor: active ? Colors.secondaryContainer : Colors.surfaceCreamLow,
          borderRadius: Radius.md,
          paddingTop: moderateScale(7),
          paddingBottom: moderateScale(6),
          paddingHorizontal: moderateScale(13),
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(14.5),
            color: active ? Colors.onSecondaryContainer : Colors.onSurface,
          }}
          maxFontSizeMultiplier={1.2}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

function HearTheBeatPill({ onPress }: { onPress: () => void }) {
  const lip = moderateScale(3);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Hear the sentence"
      style={{ alignSelf: 'center', width: moderateScale(200), marginTop: moderateScale(14) }}
    >
      {({ pressed }) => (
        <View style={{ paddingBottom: lip }}>
          <View
            style={{
              position: 'absolute',
              top: lip,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: Radius.full,
              backgroundColor: Colors.cardLip,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: moderateScale(9),
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: Colors.hairlineStrong,
              borderRadius: Radius.full,
              paddingVertical: moderateScale(10),
              transform: [{ translateY: pressed ? lip : 0 }],
            }}
          >
            <ChunkyCircle
              size={moderateScale(26)}
              bg={Colors.secondaryContainer}
              lipColor={Colors.goldLip}
              depth={2}
              pressed={pressed}
            >
              <Icons.play size={moderateScale(12)} color={Colors.onSecondaryContainer} />
            </ChunkyCircle>
            <Text
              style={{
                fontFamily: Fonts.baloo.bold,
                fontSize: moderateScale(15.5),
                color: Colors.onSurface,
              }}
              maxFontSizeMultiplier={1.3}
            >
              Hear the beat
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}
