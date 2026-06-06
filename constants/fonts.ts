import { moderateScale } from 'react-native-size-matters';

export const Fonts = {
  // Baloo Tamma 2 — Display: titles, big numbers, button labels
  // (playful redesign, DESIGN.md Amendment A). Also covers Kannada as an
  // optional rounded face — default Kannada stays Noto.
  baloo: {
    regular: 'BalooTamma2_400Regular',
    medium: 'BalooTamma2_500Medium',
    semibold: 'BalooTamma2_600SemiBold',
    bold: 'BalooTamma2_700Bold',
    extrabold: 'BalooTamma2_800ExtraBold',
  },

  // DM Sans — body/label chrome
  dmSans: {
    regular: 'DMSans_400Regular',
    medium: 'DMSans_500Medium',
    bold: 'DMSans_700Bold',
  },

  // Noto Sans Kannada — Kannada script ONLY
  notoSansKannada: {
    regular: 'NotoSansKannada_400Regular',
    medium: 'NotoSansKannada_500Medium',
    bold: 'NotoSansKannada_700Bold',
  },
};

/**
 * Codified type scale (DESIGN.md → Typography → Type scale, Amendment A).
 * Compact by design; headings tighten line-height (~1.05–1.2).
 * `min`/`max` ranges in DESIGN.md collapse here to a representative size —
 * components may pick a different size within the documented range when needed.
 */
export const TypeScale = {
  heroTitle:   { fontFamily: Fonts.baloo.extrabold, fontSize: moderateScale(30) },
  screenTitle: { fontFamily: Fonts.baloo.extrabold, fontSize: moderateScale(24) },
  cardHeading: { fontFamily: Fonts.baloo.bold,      fontSize: moderateScale(18) },
  bigNumber:   { fontFamily: Fonts.baloo.extrabold, fontSize: moderateScale(28) },
  buttonLabel: { fontFamily: Fonts.baloo.bold,      fontSize: moderateScale(16.5) },
  body:        { fontFamily: Fonts.dmSans.medium,   fontSize: moderateScale(14) },
  eyebrow:     { fontFamily: Fonts.dmSans.bold,     fontSize: moderateScale(11), letterSpacing: 1.4 },
  // Transliteration: brand sans (DM Sans), bold + full-strength foreground —
  // distinguished from the muted English gloss by weight + colour, not a separate
  // font (DESIGN.md Amendment A re-sign 2026-06-06; spec_ui_refinement.md Item 1).
  translit:    { fontFamily: Fonts.dmSans.bold,      fontSize: moderateScale(20) },
} as const;
