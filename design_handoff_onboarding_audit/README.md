# Handoff: Onboarding Flow — Audit Fixes

## Overview
UX-audit-driven redesign of the Kannada Beku onboarding flow: Welcome → 4-step intake (Name, Why, Time, +1) → post-intake greeting → "Kannada basics" primer (7 screens, Lesson 0). Nine issues were found and fixed; this bundle contains the corrected designs for 9 screens (8 fixed + 1 new).

## About the Design Files
The files in this bundle are **design references created in HTML/React (Babel-in-browser)** — prototypes showing intended look and behavior, **not production code to copy directly**. The task is to **recreate these designs in the Kannada Beku Expo / React Native app** (`github.com/SameechaSud01/kannada-beku`), using its existing `constants/` tokens, `components/` primitives, and icon map. Every value in these mocks was taken from that codebase's design system, so the mapping should be 1:1.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii, and lip shadows are exact token values. Recreate pixel-perfectly using the app's existing primitives (LipButton, OptionCard, ProgressBar, Icon, etc.) — do not restyle from scratch.

## Audit findings (why each change exists)
1. **Two competing progress systems** — dot indicator said "screen 2 of 5" while an eyebrow said "Step 1 of 4" (off by one). **Fix:** exactly one indicator — a 4-segment gold bar. No dots, no "Step x of 4" text.
2. **Name screen half empty** — content was vertically centered; jumped when keyboard opened. **Fix:** top-anchor all intake steps.
3. **Red input border read as error** — **Fix:** neutral default input (hairline + card lip); red only for caret and focus ring.
4. **Personalization not skippable** — **Fix:** "Skip" affordance top-right on steps 2–3.
5. **Step 2 hid options below fold** — **Fix:** compact icon rows, all 6 visible; checkbox affordance; "n of 3 picked" counter appears only after first pick.
6. **Step 3 (i) icons were dead weight** — **Fix:** detail inline in each row's subtitle; 10 min preselected ("Most popular" badge) so Continue is never disabled.
7. **Off-palette green + grey** — "You're ready" checks were green (green is scoped to answer feedback only); quiz chips on 3/7 were flat grey (read disabled). **Fix:** gold reward circles; white chunky chips.
8. **Vowel grid gave no feedback** — **Fix:** speaker glyph per tile, gold "heard" state, "3 of 8 heard" counter; transliteration labels ink (not red).
9. **Welcome value cards overlapped/clipped** — **Fix:** ±0.8° tilt with safe spacing.

## Screens

All screens: 390×844 (iPhone), cream canvas `#FAF6EA` with kolam dot-grid (ink @5%, 24px grid) unless noted. Padding rail: 24px horizontal.

### 1. Welcome (fixed)
- Full-screen red gradient `linear-gradient(152deg, #91001B, #BE0027)`, light status bar.
- Centered: ಬೇ glyph (Noto Sans Kannada 700, 64px, white) → wordmark "Kannada ಬೇಕು" (Baloo Tamma 2 800 33px white; ಬೇಕು in gold `#FDC003`) → subtitle (DM Sans 15.5px, white @92%).
- 3 value cards (rows, gap 14): white, radius 16, padding 14×18, shadow `0 5px 0 rgba(74,0,14,0.45)`, alternating rotate −0.8°/+0.8°/−0.8°. Each: 44px gold-fixed (`#FFDF9E`) icon tile (radius 12, icon 22px `#6C5000`) + title (Baloo 700 17px ink) + sub (DM Sans 13.5px `#464646`).
  - target / "Speak from day one" / "Real phrases, not grammar drills"
  - sos / "Never get stuck" / "Survival phrases · works offline"
  - flame / "5 minutes a day" / "Small streaks, real progress"
- Bottom sheet: white, radius 28px top corners, padding 26 24 30, shadow `0 -14px 34px rgba(0,0,0,0.22)`. Title "Let's get you talking" (Baloo 800 25px, centered), caption "Free · no card · works offline", full-width red LipButton "Get Started →" (lg).
- **No progress dots on this screen.**

