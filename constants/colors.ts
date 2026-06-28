/**
 * Living Manuscript token palette (Material 3 tonal naming).
 * Source of truth: DESIGN.md.
 *
 * Surface stack flows light → dark: surface → low → high → highest → dim.
 * Use surface shifts (not borders) to section content (§2 No-Line Rule).
 */
export const Colors = {
  // ── Surface tonal stack (§2, §4) ───────────────────────
  // Near-white neutral ramp (2026-06-04, spec_playful_redesign Amendment D —
  // owner sign-off). Faint warm whisper keeps it off clinical white.
  surface: '#fcfcfa', // root page background (near-white)
  surfaceContainerLowest: '#ffffff', // glassmorphism only (70% opacity + blur)
  surfaceContainerLow: '#f4f4f0', // secondary content zones, tab bar
  surfaceContainerHigh: '#ececea', // selection chips bg, badge containers
  surfaceContainerHighest: '#e6e6e3', // interactive cards
  surfaceDim: '#dcdcd9', // backdrop for lifted cards, locked state

  // ── Primary — Mysore Red (§2, §5) ──────────────────────
  primary: '#91001b', // CTA gradient start, active states, focus underline
  primaryContainer: '#be0027', // CTA gradient end
  onPrimary: '#ffffff', // text on primary

  // ── Secondary — Turmeric Gold (§5, §6) ─────────────────
  secondary: '#785900', // mandala fill, dark gold for text on light
  secondaryContainer: '#fdc003', // secondary actions, success/encouragement
  onSecondaryContainer: '#6c5000', // text on secondary_container
  secondaryFixed: '#ffdf9e', // selected chip bg, sun-drenched accent surfaces

  // ── Text — warm sandstone (§6) ─────────────────────────
  onSurface: '#1b1d0e', // primary text on light surfaces
  tertiary: '#464646', // captions, labels, inactive tabs (never pure grey)

  // ── Outline / Ghost Border (§4) ────────────────────────
  outlineVariant: '#e5bdbb', // use at 15% opacity only — felt, not seen

  // ── Error states (MODALS §5) ───────────────────────────
  errorContainerLow: '#f3dada', // pale Mysore red — error-state card bg, toast icon bg

  // ── Success — answer correctness (owner-approved exception, 2026-06-28) ──
  // Green/red carry right-vs-wrong in practice feedback only; gold proved
  // ambiguous against the gold "encouragement" accent. Scoped to lesson
  // answer feedback — the rest of the app stays warm-only.
  successContainer: '#4e9a2f', // green fill (correct check circle)
  successContainerLow: '#dcefc6', // pale green — correct option / banner bg
  onSuccessContainer: '#356016', // dark green text on pale green
  successLip: '#3c7a22', // green chunky lip / border
  onSuccess: '#ffffff', // text/icon on a successContainer fill

  // ── Playful redesign — additive tokens (DESIGN.md, 2026-06-04) ──
  // Strictly red / gold / deep-gold / warm-neutral. No blue/green/teal/coral.
  goldBright: '#ffd24d', // lighter gold highlight (gradients, hi state)
  goldLip: '#c98a00', // button "lip" / ring on gold chunky buttons
  redLip: '#6e0014', // deep maroon — bottom "lip" on red buttons; 4th Practice card
  redLipDeep: '#4a000e', // deepest maroon — Conversations card lip (chunky_v3)
  textFaint: '#908d76', // hints, locked labels (faintest text tier)
  hairline: 'rgba(27,29,14,0.08)', // top-bar border + card insets ("felt, not seen")
  cardLip: 'rgba(27,29,14,0.18)', // chunky lip for white/neutral cards (reads on cream; chunky_v3)

  // ── Chunky kit v3 — warm cream surfaces (2026-06-13) ──────────
  // Warmer than the near-white ramp above; used as the chunky-kit page bg.
  surfaceCream: '#faf6ea', // root page background (chunky tabs/flows)
  surfaceCreamLow: '#f3ecd9', // recessed zones / page bg behind cards

  // ── Functional accents — warm-only state semantics (additive 2026-06-13) ──
  // Burnt orange + tan-brown extend the red / gold / neutral system without
  // breaking the "no blue/green/teal/coral" rule — both read as warm.
  warningContainer: '#d97b3a', // burnt orange — locked / warning states
  interactiveSecondary: '#b8956a', // warm tan-brown — secondary interactive
  // Surfaces/text paired with the new accents (derived once, used app-wide).
  warningContainerLow: '#f7e4d3', // ≈ warningContainer @ ~14% on surface — caution/lock tile bg
  onWarning: '#3a1d07', // ink-brown for text/icons ON a warningContainer fill
  interactiveSecondaryLip: '#7e6440', // ≈ interactiveSecondary @ 72% + black — tan lip
  // Disabled state reuses surfaceContainerHighest (fill) + textFaint (label) — no new token.
};
