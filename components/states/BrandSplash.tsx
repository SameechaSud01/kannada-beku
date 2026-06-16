import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { LoadingDots } from './LoadingDots';
import { useReducedMotion } from './useReducedMotion';

const ICON = require('../../assets/icon.png');

/**
 * Splash C — Red brand reveal (st-splash.jsx SplashRedBrand). Immersive Mysore-red
 * radial with a faint dotted overlay + a giant 6%-opacity ಬೇಕು watermark; the real
 * app-icon tile scales in (0.86 → 1), white ಕನ್ನಡ + gold ಬೇಕು wordmark rise, gold
 * loader dots + tagline at the bottom. Shown as an overlay during the boot
 * hydration window (app/_layout.tsx). Reduce-motion → resting state.
 */
export function BrandSplash() {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  // App-icon tile scale-in.
  const scale = useSharedValue(reduced ? 1 : 0.86);
  useEffect(() => {
    if (reduced) return;
    scale.value = withTiming(1, { duration: 720, easing: Easing.bezier(0.2, 0.9, 0.3, 1) });
  }, [reduced, scale]);
  const tileStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const tile = moderateScale(150);
  const tileRadius = Math.round(tile * 0.225);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.primary, overflow: 'hidden' }]}>
      {/* Red brand background — brighter at top, deep maroon at the foot (approximates
          the design's upper-centre radial with a known-good linear gradient). */}
      <LinearGradient
        colors={[Colors.primaryContainer, Colors.primary, Colors.redLip]}
        locations={[0, 0.62, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Giant ಬೇಕು watermark, tilted, behind. */}
      <Text
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={{
          position: 'absolute',
          top: -moderateScale(20),
          right: -moderateScale(30),
          fontFamily: Fonts.notoSansKannada.bold,
          fontSize: moderateScale(200),
          lineHeight: moderateScale(220),
          color: 'rgba(255,255,255,0.06)',
          transform: [{ rotate: '-10deg' }],
        }}
        maxFontSizeMultiplier={1}
      >
        ಬೇಕು
      </Text>

      {/* Centred mark. */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={[
            {
              width: tile,
              height: tile,
              borderRadius: tileRadius,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(255,215,120,0.28)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 24 },
              shadowOpacity: 0.42,
              shadowRadius: 54,
              elevation: 18,
            },
            tileStyle,
          ]}
        >
          <Image source={ICON} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        </Animated.View>

        <Rise reduced={reduced} delay={620}>
          <Text
            style={{
              fontFamily: Fonts.notoSansKannada.bold,
              fontSize: moderateScale(34),
              color: Colors.onPrimary,
              marginTop: Spacing.xxl,
              lineHeight: moderateScale(44),
            }}
            maxFontSizeMultiplier={1.2}
          >
            ಕನ್ನಡ <Text style={{ color: Colors.goldBright }}>ಬೇಕು</Text>
          </Text>
        </Rise>

        <Rise reduced={reduced} delay={720}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(11),
              letterSpacing: 2.6,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
              marginTop: Spacing.md,
            }}
            maxFontSizeMultiplier={1.2}
          >
            Kannada  Beku
          </Text>
        </Rise>
      </View>

      {/* Loader dots + tagline. */}
      <Rise reduced={reduced} delay={1000} style={{ paddingBottom: insets.bottom + moderateScale(56) }}>
        <LoadingDots color={Colors.goldBright} />
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(12.5),
            color: 'rgba(255,255,255,0.82)',
            textAlign: 'center',
            marginTop: Spacing.lg,
            maxWidth: moderateScale(250),
          }}
          maxFontSizeMultiplier={1.3}
        >
          Learn Kannada. Belong in Bengaluru.
        </Text>
      </Rise>
    </View>
  );
}

function Rise({
  children,
  delay,
  reduced,
  style,
}: {
  children: React.ReactNode;
  delay: number;
  reduced: boolean;
  style?: object;
}) {
  if (reduced) return <View style={[{ alignItems: 'center' }, style]}>{children}</View>;
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(440)}
      style={[{ alignItems: 'center' }, style]}
    >
      {children}
    </Animated.View>
  );
}
