---
doc: SPEC_PLAYFUL_REDESIGN
status: locked
owner: samee
last-reviewed: 2026-06-04
sign-off:
  - 2026-06-04 — owner approved Amendments A (Baloo display font), B (floating icon-only TabBar), and C (Emergency English-first, option C-1). Foundation docs amended + CONTRADICTIONS C14 opened. Implementation isolated on branch `app_redesign`. Cadence: phase-by-phase with review.
related:
  - ../../docs/foundation/DESIGN.md
  - ../../docs/foundation/INTERACTIONS.md
  - ../../docs/foundation/NAVIGATION.md
  - ../../docs/foundation/STATE.md
  - ./spec_text_hierarchy.md
  - ./MODALS.md
  - ./playful_redesign_handoff/README.md
---

# Playful Redesign — visual + interaction refresh

A **visual + interaction refresh** of the whole app. It keeps the information
architecture, routes, navigation graph, copy, and the lesson phase machine
**exactly as they are today**, and changes only the *feel*: warmer, more
playful, inside the existing Mysore-red + turmeric-gold "Living Manuscript"
brand. Personality comes from type, colour, motif, and motion — **no mascot**.

This spec is the **contract**. The raw material is the high-fidelity HTML/React
prototype in [`playful_redesign_handoff/`](playful_redesign_handoff/README.md)
(open `design-reference/Kannada Baa - Playful.html` in a browser; read
`pl-system.jsx` for the source-of-truth token values). The prototype is a
*reference, not production code to copy* — the work is to recreate it inside the
existing Expo / React Native codebase using its established patterns
(expo-router, `Colors`/`Fonts`/`Shadows` tokens, `@tabler/icons-react-native`,
`react-native-reanimated`, `react-native-svg`, `expo-speech`, the Zustand stores,
React Query, and the `ModalHost`/`ToastHost` overlay system).

> **Signed off 2026-06-04 — `[LOCKED]`.** The three locked-decision conflicts
> (Amendments A/B/C below) were approved by the owner: A (Baloo display font),
> B (floating icon-only TabBar), C (Emergency English-first, option C-1). The
> foundation docs are amended and CONTRADICTIONS C14 is open. Phase 0 is done;
> Phases 1–8 are now buildable. All work is isolated on branch `app_redesign`.

---

## 1. Decision summary

| Question | Answer | Lock |
|---|---|---|
| Does IA / routes / navigation graph change? | No. Same route tree, same four tabs, same journeys J1–J4. | `[LOCKED]` (inherits NAVIGATION) |
| Does copy or the lesson phase machine change? | No. `useLessonRunner` phases and all strings are verbatim. | `[LOCKED]` (inherits CONTENT / `useLessonRunner`) |
| Does domain state change? | No new domain state. Only UI-only state (active celebration, fun-fact banner index/dismiss, watermark motif + on/off). | `[OPEN]` |
| New dependencies? | `expo-linear-gradient`, `@expo-google-fonts/baloo-tamma-2`; optional `expo-haptics`. | `[OPEN]` — owner approves deps |
| Display typeface (Baloo Tamma 2)? | Adds a 4th font family for titles / big numbers / button labels. **Contradicts locked typography.** | `[OPEN]` — **needs amendment A** |
| Tab bar shape? | Icon-only floating red-pill bar (active = solid red circle). **Contradicts locked TabBar.** | `[OPEN]` — **needs amendment B** |
| Emergency text hierarchy? | English-first (English hero → transliteration → Kannada). **Contradicts locked text hierarchy.** | `[OPEN]` — **needs amendment C** |
| Celebration / sparkle glyphs? | Use the `Icons` map (no emoji/dingbats). Plain `→`/`▸` arrows in CTA text stay. | `[LOCKED]` (inherits DESIGN icon rule) |
| Animation library? | Adopt `react-native-reanimated` for the redesign's motion (installed, currently unused). | `[OPEN]` — closes INTERACTIONS TODO |
| Type scale? | Codify the prototype's compact scale in `constants/fonts.ts`. | `[OPEN]` — closes DESIGN type-scale TODO |
| Celebration overlay? | One shared component (lesson / streak / level), built **on the existing `ModalHost` + `Takeover`** infra — reuse, don't duplicate `StreakMilestoneTakeover`. | `[OPEN]` |
| Watermark motif layer? | Faint motif behind content; user-selectable (default *Rangoli*), global on/off (default on). | `[OPEN]` |

---

## 2. Foundation-doc amendments required (land in the same PR as the code)

This spec **cannot ship** until these locked decisions are amended with owner
sign-off. Each is a genuine conflict, not a TODO. A new
[CONTRADICTIONS.md](../../docs/foundation/CONTRADICTIONS.md) entry (**C14**)
tracks the gap between this spec landing and the code shipping.

