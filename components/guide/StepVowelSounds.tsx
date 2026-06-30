import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { type VowelSound } from '../../constants/guide';
import { StepHeading } from './StepHeading';
import { ChunkyLip } from '../ui/ChunkyLip';
import { MouthDiagram } from './MouthDiagram';
import { useGuideAudio } from './useGuideAudio';

const COLS = 4;

/**
 * Step 2 — "The vowel sounds". The 8 common vowels in a 4-column grid; tap a
 * tile to hear it, then say it back (spec_lesson0_redesign.md). Tiles use
 * ChunkyLip (a second copy of the shape) so the chunky lip follows the rounded
 * corners — a borderBottom on a tile this round reads as a flat strip.
 */
export function StepVowelSounds({ vowels }: { vowels: VowelSound[] }) {
  const { playingKey, play } = useGuideAudio();
  const { width } = useWindowDimensions();

  // Fixed tile size so ChunkyLip (which is absolutely positioned) has real dims.
  const gap = moderateScale(10);
  const contentW = width - Spacing.xxl * 2;
  const tile = Math.floor((contentW - gap * (COLS - 1)) / COLS);

  return (
    <View>
      <StepHeading
        title="The vowel sounds"
        subtitle="Hear it first, then say it. Tap each one."
      />

      <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
        <MouthDiagram
          id="a"
          height={moderateScale(130)}
          caption="Vowels stay open — mouth relaxed, tongue flat."
        />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
        {vowels.map((vowel) => {
          const key = `vowel:${vowel.kannada}`;
          const active = playingKey === key;
          return (
            <Pressable
              key={key}
              onPress={() => play(key, vowel.kannada)}
              accessibilityRole="button"
              accessibilityLabel={`Hear ${vowel.transliteration}`}
              accessibilityState={{ busy: active }}
            >
              <ChunkyLip
                width={tile}
                height={tile}
                radius={Radius.chunky}
                bg="#ffffff"
                lipColor={active ? Colors.primary : Colors.cardLip}
                depth={4}
                border
                borderColor={active ? Colors.primary : Colors.hairline}
                borderWidth={active ? 2 : 1}
              >
                <Text
                  style={{
                    fontFamily: Fonts.notoSansKannada.bold,
                    fontSize: moderateScale(34),
                    color: Colors.onSurface,
                    lineHeight: moderateScale(44),
                  }}
                  maxFontSizeMultiplier={1.2}
                >
                  {vowel.kannada}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.bold,
                    fontSize: moderateScale(15),
                    color: Colors.primaryContainer,
                    marginTop: moderateScale(2),
                  }}
                  maxFontSizeMultiplier={1.2}
                >
                  {vowel.transliteration}
                </Text>
              </ChunkyLip>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
