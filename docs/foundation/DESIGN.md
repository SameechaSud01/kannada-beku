---
doc: DESIGN
status: reviewed
owner: samee
last-reviewed: 2026-05-19
related:
  - SCOPE.md
  - INTERACTIONS.md
  - CONTENT.md
---

# Design system

> **Decision layer.** `[LOCKED]` means decided — do not reopen, resolve, or build the opposite; changing it needs an explicit spec PR plus owner sign-off. `[OPEN]` means genuinely undecided — safe to propose, do not implement until closed. A `TODO:` is a real task only if it does not contradict a `[LOCKED]` item; a TODO that contradicts a locked decision is stale text to delete, not a task. Code-vs-spec divergences are tracked in [CONTRADICTIONS.md](CONTRADICTIONS.md).

Spec-leads-code: the tables here are the source of truth. Component code reads from [constants/](../../constants/) and must match this doc.

## Design ethos

`[LOCKED]`

- **Living Manuscript palette** — Karnataka identity (state flag green/gold, Mysore red), Material 3 tonal logic.
- **No-Line rule** — tonal separation over borders. Cards lift via shadow + surface tonal change, not strokes.
- **Warm, never sterile** — sandstone text (`#1b1d0e`, `#464646`), never pure black or grey.
- **One script per font** — Kannada in Noto Serif Kannada, transliteration in Lora italic, all body/label chrome in DM Sans. Display headings, big numbers, and button labels use Baloo Tamma 2 (the playful display face). Never mix within a role. *(Amended 2026-06-04 per [spec_playful_redesign.md](../../spec_docs/Sameecha/spec_playful_redesign.md) Amendment A — owner sign-off.)*
- **No raw pixels** — every dimension wraps `moderateScale()` (or `scale()`/`verticalScale()`) from `react-native-size-matters`.

## Color tokens

`[LOCKED]` — matches [colors.ts](../../constants/colors.ts). **Never use a hex literal in a component — always `Colors.X`.**

### Surface stack
| Token | Hex | Use |
|---|---|---|
| `surface` | `#fbfbe2` | Root page background (cream). |
| `surfaceContainerLowest` | `#ffffff` | Glassmorphism only (70% opacity + blur). |
| `surfaceContainerLow` | `#f5f5dc` | Secondary content zones; tab bar. |
| `surfaceContainerHigh` | `#eaead1` | Selection chips, badge containers. |
| `surfaceContainerHighest` | `#e4e4cc` | Interactive cards. |
| `surfaceDim` | `#dbdcc3` | Backdrop for lifted cards; locked state. |

### Primary — Mysore Red
| Token | Hex | Use |
|---|---|---|
| `primary` | `#91001b` | CTA gradient start; active state; focus underline. |
| `primaryContainer` | `#be0027` | CTA gradient end; primary button fill. |
| `onPrimary` | `#ffffff` | Text on primary backgrounds. |

### Secondary — Turmeric Gold
| Token | Hex | Use |
|---|---|---|
| `secondary` | `#785900` | Mandala fill; dark gold text accents. |
| `secondaryContainer` | `#fdc003` | Secondary actions; success / encouragement. |
| `onSecondaryContainer` | `#6c5000` | Text on secondary container. |
| `secondaryFixed` | `#ffdf9e` | Selected chip background; sun-drenched accents. |

### Text — Warm Sandstone
| Token | Hex | Use |
|---|---|---|
| `onSurface` | `#1b1d0e` | Primary text on light surfaces. |
| `tertiary` | `#464646` | Captions, labels, inactive tabs. Never pure grey. |

### Outline
| Token | Hex | Use |
|---|---|---|
| `outlineVariant` | `#e5bdbb` | Subtle felt-shadow lines. **Use at 15 % opacity only.** |

### Error
| Token | Hex | Use |
|---|---|---|
| `errorContainerLow` | `#f3dada` | Pale Mysore red — error-state card bg, toast icon bg. Added for the modal/overlay system; see [MODALS](../../spec_docs/Sameecha/MODALS.md). |

### Playful-redesign additive tokens

