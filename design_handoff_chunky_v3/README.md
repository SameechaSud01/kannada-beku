# Handoff: Chunky Kit Redesign (v3 · warm functional accents) — Kannada Baa (Expo / React Native)

> **This supersedes `design_handoff_chunky_kit/`.** Same chunky-kit redesign of the whole app, refreshed on **2026-06-13** to add two warm functional-accent tokens — `warningContainer` (locked / warning) and `interactiveSecondary` (secondary interactive) — and a formal disabled-state recipe. Everything else is unchanged. If you only need the colour delta, read **§ "What changed in this revision"** and **§ State semantics**.

## Overview
App-wide visual redesign of the Kannada Baa app (Expo + expo-router, React Native) onto the **"chunky kit"** language: physical lip-press depth on every tappable element, warm cream surfaces with a faint kolam dot grid, Baloo Tamma 2 display type, and a strict **red-commands / gold-rewards** colour hierarchy. The redesign covers all four tabs, onboarding, the lesson runner, the games flow, auth, emergency phrases, the modal layer, and a restructured (less overwhelming) Kannada-basics guide.

This revision adds the two missing **state colours** so locked/warning and secondary-interactive surfaces stop borrowing from the brand red and neutral greys:
- **`warningContainer` `#d97b3a`** — burnt orange. Locked content and caution/warning moments.
- **`interactiveSecondary` `#b8956a`** — warm tan-brown. The identity colour for *secondary* interactive controls (secondary buttons, secondary chips/links), one rung below the red primary.
- **Disabled** introduces **no new token** — it reuses `surfaceContainerHigh` (fill) + `textFaint` (label), specced in § State semantics.

## About the Design Files
The files in `design-reference/` are **design references created in HTML/JSX for browser preview** — they show intended look and behaviour, not production code. The task is to **recreate these designs inside the existing React Native codebase** (`Kannada-Baa/`), reusing its established patterns: `constants/colors.ts` tokens, `LipButton`, `ProgressRing`, `Watermark`, `ModalHost`, expo-router screens, reanimated, etc. Open `Kannada Baa - Chunky App v3.html` in a browser to see every screen; `Color Hierarchy.html` documents the colour system.

> ⚠️ The HTML references predate the two new accent tokens — they still show locked states in grey-faint and secondary buttons as plain white+hairline. **This README is the source of truth for where `warningContainer` and `interactiveSecondary` go;** apply them on top of the HTML's layout/structure.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii, lip depths and copy are final. Recreate pixel-perfectly with the codebase's own components. (The HTML uses CSS vars `--r` = 16px radius and `--lip` = 4px; treat those as the defaults.)

---

## What changed in this revision (2026-06-13)
1. **Two new tokens in `constants/colors.ts`** — `warningContainer`, `interactiveSecondary` (paste block below).
2. **Locked states** (Learn rows, game-selector rows, the Lesson-Locked modal) move from grey-faint to **burnt-orange `warningContainer`** for the lock glyph + a 12% warning tint surface — locked now reads as "not yet," not "broken."
3. **The secondary button rung** (`CKBtnSecondary` / RN `LipButton variant="secondary"`) gains a **tan-brown identity**: 2px `interactiveSecondary` border + tan lip, so secondary actions look interactive rather than like inert white cards. Threads into onboarding **Back**, "Back to lessons/Practice," secondary links, and the auth secondary actions.
4. **Disabled** gets a formal recipe (`surfaceContainerHigh` fill + `textFaint` label, flat — no lip), replacing the ad-hoc `#c8c4b0`.
5. Colour-hierarchy rules extended from 6 → 8 (rules 7–8 cover the two new tokens).

