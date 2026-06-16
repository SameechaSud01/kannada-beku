import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { GUIDE_INTRO_BLURB, type BasicPrinciple } from '../../constants/guide';

/**
 * Step 1 — "Three things — that's it". A reassurance paragraph + three numbered
 * cards with gold number circles (chunky_v3 §8). Principles are DB-sourced; the
 * heading + intro blurb are fixed UI chrome.
 */
export function StepThings({ principles }: { principles: BasicPrinciple[] }) {
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
        {principles.map((p, idx) => (
          <View
            key={p.title}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: moderateScale(14),
              backgroundColor: '#ffffff',
              borderRadius: Radius.chunky,
              borderWidth: 1,
              borderColor: Colors.hairline,
              borderBottomWidth: 4,
              borderBottomColor: Colors.cardLip,
              padding: moderateScale(16),
            }}
            accessibilityRole="text"
            accessibilityLabel={`${idx + 1}. ${p.title}. ${p.body}`}
          >
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
                {p.title}
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
                {p.body}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
