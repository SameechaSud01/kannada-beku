import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { StepHeading } from './StepHeading';
import { ChunkyPressable } from '../ui/ChunkyPressable';
import { ChunkyCircle } from '../ui/ChunkyLip';

/**
 * Step 7 — "You're ready!". A success check + four recap takeaways to keep in
 * your pocket before Lesson 1 (spec_lesson0_redesign.md).
 */
export function StepRecap({ recap }: { recap: string[] }) {
  return (
    <View>
      <View style={{ alignItems: 'center', marginBottom: Spacing.sm }}>
        <ChunkyCircle
          size={moderateScale(70)}
          bg={Colors.secondaryContainer}
          lipColor={Colors.goldLip}
          depth={4}
        >
          <Icons.check size={moderateScale(38)} color={Colors.onSecondaryContainer} strokeWidth={3} />
        </ChunkyCircle>
      </View>

      <View style={{ alignItems: 'center' }}>
        <StepHeading title="You're ready!" subtitle="Keep these four in your pocket:" />
      </View>

      <View style={{ gap: moderateScale(11) }}>
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
              gap: moderateScale(13),
              paddingVertical: moderateScale(15),
              paddingHorizontal: moderateScale(16),
            }}
          >
            <View
              style={{
                width: moderateScale(26),
                height: moderateScale(26),
                borderRadius: Radius.full,
                backgroundColor: Colors.successContainerLow,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icons.check size={moderateScale(15)} color={Colors.successContainer} strokeWidth={3.4} />
            </View>
            <Text
              style={{
                flex: 1,
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(14.5),
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
