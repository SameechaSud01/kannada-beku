import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { BrandGradient } from '../../components/ui/BrandGradient';
import { Watermark } from '../../components/ui/Watermark';
import { LipButton } from '../../components/ui/LipButton';
import { useCopy } from '../../hooks/useCopy';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const copy = useCopy();

  return (
    <BrandGradient style={{ flex: 1 }}>
      {/* Floating Kannada glyphs over the gradient */}
      <Watermark motif="glyphs" color={Colors.onPrimary} />

      {/* Soft gold bloom, top-right */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: moderateScale(-90),
          right: moderateScale(-70),
          width: moderateScale(260),
          height: moderateScale(260),
          borderRadius: moderateScale(130),
          backgroundColor: Colors.secondaryContainer,
          opacity: 0.18,
        }}
      />

      {/* Hero */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Spacing.xxl,
          paddingTop: insets.top,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.notoSansKannada.bold,
            fontSize: moderateScale(84),
            lineHeight: moderateScale(120),
            color: Colors.onPrimary,
            textShadowColor: 'rgba(110,0,20,0.35)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 8,
          }}
          maxFontSizeMultiplier={1.1}
        >
          ಬೇ
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: moderateScale(6), marginTop: Spacing.md }}>
          <Text
            style={{ fontFamily: Fonts.baloo.extrabold, fontSize: moderateScale(36), letterSpacing: -0.8, color: Colors.onPrimary }}
            maxFontSizeMultiplier={1.1}
          >
            Kannada
          </Text>
          <Text
            style={{ fontFamily: Fonts.notoSansKannada.bold, fontSize: moderateScale(38), color: Colors.secondaryContainer }}
            maxFontSizeMultiplier={1.1}
          >
            ಬೇ
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
      </View>

      {/* Actions sheet — near-white, rounded top */}
      <View
        style={{
          backgroundColor: Colors.surface,
          borderTopLeftRadius: moderateScale(28),
          borderTopRightRadius: moderateScale(28),
          paddingTop: Spacing.xxl,
          paddingHorizontal: Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xxl,
          overflow: 'hidden',
        }}
      >
        <Watermark motif="rangoli" />
        <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
          <ProgressDots total={6} current={0} />
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
