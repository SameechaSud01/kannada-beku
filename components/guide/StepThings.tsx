import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { GUIDE_INTRO_BLURB, type BasicPrinciple } from '../../constants/guide';
import { GuidePhonemeButton } from './GuidePhonemeButton';

/** A pair of side-by-side audio demos shown inside a habit card. */
type Demo = { kannada: string; romanization: string; note?: string; accent?: 'red' | 'gold' };

/**
 * Step 1 — "Three things — that's it" (onboarding-simplification 2026-06-22).
 * Habit 1 stays a text rule (DB-sourced via principles[0]); habits 2 & 3 are now
 * *listen-first* audio demos — the learner hears the sound difference instead of
 * reading a meta-linguistic rule. The demo glyphs are fixed UI chrome (stable
 * phonetic constants), like the heading + intro blurb.
 */
export function StepThings({ principles }: { principles: BasicPrinciple[] }) {
  const sayWhatYouSee = principles[0] ?? {
    title: 'Say what you see',
    body: 'Kannada is written the way it sounds. Read the letters left to right and you have said the word.',
  };

  const habits: Array<{ title: string; body: string; demos?: Demo[] }> = [
    { title: sayWhatYouSee.title, body: sayWhatYouSee.body },
    {
      title: 'Hear the difference',
      body: 'Some letters look similar but sound different. Listen:',
      demos: [
        { kannada: 'ಟ', romanization: 'Ta', note: 'curled', accent: 'red' },
        { kannada: 'ತ', romanization: 'ta', note: 'teeth' },
      ],
    },
    {
      title: 'Doubled letters hold longer',
      body: 'Listen to the difference:',
      demos: [
        { kannada: 'ಹಳ್ಳಿ', romanization: 'halLi', note: 'held' },
        { kannada: 'ಹಲಿ', romanization: 'hali', note: 'quick' },
      ],
    },
  ];

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
        Three things — that’s it
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
        {GUIDE_INTRO_BLURB}
      </Text>

      <View style={{ gap: moderateScale(12) }}>
        {habits.map((habit, idx) => (
          <View
            key={habit.title}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: Radius.chunky,
              borderWidth: 1,
              borderColor: Colors.hairline,
              borderBottomWidth: 4,
              borderBottomColor: Colors.cardLip,
              padding: moderateScale(16),
            }}
            accessibilityRole="text"
            accessibilityLabel={`${idx + 1}. ${habit.title}. ${habit.body}`}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: moderateScale(14) }}>
              {/* Gold number circle */}
              <View
                style={{
                  width: moderateScale(34),
                  height: moderateScale(34),
                  borderRadius: Radius.full,
                  backgroundColor: Colors.secondaryContainer,
                  borderBottomWidth: 2,
                  borderBottomColor: Colors.goldLip,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.baloo.extrabold,
                    fontSize: moderateScale(16),
                    color: Colors.onSecondaryContainer,
                    fontVariant: ['tabular-nums'],
                  }}
                  maxFontSizeMultiplier={1.2}
                >
                  {idx + 1}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.baloo.bold,
                    fontSize: moderateScale(16),
                    color: Colors.onSurface,
                    marginBottom: moderateScale(3),
                    letterSpacing: -0.2,
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  {habit.title}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.regular,
                    fontSize: moderateScale(13),
                    lineHeight: moderateScale(19),
                    color: Colors.tertiary,
                  }}
                  maxFontSizeMultiplier={1.4}
                >
                  {habit.body}
                </Text>
              </View>
            </View>

            {habit.demos ? (
              <View
                style={{
                  flexDirection: 'row',
                  gap: moderateScale(12),
                  marginTop: moderateScale(14),
                }}
              >
                {habit.demos.map((demo) => (
                  <GuidePhonemeButton
                    key={demo.kannada}
                    kannada={demo.kannada}
                    romanization={demo.romanization}
                    note={demo.note}
                    accent={demo.accent}
                  />
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}
