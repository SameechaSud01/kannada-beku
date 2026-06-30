import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { type WelcomePoint } from '../../constants/guide';
import { StepHeading } from './StepHeading';
import { ChunkyPressable } from '../ui/ChunkyPressable';
import { ChunkyCircle } from '../ui/ChunkyLip';

/**
 * Step 1 — "Welcome to Kannada". Three numbered reassurance points + a
 * listen-first callout (spec_lesson0_redesign.md). No audio on this step.
 */
export function StepWelcome({ welcomePoints }: { welcomePoints: WelcomePoint[] }) {
  return (
    <View>
      <StepHeading
        eyebrow="Lesson 0"
        title="Welcome to Kannada"
        subtitle="Three things make Kannada easier than it looks:"
      />

      <View style={{ gap: Spacing.md }}>
        {welcomePoints.map((point) => (
          <ChunkyPressable
            key={point.n}
            accessibilityRole="none"
            accessibilityLabel={`${point.n}. ${point.text}`}
            border
            radius={Radius.chunky}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: moderateScale(15),
              paddingVertical: moderateScale(18),
              paddingHorizontal: moderateScale(18),
            }}
          >
            <ChunkyCircle
              size={moderateScale(38)}
              bg={Colors.secondaryFixed}
              lipColor={Colors.goldLip}
              depth={2}
            >
              <Text
                style={{
                  fontFamily: Fonts.baloo.extrabold,
                  fontSize: moderateScale(17),
                  color: Colors.onSecondaryContainer,
                  fontVariant: ['tabular-nums'],
                }}
                maxFontSizeMultiplier={1.2}
              >
                {point.n}
              </Text>
            </ChunkyCircle>
            <Text
              style={{
                flex: 1,
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(15.5),
                lineHeight: moderateScale(22),
                color: Colors.onSurface,
              }}
              maxFontSizeMultiplier={1.4}
            >
              {point.text}
            </Text>
          </ChunkyPressable>
        ))}
      </View>

      {/* Listen-first callout — a flat tinted pill (no lip). */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(13),
          backgroundColor: Colors.errorContainerLow,
          borderRadius: Radius.chunky,
          paddingVertical: moderateScale(16),
          paddingHorizontal: moderateScale(16),
          marginTop: Spacing.lg,
        }}
        accessibilityRole="text"
        accessibilityLabel="Every step is listen-first — hear the sound, then say it. No alphabet drills."
      >
        <View
          style={{
            width: moderateScale(38),
            height: moderateScale(38),
            borderRadius: Radius.full,
            backgroundColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icons.headphones size={moderateScale(20)} color={Colors.onPrimary} strokeWidth={2} />
        </View>
        <Text
          style={{
            flex: 1,
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(14.5),
            lineHeight: moderateScale(21),
            color: Colors.primary,
          }}
          maxFontSizeMultiplier={1.4}
        >
          Every step is listen-first — hear the sound, then say it. No alphabet drills.
        </Text>
      </View>
    </View>
  );
}