### 2. Intake chrome (shared, steps 1–4)
- Progress: 4 equal segments (height 6, radius 3, gap 6), filled = gold `#FDC003`, rest = ink @10%. Sits under status bar, 24px padding. This is the ONLY progress indicator.
- "Skip" (DM Sans 700 13.5px `#6F6C58`) right-aligned on the same row — steps 2 and 3 only.
- Title block: h1 Baloo 800 32px / 1.12, ink `#1B1D0E`; subtitle DM Sans 15.5/1.45 `#464646`, 10px below.
- Footer (pinned bottom, padding 16 24 30, gap 12): white LipButton "Back" (33% width) + red LipButton "Continue →" (fills). Continue is never rendered disabled in these fixes — steps have defaults or Skip.

### 3. Step 1 · Name (fixed)
- Title "What should we call you?", sub "So lessons can greet you properly — Namaskāra!"
- Input (26px below): white, radius 16, border 1px `rgba(27,29,14,0.12)`, shadow `0 4px 0 rgba(27,29,14,0.10)`, padding 17×18. Value in Baloo 700 19px ink. Caret tinted red `#BE0027` (2×22px). **No red border at rest.**
- Helper "Just a first name is perfect." (DM Sans 13.5 `#6F6C58`).
- Behavior: autofocus the input (keyboard already up); layout top-anchored so nothing jumps.

### 4. Step 2 · Why (fixed)
- Title "Why are you learning Kannada?", sub "Pick what fits — we'll shape your lessons around it." Skip visible.
- 6 compact option rows (gap 10, radius 16, padding 12×14): icon tile 36px (radius 10) + label (Baloo 700 15.5px) + 22px checkbox (radius 7).
  - Unselected: white, 2px border ink@10%, lip `0 3px 0 rgba(27,29,14,0.10)`, icon tile cream-low `#F3ECD9`, icon `#464646`, checkbox 2px border ink@18%.
  - Selected: pale-red fill `#FBEAEC`, 2px red border `#BE0027`, no lip, icon tile white with red icon, checkbox red-filled with white check.
- Options (icon / label): moodHappy / "Don't want to feel like an outsider" · chat / "Connect better with Kannadiga friends" · globe / "Navigate daily life in Bengaluru" · bolt / "Stop getting overcharged (auto, markets)" · sparkle / "Impress someone special" · home / "Talk to family and in-laws"
- Counter "2 of 3 picked" (DM Sans 700 13px `#785900`) appears **only after the first pick**; max 3 selections.

### 5. Step 3 · Time (fixed)
- Title "How much time can you commit?", sub "Your daily goal — you can change it anytime in Profile." Skip visible.
- 3 radio cards (gap 12, radius 16, padding 16×18), same selected/unselected treatment as Step 2 but 24px round radio (white 8px dot when selected).
- Rows: "5 min / day · Quick daily habit · about one scenario" · "10 min / day · Steady progress · scenario + practice" (**preselected**, gold badge "MOST POPULAR": DM Sans 700 11px uppercase, `#6C5000` on `#FFDF9E`, pill, nowrap) · "20 min / day · Serious learner · everything, daily"
- **No (i) icons** — detail lives in the subtitle.

### 6. Post-intake greeting (NEW screen, after step 4)
- Vertically centered: 96px app-mark tile (red gradient, radius 26, lip `0 6px 0 #6E0014`) with gold ಕ (Noto Kannada 700 48px `#FDC003`); h1 "Namaskāra, {firstName}!" (Baloo 800 34px); sub "Your plan is ready — built around what you picked."
- Plan chips (wrap, gap 10): white pills, hairline border, lip, icon 15px `#785900` + label DM Sans 700 13.5px. Content echoes actual intake picks (e.g. clock/"10 min / day", globe/"Daily life in Bengaluru", moodHappy/"Belonging").
- Bottom: full-width red LipButton "Start Kannada basics →".

