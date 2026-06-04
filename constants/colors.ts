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
  surface:                 '#fcfcfa', // root page background (near-white)
  surfaceContainerLowest:  '#ffffff', // glassmorphism only (70% opacity + blur)
  surfaceContainerLow:     '#f4f4f0', // secondary content zones, tab bar
  surfaceContainerHigh:    '#ececea', // selection chips bg, badge containers
  surfaceContainerHighest: '#e6e6e3', // interactive cards
  surfaceDim:              '#dcdcd9', // backdrop for lifted cards, locked state

  // ── Primary — Mysore Red (§2, §5) ──────────────────────
  primary:           '#91001b', // CTA gradient start, active states, focus underline
  primaryContainer:  '#be0027', // CTA gradient end
  onPrimary:         '#ffffff', // text on primary

  // ── Secondary — Turmeric Gold (§5, §6) ─────────────────
  secondary:            '#785900', // mandala fill, dark gold for text on light
  secondaryContainer:   '#fdc003', // secondary actions, success/encouragement
  onSecondaryContainer: '#6c5000', // text on secondary_container
  secondaryFixed:       '#ffdf9e', // selected chip bg, sun-drenched accent surfaces

  // ── Text — warm sandstone (§6) ─────────────────────────
  onSurface: '#1b1d0e', // primary text on light surfaces
  tertiary:  '#464646', // captions, labels, inactive tabs (never pure grey)

  // ── Outline / Ghost Border (§4) ────────────────────────
  outlineVariant: '#e5bdbb', // use at 15% opacity only — felt, not seen

  // ── Error states (MODALS §5) ───────────────────────────
  errorContainerLow: '#f3dada', // pale Mysore red — error-state card bg, toast icon bg

  // ── Playful redesign — additive tokens (DESIGN.md, 2026-06-04) ──
  // Strictly red / gold / deep-gold / warm-neutral. No blue/green/teal/coral.
  goldBright: '#ffd24d', // lighter gold highlight (gradients, hi state)
  goldLip:    '#c98a00', // button "lip" / ring on gold chunky buttons
  redLip:     '#6e0014', // deep maroon — bottom "lip" on red buttons; 4th Practice card
  textFaint:  '#908d76', // hints, locked labels (faintest text tier)
  hairline:   'rgba(27,29,14,0.08)', // top-bar border + card insets ("felt, not seen")
};
