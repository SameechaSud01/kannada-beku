import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { BrandGradient } from '../../components/ui/BrandGradient';
import { Watermark } from '../../components/ui/Watermark';
import { LipButton } from '../../components/ui/LipButton';
import { useCopy } from '../../hooks/useCopy';

type Hook = { Icon: TablerIcon; title: string; sub: string; rotate: string };

const HOOKS: Hook[] = [
  {
    Icon: Icons.tabPractice,
    title: 'Speak from day one',
    sub: 'Real phrases, not grammar drills',
    rotate: '-3deg',
  },
  {
    Icon: Icons.emergency,
    title: 'Never get stuck',
    sub: 'Survival phrases · works offline',
    rotate: '2.5deg',
  },
  {
    Icon: Icons.streak,
    title: '5 minutes a day',
    sub: 'Small streaks, real progress',
    rotate: '-1.5deg',
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
            fontSize: moderateScale(72),
            lineHeight: moderateScale(116),
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
        <View style={{ marginTop: Spacing.xxl, alignSelf: 'stretch', gap: moderateScale(12) }}>
          {HOOKS.map((hook) => (
            <View
              key={hook.title}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: moderateScale(13),
                backgroundColor: '#ffffff',
                borderRadius: Radius.chunky,
                paddingVertical: moderateScale(13),
                paddingHorizontal: moderateScale(14),
                borderBottomWidth: 4,
                borderBottomColor: 'rgba(0,0,0,0.30)',
                transform: [{ rotate: hook.rotate }],
              }}
            >
              <View
                style={{
                  width: moderateScale(42),
                  height: moderateScale(42),
                  borderRadius: Radius.tile,
                  backgroundColor: Colors.secondaryFixed,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <hook.Icon size={moderateScale(22)} color={Colors.secondary} strokeWidth={2.1} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.baloo.bold,
                    fontSize: moderateScale(15.5),
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
                    fontFamily: Fonts.dmSans.medium,
                    fontSize: moderateScale(12.5),
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
          paddingTop: Spacing.xxl,
          paddingHorizontal: Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xxl,
          overflow: 'hidden',
        }}
      >
        <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
          <ProgressDots total={5} current={0} />
        </View>
        <Text
          style={{
            fontFamily: Fonts.baloo.extrabold,
            fontSize: moderateScale(22),
            color: Colors.onSurface,
            textAlign: 'center',
            letterSpacing: -0.3,
            lineHeight: moderateScale(30),
          }}
          maxFontSizeMultiplier={1.2}
        >
          Let&apos;s get you talking
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(13.5),
            color: Colors.tertiary,
            textAlign: 'center',
            marginTop: moderateScale(3),
            marginBottom: Spacing.xl,
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
