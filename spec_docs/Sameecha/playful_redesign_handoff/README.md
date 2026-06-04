# Handoff: Kannada Baa — Playful Redesign

## Overview
This package specifies a **visual + interaction refresh** of the Kannada Baa app. It keeps the existing information architecture, navigation, copy, and the lesson state machine **exactly as they are today**, and changes only the *feel*: a warmer, more playful, "learning is fun" personality expressed through type, colour, motif, and motion — while staying inside the app's existing Mysore-red + turmeric-gold brand ("Living Manuscript").

The redesign is the result of several rounds of design feedback. The net direction:
- **Less corporate, more playful** — but still one cohesive system, not a rainbow.
- **One brand palette everywhere**: Mysore red + turmeric gold + warm neutrals. No new off-brand hues.
- **A rounded display typeface (Baloo Tamma 2)** for headers, big numbers, and buttons — it also renders Kannada, so script and UI feel like one family.
- **Watermark motifs**, **demoted fun-facts**, an **English-first Emergency** screen, a **slim icon-only tab bar**, and **celebration moments** (correct answers, lesson complete, streaks, level-up).
- **No mascot** — personality comes from type, colour, motif, and motion.

## About the Design Files
The files in this bundle are **design references created in HTML/React (for browser preview only)** — prototypes showing the intended look and behaviour. **They are not production code to copy.** The task is to **recreate these designs inside the existing Expo / React Native codebase**, using its established patterns (expo-router, the `Colors`/`Fonts`/`Shadows` token modules, `@tabler/icons-react-native`, `react-native-reanimated`, `react-native-svg`, Zustand stores, React Query, `expo-speech`).

The prototype was built at a 390×844 logical canvas (iPhone). All sizes below are in points (px in the prototype ≈ dp/pt in RN).

## Fidelity
**High-fidelity.** Colours, typography, spacing, radii, and interactions are final and intentional. Recreate them faithfully using the codebase's existing libraries. Where the prototype value and an existing brand token differ slightly (see *Design Tokens → Colour*), prefer the existing brand token and treat the prototype value as the visual target.

---

## Design Tokens

### Colour
Extend `constants/colors.ts`. The redesign is **strictly** these families — red, gold, deep-gold, and warm neutrals. **Do not introduce blue/green/teal/coral.**

| Role | Prototype value | Existing `Colors` token | Notes |
|---|---|---|---|
| Page background (near-white, warm) | `#fffdf4` | `surface` (`#fbfbe2`) | Prototype is a brighter near-white; either is acceptable, prefer a warm off-white. |
| Card / raised surface | `#ffffff` | `surfaceContainerLowest` | Max contrast cards. |
| Secondary zone / tab fill | `#f6f2e2` | `surfaceContainerLow` (`#f5f5dc`) | |
| Chip / track | `#efe9d4` | `surfaceContainerHigh` (`#eaead1`) | |
| Interactive card | `#e9e2c9` | `surfaceContainerHighest` (`#e4e4cc`) | |
| Locked / dim | `#ded6bd` | `surfaceDim` (`#dbdcc3`) | |
| Hairline (borders, "felt not seen") | `rgba(27,29,14,0.08)` | derive from `outlineVariant` @ ~8% | Used for the top-bar border + card insets. |
| **Mysore red** (primary/action/urgency) | `#a30420` | `primary` (`#91001b`) | Prototype red is slightly brighter; **prefer the brand `primary`/`primaryContainer`** and use the gradient below. |
| Red — bright (gradient start, hi) | `#c40029` | `primaryContainer` (`#be0027`) | |
| Red — lip/shadow (deep maroon) | `#6e0014` | darken `primary` | Bottom "lip" on chunky buttons; also the 4th Practice card. |
| Red — wash (urgency card bg) | `#fdecee` | `errorContainerLow` (`#f3dada`) | "Stuck right now" card, wrong-answer state. |
| **Turmeric gold** (progress/encouragement/success) | `#fdc003` | `secondaryContainer` (`#fdc003`) | Exact match. |
| Gold — bright | `#ffd24d` | — | |
| Gold — lip | `#c98a00` | — | Button lip / ring on gold. |
| Gold — ink (text on light/gold) | `#5a4300` | `onSecondaryContainer` (`#6c5000`) | |
| Gold — wash | `#fff5d6` | `secondaryFixed` (`#ffdf9e`) tinted | Encouragement/"take it outside" cards. |
| **Deep gold** (the one extra accent, used sparingly) | `#785900` | `secondary` (`#785900`) | Exact match. "Done" badges, 3rd Practice card, Level-up. |
| Deep gold — lip | `#5a4300` | — | |
| Text — primary | `#1b1d0e` | `onSurface` | |
| Text — secondary | `#5b5947` | `tertiary` (`#464646`) | Captions/sub. |
| Text — faint | `#908d76` | — | Hints, locked labels. |

