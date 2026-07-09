# Handoff: App Splash Screen — "Rangoli × Skyline"

## Overview
A redesigned launch/splash screen for **Kannada Beku** (ಕನ್ನಡ ಬೇಕು), the Kannada
language-learning app. It replaces the current shipped splash (`BrandSplash.tsx`,
"Splash C — Red brand reveal"), which reads as tacky against the rest of the app:
a bitmap app-icon floating in a hairline box, a giant 6%-opacity tilted ಬೇಕು
watermark, two competing stacked wordmarks, and a gloomy full-bleed maroon
gradient with a heavy dead foot.

The new screen keeps the app on its **cream canvas** (the room the rest of the app
lives in), leads with the bare brand glyph **ಕ** carrying a gold "lip", and plants
a row of **Bengaluru landmark stickers** along the bottom — warm, rooted, playful,
and consistent with the brand's marketing illustrations.

## About the Design Files
The file in this bundle (`SplashScreen.html`) is a **design reference created in
HTML** — a prototype showing the intended look and motion, **not** production code
to ship directly. The task is to **recreate this design in the app's existing
environment** (Expo / React Native, `react-native-reanimated`, the existing
`constants/` tokens and `components/states/` splash structure), reusing the app's
established patterns — not to embed HTML.

The existing `components/states/BrandSplash.tsx` is the file to replace/rework; it
already establishes the animation approach (`FadeInDown` rises, a `withTiming`
scale-in), safe-area handling, `LoadingDots`, and reduced-motion fallback — reuse
all of that.

## Fidelity
**High-fidelity.** Colors, typography, spacing, sticker placement, and motion
timing are final and exact. Recreate pixel-for-pixel using the app's tokens
(`Colors`, `Fonts`, `Spacing`) and `moderateScale` for sizing.

## Screen: Splash

**Purpose:** Shown as an overlay during the boot/hydration window
(`app/_layout.tsx`), same mount point as the current `BrandSplash`. Non-interactive;
dismisses when the app is ready.

**Layout** (logical phone size ≈ 402 × 874, full screen / `StyleSheet.absoluteFill`):
- **Background:** cream radial — `radial-gradient(125% 80% at 50% 28%, #fbf4e2 → #f1e6c9)`.
  In RN, approximate with an `expo-linear-gradient` (top `#fbf4e2` → bottom `#f1e6c9`)
  or a solid `#f6eed6`; the radial is subtle.
- **Ground shadow:** bottom band, height ≈ 250, `linear-gradient(180deg, transparent
  0% → rgba(120,89,0,0.05) 45% → rgba(120,89,0,0.11) 100%)`. Sits behind the stickers,
  grounds them.
- **Sticker row:** absolutely positioned along the bottom (see Assets for exact
  coords). Each has a soft drop shadow `drop-shadow(0 7px 12px rgba(40,30,20,0.16))`.
- **Mark block:** a top-anchored vertical stack, centered horizontally, with
  `padding-top: 196`. Contains, top to bottom:
  1. **Glyph ಕ** — the loading indicator's hero.
  2. **Wordmark** "Kannada **Beku**".
  3. **Kannada line** ಕನ್ನಡ ಬೇಕು.
  4. **Loader dots** (3 gold dots).

**Components / exact values:**

- **Brand glyph ಕ**
  - Font: Noto Sans Kannada, weight 700, size **132**, line-height 1.
  - Color: `--kb-red` `#be0027`.
  - Gold lip: `text-shadow: 0 6px 0 var(--kb-gold)` (`#fdc003`) — a **hard, un-blurred**
    6px bottom edge (the brand's signature "lip"; on RN use a stacked/offset text or a
    shadow with `shadowRadius: 0`).
  - Entrance: scale-in `0.86 → 1`, 640ms, easing `cubic-bezier(0.2,0.9,0.3,1)`.

- **Wordmark "Kannada Beku"**
  - Font: Baloo Tamma 2, weight 800, size **34**, line-height 1.
  - "Kannada" = `--kb-ink` `#1b1d0e`; "Beku" = `--kb-red` `#be0027`.
  - Margin-top 22. Entrance: rise (fade + translateY 14→0), 460ms, delay 480ms.

