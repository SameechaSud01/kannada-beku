import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

export type WatermarkMotif = 'rangoli' | 'glyphs' | 'rays' | 'kolamGrid';

export type WatermarkProps = {
  motif?: WatermarkMotif;
  on?: boolean;
  /** Motif tint. Defaults to turmeric gold. */
  color?: string;
};

// Decorative Kannada glyphs for the "glyphs" motif (alphabet confetti).
const GLYPHS = ['ಕ', 'ನ', 'ಡ', 'ಬಾ', 'ಮ', 'ಹ', 'ಸ', 'ಲ', 'ಗ', 'ರ', 'ತ', 'ಪ', 'ಎ', 'ಜ'];

/**
 * The faint motif layer that sits behind content on every surface
 * (spec_playful_redesign §Watermark, ~5–8% opacity). Absolutely fills its
 * parent and ignores touches — render it as the first child of a relatively
 * positioned container, with real content layered after it.
 *
 * Default motif is Rangoli (a fine grid of gold dots). Global on by default.
 */
export function Watermark({ motif = 'rangoli', on = true, color = Colors.secondaryContainer }: WatermarkProps) {
  // Deterministic scatter for the glyph motif (stable across renders).
  const glyphs = useMemo(() => {
    let s = 11;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: 16 }).map((_, i) => ({
      g: GLYPHS[i % GLYPHS.length],
      left: `${rnd() * 100}%`,
      top: `${rnd() * 100}%`,
      size: moderateScale(20 + rnd() * 30),
      rotate: `${-20 + rnd() * 40}deg`,
    }));
  }, []);

  if (!on) return null;

  if (motif === 'glyphs') {
    return (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden', opacity: 0.05 }]}>
        {glyphs.map((it, i) => (
          <Text
            key={i}
            style={{
              position: 'absolute',
              left: it.left as `${number}%`,
              top: it.top as `${number}%`,
              fontFamily: Fonts.notoSansKannada.medium,
              fontSize: it.size,
              color,
              transform: [{ rotate: it.rotate }],
            }}
          >
            {it.g}
          </Text>
        ))}
      </View>
    );
  }

  if (motif === 'rays') {
    // Soft concentric arcs emanating from the top-right corner.
    return (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden', opacity: 0.08 }]}>
        <Svg width="100%" height="100%">
          {[60, 120, 180, 240, 300, 360, 420].map((radius) => (
            <Circle key={radius} cx="100%" cy={0} r={radius} stroke={color} strokeWidth={1.5} fill="none" />
          ))}
        </Svg>
      </View>
    );
  }

  if (motif === 'kolamGrid') {
    // Chunky kit v3 — a faint ink kolam dot grid over the cream page bg
    // (dots rgba(27,29,14,0.05), 1.2px radius, 24px grid). The dot colour
    // carries its own alpha, so the layer opacity stays at 1.
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="kolamGrid" width={24} height={24} patternUnits="userSpaceOnUse">
              <Circle cx={1.2} cy={1.2} r={1.2} fill="rgba(27,29,14,0.05)" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#kolamGrid)" />
        </Svg>
      </View>
    );
  }

  // Rangoli (default) — a fine grid of gold dots.
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: 0.07 }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="rangoli" width={22} height={22} patternUnits="userSpaceOnUse">
            <Circle cx={1.4} cy={1.4} r={1.4} fill={color} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#rangoli)" />
      </Svg>
    </View>
  );
}