### `constants/colors.ts` — paste-ready addition
Drop this just below the `errorContainerLow` line (file uses lowercase hex, M3-style naming):
```ts
  // ── Functional accents — warm-only state semantics (additive 2026-06-13) ──
  // Burnt orange + tan-brown extend the red / gold / neutral system without
  // breaking the "no blue/green/teal/coral" rule — both read as warm.
  warningContainer:     '#d97b3a', // burnt orange — locked / warning states
  interactiveSecondary: '#b8956a', // warm tan-brown — secondary interactive
  // Disabled state: no new token — reuse surfaceContainerHigh (fill) + textFaint (label).
```
Optional derived helpers (compute once, or add as tokens if you prefer static values):
```ts
  // surfaces/text paired with the new accents (derive or hardcode)
  warningContainerLow:  '#f7e4d3', // ≈ warningContainer @ ~14% on surface — caution card bg
  onWarning:            '#3a1d07', // ink-brown for text/icons ON a warningContainer fill
  interactiveSecondaryLip: '#7e6440', // ≈ interactiveSecondary @ 72% + black — tan lip
```

---

## Design Tokens

### Colors (most already exist in `constants/colors.ts`)
| Design var | Hex | Codebase token | Status |
|---|---|---|---|
| red (brand) | `#91001b` | `Colors.primary` | exists |
| red2 (action) | `#be0027` | `Colors.primaryContainer` | exists |
| redLip | `#6e0014` | `Colors.redLip` | exists |
| redPale | `#f3dada` | `Colors.errorContainerLow` | exists |
| gold | `#fdc003` | `Colors.secondaryContainer` | exists |
| goldHi | `#ffd24d` | `Colors.goldBright` | exists |
| goldLip | `#c98a00` | `Colors.goldLip` | exists |
| goldPale | `#ffdf9e` | `Colors.secondaryFixed` | exists |
| goldDeep | `#785900` | `Colors.secondary` | exists |
| gold text on gold | `#6c5000` | `Colors.onSecondaryContainer` | exists |
| ink | `#1b1d0e` | `Colors.onSurface` | exists |
| muted | `#464646` | `Colors.tertiary` | exists |
| faint | `#908d76` | `Colors.textFaint` | exists |
| hairline | `rgba(27,29,14,0.08)` | `Colors.hairline` | exists |
| **surfaceCream** | `#faf6ea` | — | **ADD** (new root background) |
| **surfaceCreamLow** | `#f3ecd9` | — | **ADD** (page background behind cards) |
| conversations card | `#91001b`, lip `#4a000e` | primary + **ADD `redLipDeep #4a000e`** | add |
| **warningContainer** | `#d97b3a` | — | **ADD** (locked / warning) |
| **interactiveSecondary** | `#b8956a` | — | **ADD** (secondary interactive) |

### Colour hierarchy rules (see `Color Hierarchy.html`)
1. **One action-red moment per screen** (primary CTA / play orb / active tab).
2. **Gold = progress & reward only**, never a competing CTA.
3. **Pale tints are surfaces**, paired with their deep text (red on redPale, goldDeep on goldPale).
4. **Lips match their face** (red2→redLip, gold→goldLip, white→ink@10%, **tan→`interactiveSecondaryLip`**).
5. **redPale = urgent/error only.**
6. Neutrals + hairline do layout; no blue/green/teal.
7. **`warningContainer` = "locked / not yet / caution," never a CTA.** Use it as the **lock glyph + a 14% warning-tint surface**; it is the *only* place burnt-orange appears. Never use it for success, progress, or primary actions. (Error/wrong-answer stays redPale — rule 5; warning ≠ error.)
8. **`interactiveSecondary` = the secondary action rung.** A warm-brown border/fill that says "interactive, but not the main thing." It sits **below red, beside gold**: red = the one primary, gold = reward, tan = the supporting/alternative action. Never let it out-shout the screen's red moment, and never use it for body text on white (see contrast note).

