import { Pressable, Text, View } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Radius } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import {
  DAILY_LISTEN_TARGET,
  DAILY_SPEAK_TARGET,
  DAILY_PRACTICE_TARGET,
} from '../../../constants/goals';

export interface RingInfoSheetProps {
  onDismiss: () => void;
}

/** One ring's explainer row — colour matches the ring/dot on the Home card. */
const RINGS: { label: string; color: string; target: number; what: string }[] = [
  {
    label: 'Listen',
    color: Colors.primaryContainer,
    target: DAILY_LISTEN_TARGET,
    what: 'Counts every time a Kannada word or phrase is played out loud in the app — including auto-play.',
  },
  {
    label: 'Speak',
    color: Colors.secondaryContainer,
    target: DAILY_SPEAK_TARGET,
    what: 'Counts your "I said it" reps in a lesson’s practice steps.',
  },
  {
    label: 'Practice',
    color: Colors.primary,
    target: DAILY_PRACTICE_TARGET,
    what: 'Counts questions you answer across the practice games.',
  },
];

/**
 * Explains how the Home "Daily Goal" rings are scored. Opened from the info
 * button on the rings card. Each ring fills as you do that activity and the set
 * resets at local midnight. Mirrors WordsLearnedSheet's header/close pattern.
 */
export function RingInfoSheet({ onDismiss }: RingInfoSheetProps) {
  return (
    <BottomSheetScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        gap: moderateScale(18),
        paddingTop: moderateScale(4),
        paddingHorizontal: moderateScale(20),
        paddingBottom: moderateScale(36),
      }}
    >
      {/* Header — back button + title */}
      <View style={{ gap: moderateScale(12) }}>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={({ pressed }) => ({
            width: moderateScale(38),
            height: moderateScale(38),
            borderRadius: Radius.full,
            backgroundColor: Colors.surfaceCreamLow,
            borderWidth: 1,
            borderColor: Colors.hairline,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Icons.back size={moderateScale(20)} color={Colors.onSurface} />
        </Pressable>

        <View>
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(26),
              color: Colors.onSurface,
              letterSpacing: -0.3,
            }}
            maxFontSizeMultiplier={1.2}
          >
            How your rings work
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
              marginTop: moderateScale(2),
            }}
            maxFontSizeMultiplier={1.4}
          >
            Each ring fills as you practise. They reset every day at midnight.
          </Text>
        </View>
      </View>

      {RINGS.map((ring) => (
        <View
          key={ring.label}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: Radius.tile,
            borderWidth: 1,
            borderColor: Colors.hairline,
            borderLeftWidth: moderateScale(4),
            borderLeftColor: ring.color,
            paddingVertical: moderateScale(12),
            paddingHorizontal: moderateScale(14),
            gap: moderateScale(4),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(8) }}>
            <View
              style={{
                width: moderateScale(10),
                height: moderateScale(10),
                borderRadius: Radius.full,
                backgroundColor: ring.color,
              }}
            />
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(15),
                color: Colors.onSurface,
              }}
              maxFontSizeMultiplier={1.3}
            >
              {ring.label}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(13),
                color: Colors.tertiary,
                marginLeft: 'auto',
                fontVariant: ['tabular-nums'],
              }}
              maxFontSizeMultiplier={1.3}
            >
              Goal: {ring.target} / day
            </Text>
          </View>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(13.5),
              color: Colors.tertiary,
              lineHeight: moderateScale(19),
            }}
            maxFontSizeMultiplier={1.4}
          >
            {ring.what}
          </Text>
        </View>
      ))}

      <Text
        style={{
          fontFamily: Fonts.dmSans.medium,
          fontSize: moderateScale(12.5),
          color: Colors.textFaint,
          lineHeight: moderateScale(18),
        }}
        maxFontSizeMultiplier={1.4}
      >
        Close all three rings to hit your daily goal. Listen and Speak are tracked
        on this device, so they don&apos;t carry across phones.
      </Text>
    </BottomSheetScrollView>
  );
}