### Amendment A — Typography (DESIGN.md ethos + Typography table, both `[UNLOCKED]`)

- **Locked today:** "One script per font — Kannada in Noto Serif Kannada,
  transliteration in Lora italic, **everything else DM Sans**. Never mix." The
  families table assigns `Fonts.dmSans` to *all UI chrome*.
- **Redesign wants:** a **4th family, Baloo Tamma 2** (700/800) for screen
  titles, hero titles, card headings, big numbers, and button labels — and
  offers Baloo as an *optional* Kannada face. This is "the single biggest driver
  of the playful feel."
- **Amendment:** DESIGN.md ethos bullet + Typography families table gain a
  **Display** role (`Fonts.baloo`), scoped to titles / big numbers / button
  labels only. Body, labels, eyebrows, settings rows stay DM Sans;
  transliteration stays Lora italic; Kannada defaults to Noto. The "everything
  else DM Sans" wording becomes "all body/label chrome DM Sans; display headings
  Baloo."
- **Also closes:** the DESIGN.md *type scale* `[OPEN]` TODO — codify the
  prototype's compact scale (see handoff README → Typography → Type scale).

### Amendment B — TabBar (DESIGN.md § Components → `TabBar`, `[UNLOCKED]`)

- **Locked today:** background `surfaceContainerLow`, full-width, **labels
  shown**, active icon `primaryContainer`, inactive `tertiary`, no border, 19pt
  icons.
- **Redesign wants:** an **icon-only** (no labels), **floating rounded-999 pill**
  that floats ~24 from the bottom; active tab = **solid red circle, white icon,
  soft red shadow**; inactive = faint icon. Still four tabs, same routes, hidden
  on lesson/emergency/auth (already outside `(tabs)`).
- **Amendment:** rewrite the DESIGN.md `TabBar` row to the floating-pill spec.
  Icon size stays 19pt; `@tabler/icons` via `Icons` map unchanged. Implemented in
  [components/ui/TabBar.tsx](../../components/ui/TabBar.tsx) (the custom `tabBar`
  already exists; this restyles it and drops the label `Text`).
- **No NAVIGATION change** — routes, tab count, and gating are untouched.

### Amendment C — Emergency text hierarchy (spec_text_hierarchy.md §1–§3, `[LOCKED]`)

- **Locked today:** *every* surface showing {transliteration, English, Kannada}
  renders **transliteration primary**, English second, Kannada third — Emergency
  rows explicitly included (§2 row "Emergency screen rows → tr / en / kn").
- **Redesign wants:** Emergency is **English-first** — big English (Baloo 20) is
  the hero, then transliteration (Lora italic, red, "say it like this"), then
  small muted Kannada. Rationale: a panicking non-speaker scans the *meaning*
  fastest.
- **This is a direct contradiction of a locked spec_doc and needs an explicit
  owner decision.** Options:
  - **C-1 (carve-out):** amend spec_text_hierarchy.md §2/§4 to add an
    **Emergency exception** (English-first), the same way spec_beginners_guide.md
    carved out a Kannada-first exception for the guide. Rationale: Emergency is a
    panic *tool*, not a learning surface — meaning-first beats pronunciation-first.
  - **C-2 (drop it):** keep Emergency transliteration-first per the lock; the
    redesign restyles Emergency visually but preserves the locked hierarchy.
- **Default proposal:** C-1, because the redesign's argument (meaning-first under
  stress) is sound and Emergency is not a vocabulary-acquisition surface. **Owner
  must confirm before this screen is built.**

### Minor / additive (no lock flip, document in DESIGN.md)

- **Colour tokens** (`[UNLOCKED]`, "extend, don't replace"): add the redesign's
  additive tokens to `constants/colors.ts` and the DESIGN.md colour table —
  gold-bright, gold-lip, red-lip/deep-maroon, faint text (`#908d76`), and the
  gradient pair. Prefer existing brand tokens where they match (turmeric
  `#fdc003`, deep gold `#785900` already exist). **No blue/green/teal/coral.**
- **Brand gradient direction:** DESIGN.md says CTA gradient `primary →
  primaryContainer`; the redesign renders it `primaryContainer → primary` at
  152°. Cosmetic — document the single brand gradient and its direction.
- **Icon rule (`[LOCKED]`, no flip):** the prototype's 👋 greeting emoji and
  ✦/✓ celebration dingbats are **not** permitted as standalone glyphs. Replace
  with `Icons` map entries (`Icons.correct`, a sparkle/star icon, etc.) or drop.
  Plain `→`/`▸` inside CTA text are allowed and stay.

---

## 3. Scope

### In
- **Tokens:** extend `constants/colors.ts` (additive tokens), `constants/fonts.ts`
  (`baloo` group + codified type scale), and reuse/extend `constants/shadows.ts`.