`[LOCKED]` — added 2026-06-04 per [spec_playful_redesign.md](../../spec_docs/Sameecha/spec_playful_redesign.md) (additive; existing tokens unchanged). Strictly red / gold / deep-gold / warm-neutral — **no blue/green/teal/coral.**

| Token | Hex | Use |
|---|---|---|
| `goldBright` | `#ffd24d` | Lighter gold highlight (gradients, hi state). |
| `goldLip` | `#c98a00` | Button "lip" / ring on gold chunky buttons. |
| `redLip` | `#6e0014` | Deep maroon — bottom "lip" on red chunky buttons; 4th Practice card. |
| `textFaint` | `#908d76` | Hints, locked labels (faintest text tier). |
| `hairline` | `rgba(27,29,14,0.08)` | Top-bar border + card insets ("felt, not seen"). The redesign's one sanctioned hairline. |

**Brand gradient (the only gradient):** a single Mysore-red linear gradient, `primaryContainer → primary` rendered at ~152°, used **only** on the Home hook card, Profile avatar, Emergency header, and Auth background. Implemented via `expo-linear-gradient`. No multi-hue gradients.

**Why these tones, not Tailwind defaults:** the palette is a deliberate Karnataka identity statement (state flag colors + Mysore red + sandstone). Material 3 tonal logic expresses elevation without strokes (see No-Line rule).

## Spacing

`[LOCKED]` — matches [spacing.ts](../../constants/spacing.ts). All values are pre-wrapped in `moderateScale()`.

| Token | Base | Use |
|---|---|---|
| `xs` | 4 | Icon ↔ text gap; tight inline spacing. |
| `sm` | 8 | Default chip / button internal padding. |
| `md` | 12 | Card content padding. |
| `lg` | 16 | Section padding; screen edge gutters. |
| `xl` | 20 | Between major sections. |
| `xxl` | 24 | Hero spacing. |
| `xxxl` | 32 | Top-of-screen breathing room. |

## Radius

`[LOCKED]` — matches [spacing.ts](../../constants/spacing.ts).

| Token | Base | Use |
|---|---|---|
| `sm` | 8 | Chips; small badges. |
| `md` | 10 | Inputs; small buttons. |
| `lg` | 14 | Standard cards. |
| `xl` | 20 | Hero cards; lifted surfaces. |
| `full` | 999 | Pill buttons; circular avatars. |

## Typography

`[LOCKED]` — families and assignments. Defined in [fonts.ts](../../constants/fonts.ts). Three families, used strictly:

| Family | When |
|---|---|
| `Fonts.baloo` | **Display** — screen titles, hero titles, card headings, big numbers (streak, %, stats), and button labels. *Added 2026-06-04 (Amendment A).* |
| `Fonts.dmSans` | Body/label chrome — body text, sub-labels, uppercase eyebrows, settings rows, tab labels. |
| `Fonts.lora.italic` | Transliteration **only**. Never UI; never Kannada. |
| `Fonts.notoSansKannada` | Kannada script **only** (Baloo Tamma 2 offered as an optional rounded Kannada face — default stays Noto). |

**Why this split:** Baloo Tamma 2 is the single biggest driver of the "playful" feel — a rounded display face for headings and numbers that also renders Kannada, so script and UI feel like one family. Transliterations get a distinctive italic so they're visually parseable as a learning aid, not body copy. Kannada uses a sans family for crisper rendering at small reference sizes — the tertiary role in [spec_text_hierarchy.md](../../spec_docs/Sameecha/spec_text_hierarchy.md), and the Beginners' Guide glyph hero.

### Type scale

`[LOCKED]` — codified 2026-06-04 per [spec_playful_redesign.md](../../spec_docs/Sameecha/spec_playful_redesign.md) Amendment A. Compact by design (pulled down from earlier drafts); headings tighten line-height to ~1.05–1.2. Defined in [fonts.ts](../../constants/fonts.ts).

