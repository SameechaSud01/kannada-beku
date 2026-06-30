import { Image, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius } from '../../constants/spacing';

/**
 * Tongue-position (place-of-articulation) diagrams for the Lesson 0 basics flow.
 * These bundled PNGs are UI chrome (not DB-sourced) — illustrative side-profiles
 * showing where the tongue contacts for a given sound. Used as step heroes on the
 * position-relevant steps: the open vowel (a) on Step 2 and the curled-vs-teeth
 * contrast (na/ta) on Step 4 (spec_lesson0_redesign.md — the deferred mouth
 * illustration, brought forward 2026-06-30 with owner sign-off).
 *
 * RN Image (not expo-image) on purpose: these are static bundled assets with no
 * network-cache benefit, and the repo has no expo-image dependency to add.
 */
const DIAGRAMS = {
  a: require('../../assets/tongue-diagrams/a.png'),
  ka: require('../../assets/tongue-diagrams/ka.png'),
  la: require('../../assets/tongue-diagrams/la.png'),
  na: require('../../assets/tongue-diagrams/na.png'),
  ta: require('../../assets/tongue-diagrams/ta.png'),
} as const;

export type MouthDiagramId = keyof typeof DIAGRAMS;

/** Native width/height ratio of each source, so we hold aspect without magic numbers. */
const ASPECT: Record<MouthDiagramId, number> = {
  a: 182 / 362,
  ka: 230 / 362,
  la: 230 / 362,
  na: 190 / 362,
  ta: 230 / 362,
};

export interface MouthDiagramProps {
  id: MouthDiagramId;
  /** Rendered height; width is derived from the source aspect ratio. */
  height: number;
  label?: string;
  caption?: string;
  tint?: string;
}

export function MouthDiagram({
  id,
  height,
  label,
  caption,
  tint = Colors.surfaceContainerLow,
}: MouthDiagramProps) {
  const width = Math.round(height * ASPECT[id]);
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          backgroundColor: tint,
          borderRadius: Radius.chunky,
          padding: moderateScale(6),
          overflow: 'hidden',
        }}
      >
        <Image
          source={DIAGRAMS[id]}
          style={{ width, height, borderRadius: Radius.tile }}
          resizeMode="contain"
          accessible
          accessibilityRole="image"
          accessibilityLabel={caption ?? label ?? 'Mouth-position diagram'}
        />
      </View>
      {label ? (
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(14),
            color: Colors.onSurface,
            marginTop: moderateScale(8),
          }}
          maxFontSizeMultiplier={1.3}
        >
          {label}
        </Text>
      ) : null}
      {caption ? (
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(12.5),
            color: Colors.tertiary,
            textAlign: 'center',
            marginTop: moderateScale(2),
            maxWidth: moderateScale(130),
          }}
          maxFontSizeMultiplier={1.3}
        >
          {caption}
        </Text>
      ) : null}
    </View>
  );
}