- **Fonts:** add `@expo-google-fonts/baloo-tamma-2` to the `useFonts(...)` call in
  [app/_layout.tsx](../../app/_layout.tsx).
- **Deps:** add `expo-linear-gradient`; optional `expo-haptics`.
- **New shared components** under `components/ui/`: `LipButton` (chunky hard-edge
  button), `BrandGradient` wrapper, `Watermark` layer, `AudioOrb` (ping ring),
  `ProgressRing` (SVG). A shared `Celebration` overlay built on the existing
  `ModalHost`/`Takeover` system.
- **Restyle (no behaviour change)** of: Home, Learn, Practice, Profile, the
  lesson runner phases + `DoneCard`, Emergency, and the Auth/Welcome sample.
  Restyle the floating-pill `TabBar`.
- **Micro-interactions** (reanimated): correct-answer pop + sparkles + bounce,
  wrong-answer shake (already locked at 200ms — reuse), lip-button press,
  audio-orb ping loop, "stuck" card pulse, page transitions, celebration overlay.
- **Watermark system:** Rangoli (default) / Glyphs / Rays, global toggle (on).
- **Optional:** Discord-style loading screen (bobbing ಬಾ + bar + rotating
  fun-fact tip) for route/lesson loads.

### Out
- Information architecture, routes, navigation graph, auth/onboarding gating.
- All copy/strings and the lesson phase machine + practice/scoring logic.
- Audio/TTS, reminders/notifications, the Supabase/React Query data layer.
- Replacing the token approach — **extend, don't replace** Colors/Fonts/Shadows/Spacing.
- Any new domain state (streak, progress %, words learned, lessons done all reuse
  existing stores/hooks).

---

## 4. Per-screen targets

The fine-grained visual detail (exact sizes, copy, layout order, accent logic)
lives in the **handoff README** and `pl-*.jsx` files — that is the visual
contract. This table is the codebase mapping only.

