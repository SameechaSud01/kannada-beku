# Kannada Beku — Brand Identity & Style Guide

One source of truth for visuals across **app, website, LinkedIn, and Instagram.**
All values are pulled from the live app design system (`constants/`), so anything
built off this doc stays pixel-consistent with the product.

---

## 1. Brand Essence

| | |
|---|---|
| **Name** | Kannada Beku |
| **Meaning** | "Kannada is wanted / needed" |
| **Tagline (primary)** | Learn Kannada. Belong in Bengaluru. |
| **Tagline (playful)** | Gottilla Kannada? No problem. Let's fix that. |
| **Personality** | Warm, rooted, playful, confident — not a sterile classroom |
| **Voice** | Friendly local, never preachy. Short sentences. A little cheeky. Bengaluru-proud. |

**Three words:** Warm · Rooted · Playful.

**Do** lead with belonging and everyday usefulness ("order coffee, talk to your
auto driver, feel at home"). **Don't** sound like a corporate language platform or
a textbook.

---

## 2. Core Colors

The palette is **warm-only**: Mysore red, turmeric gold, and cream neutrals.
No blue, green, teal, or coral — these read as "off-brand" instantly.

### Primary — Mysore Red (the brand signature)
| Role | Name | Hex | Swatch |
|---|---|---|---|
| Brand red (deep) | `primary` | `#91001B` | 🟥 |
| CTA red (bright) | `primaryContainer` | `#BE0027` | 🟥 |
| Red "lip"/shadow | `redLip` | `#6E0014` | 🟥 |
| Deepest maroon | `redLipDeep` | `#4A000E` | 🟥 |

> Red is the **action color**. Use it for the one primary call-to-action per
> screen/post. The brand mark and CTA buttons live here.

### Secondary — Turmeric Gold (reward & energy)
| Role | Name | Hex | Swatch |
|---|---|---|---|
| Gold | `secondaryContainer` | `#FDC003` | 🟨 |
| Bright gold | `goldBright` | `#FFD24D` | 🟨 |
| Gold lip/ring | `goldLip` | `#C98A00` | 🟨 |
| Soft gold accent | `secondaryFixed` | `#FFDF9E` | 🟨 |
| Dark gold (text) | `secondary` | `#785900` | 🟫 |

> Gold = **progress, reward, celebration, highlights**. Never use gold as a
> competing CTA next to red.

### Neutrals — Cream & Ink
| Role | Name | Hex | Swatch |
|---|---|---|---|
| Page cream (warm) | `surfaceCream` | `#FAF6EA` | ⬜ |
| Near-white | `surface` | `#FCFCFA` | ⬜ |
| Recessed cream | `surfaceCreamLow` | `#F3ECD9` | ⬜ |
| Card / panel | `surfaceContainerHighest` | `#E6E6E3` | ⬜ |
| Ink (primary text) | `onSurface` | `#1B1D0E` | ⬛ |
| Caption / label | `tertiary` | `#464646` | ⬛ |
| Faint hint text | `textFaint` | `#908D76` | ⬛ |
| Splash background | — | `#FFFDF5` | ⬜ |

### State accents (warm-only)
| Role | Name | Hex |
|---|---|---|
| Locked / caution fill | `warningContainerLow` | `#F7E4D3` |
| Locked / caution icon | `warningContainer` | `#D97B3A` |
| Error fill (pale) | `errorContainerLow` | `#F3DADA` |
| Secondary interactive (tan) | `interactiveSecondary` | `#B8956A` |

---

## 3. Color Usage Rules

1. **One red moment per surface** — a single primary CTA. More than one red and
   nothing reads as "the action."
2. **Gold is reward, not action** — streaks, badges, progress, accents.
3. **Cream is the canvas** — `#FAF6EA` backgrounds, ink text, red/gold accents on top.
4. **Pale tints are surfaces, paired with deep text** (e.g. pale red fill + deep red text).
5. **No cool colors.** Warm palette only.
6. **Red `#BE0027` / gold `#FDC003`** are the two colors people should remember us by.

### Quick recipes
- **Marketing CTA button:** fill `#BE0027`, text `#FFFFFF`, lip/shadow `#6E0014`.
- **Highlight / badge:** fill `#FDC003`, text/ink `#1B1D0E`.
- **Background section:** `#FAF6EA` with `#1B1D0E` text.
- **Light section divider:** card surface `#E6E6E3`.

---

## 4. Gradients

| Name | Stops | Use |
|---|---|---|
| **Red CTA** | `#91001B → #BE0027` | Primary buttons, hero panels |
| **Gold glow** | `#FFD24D → #FDC003` | Reward/celebration moments |

---

## 5. Typography

| Use | Typeface | Weight |
|---|---|---|
| **Display / titles / numbers / buttons** | **Baloo Tamma 2** | Bold–ExtraBold (700–800) |
| **Body / captions / UI labels** | **DM Sans** | Regular–Bold (400–700) |
| **Kannada script** | Baloo Tamma 2 (covers Kannada) / Noto Sans Kannada fallback | — |

**Personality:** Baloo Tamma 2 is rounded and friendly — it *is* the chunky,
playful brand voice. Use it for anything that should feel like the product.
DM Sans keeps body text clean and readable.

### Web / social fallback stack
- Headings: `"Baloo Tamma 2", "Baloo 2", system-ui, sans-serif`
- Body: `"DM Sans", -apple-system, "Segoe UI", Roboto, sans-serif`

Both are free Google Fonts — use the same on the website so it matches the app.

### Type scale (reference, from the app)
| Style | Font | Weight | Size |
|---|---|---|---|
| Hero title | Baloo Tamma 2 | 800 | 30 |
| Screen title | Baloo Tamma 2 | 800 | 24 |
| Card heading | Baloo Tamma 2 | 700 | 18 |
| Big number | Baloo Tamma 2 | 800 | 28 |
| Button label | Baloo Tamma 2 | 700 | 16.5 |
| Body | DM Sans | 500 | 14 |
| Eyebrow/caption | DM Sans | 700 | 11 (1.4 letter-spacing, UPPERCASE) |

---

## 6. The "Chunky" Visual Language

This is the signature look — carry it into web and social graphics so everything
feels like one family.

- **Rounded corners.** Default card/button radius ≈ **16px** (`chunky`). Pills use full radius.
- **The "lip."** Every tappable element has a **5–8px solid bottom edge** in a
  darker shade of its own face (red→`#6E0014`, gold→`#C98A00`, white→ink @10%).
  This gives buttons a physical, pressable, toy-like feel. Recreate it in web/social
  as a hard bottom border or offset shadow (no soft blur on the lip).
- **Soft ambient shadows** for floating elements (nav, modals): black, low opacity,
  large blur, `0px` x-offset, downward y-offset.
- **Generous padding.** Spacing scale: 4 · 8 · 12 · 16 · 20 · 24 · 32.

**Feel:** tactile, rounded, confident. Think friendly buttons you want to press —
not flat minimalism, not skeuomorphic gloss.

---

## 7. Logo & Icon

- App icon: `assets/icon.png` · Adaptive (Android): `assets/adaptive-icon.png`
- Splash: `assets/splash-icon.png` on `#FFFDF5`
- Favicon: `assets/favicon.png`

**Clear space:** keep padding equal to the height of the "K" around the mark.
**Backgrounds:** prefer cream `#FAF6EA` or red `#BE0027`. On red, use the
white/cream version of the mark. Don't place the logo on busy photos without a
solid scrim.

---

## 8. Per-Channel Cheatsheet

### App
The source of truth — `constants/colors.ts`, `fonts.ts`, `spacing.ts`, `shadows.ts`.

### Website
- Background `#FAF6EA`, ink text `#1B1D0E`.
- Headlines Baloo Tamma 2; body DM Sans.
- Primary CTA = red chunky button with `#6E0014` lip. Gold for highlights/badges.
- Reuse the 16px radius + lip everywhere for visual continuity.

### LinkedIn
- Slightly more restrained: more cream/ink, red as a single accent.
- **Banner:** cream or red gradient `#91001B→#BE0027`, logo + tagline
  "Learn Kannada. Belong in Bengaluru."
- Keep gold for one highlight element so posts stay on-brand but professional.

### Instagram
- Lean into warmth and play. Cream and gold backgrounds, red for punchy CTAs.
- Big rounded Baloo Tamma 2 headlines; chunky lipped "buttons" as graphic devices.
- **Grid rhythm:** alternate cream / gold / red tiles for a cohesive feed.
- Story CTAs: red button graphic with the lip.

### Universal social rules
- Two recognizable colors per graphic max + neutral. Usually **cream + one of red/gold.**
- Always Baloo Tamma 2 for the headline.
- Kannada script welcome and encouraged — it's the brand.

---

## 9. Quick Copy-Paste Tokens

```
/* Brand core */
--red:           #BE0027;  /* primary CTA   */
--red-deep:      #91001B;  /* brand red     */
--red-lip:       #6E0014;  /* button lip    */
--gold:          #FDC003;  /* reward/accent */
--gold-bright:   #FFD24D;
--gold-lip:      #C98A00;

/* Neutrals */
--cream:         #FAF6EA;  /* page bg       */
--cream-low:     #F3ECD9;
--ink:           #1B1D0E;  /* text          */
--ink-caption:   #464646;
--ink-faint:     #908D76;
--white:         #FCFCFA;

/* Type */
--font-display:  "Baloo Tamma 2", "Baloo 2", system-ui, sans-serif;
--font-body:     "DM Sans", -apple-system, "Segoe UI", Roboto, sans-serif;

/* Shape */
--radius-chunky: 16px;
--lip-depth:     5px;
```

---

*Source of truth: this app's `constants/` design tokens. If a value changes there,
update it here so app, web, and social never drift apart.*
