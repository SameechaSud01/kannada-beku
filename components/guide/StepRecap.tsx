import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { StepHeading } from './StepHeading';
import { ChunkyPressable } from '../ui/ChunkyPressable';
import { ChunkyCircle } from '../ui/ChunkyLip';

const HERO_SIZE = moderateScale(92);
const HERO_LIP = moderateScale(6);

/**
 * Step 7 — "You're ready!". A gold celebration circle + four recap takeaways.
 * Audit fix (spec_onboarding_audit_fixes.md finding 7): the per-row checks are
 * GOLD, not green — completion is a reward; green is scoped to answer feedback
 * only. The hero uses the sanctioned gold gradient.
 */
export function StepRecap({ recap }: { recap: string[] }) {
  return (
    <View>
      <View style={{ alignItems: 'center', marginBottom: Spacing.sm }}>
        {/* Gold-gradient celebration circle with a chunky lip. */}
        <View style={{ width: HERO_SIZE, height: HERO_SIZE + HERO_LIP }}>
          <View
            style={{
              position: 'absolute',
              top: HERO_LIP,
              width: HERO_SIZE,
              height: HERO_SIZE,
              borderRadius: HERO_SIZE / 2,
              backgroundColor: Colors.goldLip,
            }}
          />
          <LinearGradient
            colors={[Colors.goldBright, Colors.secondaryContainer]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              width: HERO_SIZE,
              height: HERO_SIZE,
              borderRadius: HERO_SIZE / 2,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Icons.check
              size={moderateScale(44)}
              color={Colors.onSecondaryContainer}
              strokeWidth={3}
            />
          </LinearGradient>
        </View>
      </View>

      <View style={{ alignItems: 'center' }}>
        <StepHeading title="You're ready!" subtitle="Keep these four in your pocket:" />
      </View>

      <View style={{ gap: moderateScale(12) }}>
        {recap.map((point, i) => (
          <ChunkyPressable
            key={i}
            accessibilityRole="none"
            accessibilityLabel={point}
            border
            radius={Radius.chunky}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: moderateScale(14),
              paddingVertical: moderateScale(14),
              paddingHorizontal: moderateScale(16),
            }}
          >
            {/* Gold reward check — NOT green (green = answer feedback only). */}
            <ChunkyCircle
              size={moderateScale(30)}
              bg={Colors.secondaryContainer}
              lipColor={Colors.goldLip}
              depth={2}
            >
              <Icons.check
                size={moderateScale(15)}
                color={Colors.onSecondaryContainer}
                strokeWidth={3}
              />
            </ChunkyCircle>
            <Text
              style={{
                flex: 1,
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(15),
                lineHeight: moderateScale(21),
                color: Colors.onSurface,
              }}
              maxFontSizeMultiplier={1.4}
            >
              {point}
            </Text>
          </ChunkyPressable>
        ))}
      </View>
    </View>
  );
}