### State semantics (NEW — where the two accents go, app-wide)
| State | Old treatment | New treatment |
|---|---|---|
| **Locked** (lesson rows, game rows, lock modal) | grey-faint icon on tonal tile | **lock glyph `warningContainer`** on a `warningContainerLow` (≈14% tint) tile; row stays de-emphasized (tonal `surfaceCreamLow` @ ~62%). Optional 1px `warningContainer`@30% inset. |
| **Warning / caution** (e.g. "this resets your progress," streak-at-risk banners) | red (read as error) or grey | `warningContainerLow` surface + `warningContainer` icon + `onSurface` body. Reserve **red/redPale for true errors**. |
| **Secondary action** (Back, "Back to lessons," alt CTA, secondary chips/links) | white + hairline (inert) | **white fill + 2px `interactiveSecondary` border + `interactiveSecondaryLip` lip**, label `onSurface`. Reads as a warm, pressable secondary. |
| **Disabled** (Continue before valid, locked submit) | ad-hoc `#c8c4b0` | **fill `surfaceContainerHigh` `#e6e6e3`, label `textFaint` `#908d76`, NO lip (flat), no press-translate, `opacity:1`.** Never grey-out by lowering opacity. |

**Contrast notes (important):**
- `warningContainer #d97b3a` as a **fill under text**: white ≈ 3.0:1 (only ≥18px/bold), `onSurface` ink ≈ 6.4:1 (safe), `onWarning #3a1d07` ≈ 7+:1 (best). As a **lock glyph on the pale tile** it's decorative-adjacent but still ≈ 3.4:1 on `warningContainerLow` — fine at ≥20px stroke-2.
- `interactiveSecondary #b8956a` is a **mid-tone** — **do not use it as text on white/cream** (~2.3:1, fails). Use it as a **border, lip, or fill**. On a tan fill, label with `onSurface`/`onWarning`. For warm-brown *text*, darken to ~`#6e5733` first.

### Typography
- **Display / headings / buttons:** Baloo Tamma 2 (supports Kannada script) — codebase `Fonts.baloo`. Weights 700/800. Kannada glyphs render in Baloo Tamma 2 directly.
- **Body / labels:** DM Sans — `Fonts.dmSans`. 400/500/700.
- Scale (px @ 390pt width): wordmark 22/800, page greeting 34/800, page title 25/800, card title 16–17/700, body 13–15/500, caption 11–12.5, uppercase labels 11/700 +1.4 tracking. Numbers use `fontVariantNumeric: 'tabular-nums'`.

### Shape & depth ("the chunky kit")
- Corner radius: **16** (cards, buttons), 11–14 inner tiles, 99 pills/circles. Add to `constants/spacing.ts` if needed.
- **Lip shadow** (replaces most soft shadows in `constants/shadows.ts`):
  - White card: `0 4px 0 rgba(27,29,14,0.10)` + 1px hairline border.
  - Red button: bg `#be0027`, lip `0 5px 0 #6e0014`.
  - Gold button: bg gradient `#ffd24d→#fdc003`, lip `0 5px 0 #c98a00`, text `#6c5000`.
  - **Secondary (tan) button:** bg `#fff`, **2px `#b8956a` border**, lip `0 4px 0 #7e6440`, label `#1b1d0e`.
  - **Disabled button:** bg `#e6e6e3`, no border, **no lip**, label `#908d76`.
  - Chips/small: lip 3px. Floating tab pill: lip 4px + `0 12px 28px rgba(27,29,14,0.10)` ambient.
- **Press feedback ("lip press")**: on press-in, translateY(+lip) and lip shadow → 0; 80ms ease. Build ONE shared `ChunkyPressable` component (RN: `Pressable` + reanimated `withTiming(80ms)`); generalises the existing `LipButton` to cards, chips, orbs, rows. `LipButton` itself stays for CTAs but restyle to Baloo 700, radius 16, padding 15/26/13. **Disabled pressables skip the translate entirely** (flat, no feedback).

### Background
- Root background `#faf6ea`, recessed zones `#f3ecd9`.
- **Kolam dot grid** over page backgrounds: dots `rgba(27,29,14,0.05)`, 1.2px radius, 24px grid. Implement as a new `Watermark` motif (`motif="kolamGrid"`, tileable SVG) replacing `motif="rangoli"` usage on tab screens.

---

## Shared Components (codebase changes)