### 7. Lesson chrome (Kannada basics, shared)
- Header row: 40px round white back button (hairline + lip, back icon 18px `#91001B`) + "Kannada basics" (Baloo 700 18px) + "n/7" (DM Sans 700 14px `#464646`).
- Progress bar 12px below: height 8, radius 4, track ink@8%, gold fill = n/7.
- Footer: full-width red LipButton "Next".

### 8. Basics 2/7 · Vowel sounds (fixed)
- Title "The vowel sounds" (Baloo 800 30px), sub "Hear it first, then say it. Tap each one."
- Mouth-position card: white, radius 16, hairline + lip, padding 12×16; tongue diagram image 76×106 (radius 12, object-fit cover) beside caption "Vowels stay open — mouth relaxed, tongue flat." (DM Sans 14.5/1.45 `#464646`). Asset: `assets/tongue-a.png`.
- 4×2 vowel grid (gap 12): tiles radius 16, padding 12 0 9; glyph Noto Kannada 700 30px ink; roman label DM Sans 700 13px **ink** (not red).
  - Unheard: white, hairline, lip `0 4px 0 rgba(27,29,14,0.10)`, small speaker icon (12px, ink@35%) top-right.
  - Heard: pale-gold `#FFF6DA`, border + lip `#C98A00`, check icon (12px `#785900`) top-right, roman label `#6C5000`.
- Counter "3 of 8 heard" (DM Sans 700 13px `#785900`, centered).
- Vowels: ಅ a · ಆ aa · ಇ i · ಈ ee · ಉ u · ಊ oo · ಎ e · ಒ o.
- Behavior: tap plays audio and flips to heard; consider Next pulsing once 8/8 heard.

### 9. Basics 3/7 · Short vs long (fixed)
- Two listen cards side by side (gap 12): white, hairline + lip, centered column — glyph (Noto Kannada 700 34px **ink** — not red), roman (DM Sans 700 15px), gloss (12.5px `#6F6C58`), 40px gold play orb (`#FDC003`, lip `0 3px 0 #C98A00`, play icon 16px `#6C5000`). Cards: ಕಲಿ/kali/learn · ಕಾಲಿ/kaali/empty.
- Quiz zone: cream-low `#F3ECD9` card, radius 16. Eyebrow "WHICH DID YOU HEAR?" (DM Sans 700 12px, tracking 1.4, `#785900`). "Play a sound" row: white, radius 12, lip, 24px gold play orb + label (Baloo 700 15px ink).
- Answer chips (2, gap 10, radius 14, padding 13 vertical):
  - Idle: white, 2px border ink@12%, lip ink@10%, label Baloo 700 16.5px ink. **Never flat grey.**
  - Correct (the ONE sanctioned green): fill `#DCEFC6`, 2px border `#4E9A2F`, lip `0 4px 0 #3C7A22`, check + label `#356016`. Feedback line "Correct! Well done." (DM Sans 700 13.5 `#356016`). Wrong answer: shake animation + encouraging copy ("Not quite. Let's try again!").

### 10. Basics 6/7 · The rhythm (fixed)
- White card: sentence ನನಗೆ ಕನ್ನಡ ಬೇಕು (Noto Kannada 700 26px, centered); syllable chips (na na ge kan na / da bē ku): DM Sans 700 14.5px, radius 10, padding 7×13 — idle cream-low + ink; the currently-beating chip gold `#FDC003` + `#6C5000` with lip `0 2px 0 #C98A00`.
- Gloss line: "I want Kannada" — Nanage Kannada bēku (13.5px `#6F6C58`).
- **"Hear the beat" is a white pill** (200px, full radius, hairline-strong border, lip) with a 26px gold play orb + label Baloo 700 15.5px ink. It is NOT a gold button — gold never competes with the red Next CTA.
- Behavior: play highlights chips in sequence (gold state steps across syllables).

