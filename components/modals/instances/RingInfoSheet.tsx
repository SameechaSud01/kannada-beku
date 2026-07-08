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

type Ring = {
  label: string;
  icon: (typeof Icons)[keyof typeof Icons];
  /** Icon-disc fill — matches the ring/dot colour on the Home card. */
  disc: string;
  /** Icon colour inside the disc (white on the dark fills, ink-gold on gold). */
  onDisc: string;
  target: number;
  what: string;
};

/** One ring's explainer row — colour matches the ring/dot on the Home card. */
const RINGS: Ring[] = [
  {
    label: 'Listen',
    icon: Icons.audio,
    disc: Colors.primaryContainer,
    onDisc: Colors.onPrimary,
    target: DAILY_LISTEN_TARGET,
    what: 'Every Kannada word played out loud — your taps and autoplay both count.',
  },
  {
    label: 'Speak',
    icon: Icons.mic,
    disc: Colors.secondaryContainer,
    onDisc: Colors.onSecondaryContainer,
    target: DAILY_SPEAK_TARGET,
    what: 'Each time you tap “I said it” during a lesson’s practice steps.',
  },
  {
    label: 'Practice',
    icon: Icons.tabPractice,
    disc: Colors.interactiveSecondary,
    onDisc: Colors.onSurface,
    target: DAILY_PRACTICE_TARGET,
    what: 'Questions you answer across the practice games.',
  },
];

/**
 * Explains how the Home "Daily Goal" rings are scored. Opened from the info
 * button on the rings card. Each ring fills as you do that activity and the set
 * resets at local midnight. Layout follows the Rings Popup Redesign handoff:
 * icon-disc rows with a per-day goal pill, then a cream note panel covering the
 * midnight reset and the on-device tracking of Listen & Speak.
 */
export function RingInfoSheet({ onDismiss }: RingInfoSheetProps) {
  return (
    <BottomSheetScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: moderateScale(12),
        paddingHorizontal: moderateScale(20),
        paddingBottom: moderateScale(36),
      }}
    >
      {/* Close — top-right disc, matches the handoff. */}
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={8}
        style={({ pressed }) => ({
          position: 'absolute',
          top: moderateScale(2),
          right: moderateScale(20),
          zIndex: 2,
          width: moderateScale(34),
          height: moderateScale(34),
          borderRadius: Radius.full,
          backgroundColor: Colors.surfaceCreamLow,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Icons.close size={moderateScale(18)} color={Colors.tertiary} />
      </Pressable>

      {/* Header */}
      <View style={{ paddingRight: moderateScale(40) }}>
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(26),
            color: Colors.onSurface,
            letterSpacing: -0.3,
            lineHeight: moderateScale(34),
          }}
          maxFontSizeMultiplier={1.2}
        >
          How your rings work
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(14),
            color: Colors.tertiary,
            lineHeight: moderateScale(20),
            marginTop: moderateScale(8),
          }}
          maxFontSizeMultiplier={1.4}
        >
          Three daily goals. Each ring fills as you practise — close all three to finish your day.
        </Text>
      </View>

      {/* Ring rows */}
      <View style={{ marginTop: moderateScale(20) }}>
        {RINGS.map((ring, idx) => {
          const Icon = ring.icon;
          return (
            <View
              key={ring.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: moderateScale(14),
                paddingVertical: moderateScale(14),
                ...(idx > 0 ? { borderTopWidth: 1, borderTopColor: Colors.hairline } : null),
              }}
            >
              <View
                style={{
                  width: moderateScale(44),
                  height: moderateScale(44),
                  borderRadius: Radius.full,
                  backgroundColor: ring.disc,
                  borderBottomWidth: moderateScale(3),
                  borderBottomColor: Colors.cardLip,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={moderateScale(22)} color={ring.onDisc} />
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontFamily: Fonts.baloo.extrabold,
                    fontSize: moderateScale(17),
                    color: Colors.onSurface,
                    letterSpacing: -0.2,
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  {ring.label}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.medium,
                    fontSize: moderateScale(13),
                    color: Colors.tertiary,
                    lineHeight: moderateScale(18),
                    marginTop: moderateScale(2),
                  }}
                  maxFontSizeMultiplier={1.4}
                >
                  {ring.what}
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: Fonts.baloo.extrabold,
                  fontSize: moderateScale(20),
                  color: Colors.onSurface,
                  fontVariant: ['tabular-nums'],
                  alignSelf: 'flex-start',
                  marginTop: moderateScale(3),
                }}
                maxFontSizeMultiplier={1.2}
              >
                {ring.target}
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.bold,
                    fontSize: moderateScale(11),
                    color: Colors.textFaint,
                  }}
                >
                  /day
                </Text>
              </Text>
            </View>
          );
        })}
      </View>

      {/* Note panel — reset cadence + on-device caveat. */}
      <View
        style={{
          marginTop: moderateScale(18),
          backgroundColor: Colors.surfaceCream,
          borderRadius: Radius.chunky,
          paddingVertical: moderateScale(14),
          paddingHorizontal: moderateScale(16),
          gap: moderateScale(11),
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: moderateScale(11) }}>
          <Icons.refresh size={moderateScale(17)} color={Colors.textFaint} />
          <Text
            style={{
              flex: 1,
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(12.5),
              color: Colors.tertiary,
              lineHeight: moderateScale(18),
            }}
            maxFontSizeMultiplier={1.4}
          >
            <Text style={{ fontFamily: Fonts.dmSans.bold, color: Colors.onSurface }}>
              Resets every midnight.
            </Text>{' '}
            A fresh set of rings each day.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: moderateScale(11) }}>
          <Icons.device size={moderateScale(17)} color={Colors.textFaint} />
          <Text
            style={{
              flex: 1,
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(12.5),
              color: Colors.tertiary,
              lineHeight: moderateScale(18),
            }}
            maxFontSizeMultiplier={1.4}
          >
            <Text style={{ fontFamily: Fonts.dmSans.bold, color: Colors.onSurface }}>
              Listen &amp; Speak count on this device,
            </Text>{' '}
            so they don&apos;t carry across phones.
          </Text>
        </View>
      </View>
    </BottomSheetScrollView>
  );
}