| Component | File | Change |
|---|---|---|
| `ChunkyPressable` | **NEW** `components/ui/ChunkyPressable.tsx` | lip-press wrapper (props: lip=4, lipColor, radius, bg). Add a `disabled` path: flat (no lip), `surfaceContainerHigh` fill, `textFaint` content, no translate. |
| `LipButton` | `components/ui/LipButton.tsx` | Add/confirm **3 variants**: `primary` (red/redLip), `secondary` (**white + 2px `interactiveSecondary` border + `interactiveSecondaryLip` lip, ink label**), `tertiary` (quiet text, `muted`). Plus a `disabled` style per recipe above. Reward CTAs use a `gold` variant. |
| `TabBar` | `components/ui/TabBar.tsx` | white pill (bg #fff, hairline border, lip 4px + ambient shadow), 7px padding, 46px icon-only slots; **active = solid #be0027 circle with 3px #6e0014 lip** (replaces red-glow shadow). Add a 110px bottom scrim `linear-gradient(transparent → page bg 62%)` behind the pill so content fades out. |
| `LockTile` | **NEW** `components/ui/LockTile.tsx` | the reusable locked glyph tile: `warningContainerLow` bg, `warningContainer` lock icon (stroke 2, ~20px), radius 11–14. Used by Learn rows, game-selector rows, and the lock modal so "locked" is one consistent object. |
| `StreakPill` | `components/ui/StreakPill.tsx` | goldPale bg, 1px goldLip border, 3px goldLip lip, flame icon `#be0027`, count Baloo 800 goldDeep, tabular-nums |
| Top bar | each tab screen | wordmark **ಕನ್ನಡ ಬಾ** (Baloo 800 22, `Colors.primary`) left + StreakPill right + hairline bottom (keep existing structure) |
| `ProgressRing` | exists | reuse; add multi-ring variant for Home daily goal (3 concentric rings, 12px stroke, 5px gap, track = `color-mix(ring 16%, #fff)`) |
| `AudioOrb` | `components/ui/AudioOrb.tsx` | circle `#be0027` with 3px `#6e0014` lip, white speaker icon; gold variant goldPale/goldLip for summary rows |
| Progress bars | shared | 8–9px tall, radius 99, gold `#fdc003` fill on `rgba(27,29,14,0.10)` track (red `#be0027` fill on gold surfaces) |

---

## Screens (mapped to codebase files)

### 1. Home — `app/(tabs)/index.tsx` (restructured)
Order top→bottom (20px gutters):
1. Top bar (wordmark + StreakPill, hairline).
2. Greeting: "Namaskāra, {firstName}!" Baloo 800 34; sub DM Sans 15 muted: "Let's build your Kannada fluency today."
3. **Daily-goal rings card** (white chunky card): 150px 3-ring stack LEFT (outer `#be0027` Listen, mid `#fdc003` Speak, inner `#91001b` Practice; center "Daily / GOAL"), stats column RIGHT — per metric: dot + label (DM Sans 700 13 muted) and `7/9`-style value (Baloo 800 22 in ring colour, total 14 faint). **NEW DATA:** requires per-day listen/speak/practice counts — extend `progressStore` (today's words heard / spoken prompts done / practice rounds) or derive from existing `todayMinutes` split; product call, flag in PR.
4. **Continue card** (the screen's one action-red): bg `#be0027`, 5px redLip lip; white play orb 44px left; "Continue where you left off" Baloo 700 17 white + "Lesson {n} · {title} · ~5 min" 12.5 white@85%; chevron right. → `router.push('/lesson/{slug}')` (same logic as current hero).
5. **Words-learnt banner** (gold reward): gradient goldHi→gold, 5px goldLip lip; "Words learnt: {wordsLearned}" Baloo 800 19 `#6c5000` + "65%" right; 9px red progress bar on `rgba(108,80,0,0.22)` track; caption "of your weekly target achieved". **NEW DATA:** weekly word target (use `dailyGoalMinutes`-derived target or add `weeklyWordTarget` to user store).
6. **Stuck right now?** card — keep existing behaviour/copy exactly (redPale bg, pulsing 44px red SOS tile w/ 3px lip, title `Colors.primary`, sub muted, chevron) → `/emergency`. (This stays red — it's an *urgent* surface, rule 5, not a warning.)
7. Floating TabBar.
Removed vs current code: brand-gradient hero with progress dots, "Your progress" ring row, QuickLink pair (Practice/Journey) — superseded by 3–5.

### 2. Learn — `app/(tabs)/learn.tsx`  ⟵ warm-accent touchpoints
Top bar + title "Lessons" 34 + "8 steps to speaking". `BasicsCard` restyled: surfaceCreamLow tonal card, white 40px book tile (icon `#be0027`), texts unchanged, chevron — lip 4. Lesson rows (from `PLANNED_LESSON_SLOTS`):
- **Done:** goldPale row + 26px gold check circle w/ 2px goldLip lip; glyph tile goldPale/goldDeep.
- **Active:** white chunky row, `#be0027` glyph tile + 3px lip, row gets 2px `#be0027` border + 5px redLip lip + 42px red play orb.
- **Locked (CHANGED):** row tonal `surfaceCreamLow` @ ~62%; **glyph tile → `LockTile`** (`warningContainerLow` bg + `warningContainer` lock icon) instead of the old 6%-ink tile + grey lock. Title `textFaint`. This is the canonical locked object — burnt-orange now signals "not yet" at a glance. Tapping a locked row still opens the Lesson-Locked modal (§11).
- Keep the ⓘ info button per row (existing dialogs).

### 3. Practice — `app/(tabs)/practice.tsx`
Title "Games" + "Play with what you've learned". **Only live games** (GAMES const, image-match stays hidden). Featured **Quick quiz**: full-width goldHi→gold card, 5px goldLip lip, ಪ glyph watermark (Baloo 800 88, `rgba(120,89,0,0.18)`, top-right), 52px icon well `rgba(255,255,255,0.45)`, bolt icon goldDeep, title Baloo 800 21 `#6c5000`, sub "Test your speed.", 46px red play orb. Grid: Dictation (`#be0027`/redLip, ಕ) + Conversations (`#91001b`/`#4a000e`, ಮ) 2-up at 150px min-height; Opposites (goldPale/goldLip, ವ) full-width 96px. Glyph watermarks 64px, white@22% on red / `rgba(120,89,0,0.20)` on gold. Footnote kept: "Each game draws only from phrases you've already learned." *(Any game tile that's locked because its lessons aren't done uses the §State-semantics locked recipe — `warningContainer` lock badge, tile dimmed.)*

### 4. Profile — `app/(tabs)/profile.tsx`
Top bar; name block left ("Sameecha" 30/800 + "Learning since {month year}") with **76px gold streak medallion** right (goldHi→gold circle, 5px goldLip lip, count Baloo 800 27 + "DAY STREAK" 8.5/700). Overall-progress gold band (gradient, 5px lip, label + % Baloo 800 22, 9px red bar, "Lessons + games combined"). Two white stat cards (flame `#be0027` / book goldDeep, value 28/800 tabular). "Your goal" row (existing GoalSummarySheet trigger). Settings card: single white card, hairline-separated rows (Reminders / Audio & pronunciation / Help & feedback), icons `#be0027`, alternating row tint optional. **"Sign out" = secondary (tan) button** — white + 2px `interactiveSecondary` border + tan lip, label `#1b1d0e` (triggers existing SignOutDialog). *(Was red text on white; sign-out is a secondary action, not the destructive-confirm itself — the red confirm lives in the dialog.)*

### 5. Emergency — `app/emergency.tsx` (structure unchanged)
Red gradient header (red2→red 160deg), rounded-bottom radius 16 + 4px redLip lip, back chip white@18% w/ lip; title "Emergency phrases", sub "Works offline · tap any card to hear it". Category chips: active = `#be0027` pill w/ 3px redLip lip, idle = white + hairline. Phrase rows: white chunky cards with **5px left border in group colour** (gold for Auto/cab, red2 for In trouble), Kannada Baloo 700 17, "roman · english" caption, 36–44px AudioOrb. Keep loading/error/retry states and footnote. *(Emergency is intentionally all-red urgency — do **not** introduce warning-orange here.)*

### 6. Lesson runner — `components/lesson/*`
- `LessonProgressBar`: label 11.5/700 faint + 9px gold bar. Exit chip: 38px white circle + hairline + lip 3.
- `SituationPhase`: goldPale "SITUATION / {title}" card (5px goldLip lip, min 170px), title + body, red "Let's start" LipButton.
- `TeachWordsPhase`: recessed `#f3ecd9` word card (lip 4) — transliteration DM Sans 700 40, english 18 muted, Kannada glyph 14 faint; 64px red AudioOrb; CTA "Got it".
- `PracticeWordsPhase` (listen): 72px red AudioOrb + speed chips (active = goldPale pill w/ goldLip border); "What does this mean?" Baloo 800 20; `AnswerOption` → white chunky option cards, **correct = goldPale + 2px goldLip border + gold check circle; wrong = redPale + 2px red2 border**. (Wrong stays red — it's an error, not a warning.)
- `SummaryPhase`: "What you learned" + WORDS/PHRASES label rows; rows = white lip-3 cards (transliteration 700 14.5, glyph 12 faint, english right-aligned 12.5, 34px goldPale AudioOrb).
- `DoneCard`: centered "Nice — that's the lesson done."; stat lines (icons `#be0027`); goldPale "TAKE IT OUTSIDE" prompt card (5px goldLip lip); "Keep practising" game rows with red pill Play buttons; primary red CTA "I'll try this in real life", **secondary (tan) "Back to lessons"** (was white/hairline). Keep all existing save/celebration logic.

### 7. Onboarding — `app/onboarding/*`  ⟵ warm-accent touchpoints
- `welcome.tsx`: red gradient + gold bloom + **floating glyph watermark** (white@10%, rotated ±8–14°); hero ಬಾ 64 + "Kannada ಬಾ" 33/800 (ಬಾ gold) + tagline; **three tilted white hook cards** (rotate −3°/2.5°/−1.5°, lip `0 4px 0 rgba(0,0,0,0.30)`, goldPale icon wells w/ goldDeep icons): "Speak from day one / Real phrases, not grammar drills", "Never get stuck / Survival phrases · works offline", "5 minutes a day / Small streaks, real progress"; white sheet (28px top radius) with ProgressDots, "Let's get you talking", "Free · no card · works offline", red "Get Started" LipButton.
- `name/goal/motivation/commitment`: keep flow + copy; restyle — ProgressDots (active = 22px red bar); step label 11/700 +2 tracking; titles Baloo 800 27; `OptionCard` → chunky: selected `#fff5f5` bg + **2px `#be0027` border + red check circle + lip 4 `rgba(145,0,27,0.25)`**, idle white + 2px ink@10% border + lip 3; text input: white, 2px `#be0027` border when focused, lip shadow `rgba(145,0,27,0.20)`. Footer: **Back and Continue equal width (1:1)** — **Back = secondary (tan) button** (white + 2px `interactiveSecondary` border + tan lip), **Continue = red primary**, and **Continue while invalid uses the disabled recipe** (`surfaceContainerHigh` fill + `textFaint` label, flat — replaces the old `#c8c4b0`).
- `basics.tsx`: replace GuidePager forced read with the **4-step gentle flow** (§8).

### 8. Kannada basics (guide) — `app/guide.tsx`, `app/onboarding/basics.tsx`, `constants/guide.ts`, `components/guide/*`
Replace the 4 dense swipe pages with a **4-step paced flow** (back chip + "Kannada basics" + step counter `n/4` + gold progress bar; red Next CTA per step):
1. **Three things — that's it**: reassurance paragraph ("You don't need to memorise anything…") + 3 numbered cards (gold number circles): Say what you see / Capitals curl your tongue / Doubled letters linger. CTA "Show me the vowels".
2. **Vowels come in pairs**: 5 rows pairing short→long (ಅ a "up" → ಆ ā "art"; ಇ→ಈ; ಉ→ಊ; ಎ→ಏ; ಒ→ಓ), long glyph in red, gold chevron between, 32px gold AudioOrb per row; footnote "+ three loners you'll meet later: ಐ ai · ಔ au · ಋ ṛ". (Content from existing `GUIDE_SECTIONS[0]`.)
3. **Consonants live in 5 places**: accordion families — Throat (ಕ ಖ ಗ ಘ) / Palate (ಚ ಜ) / Curled tongue (ಟ ಡ ಣ) / Teeth (ತ ದ ನ) / Lips (ಪ ಬ ಮ), one open at a time (open = goldLip border + lip 4; glyph chips = goldPale tiles w/ 2px goldLip lip). **Link "See the full 34-letter chart →" uses the secondary-link treatment** (`interactiveSecondary` chip/border, ink label) and opens the existing complete chart as a reference screen.
4. **Reading + try it**: Ta/ta/Da/da 4-row comparison card (capitals red, lowercase goldDeep) + goldPale "TRY IT — haLLi · ಹಳ್ಳಿ" card; CTA "Done — start Lesson 1".
Data: restructure `GUIDE_SECTIONS` into this step model (keep full chart data for the reference screen). In onboarding, step 4's CTA finishes onboarding (existing `finishOnboarding`).

### 9. Games — `src/games/*`, `components/lesson/LessonSelector.tsx`  ⟵ warm-accent touchpoints
- **LessonSelector:** back chip + game title + "Pick a lesson to play with"; unlocked rows = white chunky cards (goldPale glyph tile), **locked rows = §State-semantics locked recipe** (tonal @65%, `LockTile` with `warningContainer` lock glyph) + footnote "Finish a lesson on the Learn tab to unlock it here."
- Quiz round (`QuickQuizGame`): header = exit chip + "Question n / N" + "Score n" (tabular); **TimerBar → 8px gold bar**; prompt = white chunky card (label "WHAT DOES THIS MEAN?", Kannada Baloo 800 38, transliteration 14); options 2×2 chunky cards (correct goldPale/goldLip, wrong redPale/red2); `FeedbackBanner` → goldPale banner w/ gold check circle, "Correct! · streak ×3" + meaning + "Next ▸".
- `ResultScreen` (shared): keep rangoli; title Baloo 800 22, score Baloo 800 52 `#be0027`, "out of N correct", best-streak goldPale pill; red "Play again" LipButton + **secondary (tan) "Back to Practice"** (was white ghost).

### 10. Auth — `app/(auth)/login.tsx`  ⟵ warm-accent touchpoints
Wordmark hero (ಕನ್ನಡ ಬಾ 42 + "Kannada Baa" 18, both `#be0027`); segmented Log in/Sign up toggle (active = white pill w/ 2px lip in ink@6% track; **inactive label `interactiveSecondary`-darkened or `muted`** — keep contrast ≥4.5); heading "Welcome back" + sub; inputs = white, 1px ink@14% border, 3px ink@6% lip, radius 14; "Forgot password?" red 12.5 right-aligned; red "Log in" LipButton (**disabled recipe while fields empty**); "or" hairline divider; Google (**secondary tan**: white + 2px `interactiveSecondary` border + tan lip, red G) + Apple (ink bg) social buttons. Keep all auth logic/toasts.

### 11. Modals — `components/modals/instances/*` (ModalHost unchanged)  ⟵ warm-accent touchpoints
- **`LessonLocked` (CHANGED):** white card radius 16, `0 24px 60px rgba(0,0,0,0.22)`; **icon well = `warningContainerLow` circle + `warningContainer` lock icon** (was the generic red/grey well) — matches the `LockTile` on the row that opened it; title Baloo 800 19 centered ("Lesson {n} is locked"), body 13.5 muted ("Finish Lesson {n-1} first to unlock it."), **primary red "Got it" / secondary (tan) "Back to lessons."** Dim 0.40 ink.
- Other dialogs (SignOut, GoalComplete…): white card, centered icon well, title Baloo 800 19 centered, body 13.5 muted, **red primary chunky button + secondary (tan) or tertiary text secondary** (SignOut's destructive confirm stays red; its "Cancel" is secondary tan).
- `RemindersSheet`: bottom sheet (24px top radius, grab handle), "Reminders" + sub, toggle row (gold track switch w/ inset lip), TIME label + 4 time chips (selected goldPale/goldLip), red "Save reminder".
- Streak `Celebration`: full red gradient takeover, confetti dots (gold/white), **130px gold medallion (6px goldLip lip)** with flame + count, title Baloo 800 28 white ("A full week!"), sub white@92%, gold "Keep it going" button.

---

## Interactions & Motion
- Lip press everywhere: press-in translateY(+lip) + lip→0, 80ms ease; release reverses. Use haptics where games already do. **Disabled and locked surfaces do not animate** (flat, no translate).
- Screen entry: keep existing 220ms fade/slide; optional 60ms stagger on card lists (LessonSelector already does this).
- Tab pill: bottom scrim so content fades behind it; active tab swap is instant (no morph).
- Rings animate fill on mount (timing 600ms ease-out). Timer bar drains linearly.
- Reduced motion: respect `useReducedMotion` — disable tilt/confetti, keep opacity fades.

## State / Data Notes
- New: per-day Listen/Speak/Practice counts for Home rings (progressStore extension) and weekly word target for the banner — confirm with product before building; everything else reuses existing stores/hooks (`useStreak`, `useWordsLearned`, `useCompletedLessons`, `useOverallProgress`).
- Locked/disabled are **derived view-states**, not stored: a row is locked when its lesson isn't unlocked (`useCompletedLessons`/unlock logic — unchanged); a button is disabled from local form validity. No new persisted state for the colour work.
- Guide restructure: new step model in `constants/guide.ts`; keep raw chart data for the reference screen.
- Removed surfaces: Home quick-links + gradient hero; Karnataka-culture entry point is NOT part of this redesign (heritage routes untouched).

## Assets
- Fonts: Baloo Tamma 2 (400–800) + DM Sans — both already in `constants/fonts.ts` (Baloo). No images required; all motifs (kolam grid, glyph watermarks, confetti, rangoli) are drawn.
- Icons: keep Tabler icons (`constants/icons.ts`); stroke ~1.9–2.2. Lock glyph uses the existing `lock` icon at `warningContainer`.

## Implementation order (suggested)
1. **Tokens first** — add `warningContainer` + `interactiveSecondary` (+ optional derived helpers) to `constants/colors.ts`; update `constants/shadows.ts` lip presets (tan lip, disabled flat).
2. **Shared primitives** — `ChunkyPressable` (incl. disabled path), `LipButton` 3 variants + disabled, `LockTile`, `TabBar`, `AudioOrb`, multi-`ProgressRing`.
3. **Tabs** (Home → Learn → Practice → Profile), wiring the locked recipe on Learn first since it exercises `LockTile`.
4. **Flows** — onboarding, lesson runner, guide, games, auth.
5. **Modal layer** — `LessonLocked` (validates the warning system end-to-end), then the rest.

## Files in this bundle
- `design-reference/Kannada Baa - Chunky App v3.html` — open in a browser; all 30+ screens on one canvas (tabs, onboarding, lesson flow, auth/games/guide, modals, emergency, gentle basics flow). *(Predates the new accent tokens — see the ⚠️ note up top.)*
- `design-reference/ck-system.jsx` — the kit itself: tokens, Chunky press wrapper, icons, tab bar, rings, app bar (read this first).
- `design-reference/ck-home.jsx`, `ck-tabs.jsx`, `ck-flows.jsx`, `ck-onboarding.jsx`, `ck-lessonflow.jsx`, `ck-game.jsx`, `ck-auth-guide.jsx`, `ck-modals.jsx`, `ck-basics.jsx` — per-area screen references.
- `design-reference/Color Hierarchy.html` — colour roles, rules, and per-screen red/gold map.
- `design-canvas.jsx`, `tweaks-panel.jsx` — preview scaffolding only; ignore for implementation.