### 11. Basics 7/7 · You're ready (fixed)
- Centered 92px celebration circle: gold gradient `linear-gradient(180deg,#FFD24D,#FDC003)`, lip `0 6px 0 #C98A00`, check 44px `#6C5000`. h1 "You're ready!" (Baloo 800 32px), sub "Keep these four in your pocket:".
- 4 rows (gap 12): white, hairline + lip, 30px **gold** check circle (`#FDC003`, lip `#C98A00`, check `#6C5000`) + text DM Sans 500 15px ink. **Not green** — completion is a reward (gold); green is answer feedback only.
  - "Kannada is phonetic — say what you see." / "Long vowels change the word (kali vs kaali)." / "Capital letters (Ta, Da, Na, La) mean curl your tongue." / "Double letters are held slightly longer."
- CTA: red LipButton "Start Lesson 1 · Greetings →".

## Interactions & Behavior
- **Lip press physics (all pressables):** face drops ~3px, lip shrinks to keep bottom edge planted, ~80ms. Never blur the lip shadow.
- Intake: Back/Continue navigate steps; Skip jumps forward; selection state as above; Continue enabled from arrival on steps with defaults (3) or once input is valid (1).
- Vowel tiles: tap → play audio → heard state + counter increment.
- Quiz (3/7): "Play a sound" plays one of the pair; answer → correct bounce+green / wrong shake+retry.
- Rhythm (6/7): "Hear the beat" plays audio, chips highlight in sequence.
- Reduced motion respected; no infinite decorative loops.

## State Management
- Intake store: `firstName: string`, `motivations: string[] (max 3)`, `dailyGoalMinutes: 5|10|20 (default 10)`, persisted; each nullable via Skip.
- Basics lesson: `screenIndex 1–7`, `heardVowels: Set (0–8)`, quiz `answerState: idle|correct|wrong`.
- Greeting screen reads intake store to render name + plan chips.

## Design Tokens
All from `tokens/colors.css` (mirrors app `constants/colors.ts`):
- Red: `--kb-red #BE0027`, `--kb-red-deep #91001B`, `--kb-red-lip #6E0014`, `--kb-red-soft #FBEAEC`
- Gold: `--kb-gold #FDC003`, `--kb-gold-bright #FFD24D`, `--kb-gold-lip #C98A00`, `--kb-gold-fixed #FFDF9E`, `--kb-gold-soft #FFF6DA`, `--kb-gold-dark #785900`, `--kb-gold-ink #6C5000`
- Neutrals: `--kb-cream #FAF6EA`, `--kb-cream-low #F3ECD9`, `--kb-ink #1B1D0E`, `--kb-ink-caption #464646`, `--kb-ink-faint #6F6C58`
- Lines: hairline `rgba(27,29,14,0.08)`, strong `0.12`, card lip `rgba(27,29,14,0.10)`
- Success (answer feedback ONLY): `#4E9A2F` / low `#DCEFC6` / on `#356016` / lip `#3C7A22`
- Gradients (the only two): red `135–152deg #91001B→#BE0027`, gold `180deg #FFD24D→#FDC003`
- Type: Baloo Tamma 2 (700/800, display + button labels) · DM Sans (400–700, body/labels/transliteration) · Noto Sans Kannada (script only)
- Spacing: 4/8/12/16/20/24/32 · Radius: 16 default, pills full · Icons: Tabler outline via the app's `icons.ts` map, 2px stroke, currentColor. No emoji.

## Assets
- `assets/tongue-a.png` — mouth-position diagram (from the design system's `assets/illustrations/`; the app has tongue-ka/la/na variants too).
- Before-state reference screenshots in `before-screens/`.

## Files
- `Onboarding - Audit Fixes.html` — the full audit canvas (findings + before/after pairs).
- `ob-fixes-intake.jsx` — Welcome + intake steps 1–3 + shared intake chrome.
- `ob-fixes-basics.jsx` — lesson chrome + basics 2/7 and 7/7.
- `ob-fixes-extra.jsx` — basics 3/7, 6/7, post-intake greeting.
- Screens 4/4 (intake), basics 1/7, 4/7, 5/7 were not redesigned — only the shared-chrome fixes (single progress bar, no dots) apply to them.