| Token | Size | Weight | Family | Use |
|---|---|---|---|---|
| `heroTitle` | `moderateScale(30)` | 800 | Baloo | Home hook hero ("Names"), celebration title |
| `screenTitle` | `moderateScale(24)` | 800 | Baloo | Screen titles ("Your journey", "Practice") |
| `cardHeading` | `moderateScale(16)`–`moderateScale(20)` | 700 | Baloo | Card titles, game names, phrase English |
| `bigNumber` | `moderateScale(16)`–`moderateScale(34)` | 800 | Baloo | Streak, ring %, stats |
| `buttonLabel` | `moderateScale(16.5)` | 700 | Baloo | CTA labels |
| `body` | `moderateScale(12.5)`–`moderateScale(15)` | 500–700 | DM Sans | Descriptions, subs |
| `eyebrow` | `moderateScale(10.5)`–`moderateScale(12)` | 800 | DM Sans | Uppercase, letter-spacing 1.2–1.6 |
| `translit` | `moderateScale(15)`–`moderateScale(42)` | 400 italic | Lora | Word/phrase teaching |
| `kannada` | `moderateScale(13.5)`–`moderateScale(88)` | 400–700 | Noto/Baloo | Muted reference + decorative watermark glyphs |

## Icons

`[LOCKED]` — all from `@tabler/icons-react-native` (outline weight). Mapped in [icons.ts](../../constants/icons.ts) — **never import Tabler directly in a component.**

### Rules

`[LOCKED]`

1. **One library** — `@tabler/icons-react-native`, outline weight, pinned in `package.json`. No alternate icon libraries.
2. **Never reach into the library directly from a component.** Every icon flows through the [icons.ts](../../constants/icons.ts) map so swaps stay one-line.
3. **No emoji glyphs in UI.** This covers pictographs (🔥 🎉 😊 📚 🎯), emoticons (😐 😔 😅), and dingbats used as standalone visual elements (✓ ✗). Replace with the corresponding entry from the icon map (e.g. `Icons.streak`, `Icons.ratingEasy`, `Icons.correct`, `Icons.wrong`). Plain typographical arrows inside CTA text (`←`, `→`, `▸`) are allowed as text decoration and are not subject to this rule.
4. **No hand-drawn inline SVGs for iconography.** Illustrations and brand marks are not icons and sit outside this rule.

**Why:** the icon system is the only path through which visual symbols enter the UI. Bypassing it (via emoji or one-off SVG) re-fragments the symbol vocabulary, breaks the size cap below, and makes future swaps a search-and-replace across components instead of a one-line change.

### Sizes
| Where | Size |
|---|---|
| Tab bar | 19 pt |
| Inline / list / chip | 16–21 pt |
| Decorative max | 24 pt |
| Minimum allowed | 11 pt |

The decorative cap applies to icons that replaced ex-emoji hero glyphs (e.g. end-of-game result screens) — they render smaller than the emoji they replaced. That's intentional.

### Icon map
See [icons.ts](../../constants/icons.ts) for the full map. Categories: tab bar, global, practice games, emergency, settings, lesson runner.

## Shadow / elevation

`[OPEN]` — a global elevation scale is still unspecced. Modal-scoped shadows shipped in [constants/shadows.ts](../../constants/shadows.ts) per the [MODALS](../../spec_docs/Sameecha/MODALS.md) spec.

### Shipped (modal scope) — `[PROPOSED]` per MODALS §5

| Token | Use |
|---|---|
| `Shadows.modal` | Dialog & sheet drop shadow. `{ color #000, opacity 0.22, radius 60, offset (0, 24) }` |
| `Shadows.toastDark` | Success-top toast. `{ color #000, opacity 0.30, radius 30, offset (0, 10) }` |
| `Shadows.toastSoft` | Error-bottom toast. `{ color #000, opacity 0.18, radius 30, offset (0, 10) }` |
| `Shadows.medallion` | Streak takeover medallion. `{ color secondary, opacity 0.20, radius 22, offset (0, 16) }` |

> **TODO (still open):** Global `e0`–`e3` elevation scale for non-modal surfaces. Shadow values are still inlined elsewhere (e.g. `shadowOpacity: 0.6, shadowRadius: 6`).

## Components

Anatomy + props + tokens used. Every reusable component lives here.