**Accent logic (apply on every screen):**
- **Red** = primary actions, current lesson, urgency (Emergency / "Stuck right now"), active tab, lesson CTAs, wrong-answer.
- **Gold** = progress rings, streaks, encouragement, correct-answer, success/celebration.
- **Deep gold** = "done/completed" badges, a secondary card tone, the Level-up moment.
- **Surface tone** = how sections are grouped (the app's "no-line rule" — sections via surface shifts, not borders).

**Brand gradient (the only gradient).** A single Mysore-red linear gradient is used for the Home hook card, the Profile avatar, the Emergency header, and the Auth background:
```
linear-gradient(152deg, #c40029 0%, #a30420 82%)   // i.e. primaryContainer → primary
```
Requires **`expo-linear-gradient`** (not currently a dependency — add it). Do not use multi-hue gradients.

### Typography
Three roles, mirroring the existing `Fonts` module, **plus a new display face**:

| Role | Family | Usage |
|---|---|---|
| **Display** (NEW) | **Baloo Tamma 2** (`700`/`800`) | All screen titles, the hero lesson title, big numbers (streak, %, stats), button labels, card headings. This is the single biggest driver of the "playful" feel. |
| UI / body | DM Sans (`400`–`800`) | Body copy, sub-labels, uppercase eyebrows, settings rows. |
| Transliteration | Lora *italic* (`400`/`500`) | Romanised Kannada only, always italic (e.g. *Nanna hesaru*). Existing rule — keep. |
| Kannada script | Noto Sans Kannada **or** Baloo Tamma 2 | Default to Noto Sans Kannada; offer Baloo as the rounded option (it covers Kannada and pairs with the display face). |

**Add the font package:** `@expo-google-fonts/baloo-tamma-2` (weights 400/500/600/700/800), load it in the existing `useFonts(...)` call in `app/_layout.tsx` alongside the current DM Sans / Lora / Noto families. Extend `constants/fonts.ts` with a `baloo` group.

**Type scale (points / weight):**
| Token | Size | Weight | Family | Example |
|---|---|---|---|---|
| Screen title | 24–25 | 800 | Baloo | "Your journey", "Practice", "Emergency Kannada" |
| Hero title | 30 | 800 | Baloo | Home hook "Names" |
| Card heading | 16–20 | 700 | Baloo | "Stuck right now?", game names, phrase English |
| Big number | 16–34 | 800 | Baloo | streak `12`, ring `13%`, stat `37`, celebration title |
| Button label | 16.5 | 700 | Baloo | "Continue lesson", "Let's start" |
| Body | 12.5–15 | 500–700 | DM Sans | descriptions, subs |
| Eyebrow / label | 10.5–12 | 800 | DM Sans | uppercase, letter-spacing 1.2–1.6 ("CONTINUE · LESSON 2", "SITUATION") |
| Transliteration | 15–42 | 400 italic | Lora | word/phrase teaching |
| Kannada | 13.5–88 | 400–700 | Noto/Baloo | muted reference + decorative watermark glyphs |

Tighten line-heights vs a default app (headings ~1.05–1.2). The whole scale was deliberately pulled **down/compact** from an earlier draft — keep it tight.

### Spacing, radii, shadows, motion
- **Screen padding:** 16 horizontal. Cards: 13–18 inner padding. Gaps between stacked cards: 9–11.
- **Top bar:** paddingTop 50 (status bar), paddingBottom 11, 1px hairline bottom border.
- **Bottom nav:** floats 24 from the bottom, centered.
- **Radii:** cards 16–22, buttons 13–16, tiles/icon-chips 11–16, pills/avatars 999.
- **Shadows:**
  - *Chunky "lip" button:* a hard bottom edge, no blur — `boxShadow: 0 4px 0 <lipColor>`; on press, translateY(2) and lip shrinks to `0 2px 0`. (In RN: a coloured `View` behind, or `borderBottomWidth`, since RN can't do hard offset box-shadows — see Implementation Notes.)
  - *Card inset border:* `inset 0 0 0 1px <line>` → RN `borderWidth: 1, borderColor: line`.
  - *Floating nav:* `0 8px 24px rgba(27,29,14,0.16)`.
  - *Celebration badge:* soft `0 12px 30px <lip>@40%`.
  - Reuse `constants/shadows.ts` tokens where they fit (`modal`, `medallion`).

---

## Screens / Views

> All screens sit on the warm near-white background with an optional **watermark** layer behind content (see *Watermark system*). Map each to the existing route file noted.

### 1. Home → `app/(tabs)/index.tsx`
**Purpose:** Land, pick up where you left off, get positive reinforcement, reach Emergency fast.

**Layout (top → bottom, scrolls):**
1. **Top bar** (sticky): left-aligned **wordmark** "Kannada **ಬಾ**" (Baloo + red ಬಾ glyph) · right **streak pill** · 1px bottom hairline.
   - *Streak pill:* its own rounded-999 button, gold-wash fill with a 1.5px gold inset ring, a red flame icon + bold number (`12`). **Tappable** — fires the streak celebration. Flame plays a quick wiggle on tap.
2. **Fun-fact banner** (demoted): slim card, deep-gold sparkle chip + one-line truncated "**Did you know?** …", dismissible (×), cycles on tap. This replaces the old prominent fun-fact block.
3. **Greeting:** "Namaskāra, Samee! 👋" (Baloo 24) + one line "Pick up where you left off — 5 minutes today keeps the streak."
4. **HOOK card** (the primary draw): red brand-gradient card, big faint Kannada glyph (ನ) bleeding off the top-right corner. Contains: eyebrow pill "▶ CONTINUE · LESSON 2", hero "Names" (Baloo 30, white), "I, you, my name is · *~5 min*", a row of step dots (filled = done, gold), and a gold **lip button** "Continue lesson →". Tapping opens the lesson.
5. **Progress card:** white card, gold **progress ring** (SVG) with `13%` centred, "1 of 8 lessons" + "You're on a roll — **Names** is next." → taps to Learn.
6. **"Stuck right now?" card** — the single urgent accent: pale-red wash, red rounded icon tile (SOS) that **gently pulses**, red heading, sub "Survival phrases for the auto, shop & street · works offline." → opens Emergency.
7. **Quick links** (2-up grid): "Practice" (red accent) and "Heritage" (deep-gold accent), each an icon chip + label + count.

### 2. Learn → `app/(tabs)/learn.tsx`
**Purpose:** The lesson journey/path.
- Header: "Your journey" (Baloo 25) + italic "Swalpa swalpa — one step at a time." + hairline.
- Vertical list of lesson rows. Each: a rounded tile with the lesson's Kannada glyph, title (Baloo 17) + sub.
  - **Done:** gold-wash tile, deep-gold round badge with white check.
  - **Current:** white card, 2px red inset ring + soft red drop shadow, red round play badge. Tappable → lesson.
  - **Locked:** low-surface tile at 0.62 opacity, lock icon.

### 3. Practice → `app/(tabs)/practice.tsx`
**Purpose:** Games drill.
- Header "Practice" + "Play with the phrases you've met."
- 2-col grid of game cards, each a coloured rounded card with a big translucent Kannada glyph and a **lip** (hard bottom edge). Colours form a red→gold spectrum:
  - **Dictation** (full-width, big): red `#a30420`.
  - **Opposites:** gold `#fdc003` (dark text).
  - **Quick Quiz** (Soon): deep gold `#785900`, "Soon" badge.
  - **Image Match** (Soon): deep maroon `#6e0014`, "Soon" badge.
- Wire to existing `app/(games)/[game]`.

### 4. Profile → `app/(tabs)/profile.tsx`
Keep the existing IA exactly; restyle.
- Top bar (wordmark + streak pill).
- Avatar: red brand-gradient circle with the initial (Baloo 36, white); name (Baloo 24); italic "Level 2 · Friendly Beginner".
- **Overall progress band:** gold-wash card, uppercase "OVERALL PROGRESS" + big `18%`, gold track + deep-gold fill, "Lessons + games combined". (Tappable → Level-up celebration demo.)
- **Two stat cards:** "Day streak" (red flame) and "Words learned" (gold) — big Baloo numbers.
- **Your goal** row (deep-gold target chip).
- **Settings** list: alternating tonal rows (no dividers) — Reminders, Audio & pronunciation, Help & feedback (red icons).
- **Sign out** (red text button).

### 5. Lesson runner → `app/lesson/[id].tsx` + `components/lesson/*`
**Keep the existing phase machine and copy verbatim** (`hooks/useLessonRunner.ts`). Phases:
`situation → teach_words → practice_words(listen→say) → teach_phrases → practice_phrases(listen→say) → summary → real_world → done`

Shared chrome:
- Top: thin **progress bar** (red fill, animates width) + centred caption ("Word 1 of 3"). A round **×** "exit" chip top-left.
- Content area scrolls; a sticky footer holds the primary **lip button** over a fade-to-background gradient.

Per phase:
- **Situation:** gold-wash hero card (big faint glyph), "SITUATION" eyebrow + title; below, title (Baloo 25) + the situation paragraph. Footer "Let's start".
- **Teach word/phrase:** centered white **ScriptCard** — transliteration (Lora italic, large) / English (DM Sans) / muted Kannada — with a red round **AudioOrb** that shows a **ping ring** animation. Phrases also show tappable word chips above. Footer "Got it" / "Start practising…". Cards **slide in** from the right on advance.
- **Practice — Listen:** big AudioOrb (ping) + "What does this mean?" + a multiple-choice list. **Correct** → gold wash + gold check badge that **pops**, plus 3 small gold ✦ sparkles that **float up**, and the card **bounces**. **Wrong** → red wash + red × badge + a **shake**. Auto-advances (~0.95s correct, ~1.05s wrong).
- **Practice — Say:** ScriptCard + a secondary AudioOrb + "Say it out loud"; footer "I said it" enables after ~1.3s.
- **Summary:** "What you learned" + gold "Words" / red "Phrases" sections, each a list row with a gold audio chip.
- **Real world:** gold-wash card with the real-world prompt (Baloo); footer "I'll try this" + "Skip for now".
- **Done:** see *Celebrations → Lesson complete*. Below the overlay: a recap (words/phrases learned, "You spoke Kannada today"), a gold "Take it outside" card, and "Keep practising" game shortcuts. Footer button toggles red "I'll try this in real life" → deep-gold "Committed! ✓".

### 6. Emergency → `app/emergency.tsx`  **(important UX change)**
**English-first hierarchy** so a panicking non-speaker scans fast:
- Red brand-gradient header (back button, "Emergency Kannada", "Tap a phrase to play it out loud · works offline"), rounded bottom corners.
- Category tabs (Auto / cab · In trouble · Basics) — active = red lip pill.
- **Phrase cards, English first:** big **English** (Baloo 20) is the hero → **transliteration** (Lora italic, red) "say it like this" → **small muted Kannada** reference. Right: a red audio button; while playing it inverts to solid red with a **ping ring**. Pull data from `data/emergency.json` / `useEmergencyPhrases.ts`, but ensure each item carries `en`, `roman`, and `kn` (add romanisation if missing).
- Footer note (Lora italic): audio uses device voice; romanisation pending review.

### 7. Auth / Welcome → `app/(auth)/login.tsx` (and/or `app/onboarding/welcome.tsx`)
Single **sample** screen demonstrating the gradient treatment:
- Full-bleed **red brand gradient** background with a soft gold radial "bloom" top-right + a faint gold bloom bottom-left, and **floating Kannada glyphs** (white @ ~8%, slow bob).
- Centered hero: large white ಬಾ (with soft shadow), wordmark "Kannada **ಬಾ**" (gold accent glyph), italic tagline "*"Come, Kannada." Learn to speak it in five minutes a day.*"
- Bottom **sheet** (near-white, rounded top, watermark behind): "Let's get you talking" + "Free · no card · works offline", a red **lip button** "Start learning →", a ghost text button "I already have an account", and a Terms/Privacy line.

### 8. Loading screen (Discord-style) — optional, reusable
Centered bobbing ಬಾ glyph + wordmark + a red-gradient **progress bar**, and a bottom **rotating tip** ("Did you know · …") drawn from the fun-facts. Use during lesson/route loads instead of a spinner. Source tips from `useKarnatakaFunFacts.ts` / `data/karnataka_fun_facts.json`.

---

## Interactions & Behaviour

### Navigation
- Bottom tab bar is **icon-only** (no labels), a floating rounded-999 pill, four tabs (Home / Learn / Practice / Profile). Active tab = solid red circle with white icon + soft red shadow; inactive = faint icon. Implement via a **custom `tabBar`** on the expo-router `Tabs` in `app/(tabs)/_layout.tsx` (the default bar shows labels and spans full width — replace it). Hide it on lesson/emergency/auth routes (those are outside `(tabs)`).
- Icons: use `@tabler/icons-react-native` equivalents of the prototype's set (home, book/learn, adjustments/practice, user, flame, volume, play, etc.).

### Micro-interactions (priority list — all requested)
| Moment | Behaviour | Suggested impl |
|---|---|---|
| **Correct answer** | Option turns gold, check badge **pops** (scale 0.4→1.12→1), 3 ✦ sparkles **float up & fade**, card **bounces** | reanimated; ~0.3–0.9s |
| **Wrong answer** | Option turns red, × badge pops, card **shakes** (±7→3px) | reanimated; ~0.4s |
| **Lesson complete** | Full-frame **celebration** overlay (see below) | reanimated + svg + expo-blur |
| **Streak milestone** | Celebration (flame variant) — fired by tapping the streak pill | same |
| **Level up** | Celebration (star, deep-gold) — fired from the Profile progress band | same |
| **Streak flame** | Quick wiggle/scale when the streak pill is tapped | reanimated |
| **Loading** | Discord-style bobbing glyph + animated bar + rotating tip | reanimated |
| **Page transitions** | Subtle fade + 8px upward slide + tiny scale on screen change (~0.32s, ease-out) | expo-router screen options / reanimated layout |
| **Audio orb** | Concentric **ping ring** expanding & fading while "playing" | reanimated loop |
| **Stuck card icon** | Gentle continuous pulse to draw the eye | reanimated loop |
| **Lip buttons** | Press = translateY +2 and lip 4px→2px (tactile) | Pressable + reanimated |

### Celebration overlay (shared component)
Full-frame, dim backdrop (`rgba(27,29,14,0.46)` + **blur** via `expo-blur`), **confetti** (~46 pieces, red/gold/deep-gold, falling+rotating), a large **badge**: an SVG ring that **sweeps** from empty to full (1s) around a coloured disc that **bobs**, with a Tabler icon (trophy / flame / star). Then eyebrow + Baloo title + sub + a lip-button CTA, each **rising** in sequence. Three kinds:
- **lesson** — gold, trophy, "Lesson complete" / "Lesson 2 done!"
- **streak** — red, flame, "Milestone" / "12-day streak!"
- **level** — deep gold, star, "Level up" / "You reached Level 3"
Respect `prefers-reduced-motion` / a reduced-motion setting: show the end state without the loops.

### Watermark system
A faint motif layer (~5–8% opacity) sits behind content on every surface. **Three motifs** (user-selectable; default *Rangoli*):
- **Rangoli (mandala):** a fine grid of small gold dots (`radial-gradient` dot pattern). In RN, a tiled SVG or a repeated dot `Image`.
- **Glyphs:** scattered, low-opacity Kannada letters at varied size/rotation (alphabet confetti).
- **Rays:** soft concentric gold arcs emanating from a corner.
Provide a global toggle (on by default).

## State Management
No new domain state — reuse existing Zustand stores / React Query / hooks:
- `stores/progressStore.ts`, `hooks/useOverallProgress.ts`, `hooks/progress.ts` — streak, % complete, lessons done/locked, words learned.
- `hooks/useLessonRunner.ts` — the phase machine (unchanged).
- `hooks/useEmergencyPhrases.ts`, `hooks/useKarnatakaFunFacts.ts`, `hooks/useCopy.ts` — content.
- `stores/useAuthStore.ts`, `stores/useUserStore.ts` — auth/name/level.
New **UI-only** state: which celebration is showing (`null | 'lesson' | 'streak' | 'level'`), fun-fact banner dismissed/index, watermark motif + on/off, Kannada-typeface + background preferences (these last are the prototype's "Tweaks" — ship as Settings or hard-code the defaults: Baloo Kannada off / Noto on, near-white bg, watermark on, Rangoli motif).

## Implementation Notes (RN specifics)
- **Add deps:** `@expo-google-fonts/baloo-tamma-2`, `expo-linear-gradient`. (`react-native-svg`, `react-native-reanimated`, `expo-blur`, `@tabler/icons-react-native`, `expo-speech` already present.)
- **Lip buttons / cards with a hard bottom edge:** RN can't render hard-offset box-shadows. Implement the "lip" as either `borderBottomWidth: 4, borderBottomColor: <lip>` on the button, or a coloured `View` layered 4px below. Animate the press by reducing the offset to 2 and translating the face down 2.
- **Progress ring / celebration ring / confetti:** `react-native-svg` (`Circle` with `strokeDasharray`/`strokeDashoffset`; animate offset via reanimated). Confetti = absolutely-positioned animated `View`s.
- **Gradient:** `expo-linear-gradient` `<LinearGradient colors={['#c40029','#a30420']} start/end>` matching 152°.
- **Blur backdrop:** `expo-blur` `<BlurView>` under the celebration content.
- **Audio:** keep `expo-speech` / `expo-av` as today; the AudioOrb ping is purely decorative.
- **Tab bar:** custom `tabBar` component on `Tabs`; SafeArea-aware; hide on non-tab routes.
- **Haptics (nice-to-have):** add `expo-haptics` for a light tap on correct answers / celebrations (not in the prototype, optional).

## What to keep unchanged
- Information architecture, routes, and navigation graph.
- All copy/strings and the lesson phase machine + practice logic.
- Audio/TTS, reminders/notifications, Supabase/React Query data layer.
- The `Colors`/`Fonts`/`Shadows`/`Spacing` token approach (extend, don't replace).

## Files (design references in this bundle)
Open `Kannada Baa - Playful.html` in a browser to see and click through everything (use the **Tweaks** panel → "Walk the flow" + "Celebrations" to jump to any screen/moment).

- `design-reference/Kannada Baa - Playful.html` — entry; fonts, keyframes, mounts the React prototype.
- `design-reference/pl-system.jsx` — **tokens, theme, fonts, icons, watermark, confetti, celebration, lip button** (read this first; it's the source of truth for values).
- `design-reference/pl-home.jsx` — top bar, streak pill, fun-fact banner, Home, bottom nav, Learn/Practice/Profile.
- `design-reference/pl-lesson.jsx` — lesson runner (all phases), loading screen, choice list, done/celebration.
- `design-reference/pl-emergency.jsx` — English-first Emergency.
- `design-reference/pl-auth.jsx` — Welcome/sign-in gradient sample.
- `design-reference/pl-app.jsx` — shell, navigation, celebration wiring, Tweaks/preferences.
- `design-reference/tweaks-panel.jsx`, `design-reference/ios-frame.jsx` — preview-only scaffolding (the device frame + the preview "Tweaks" panel). **Not part of the app** — ignore for implementation except to read default preference values.

### Mapping cheat-sheet
| Prototype file/section | Target in codebase |
|---|---|
| `pl-system` tokens | `constants/colors.ts`, `constants/fonts.ts`, `constants/shadows.ts` |
| `pl-home` Home | `app/(tabs)/index.tsx` |
| `pl-home` Learn / Practice / Profile | `app/(tabs)/learn.tsx` · `practice.tsx` · `profile.tsx` |
| `pl-home` BottomNav | `app/(tabs)/_layout.tsx` (custom `tabBar`) |
| `pl-lesson` | `app/lesson/[id].tsx` + `components/lesson/*` |
| `pl-emergency` | `app/emergency.tsx` |
| `pl-auth` | `app/(auth)/login.tsx`, `app/onboarding/welcome.tsx` |
| Celebration / watermark / lip button | new shared components under `components/ui/` |