| Prototype | Target file | Notes |
|---|---|---|
| `pl-system` tokens | `constants/{colors,fonts,shadows}.ts` | Source-of-truth values in `pl-system.jsx`. |
| `pl-home` Home | [app/(tabs)/index.tsx](../../app/%28tabs%29/index.tsx) | Hook card (gradient), progress ring, "Stuck right now?" card, quick links, fun-fact banner (demoted), streak pill. |
| `pl-home` Learn / Practice / Profile | [learn.tsx](../../app/%28tabs%29/learn.tsx) · [practice.tsx](../../app/%28tabs%29/practice.tsx) · [profile.tsx](../../app/%28tabs%29/profile.tsx) | Restyle only; IA intact. |
| `pl-home` BottomNav | [components/ui/TabBar.tsx](../../components/ui/TabBar.tsx) | **Amendment B.** |
| `pl-lesson` | [app/lesson/[id].tsx](../../app/lesson/%5Bid%5D.tsx) + [components/lesson/*](../../components/lesson/) | Phase machine unchanged; restyle each phase + `DoneCard`. |
| `pl-emergency` | [app/emergency.tsx](../../app/emergency.tsx) | **Amendment C** (English-first, pending sign-off). |
| `pl-auth` | [app/(auth)/login.tsx](../../app/%28auth%29/login.tsx) and/or [app/onboarding/welcome.tsx](../../app/onboarding/welcome.tsx) | Gradient sample treatment. |
| Celebration / Watermark / LipButton | new under [components/ui/](../../components/ui/) | Celebration reuses `ModalHost`/`Takeover`. |

---

## 5. Acceptance criteria

`[OPEN]` — promote to `[LOCKED]` on owner sign-off of amendments A/B/C.

**Foundation conformance**
- DESIGN.md amendments A & B and the spec_text_hierarchy.md decision (C-1 or C-2)
  are signed off and edited **in the same PR** that ships the corresponding code.
- CONTRADICTIONS.md C14 is opened when this spec is promoted and closed when the
  code is verified end-to-end.
- No hex literal in any component — every colour resolves through `Colors`.
- No raw pixels — every dimension wraps `moderateScale`/`scale`/`verticalScale`.
- No emoji or dingbat used as a standalone visual glyph — all symbols flow
  through the `Icons` map.

**Behaviour preserved**
- `useLessonRunner` phase order and all copy are byte-for-byte unchanged.
- Routes, tab count, gating, and journeys J1–J4 are unchanged.
- Streak / progress % / words-learned / lessons-done all read from the existing
  stores/hooks; no new domain state persisted.

**Visual / interaction**
- Tab bar is icon-only, floating, active = solid red circle; hidden on
  lesson/emergency/auth routes.
- The single brand gradient appears only on Home hook, Profile avatar, Emergency
  header, and Auth background.
- Correct answer: gold wash + check pop + sparkles + bounce; wrong answer: red
  wash + shake (reusing the locked 200ms shake). Auto-advance timings per handoff.
- Celebration overlay renders all three variants (lesson/streak/level) via the
  shared component; honours a reduced-motion setting (end-state, no loops).
- Verified visually on **iPhone SE (375×667)** and a larger device per the
  CLAUDE.md workflow (screenshot every changed screen).

---

## 6. Implementation phases

Sequenced so the foundation (deps → tokens → primitives) lands before screens,
and the sign-off-gated screens are isolated. Each phase ends with a build + a
screenshot pass on iPhone SE.

**Phase 0 — Sign-off + spec promotion** *(blocks everything below)*
- Owner decides amendments A (Baloo), B (TabBar), and C (Emergency C-1 vs C-2).
- Edit DESIGN.md (typography + type scale + TabBar + colour tokens) and, per the
  C decision, spec_text_hierarchy.md. Open CONTRADICTIONS C14.
- Promote this spec from `draft` → `[LOCKED]`.
- **Verify:** foundation docs reflect the decisions; this section's amendments
  are no longer "pending."

**Phase 1 — Dependencies + tokens** *(no UI yet)*
- Add `expo-linear-gradient`, `@expo-google-fonts/baloo-tamma-2` (and optional
  `expo-haptics`); run the app to confirm it still builds.
- Extend `constants/colors.ts` (additive tokens), `constants/fonts.ts` (`baloo`
  group + type scale), `constants/shadows.ts` as needed.
- Load Baloo in the `useFonts(...)` call in `app/_layout.tsx`.
- **Verify:** app boots, fonts load, no token regressions; existing screens look
  unchanged (we haven't restyled yet).

**Phase 2 — Shared primitives** *(`components/ui/`)*
- `BrandGradient`, `LipButton`, `ProgressRing`, `AudioOrb`, `Watermark`.
- Restyle `TabBar` to the floating icon-only pill (Amendment B).
- **Verify:** primitives render in isolation; tab bar correct on SE + large,
  hidden on non-tab routes; touch targets ≥44pt.

**Phase 3 — Celebration overlay** *(on `ModalHost`/`Takeover`)*
- One shared `Celebration` (lesson / streak / level) reusing the existing
  takeover infra; migrate/replace `StreakMilestoneTakeover` rather than
  duplicate. Confetti + ring-sweep + rising text; reduced-motion path.
- **Verify:** all three variants fire from their triggers (lesson done, streak
  milestone, level-up demo); reduced-motion shows end state.

**Phase 4 — Home + Learn + Practice + Profile**
- Restyle the four tab screens (gradient hook card, progress ring, "Stuck"
  card, quick links, fun-fact banner; lesson journey rows; game grid; profile
  bands). UI-only state for fun-fact banner + watermark prefs.
- **Verify:** screenshot each on SE + large; nothing clipped; IA intact.

**Phase 5 — Lesson runner**
- Restyle every phase + `DoneCard`; wire correct/wrong micro-interactions and
  the lesson-complete celebration. Phase machine untouched.
- **Verify:** full lesson run on device; phase order + copy unchanged; animations
  fire; auto-advance timings correct.

**Phase 6 — Emergency** *(gated on Amendment C)*
- Restyle with gradient header + category pills + audio buttons. Apply
  English-first **only if C-1 was approved**; otherwise restyle while keeping the
  locked transliteration-first hierarchy (C-2).
- **Verify:** matches the approved hierarchy; TTS still plays; works offline.

**Phase 7 — Auth/Welcome sample + optional loading screen**
- Gradient background + floating glyphs + bottom sheet on the Auth/Welcome
  screen. Optional Discord-style loading screen sourcing fun-fact tips.
- **Verify:** screenshot; safe-area insets correct; no regressions to auth flow.

**Phase 8 — Watermark toggle + reduced-motion settings + polish**
- Wire the watermark motif picker + on/off and a reduced-motion preference
  (ship as Settings rows, or hard-code defaults: Noto Kannada, near-white bg,
  watermark on / Rangoli, motion on).
- **Verify:** toggles work; defaults correct; close CONTRADICTIONS C14 after a
  full end-to-end pass on SE + large.

---

## 7. CONTRADICTIONS entry to open (on promotion)

> **C14 — Playful redesign spec landed; foundation amendments + code not yet
> shipped.** spec_playful_redesign.md requires amendments to DESIGN.md
> (typography + TabBar + colour tokens + type scale) and a decision on
> spec_text_hierarchy.md (Emergency English-first carve-out vs keep). Until the
> amendments land and the code ships, the app runs the current tonal tab bar,
> DM-Sans-only typography, and transliteration-first Emergency — divergent from
> this committed spec. Resolution owed: execute Phases 0–8; close when verified
> end-to-end on iPhone SE + a larger device.
