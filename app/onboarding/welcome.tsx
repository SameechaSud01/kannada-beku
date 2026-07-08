import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { BrandGradient } from '../../components/ui/BrandGradient';
import { Watermark } from '../../components/ui/Watermark';
import { LipButton } from '../../components/ui/LipButton';
import { useCopy } from '../../hooks/useCopy';

type Hook = { Icon: TablerIcon; title: string; sub: string; rotate: string };

// ±0.8° tilt with safe spacing — the old ±3° tilts overlapped/clipped
// neighbouring cards (audit finding 9, spec_onboarding_audit_fixes.md).
const HOOKS: Hook[] = [
  {
    Icon: Icons.tabPractice,
    title: 'Speak from day one',
    sub: 'Real phrases, not grammar drills',
    rotate: '-0.8deg',
  },
  {
    Icon: Icons.emergency,
    title: 'Never get stuck',
    sub: 'Survival phrases · works offline',
    rotate: '0.8deg',
  },
  {
    Icon: Icons.streak,
    title: '5 minutes a day',
    sub: 'Small streaks, real progress',
    rotate: '-0.8deg',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const copy = useCopy();

  return (
    <BrandGradient style={{ flex: 1 }}>
      {/* Floating Kannada glyphs over the gradient (white ~10%) */}
      <Watermark motif="glyphs" color={Colors.onPrimary} />

      {/* Hero */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Spacing.xxl,
          paddingTop: insets.top + Spacing.lg,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.notoSansKannada.bold,
            fontSize: moderateScale(64),
            lineHeight: moderateScale(104),
            color: Colors.onPrimary,
            textShadowColor: 'rgba(110,0,20,0.35)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 8,
          }}
          maxFontSizeMultiplier={1.1}
        >
          ಬೇ
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: moderateScale(6),
            marginTop: Spacing.sm,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(33),
              letterSpacing: -0.8,
              color: Colors.onPrimary,
            }}
            maxFontSizeMultiplier={1.1}
          >
            Kannada
          </Text>
          <Text
            style={{
              fontFamily: Fonts.notoSansKannada.bold,
              fontSize: moderateScale(35),
              color: Colors.secondaryContainer,
            }}
            maxFontSizeMultiplier={1.1}
          >
            ಬೇಕು
          </Text>
        </View>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(15.5),
            color: Colors.onPrimary,
            textAlign: 'center',
            lineHeight: moderateScale(23),
            marginTop: Spacing.md,
            maxWidth: moderateScale(280),
          }}
          maxFontSizeMultiplier={1.3}
        >
          {copy('onboardingWelcome')}
        </Text>

        {/* Three tilted white hook cards */}
        <View style={{ marginTop: Spacing.xxl, alignSelf: 'stretch', gap: moderateScale(14) }}>
          {HOOKS.map((hook) => (
            <View
              key={hook.title}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: moderateScale(14),
                backgroundColor: '#ffffff',
                borderRadius: Radius.chunky,
                paddingVertical: moderateScale(14),
                paddingHorizontal: moderateScale(18),
                borderBottomWidth: 5,
                borderBottomColor: 'rgba(74,0,14,0.45)',
                transform: [{ rotate: hook.rotate }],
              }}
            >
              <View
                style={{
                  width: moderateScale(44),
                  height: moderateScale(44),
                  borderRadius: Radius.tile,
                  backgroundColor: Colors.secondaryFixed,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <hook.Icon
                  size={moderateScale(22)}
                  color={Colors.onSecondaryContainer}
                  strokeWidth={2}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.baloo.bold,
                    fontSize: moderateScale(17),
                    color: Colors.onSurface,
                    letterSpacing: -0.2,
                  }}
                  maxFontSizeMultiplier={1.3}
                  numberOfLines={1}
                >
                  {hook.title}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.regular,
                    fontSize: moderateScale(13.5),
                    color: Colors.tertiary,
                    marginTop: moderateScale(1),
                  }}
                  maxFontSizeMultiplier={1.3}
                  numberOfLines={1}
                >
                  {hook.sub}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Actions sheet — white, rounded top */}
      <View
        style={{
          backgroundColor: '#ffffff',
          borderTopLeftRadius: moderateScale(28),
          borderTopRightRadius: moderateScale(28),
          paddingTop: moderateScale(26),
          paddingHorizontal: Spacing.xxl,
          paddingBottom: insets.bottom + Spacing.xxl,
          overflow: 'hidden',
        }}
      >
        {/* No progress indicator on this screen (audit finding 1). */}
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(25),
            color: Colors.onSurface,
            textAlign: 'center',
            letterSpacing: -0.3,
            lineHeight: moderateScale(33),
          }}
          maxFontSizeMultiplier={1.2}
        >
          Let&apos;s get you talking
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(14.5),
            color: Colors.tertiary,
            textAlign: 'center',
            marginTop: moderateScale(4),
            marginBottom: moderateScale(18),
          }}
          maxFontSizeMultiplier={1.3}
        >
          Free · no card · works offline
        </Text>
        <LipButton
          label="Get Started"
          onPress={() => router.push('/onboarding/name')}
          icon={Icons.forward}
        />
      </View>
    </BrandGradient>
  );
}