### `TabBar`

`[LOCKED]` — matches [components/ui/TabBar.tsx](../../components/ui/TabBar.tsx). Custom Expo Router tab bar (replaces default). *Amended 2026-06-04 per [spec_playful_redesign.md](../../spec_docs/Sameecha/spec_playful_redesign.md) Amendment B — owner sign-off: floating icon-only pill, no labels.*

| Property | Value |
|---|---|
| Shape | Floating rounded-`full` pill, centered, floats ~24 from bottom (safe-area aware) |
| Labels | **None** (icon-only) |
| Pill background | `surfaceContainerLow` |
| Active tab | Solid `primaryContainer` circle, `onPrimary` icon, soft red shadow |
| Inactive icon color | `tertiary` |
| Icon size | 19 pt |
| Border | None (No-Line rule) |
| Hidden on | lesson / emergency / auth routes (outside `(tabs)`) |
| Tabs | Four — Home / Learn / Practice / Profile (unchanged; NAVIGATION not affected) |

### `ProgressDots`

`[LOCKED]` — matches [components/onboarding/ProgressDots.tsx](../../components/onboarding/ProgressDots.tsx). Migration TODOs inside the table are `[OPEN]`.

| Property | Value |
|---|---|
| Current dot | 28 × 8 |
| Other dots | 8 × 8 |
| Gap | `Spacing.sm` |
| Current color | `primaryContainer` |
| Other color | `#E0DDD0` ← **TODO:** move to token |
| Radius | 4 |

### `OptionCard`

`[LOCKED]` — matches [components/onboarding/OptionCard.tsx](../../components/onboarding/OptionCard.tsx). Migration TODOs inside the table are `[OPEN]`.

| Property | Value |
|---|---|
| Radius | 16 ← TODO: align with `Radius.xl` (20) |
| Padding | 18 ← TODO: align with `Spacing.lg` / `xl` |
| Selected bg | `#FFF5F5` ← **TODO:** move to token (e.g. `primaryContainerLow`) |
| Unselected bg | `#FFFFFF` |
| Selected border | `primaryContainer`, 2 pt |
| Unselected border | `#E0DDD0`, 2 pt ← **TODO:** move to token |
| Pressed scale | 0.97 |
| Selection mark | Inline SVG checkmark, white 3 pt stroke |

### Lesson runner components

`[OPEN]`

> **TODO:** spec each. Visual anatomy, tokens used, animation cross-ref to [INTERACTIONS.md](INTERACTIONS.md).
> - `ScenarioPhase`
> - `IntakePhase` + `PhraseDisplay`, `AudioControls`, `SayItControl`, `IntakeFooter`
> - `DrillPhase` + `ListenPickItem`, `TranslatePickItem`, `FillBlankItem`
> - `OutputPhase` + `SpokenResponse`, `TypedResponse`
> - `DoneCard`

### Game components

`[OPEN]`

> **TODO:** spec each game UI as it gets wired.
> - `DictationGame` ([src/games/dictation/](../../src/games/dictation/))
> - `OppositeGame` ([src/games/opposites/](../../src/games/opposites/))

### Modals & overlays

`[PROPOSED]` — full spec lives in [spec_docs/Sameecha/MODALS.md](../../spec_docs/Sameecha/MODALS.md). Owns the four overlay shapes (centered dialog, bottom sheet, full-screen takeover, toast), the `ModalHost` + `ToastHost` providers, and 9 modal instances. Implementation in [components/modals/](../../components/modals/). Pending promotion to `[LOCKED]` after sign-off.

## Open questions / drift

`[OPEN]`

- README and [.claude/CLAUDE.md](../.claude/CLAUDE.md) still mention "NativeWind". NativeWind was ripped out (commit `818e1ba`); we now use inline styles + tokens. Update both.
- `OptionCard` and `ProgressDots` use hex literals — migrate to tokens.
- Type scale codified 2026-06-04 (Amendment A) — `fonts.ts` token group still owed in code (tracked by CONTRADICTIONS C12).
- Shadow tokens not codified — see TODO above.
