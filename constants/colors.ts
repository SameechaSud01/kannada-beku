export const Colors = {

  // ── Primary — deep Karnataka crimson ───────────────────
  primary:        '#BE0027',  // deep crimson red — CTA buttons, active states, headings
  primaryDark:    '#8D0020',  // pressed/dark variant
  primaryLight:   '#FFEBEE',  // light red surface — selected card bg, error bg

  // ── Secondary — warm amber gold ────────────────────────
  accent:         '#FFC107',  // amber gold — progress rings, badges, highlights
  accentDark:     '#E8A000',  // darker gold for text on light bg
  accentLight:    '#FFF8E1',  // gold tint surface — culture cards, XP cards

  // ── Backgrounds — warm parchment ───────────────────────
  pageBg:         '#F5F5DC',  // warm cream/parchment — ALL screen backgrounds
  cardBg:         '#FFFFFF',  // pure white — lesson cards, phrase cards
  cardAlt:        '#F0EFE0',  // slightly warm — secondary card bg, module cards
  cultureBg:      '#FFF8E1',  // warm gold tint — cultural insight cards

  // ── Borders ─────────────────────────────────────────────
  border:         '#E0DDD0',  // warm grey-beige — all card borders
  borderStrong:   '#C8C4B0',  // stronger border for emphasis

  // ── Text — always dark, warm-toned ──────────────────────
  textPrimary:    '#1A1008',  // near-black warm — all headings
  textBody:       '#2C2416',  // warm dark brown — body copy
  textSecondary:  '#6B5E4A',  // warm mid-brown — subtitles, meta
  textTertiary:   '#9C8E7A',  // warm light — captions, hints, inactive tabs
  textOnRed:      '#FFFFFF',  // white text on crimson bg
  textOnGold:     '#5D4000',  // dark brown text on gold bg

  // ── Semantic ─────────────────────────────────────────────
  success:        '#BE0027',  // use primary red for correct — no green
  error:          '#BE0027',  // same red, differentiate via shake animation
  locked:         '#C8C4B0',  // greyed out for locked content

  // ── NEVER USE ────────────────────────────────────────────
  // No green (#2E7D32) anywhere in the UI
  // No blue anywhere
  // No pure white (#FFFFFF) for backgrounds — always use pageBg
  // No cold grey borders — always warm-toned
};
