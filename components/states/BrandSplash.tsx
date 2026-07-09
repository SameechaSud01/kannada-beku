import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { LoadingDots } from './LoadingDots';
import { useReducedMotion } from './useReducedMotion';

// Shared entrance easing — cubic-bezier(0.2, 0.9, 0.3, 1) (design_handoff_splash_screen).
const EASE = Easing.bezier(0.2, 0.9, 0.3, 1);
// Rises translate exactly 14px upward, per spec. Precompute — plain JS, never in a worklet.
const RISE_Y = moderateScale(14);
// The signature gold "lip": a hard, un-blurred 6px bottom edge under the glyph.
const LIP = moderateScale(6);

// Bengaluru landmark stickers — existing brand illustrations, anchored from the
// bottom. Negative offsets intentionally bleed the palace / town hall off-screen.
// aspectRatio is the source PNG's width/height so a fixed width yields the right height.
const STICKERS = [
  { src: require('../../assets/stickers/vidhana-soudha.png'), width: 200, left: 92, bottom: 66, rotate: '0deg', z: 3, ratio: 270 / 195 },
  { src: require('../../assets/stickers/mysore-palace.png'), width: 170, left: -32, bottom: 78, rotate: '-2deg', z: 1, ratio: 360 / 250 },
  { src: require('../../assets/stickers/town-hall.png'), width: 152, right: -30, bottom: 90, rotate: '2deg', z: 4, ratio: 320 / 258 },
  { src: require('../../assets/stickers/dosa.png'), width: 92, right: 20, bottom: 50, rotate: '-6deg', z: 2, ratio: 304 / 149 },
  { src: require('../../assets/stickers/filter-coffee.png'), width: 58, left: 36, bottom: 54, rotate: '9deg', z: 5, ratio: 151 / 145 },
] as const;

/**
 * Splash — "Rangoli × Skyline". Keeps the app on its cream canvas: the bare brand
 * glyph ಕ (carrying a hard gold lip) scales in over a row of Bengaluru landmark
 * stickers grounded by a warm shadow, then the "Kannada Beku" wordmark, Kannada
 * line, and gold loader dots rise in. Shown as an overlay during the boot/hydration
 * window (app/_layout.tsx). Reduce-motion → resting state, no dot pulse.
 */
export function BrandSplash() {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  // Glyph pop — scale 0.86 → 1 + fade, 640ms, delay 0.
  const pop = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    pop.value = withTiming(1, { duration: 640, easing: EASE });
  }, [reduced, pop]);
  const popStyle = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [{ scale: 0.86 + 0.14 * pop.value }],
  }));

  const glyph = moderateScale(132);
  // Noto's ಕ has a top flourish that overflows a 1.0 line box — give it headroom
  // so the crown isn't clipped (the extra space is split above/below, symmetric).
  const glyphLine = moderateScale(174);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.splashCreamTop, overflow: 'hidden' }]}>
      {/* Cream canvas — subtle top→foot warm gradient (approximates the radial). */}
      <LinearGradient
        colors={[Colors.splashCreamTop, Colors.splashCreamBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Warm ground shadow — grounds the stickers along the foot. */}
      <LinearGradient
        colors={['transparent', Colors.splashGroundMid, Colors.splashGroundLow]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: moderateScale(250) }}
      />

      {/* Sticker row — the whole group rises together (delay 260). */}
      <Rise reduced={reduced} delay={260} style={StyleSheet.absoluteFill}>
        {STICKERS.map((s, i) => (
          <Image
            key={i}
            source={s.src}
            resizeMode="contain"
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={{
              position: 'absolute',
              width: moderateScale(s.width),
              aspectRatio: s.ratio,
              bottom: moderateScale(s.bottom),
              ...('left' in s ? { left: moderateScale(s.left) } : { right: moderateScale(s.right) }),
              transform: [{ rotate: s.rotate }],
              zIndex: s.z,
              shadowColor: Colors.splashStickerShadow,
              shadowOffset: { width: 0, height: moderateScale(7) },
              shadowOpacity: 1,
              shadowRadius: moderateScale(12),
            }}
          />
        ))}
      </Rise>

      {/* Mark block — top-anchored stack, centered. paddingTop 196 clears the status bar. */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          alignItems: 'center',
          paddingTop: Math.max(moderateScale(196), insets.top + moderateScale(140)),
        }}
      >
        {/* Brand glyph ಕ with a hard gold lip — a gold copy offset 6px behind the red. */}
        <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, popStyle]}>
          <Text
            aria-hidden
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={[styles.glyph, { fontSize: glyph, lineHeight: glyphLine, position: 'absolute', top: LIP, color: Colors.secondaryContainer }]}
            maxFontSizeMultiplier={1}
          >
            ಕ
          </Text>
          <Text
            style={[styles.glyph, { fontSize: glyph, lineHeight: glyphLine, color: Colors.primaryContainer }]}
            maxFontSizeMultiplier={1}
          >
            ಕ
          </Text>
        </Animated.View>

        {/* Wordmark "Kannada Beku". */}
        <Rise reduced={reduced} delay={480}>
          <Text
            style={{
              fontFamily: Fonts.baloo.extrabold,
              fontSize: moderateScale(34),
              // Baloo Tamma 2 overflows a 1.0 line box (clips ascenders/descenders);
              // ~1.3 line-height is the project-wide fix for this face.
              lineHeight: moderateScale(44),
              color: Colors.onSurface,
              marginTop: moderateScale(22),
              includeFontPadding: false,
            }}
            maxFontSizeMultiplier={1.2}
          >
            Kannada <Text style={{ color: Colors.primaryContainer }}>Beku</Text>
          </Text>
        </Rise>

        {/* Kannada line — no letter-spacing, no uppercase (script rule). */}
        <Rise reduced={reduced} delay={620}>
          <Text
            style={{
              fontFamily: Fonts.notoSansKannada.regular,
              fontSize: moderateScale(14),
              color: Colors.inkFaint,
              marginTop: moderateScale(12),
            }}
            maxFontSizeMultiplier={1.2}
          >
            ಕನ್ನಡ ಬೇಕು
          </Text>
        </Rise>

        {/* Loader dots — 3 gold dots. */}
        <Rise reduced={reduced} delay={920} style={{ marginTop: moderateScale(28) }}>
          <LoadingDots color={Colors.secondaryContainer} />
        </Rise>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glyph: {
    fontFamily: Fonts.notoSansKannada.bold,
    includeFontPadding: false,
    textAlign: 'center',
  },
});

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
  const p = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    p.value = withDelay(delay, withTiming(1, { duration: 460, easing: EASE }));
  }, [reduced, delay, p]);
  const aStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: RISE_Y * (1 - p.value) }],
  }));

  if (reduced) return <View style={[{ alignItems: 'center' }, style]}>{children}</View>;
  return <Animated.View style={[{ alignItems: 'center' }, style, aStyle]}>{children}</Animated.View>;
}