- **Kannada line ಕನ್ನಡ ಬೇಕು**
  - Font: Noto Sans Kannada, weight 400, size **14**, color `--kb-ink-faint` `#6f6c58`.
  - Margin-top 12. Entrance: rise, delay 620ms.
  - NOTE: Kannada script gets **no letter-spacing and no uppercase** (script rule).

- **Loader dots**
  - 3 dots, 8×8, fully round, gap 8, color `--kb-gold` `#fdc003`.
  - Margin-top 28. Container entrance: rise, delay 920ms.
  - Each dot pulses: opacity 0.35→1, scale 0.85→1, 1.1s ease-in-out infinite,
    staggered 0 / 160 / 320ms. Reuse the app's existing `LoadingDots`.

## Interactions & Behavior
- **No user interaction.** Pure entrance choreography, then dismiss on ready.
- **Animation order:** stickers (260ms) → glyph pop (0ms, 640ms dur) → wordmark
  (480ms) → Kannada line (620ms) → dots (920ms). Rises are fade + 14px upward
  translate, 460ms, `cubic-bezier(0.2,0.9,0.3,1)`. The glyph is a scale-in from 0.86.
- **Reduced motion:** respect it. Render the final resting state with no entrance
  animation and no dot pulse (mirror the existing `useReducedMotion()` / `Rise`
  fallback in `BrandSplash.tsx`).

## State Management
None. Stateless presentational overlay; visibility is controlled by the existing
boot/hydration gate in `app/_layout.tsx` (unchanged).

## Design Tokens
All already exist in `constants/colors.ts` / `constants/fonts.ts` / `constants/spacing.ts`:

- **Colors**
  - `--kb-red` `#be0027` (glyph, "Beku")
  - `--kb-red-deep` `#91001b`
  - `--kb-gold` `#fdc003` (glyph lip, dots)
  - `--kb-gold-bright` `#ffd24d`
  - `--kb-ink` `#1b1d0e` ("Kannada")
  - `--kb-ink-faint` `#6f6c58` (Kannada line)
  - Ground shadow: `rgba(120,89,0,0.05)` → `rgba(120,89,0,0.11)`
  - Background: `#fbf4e2` → `#f1e6c9`
- **Type**
  - Display: Baloo Tamma 2 (800) — wordmark
  - Kannada script: Noto Sans Kannada (700 glyph, 400 line)
  - Body: DM Sans (not used on this screen, but the family)
- **Spacing / radius:** 12 · 22 · 28 margins; the "lip" is a hard 6px offset shadow.

## Assets
Five Bengaluru sticker illustrations, in `assets/` (copied from the app's own
`assets/` — these are existing brand illustrations, not new art). Exact placement,
anchored from the **bottom** of the screen; z-index in parentheses:

| File | width | left / right | bottom | rotation | z |
|---|---|---|---|---|---|
| `mysore-palace.png` | 170 | left −32 | 78 | −2° | 1 |
| `town-hall.png` | 152 | right −30 | 90 | +2° | 4 |
| `vidhana-soudha.png` | 200 | left 92 | 66 | 0° | 3 |
| `filter-coffee.png` | 58 | left 36 | 54 | +9° | 5 |
| `dosa.png` | 92 | right 20 | 50 | −6° | 2 |

The negative offsets intentionally let the palace and town hall bleed off the screen
edges. All carry `drop-shadow(0 7px 12px rgba(40,30,20,0.16))`.

The brand mark is the **ಕ glyph rendered in type** (not an image) — do not use a
bitmap icon.

## Files
- `SplashScreen.html` — the design reference (self-contained; open in a browser).
- `assets/*.png` — the five sticker illustrations.
- In the app repo, the file to rework: `components/states/BrandSplash.tsx`
  (reuse its `Rise`, `LoadingDots`, `useReducedMotion`, safe-area, and mount point).
