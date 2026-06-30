import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { type GuideWord } from '../../constants/guide';
import { StepHeading } from './StepHeading';
import { ChunkyPressable } from '../ui/ChunkyPressable';
import { ChunkyCircle } from '../ui/ChunkyLip';
import { useGuideAudio } from './useGuideAudio';

/**
 * Step 5 — "Doubled letters linger". A short list of geminated words; tap a row
 * to hear the double consonant held a beat longer (spec_lesson0_redesign.md).
 */
export function StepDoubles({ doubles }: { doubles: GuideWord[] }) {
  const { playingKey, play } = useGuideAudio();

  return (
    <View>
      <StepHeading
        title="Doubled letters linger"
        subtitle="A double consonant is just held a beat longer. Tap to hear it."
      />

      <View style={{ gap: Spacing.md }}>
        {doubles.map((word) => {
          const key = `dbl:${word.kannada}`;
          const active = playingKey === key;
          return (
            <ChunkyPressable
              key={key}
              onPress={() => play(key, word.kannada)}
              accessibilityLabel={`Hear ${word.transliteration}, meaning ${word.english}`}
              border
              borderColor={active ? Colors.goldLip : Colors.hairline}
              lipColor={active ? Colors.goldLip : Colors.cardLip}
              radius={Radius.chunky}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: moderateScale(15),
                paddingVertical: moderateScale(18),
                paddingHorizontal: moderateScale(18),
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
                {word.kannada}
              </Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.bold,
                    fontSize: moderateScale(18),
                    color: Colors.onSurface,
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  {word.transliteration}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.regular,
                    fontSize: moderateScale(13.5),
                    color: Colors.tertiary,
                  }}
                  maxFontSizeMultiplier={1.4}
                >
                  {word.english}
                </Text>
              </View>
              <ChunkyCircle
                size={moderateScale(44)}
                bg={Colors.secondaryFixed}
                lipColor={Colors.goldLip}
                depth={3}
              >
                <Icons.play size={moderateScale(19)} color={Colors.secondary} />
              </ChunkyCircle>
            </ChunkyPressable>
          );
        })}
      </View>
    </View>
  );
}
