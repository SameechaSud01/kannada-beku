# Handoff: System States (Splash · Loading · Success · Failure · Empty)

## Overview
This package specifies every **system-state screen** for the Kannada Beku mobile app: the launch **Splash**, **Loading** states (spinner + per-tab skeletons), **Success** (toast + reward), **Failure** (toast + full-screen error/offline), and **Empty** states. These are the moments between or around real content — they keep the app feeling alive, honest, and on-brand when there's nothing (yet) to show.

## About the design files
The files in this bundle are **design references created in HTML/React (Babel JSX)** — prototypes showing the intended look, copy, and motion. They are **not** production code to copy directly.

Kannada Beku is an **Expo / React Native** app (expo-router, TypeScript). The task is to **recreate these designs as React Native screens/components** using the app's **existing** primitives and tokens:

- Tokens: `constants/colors.ts`, `constants/fonts.ts`, `constants/spacing.ts`, `constants/shadows.ts`
- Icons: `constants/icons.ts` (single source — `@tabler/icons-react-native`, outline weight)
- Components: `components/ui/ChunkyPressable`, `ChunkyLip` (`ChunkyCircle`), `LipButton`, `RoundIconButton`, `TopBar`, `TabBar`, `Watermark`, `ProgressRing`
- Modals/toasts: `components/modals/Toast.tsx` + `ToastHost.tsx` (already implemented — reuse, don't rebuild)

Build with `moderateScale()` (react-native-size-matters) exactly as the rest of the app does. The pixel values below are at base scale (design width 390).

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and motion are final. Match them. Where a value maps to an existing token, **use the token**, not the raw hex.

---

## Design tokens (all sourced from `constants/colors.ts` @ `main`)

### Color
| Token | Hex | Use |
|---|---|---|
| `surface` | `#fcfcfa` | near-white root (non-chunky screens) |
| `surfaceCream` | `#faf6ea` | chunky page bg |
| `surfaceCreamLow` | `#f3ecd9` | recessed zones / skeleton canvas |
| `surfaceContainerHighest` | `#e6e6e3` | neutral icon well (search empty) |
| `primary` | `#91001b` | Mysore red — flame, error icon, wordmark |
| `primaryContainer` | `#be0027` | CTA gradient end, accent red |
| `redLip` | `#6e0014` | lip under red buttons / cards |
| `redLipDeep` | `#4a000e` | lip under Conversations card |
| `errorContainerLow` | `#f3dada` | pale-red error icon bg / toast icon bg |
| `secondaryContainer` | `#fdc003` | turmeric gold — success, reward |
| `goldBright` | `#ffd24d` | gold gradient hi |
| `goldLip` | `#c98a00` | lip under gold buttons/cards |
| `secondary` | `#785900` | dark gold — text/icons on gold |
| `secondaryFixed` | `#ffdf9e` | pale gold surfaces |
| `warningContainer` | `#d97b3a` | burnt orange — locked / offline caution |
| `warningContainerLow` | `#f7e4d3` | caution icon well bg |
| `onWarning` | `#3a1d07` | ink-brown on warning fills |
| `interactiveSecondary` | `#b8956a` | tan — secondary button border/fill |
| `interactiveSecondaryLip` | `#7e6440` | tan lip |
| `onSurface` | `#1b1d0e` | primary text; dark toast bg |
| `tertiary` | `#464646` | captions / muted body |
| `textFaint` | `#908d76` | hints, locked labels |
| `hairline` | `rgba(27,29,14,0.08)` | felt borders |
| `cardLip` | `rgba(27,29,14,0.18)` | lip for white/neutral cards |

> Rule: **warm-only** semantics. Errors = red, caution/locked/offline = burnt orange, reward/encouragement = gold. **No blue/green/teal/coral** anywhere in states.

### Typography (`constants/fonts.ts` → `TypeScale`)
- Display (titles, numbers, button labels): **Baloo Tamma 2** — `screenTitle` 24/extrabold, `heroTitle` 30/extrabold, `cardHeading` 18/bold, `bigNumber` 28/extrabold, `buttonLabel` 16.5/bold
- Body/labels: **DM Sans** — `body` 14/medium, `eyebrow` 11/bold (letterSpacing 1.4, uppercase)
- Kannada script (ಕನ್ನಡ ಬೇಕು etc.): **Noto Sans Kannada** only

### Spacing & radius (`constants/spacing.ts`)
- Spacing: xs 4 · sm 8 · md 12 · lg 16 · xl 20 · xxl 24 · xxxl 32
- Radius: `chunky` 16 (cards/buttons) · `tile` 12 (inner icon tiles) · `lg` 14 · `full` 999

### The "chunky" elevation language
Every pressable/card rests on a **solid colored lip** — `borderBottomWidth: 4–5` in the lip color, not a soft shadow. On press it sinks (translateY ≈ lip height, lip → 0). Use existing `ChunkyPressable` / `ChunkyCircle` / `LipButton`; do not hand-roll.

- **Primary button** = red gradient `[primary → primaryContainer]`, lip `redLip`, white label, radius `chunky`.
- **Gold/reward button** = gradient `[goldBright → secondaryContainer]`, lip `goldLip`, label `secondary`/`secondaryDeep`.
- **Secondary button** = white/transparent, 2px `interactiveSecondary` border, lip `interactiveSecondaryLip`, ink label.

---

## Screens

### 1. SPLASH (`app launch`)
App-launch screen shown while fonts/session load (Expo `expo-splash-screen`). Brand mark = the **real app icon** (`assets/icon.png` — gold ಕ on Mysore red) presented as a rounded app-icon tile (radius ≈ 22.5% of size, `overflow:hidden`), with the wordmark **ಕನ್ನಡ ಬೇಕು** (Noto Sans Kannada, extrabold) + eyebrow **KANNADA BEKU** (DM Sans bold, ls 2.4, uppercase, `#9a7b1e`) + tagline *"Learn Kannada. Belong in Bengaluru."*

Three art directions are provided — **ship one** (recommendation: **A · Skyline** as the production splash; B and C are alternates):

- **A · Bengaluru skyline** — cream radial bg `radial-gradient(125% 80% at 50% 30%, #fbf4e2, #f1e6c9)`. A soft warm ground band (bottom 250px, `linear-gradient(180deg, transparent, rgba(120,89,0,0.05) 45%, rgba(120,89,0,0.11))`). Landmark stickers stand on it, bottom-aligned with slight rotation/overlap: Mysore Palace (left, w≈166, −2°), Vidhana Soudha (center, w≈196), Town Hall (right, w≈150, +2°), with filter-coffee + dosa as small foreground props. Mark sits in the upper third.
- **B · Sticker scatter** — same cream bg; 8 stickers loosely **frame** a centered mark: palace + Dasara up top, Lalbagh + Ganapathi temple mid-upper, flower market + Channapatna toys + dosa + coffee around the bottom. Each rotated 4–10° and gently floating.
- **C · Red brand reveal** — immersive `primary`/`primaryContainer` radial with a dotted overlay + giant 6%-opacity ಬೇಕು watermark; app-icon tile with a faint gold rim, white wordmark with gold ಬೇಕು, gold loader dots + tagline at the bottom.

**Stickers**: transparent PNG illustrations from the project's sticker set (`assets/*.png`, included in this bundle under `assets/`). In RN, render with `<Image source={require(...)}>`, `resizeMode="contain"`, and a soft drop shadow (`shadowColor #281e14, opacity .16, radius 12, offset {0,7}` / Android `elevation`).

**Motion**: mark elements rise + fade in, staggered 560→900 ms; stickers float ±5px on a 3 s ease-in-out loop, staggered by index ×0.35 s. App-icon tile scales `0.86 → 1` over 720 ms. Respect `prefers-reduced-motion` / RN reduce-motion: skip floats, show resting state. Loader = 3 bouncing dots (gold `#cf9a1c`).

### 2. LOADING
- **Spinner screen** — `surfaceCreamLow` bg, a back chip top-left (white `RoundIconButton`, red back arrow — *user is never trapped*), centered ring spinner (red `primaryContainer`, ~48px, 0.9 s linear spin, ~28% arc) + label *"Getting things ready…"* (Baloo bold 15.5, `tertiary`). **This is also the lesson/guide load** (`lesson/[id]` shows `ActivityIndicator size=large color=primary`).
- **Skeleton screens** (one per tab) — render the **real chrome** (TopBar with wordmark+streak; TabBar with correct active index) and replace content with shimmer blocks. Shimmer = `linear-gradient(100deg, #e8e4d8 28%, #f4f1e8 50%, #e8e4d8 72%)`, 200% width, 1.5 s ease-in-out sweep. Colored cards keep their **real fill** (color is structural) with tonal shimmer inside (e.g. red card → white-alpha shimmer, gold card → `rgba(120,89,0,.18→.09)`).
  - **Home** (`active=0`): greeting lines → rings card (118 circle + 3 rows) → red "continue" card → gold progress banner.
  - **Learn** (`active=1`): title block → basics row → 5 lesson rows (fading opacity down the list).
  - **Games** (`active=2`): title → gold featured-quiz card (52 tile + play orb) → 2-up red grid (Dictation `primaryContainer`/redLip, Conversations `primary`/redLipDeep, h150) → wide gold Opposites card (h96).
  - **Profile** (`active=3`): name block → gold gradient progress band (eyebrow + big % + bar + caption) → 2 white stat cards → settings list (white card, 3 hairline rows) → tan sign-out block.

> Implementation: trigger skeletons off each screen's existing query `isLoading`. Match the loaded layout 1:1 so there's no reflow on data arrival.

### 3. SUCCESS — reuse `components/modals/Toast.tsx` + add reward
- **Toast (success)** — **already built.** Top, dark pill (`onSurface` bg, radius full), 22px gold (`secondaryContainer`) circle with a 14px `Icons.check` (`onSecondaryContainer`, stroke 3), white DM Sans bold 14 label. Enters from top (translateY −40→0, 200 ms), **auto-dismisses after 3 s**. Use for quiet confirmations (e.g. "Reminder set — 8:00 AM daily").
- **Full-screen reward** (milestone, e.g. daily-goal hit) — centered scaffold over `surfaceCreamLow` with floating confetti dots (gold/red, ±5px loop). Hero = 126px circle, gradient `[goldBright → secondaryContainer]`, lip `goldLip`, 58px `Icons.check` (`secondary`, stroke 3). Title (Baloo extrabold 24): *"You've hit your daily goal!"* Body (DM Sans 14.5, `tertiary`). Actions: primary red **"Keep going"** + secondary tan **"Back to home"**.

### 4. FAILURE — reuse Toast + two full screens
- **Toast (error)** — **already built.** Bottom, soft white card (`surfaceContainerLow`, radius `lg`), 22px `errorContainerLow` circle with 14px `Icons.x` (`primary`, stroke 3), bold title + optional `tertiary` subtitle, trailing `Icons.forward` when tappable. **Sticky** (no auto-dismiss); tap = retry/route. Use for transient errors + offline.
- **Full · load error** (true error → red) — back chip; 104px well `errorContainerLow` bg with **`Icons.emHelp` (`IconAlertTriangle`)** 48px in `primary`. Title *"Something went wrong"*, body *"We couldn't load your lessons. Check your connection and give it another try."* Actions: primary red **"Try again"** (leading refresh icon — see *New icons*) + tertiary **"Get help"**.
- **Full · offline** (caution, **not** error → orange) — back chip; 104px well `warningContainerLow` bg with **`IconWifiOff`** 48px in `warningContainer`. Title *"You're offline"*, body *"Reconnect to keep learning. Anything you've done is saved and will sync the moment you're back."* Actions: primary **"Try again"** (refresh icon) + tertiary **"Practice offline phrases"**. Footnote (`textFaint`): *"Emergency phrases work without a connection."*

### 5. EMPTY (no content yet — distinct from errors; each offers the one action that fills it)
- **Games · locked** (`active=2`) — PageHeader "Games". 104px well `warningContainerLow` + `Icons.locked` 46px `warningContainer`. Title *"Games unlock as you learn"*, body about finishing lesson 1. CTA: primary red **"Start Lesson 1"** (leading play icon).
- **Quiz · no scores** — back chip. 104px well `secondaryFixed`/`goldPale` with `goldLip` ring + `Icons.bolt` 48px `secondary`, a faint "?" glyph top-right. Title *"No scores yet"*, body. CTA: **gold** button **"Play Quick Quiz"**. Footnote about phrase pool.
- **Profile · no streak** (`active=3`, TopBar streak = 0) — 104px well `errorContainerLow` + `Icons.flame` 50px `primaryContainer`. Title *"Start your streak today"*, body. CTA: primary red **"Start today's lesson"**.
- **Search · no match** — search-bar chrome (pill, query text + clear ×). 96px neutral well `surfaceContainerHighest` + search icon 42px `textFaint`. Title *"No phrase for "biriyani""*, body. CTA: secondary tan **"Browse by situation"**.

Empty heroes rise+fade in (staggered 0→220 ms).

---

## Interactions & behavior
- **Back chip** appears on standalone full-screen states (error/offline/no-scores) so the user can always exit; routes `router.back()`.
- **Success toast**: auto-dismiss 3 s; **error toast**: sticky until tapped; both via the existing `ModalHost`/`ToastHost` queue.
- **Retry** buttons re-run the failed query; **offline** "Try again" re-checks connectivity.
- **Reduced motion**: disable float/confetti/shimmer-as-decoration; **keep the spinner** (it *is* the loading signal) and show resting states everywhere else.
- Every empty/error screen has exactly **one primary action** that resolves it.

## State management
- Loading skeletons gate on each screen's existing query `isLoading` (TanStack Query). Render skeleton when loading, real layout otherwise — identical layout to avoid reflow.
- Offline vs error: treat connectivity loss as **caution** (orange screen, work-is-safe copy), reserve **red** for genuine load/server failures.
- Toasts are fired imperatively from the existing toast catalog/`ModalHost`.

## New icons (add to `constants/icons.ts`)
The failure states need two Tabler icons not yet in the map — add them (keeps the "one library, no hand-drawn SVG" rule):
```ts
import { IconWifiOff, IconRefresh } from '@tabler/icons-react-native';
// …
wifiOff: IconWifiOff,   // full-screen offline
refresh: IconRefresh,   // "Try again" buttons
```
(`IconAlertTriangle` already exists as `emHelp` — reuse it for the load-error well.)

## Assets
Bundled under `assets/`:
- `icon.png` — the app icon (gold ಕ on red), used as the splash mark.
- Splash stickers (transparent PNGs): `mysore-palace`, `vidhana-soudha`, `town-hall`, `lalbagh`, `dodda-ganapathi-temple`, `mysore-dasara`, `flower-market-malini`, `channapatna-toys`, `dosa`, `filter-coffee`. (Full 23-sticker set lives in the project's `assets/` + `Kannada Baa Stickers.html`.)

## Files (design references in this bundle)
- `Kannada Beku - System States.html` — the full canvas (open in a browser to see every state live; Tweaks panel toggles Classic/Rowdy copy, accent, surface, kolam grid).
- `st-splash.jsx` — Splash (skyline / scatter / red), `Sticker`, `SplashMark`.
- `st-loading.jsx` — Spinner + Home/Learn/Games/Profile skeletons, `Skel`, `SkelCard`.
- `st-feedback.jsx` — Success + Failure toasts and full screens; accurate Tabler icon paths.
- `st-empty.jsx` — the four empty states + gold button.
- `st-shared.jsx` — `AppIcon`, `CKSpinner`, `CKDots`, `IconWell`, `StateScaffold`, tone switch.
- `ck-system.jsx`, `ck2-shared.jsx` — chunky primitives + icon paths + TopBar/TabBar/PageHeader the mocks reuse (your RN equivalents already exist in `components/ui`).

> Copy/tone note: the mocks include a playful **"Rowdy"** Kannada-English voice toggle alongside the default **"Classic"** copy. Ship Classic unless product asks otherwise; Rowdy strings are in each file if wanted.
