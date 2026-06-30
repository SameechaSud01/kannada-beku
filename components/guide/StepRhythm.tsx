import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { type RhythmSentence } from '../../constants/guide';
import { StepHeading } from './StepHeading';
import { ChunkyPressable } from '../ui/ChunkyPressable';
import { LipButton } from '../ui/LipButton';
import { useGuideAudio } from './useGuideAudio';

/**
 * Step 6 — "The rhythm". The useful sentence ನನಗೆ ಕನ್ನಡ ಬೇಕು broken into even
 * per-syllable beats; tap to hear that syllable-timed rhythm
 * (spec_lesson0_redesign.md).
 */
export function StepRhythm({ rhythm }: { rhythm: RhythmSentence }) {
  const { play } = useGuideAudio();

  return (
    <View>
      <StepHeading
        title="The rhythm"
        subtitle="Kannada is even — every syllable gets its own beat. Tap to hear:"
      />

      <ChunkyPressable
        accessibilityRole="none"
        border
        radius={Radius.xl}
        style={{
          paddingVertical: moderateScale(24),
          paddingHorizontal: moderateScale(16),
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.notoSansKannada.bold,
            fontSize: moderateScale(27),
            color: Colors.onSurface,
            textAlign: 'center',
            marginBottom: moderateScale(20),
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
            <Text
              // Syllables repeat (na, na, …) so index is part of the key.
              key={`${syllable}:${i}`}
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(15),
                color: Colors.secondary,
                backgroundColor: Colors.surfaceCreamLow,
                borderRadius: Radius.md,
                overflow: 'hidden',
                paddingVertical: moderateScale(9),
                paddingHorizontal: moderateScale(12),
              }}
              maxFontSizeMultiplier={1.2}
            >
              {syllable}
            </Text>
          ))}
        </View>

        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(13.5),
            color: Colors.tertiary,
            textAlign: 'center',
            marginTop: moderateScale(18),
          }}
          maxFontSizeMultiplier={1.4}
        >
          {rhythm.english} — {rhythm.transliteration}
        </Text>

        <View style={{ alignItems: 'center', marginTop: moderateScale(16) }}>
          <LipButton
            label="Hear the beat"
            variant="gold"
            icon={Icons.play}
            iconLeading
            fullWidth={false}
            onPress={() => play('rhythm', rhythm.kannada)}
            accessibilityLabel="Hear the sentence"
          />
        </View>
      </ChunkyPressable>
    </View>
  );
}
