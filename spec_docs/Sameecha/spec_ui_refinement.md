---
doc: SPEC_UI_REFINEMENT
status: draft
owner: samee
last-reviewed: 2026-06-06
sign-off:
  - PENDING — awaiting owner approval of this spec. Two decisions already taken
    in chat 2026-06-06: (1) Item 1 transliteration font → OVERRIDE to brand sans
    (amends DESIGN.md Amendment A); (2) Item 2 Home hero CTA → lighter-red raised.
related:
  - ../../docs/foundation/DESIGN.md
  - ../../docs/foundation/CONTRADICTIONS.md
  - ./spec_playful_redesign.md
  - ./spec_text_hierarchy.md
  - ./MODALS.md
---

# UI Refinement — visual + UX polish pass

A **correction pass** on the already-built playful redesign (branch
`app_redesign`). **No new features, screens, flows, data models, or behaviour
changes.** Every item tightens typographic consistency, fixes colour semantics,
or clears a clipping/overlap bug so the app reads as finished and cohesive.

This is the contract. The source brief is the owner's "Kannada Beku — UI
Refinement Spec" (chat, 2026-06-06). This doc grounds each item in the actual
code, reconciles it against the foundation `[LOCKED]` decisions, and records the
two design decisions already taken.

> **Relationship to the redesign.** This pass sits **on top of**
> [spec_playful_redesign.md](spec_playful_redesign.md) and ships on the same
> `app_redesign` branch, before the C14 merge-to-main. It does not reopen the
> redesign's locked amendments except where explicitly noted (Item 1 amends
> Amendment A, with owner sign-off).

---

## 1. Decisions taken (chat 2026-06-06)

| # | Question | Decision |
|---|---|---|
| 1 | Transliterations sit in Lora serif-italic (a `[LOCKED]` DESIGN.md / Amendment-A treatment). Spec wants them in the brand sans. | **OVERRIDE.** Move transliterations to the brand sans, differentiated by **weight + colour** only. **Amend DESIGN.md** (ethos "One script per font" bullet + Typography table + `TypeScale.translit`) and **re-sign Amendment A** in the same PR. Open **CONTRADICTIONS C15**. |
| 2 | Home hero "Continue lesson" button is gold (a reward colour used as a CTA). | **Lighter-red raised** `LipButton` on the deeper-red hero card (in-palette, white label), replacing the gold face. |
| 8 | Practice tiles are olive + 2 reds + gold; brief proposed recolouring. | **Keep the current palette as-is** (owner likes it, 2026-06-06). Tile colours are *category* colours, documented as distinct from gold-as-reward (Item 2). Item 8 reduces to a **contrast check** on the gold Opposites tile only. |

> **Transliteration family (Item 1 detail).** Both transliteration and its
> adjacent English gloss render in **`Fonts.dmSans`** (the body sans the glosses
> already use) — translit `dmSans.bold` full-strength, gloss `dmSans.regular`
> muted. This satisfies the brief's "distinguish by weight/colour, **not** a
> different font" within one family, and avoids flipping the locked DM-Sans body
> role for glosses. Brand-chrome taglines (login wordmark) may use `Fonts.baloo`.
> Adjustable at the Phase-A screenshot gate.

---

## 2. Foundation conformance & the one lock change

- **DESIGN.md is `[LOCKED]`.** Item 1 is the *only* item that changes a locked
  decision. It is gated on the owner sign-off already given in chat and must land
  the DESIGN.md edit + Amendment-A re-sign **in the same PR** as the code, with a
  new **CONTRADICTIONS C15** entry opened on promotion and closed on device
  verification. **Why the override is sound:** the locked rationale (transliteration
  must be *visually parseable* as a learning aid) is preserved — it's just carried
  by **weight + muted colour** in the brand sans instead of a second font family,
  which removes the "spliced-in serif" feel the brief flags on the flashcard,
  phrase-builder, and recap screens.
- **All other items conform to existing locks** or bring code back *into* line
  with them (Item 2 and Item 8 both honour the locked token semantics: red =
  primary/CTA, gold = success/reward).
- **Non-negotiables inherited from the foundation** (every item obeys these):
  no hex literals in components (use `Colors`); no raw pixels (wrap
  `moderateScale`/`scale`/`verticalScale`); no emoji/dingbat glyphs (use the
  `Icons` map); `accessibilityLabel` on icon-only buttons; `Pressable` for
  interactives; safe-area insets applied explicitly.

---

## 3. Items already satisfied / premise to re-verify (surface, don't "fix")

The brief was written partly against older screenshots. The audit found the
current `app_redesign` code already meets, or nearly meets, several acceptance
criteria. These are **flagged for owner confirmation against a current build**,
not blindly re-implemented:

| Brief item | Audit finding | Action |
|---|---|---|
| **5 — Home coachmark "overlaps header, text truncated"** | It is **not an overlay coachmark**. It's a top **toast** (`Toasts.basicsHomeNudge`, [toastCatalog.ts](../../components/modals/instances/toastCatalog.ts)) fired from [index.tsx](../../app/%28tabs%29/index.tsx) — positioned above the header at `insets.top + Spacing.xl`, `maxWidth 85%`, no single-line clamp, auto-dismisses in 3s. Likely already meets all three acceptance criteria. | **Verify on device.** Only act if it actually overlaps/clips at runtime. Do **not** rebuild it as a tooltip. |
| **7 — Onboarding Back/Continue "near-equal weight"** | Already differentiated: Back = `surfaceContainerHighest`, `flex:1`; Continue = `primaryContainer` (red), `flex:2`, white label; disabled = `surfaceDim`. | **Verify on device.** Likely no change needed. |
| **10 — Lesson-complete modal "off-center, bleeds through"** | [Celebration.tsx](../../components/ui/Celebration.tsx) is already vertically centered (`justifyContent:'center'`) with an **82%-opaque** scrim (`rgba(27,29,14,0.82)`) + blur, and explicit vertical spacing (`Spacing.xxl/sm/md/xxl`). The screenshot may have shown the older `StreakMilestoneTakeover`. | **Verify on device.** If text still reads through, raise scrim opacity; otherwise no change. |
| **12 — Splash subtext "low-contrast pink-on-red"** | Actually `rgba(255,255,255,0.9)` (near-white) on the red gradient — already high contrast, not pink. | **Trivial:** bump to full white (`Colors.onPrimary`) for AA headroom; otherwise no issue. |

---

## 4. Per-item specification

Each item: **Current → Target → Acceptance**, grounded in files. Acceptance
criteria are copied/condensed from the brief and are the definition of done.

### P0 — Systemic

#### Item 1 — Unify the typeface (transliteration → brand sans) `[OVERRIDE — amends DESIGN.md]`

- **Current:** `Fonts.lora.italic` / `Fonts.lora.mediumItalic` carries every
  transliteration across ~20 sites: lesson teaching/practice phases
  ([TeachWordsPhase](../../components/lesson/TeachWordsPhase.tsx),
  [TeachPhrasesPhase](../../components/lesson/TeachPhrasesPhase.tsx),
  [PracticeWordsPhase](../../components/lesson/PracticeWordsPhase.tsx),
  [PracticePhrasesPhase](../../components/lesson/PracticePhrasesPhase.tsx),
  [SummaryPhase](../../components/lesson/SummaryPhase.tsx)), all five games
  (`src/games/*`), the guide cards (`components/guide/*`), the phrase-detail
  sheet, emergency, the celebration/milestone modals, and the
  login/Learn taglines. `TypeScale.translit` = `{ Fonts.lora.italic, 20 }`.
- **Target:** one Latin type system.
  - **Transliteration** (`nanage`, assembled phrases): brand sans
    (`Fonts.baloo.medium` or `dmSans.bold` — see token note), **medium/semibold,
    full-strength foreground** (`Colors.onSurface`).
  - **English gloss** ("For me / to me"): brand sans **regular, muted**
    (`Colors.tertiary` / `textFaint`).
  - **Kannada script** (`ನನಗೆ`): unchanged — Noto, muted.
  - The login/signup **tagline** "Kannada Beku" and the Learn subtitle line move
    to brand sans (they were Lora).
- **Token change:** redefine `TypeScale.translit` in [fonts.ts](../../constants/fonts.ts)
  to the brand-sans treatment; sweep the ~20 call-sites to the token (don't
  inline). Keep `Fonts.lora` entries in `fonts.ts` only if any non-translit use
  remains (none expected — verify, then the `Lora_*` font-load in
  [_layout.tsx](../../app/_layout.tsx) can be dropped).
- **DESIGN.md edits (same PR):** ethos "One script per font" bullet drops the
  "transliteration in Lora italic" clause; Typography families table removes the
  `Fonts.lora.italic` row (or marks it retired); type-scale `translit` row updated;
  Amendment A note appended with the 2026-06-06 re-sign. Open **C15**.
- **Acceptance:**
  - [ ] Zero serif-italic anywhere. `grep -rn "lora\|italic" app/ components/ src/ constants/` returns no transliteration uses.
  - [ ] Flashcard, phrase-builder, quiz options, recap list all use the same Latin font.
  - [ ] Transliteration vs English gloss distinguished by **weight/colour only**.
  - [ ] DESIGN.md amended + Amendment A re-signed + C15 opened, in the same PR.

#### Item 2 — Fix colour semantics (red = primary, gold = reward only) `[conforms to lock]`

- **Current violations:**
  - Home hero "Continue lesson" `LipButton` is gold (`Colors.secondaryContainer`
    face, `goldLip` lip) — [index.tsx](../../app/%28tabs%29/index.tsx).
  - Opposites Practice tile is gold (`secondaryContainer`) — see Item 8.
- **Target:**
  - Home hero CTA → **lighter-red raised** `LipButton` (white label) on the
    deeper-red gradient card — **decision taken**. Stays in-palette, reads as the
    single primary action, no gold.
  - Gold (`secondaryContainer`/`secondaryFixed`/`goldBright`) remains only on
    success/reward/completion: correct-answer feedback, completed-lesson check,
    streak pill, celebration, gloss tags. (Audit confirmed these uses are already
    correct.)
- **Carve-out:** the Practice game **tiles** keep their category colours
  (incl. the gold Opposites tile) per Item 8 — a navigational tile is not a
  reward, so this does not violate the reward-only rule.
- **Acceptance:**
  - [ ] No gold primary **CTA buttons** remain; every "do the thing" button is red (or white-on-red inside red cards).
  - [ ] Gold appears only on success/reward/completion states (Practice tile carve-out excepted).
  - [ ] Home hero CTA legible and clearly primary, no gold.

#### Item 3 — Eliminate text truncation `[bug]`

- **Current (confirmed `numberOfLines={1}`):** Home fun-fact banner
  ([index.tsx](../../app/%28tabs%29/index.tsx) "Did you know? …"), Journey lesson
  subtitle ([learn.tsx](../../app/%28tabs%29/learn.tsx) "Vowels, consonants, how to re…"),
  Practice game subtitle ([practice.tsx](../../app/%28tabs%29/practice.tsx)
  "Roleplay real sce…"). Recap list rows and onboarding cards **wrap** (no clamp)
  but are clipped behind fixed bars — that's Item 6's scroll-padding fix.
- **Target:** no single-line `…` on primary content. Per case, either allow a
  **2-line clamp** (`numberOfLines={2}`) or shorten the source copy to fit one
  line. (Copy shortening is a copy-fix, allowed; no phase-machine/string-meaning
  change.)
- **Acceptance:**
  - [ ] No single-line `…` truncation on titles, lesson descriptions, or tips. Two-line clamp OK; mid-sentence single-line clamp not.

#### Item 4 — Standardize button label casing → Title Case `[copy fix]`

- **Current:** `LOG IN` / `SIGN UP` are **literal all-caps strings** in
  [login.tsx](../../app/%28auth%29/login.tsx). (The Home "CONTINUE · LESSON N" is
  an **eyebrow label** rendered as an intentional caps style — *excluded*, per the
  brief's CSS-caps carve-out. Other caps in the app are `textTransform:'uppercase'`
  eyebrows/section labels — also excluded.)
- **Target:** Title Case button labels → `Log in`, `Sign up`.
- **Acceptance:**
  - [ ] No ALL-CAPS **button** labels remain (intentional CSS-transform eyebrows excepted).

### P1 — Per-screen

#### Item 5 — Home coachmark — **see §3.** Verify-first; do not rebuild.

#### Item 6 — Onboarding step 3 last option clipped `[bug]`

- **Current:** [motivation.tsx](../../app/onboarding/motivation.tsx) ScrollView has
  `paddingVertical: Spacing.xl` but **no bottom padding for the footer bar** (~70px
  incl. inset), so the 4th reason card ("Stop getting overcharged…") clips behind
  the fixed Back/Continue bar.
- **Target:** add `paddingBottom ≥ barHeight + insets.bottom` to the scroll content;
  add a subtle top fade/shadow on the button bar to signal more content below.
  Apply the same scroll-padding fix to any onboarding step that scrolls.
- **Acceptance:**
  - [ ] All option cards on every onboarding step fully visible/scrollable above the bar.
  - [ ] Button bar has a subtle fade/shadow separation from content beneath.

#### Item 7 — Onboarding Back/Continue hierarchy — **see §3.** Likely already met; verify-first.

#### Item 8 — Practice tile palette `[KEEP AS-IS 2026-06-06]`

- **Current:** 4 tiles — Quick quiz `Colors.secondary` (olive `#785900`, white
  text), Dictation `Colors.primary` (red), Conversations `Colors.primaryContainer`
  (dark red), Opposites `Colors.secondaryContainer` (gold `#fdc003`, dark-gold
  text `onSecondaryContainer #6c5000`) — [practice.tsx](../../app/%28tabs%29/practice.tsx)
  `GAMES`.
- **Decision (owner, 2026-06-06):** **keep the palette as-is.** The brief's
  recolour proposal is declined. The tile colours are *category* colours; this is
  documented as **distinct from gold-as-reward** (Item 2) — a tile is navigation,
  not a success state. No olive removal, no recolour.
- **Only action — contrast check:** verify the gold Opposites tile's text
  (`#6c5000` on `#fdc003`) and any other tile text meet **WCAG AA 4.5:1**. If the
  gold tile fails, darken its text token *only* (no bg change). If it passes,
  no change.
- **Acceptance:**
  - [ ] Palette unchanged from current.
  - [ ] All tile text passes 4.5:1 (verify the gold Opposites tile specifically).

#### Item 9 — Journey list right-side icon column alignment `[bug]`

- **Current:** [learn.tsx](../../app/%28tabs%29/learn.tsx) `LessonRowView` —
  completed = 26px gold circle, active = 32px red circle, locked = bare 17px lock
  icon. Different widths → ragged right edge.
- **Target:** a **fixed-width right action column** (e.g. 32px slot) so every
  state's icon centers at the same x. States: active=play, complete=check,
  locked=lock. Keep the info affordance in a consistent slot (or move to row tap).
- **Acceptance:**
  - [ ] Right-side action icons sit at the same horizontal position on every row.
  - [ ] State icons consistent: active=play, complete=check, locked=lock.

#### Item 10 — Lesson-complete celebration — **see §3.** Verify-first; raise scrim only if it reads through.

### P2 — Polish

#### Item 11 — Splash logo shadow `[polish]`

- **Current:** [welcome.tsx](../../app/onboarding/welcome.tsx) ಬೇ glyph has
  `textShadow` maroon (`redLip`), offset `(0,6)`, radius `18` — heavy/dated.
- **Target:** soften or remove. **Acceptance:** [ ] Logo shadow subtle or gone.

#### Item 12 — Splash subtext contrast — **see §3.** Bump `rgba(255,255,255,0.9)` → full white. **Acceptance:** [ ] Subtext passes AA.

#### Item 13 — Flashcard top-bar controls clarity `[polish]`

- **Current:** two top-left circular buttons — `ExitBackButton` (`Icons.back`,
  left-arrow → confirm-exit dialog → `router.back()`) and `PhaseBackButton`
  (`Icons.stepBack`, back-up arrow → `runner.goPrevious()` within the lesson).
  Distinct scopes, but ambiguous and missing `accessibilityLabel`s.
- **Target:** confirm each purpose; give each a clear `accessibilityLabel`
  ("Exit lesson" / "Previous step"); keep both (they are not redundant). Only
  change icons if genuinely confusing — do **not** remove the step-back control.
- **Acceptance:** [ ] Every top-bar control's purpose is clear from its icon + has an accessibilityLabel.

---

## 5. Scope

### In
- Token edits: `TypeScale.translit` (Item 1), optional one lighter-red tile tint
  (Item 8a).
- Restyle/copy/layout fixes to the screens named per item. No behaviour change.
- DESIGN.md amendment + Amendment-A re-sign + CONTRADICTIONS C15 (Item 1 only).

### Out
- Any new feature, screen, route, flow, data model, or domain state.
- The lesson phase machine, all strings' *meaning*, scoring, audio/TTS, data layer.
- Reopening redesign locks other than Item 1's Amendment-A clause.
- `ios/`, `android/`, lockfiles.

---

## 6. Implementation phases (manual-test gate after each)

Each phase ends with a build + screenshot pass on **iPhone SE** and a larger
device, then **hands off to the owner for manual testing before the next phase**
(per project cadence).

- **Phase A — Systemic typography (Item 1).** Token + ~20 call-site sweep;
  DESIGN.md amendment + Amendment-A re-sign + open C15. *Gate:* no serif italic;
  translit vs gloss by weight/colour; foundation docs updated.
- **Phase B — Colour semantics + casing (Items 2, 4).** Home hero CTA →
  lighter-red raised; `LOG IN`/`SIGN UP` → Title Case. *Gate:* no gold CTA; no
  all-caps button labels.
- **Phase C — Truncation + scroll padding (Items 3, 6).** 2-line clamps / copy
  shortening; onboarding (+ recap/lesson) bottom padding + bar fade. *Gate:* no
  single-line `…`; last item clears every fixed bar on SE.
- **Phase D — Practice contrast + Journey icons (Items 8, 9).** Keep palette;
  verify gold-tile text AA contrast (darken text token only if it fails); fixed
  right-icon column. *Gate:* tile text AA; right icons aligned.
- **Phase E — Verify-first cluster (Items 5, 7, 10, 12).** Screenshot each;
  fix **only** what actually fails its acceptance criteria on device. *Gate:*
  each confirmed met or fixed.
- **Phase F — Splash + flashcard polish (Items 11, 13).** Soften splash shadow;
  add accessibilityLabels to top-bar controls. *Gate:* shadow subtle; labels present.

---

## 7. Global acceptance checklist

- [ ] One Latin font across the app (no serif italic).
- [ ] Gold only on success/reward (Practice tile category carve-out excepted); all primary CTA buttons red.
- [ ] No truncated primary content; all lists clear their bottom CTA bars.
- [ ] Title Case button labels throughout.
- [ ] All text meets WCAG AA (4.5:1 body, 3:1 large).
- [ ] No overlapping/clipped UI at iPhone safe-area insets (SE + larger).
- [ ] DESIGN.md Amendment A re-signed; CONTRADICTIONS C15 opened (Item 1) and
      closed after end-to-end device verification.

## 9. Implementation status — 2026-06-06 (branch `app_redesign`)

All phases coded and type-clean (only the 3 pre-existing `baloo-tamma-2` /
`expo-linear-gradient` module-type errors remain — unrelated). **Not yet
visually verified on device** (this checkout's `node_modules` is missing the
redesign deps, so the app can't bundle here) → owner manual-test pending.

| Item | Status | Notes |
|---|---|---|
| 1 — typography | ✅ done | 24 sites → `dmSans.bold`; `Fonts.lora` + font-load removed; login tagline → Baloo; DESIGN.md amended; C15 opened. |
| 2 — gold CTA | ✅ done | Home hero `LipButton` → `primaryContainer` face / `redLip` lip / white label. |
| 3 — truncation | ✅ done | Learn subtitle, Practice subtitle → `numberOfLines={2}`; recap `ScrollView` got the missing `flex:1` (the real recap clip). Home fun-fact sub-item **superseded by R1** (banner removed, not clamped). |
| R1 — remove Home fun-fact | ✅ done | Owner request 2026-06-06: "Did you know?" banner removed from Home (too much info / didn't fit). Deleted `FunFactBanner` + `factOfDayIndex` + `CardFact` + the `useKarnatakaFunFacts` query/effect/imports in [index.tsx](../../app/%28tabs%29/index.tsx). The hook [useKarnatakaFunFacts.ts](../../hooks/useKarnatakaFunFacts.ts) + service [karnataka_fun_facts.ts](../../services/api/karnataka_fun_facts.ts) are now **orphaned** — left on disk (may feed the deferred loading-screen tips); flagged for owner to delete or keep. |
| 4 — casing | ✅ done | login `cta` `LOG IN`/`SIGN UP` → `Log in`/`Sign up` (toggle was already Title Case). |
| 5 — coachmark | ⚪ no change | Already a top toast (auto-dismiss 3s), not an overlay. Confirm on device. |
| 6 — onboarding clip | ⚪ no change | Footer is a flex sibling (not a floating bar) and the `ScrollView` already has `flex:1` → no overlap. Premise didn't match code. Confirm on device. |
| 7 — Back/Continue | ⚪ no change | Already differentiated (neutral `flex:1` / red `flex:2`). Confirm on device. |
| 8 — tile contrast | ✅ done | Palette kept; removed the gold-tile subtitle's `opacity:0.84` (was ~3.4:1 → now full-strength ≈4.6:1). |
| 9 — journey icons | ✅ done | State icon wrapped in a fixed `moderateScale(32)` centered slot → aligned right column. |
| 10 — celebration | ⚪ no change | Already vertically centered, 82%-opaque scrim. Confirm on device. |
| 11 — splash shadow | ✅ done | Maroon shadow softened: offset `(0,6)`→`(0,2)`, radius `18`→`8`, color → `rgba(110,0,20,0.35)`. |
| 12 — splash subtext | ✅ done | `rgba(255,255,255,0.9)` → full `onPrimary` white. |
| 13 — flashcard ctrls | ✅ done | Both already had a11y labels; exit chip relabelled `Back`→`Exit lesson` to disambiguate from `Previous step`. |

**Owner manual-test checklist (on device, SE + larger):** transliteration reads
clean on flashcard/recap/games/emergency/login; Home CTA reads primary (red, not
gold); no single-line `…` on Home fact / Learn & Practice subtitles; recap last
row clears the Continue bar; journey right icons aligned; gold tile text legible;
splash shadow subtle + subtext crisp; and confirm items 5/6/7/10 are indeed fine
(no regressions).

## 8. CONTRADICTIONS entry to open (on promotion)

> **C15 — Transliteration font moved off Lora italic to brand sans.**
> spec_ui_refinement.md Item 1 (owner sign-off 2026-06-06) amends DESIGN.md
> ethos + Typography table + `TypeScale.translit` and the redesign's Amendment A:
> transliterations render in the brand sans (weight + muted colour) instead of
> Lora serif-italic. Until the ~20 call-sites + token + `_layout.tsx` font-load
> are swept and DESIGN.md is edited in the same PR, code and spec diverge.
> Resolution owed: execute Phase A; close after end-to-end device verification on
> iPhone SE + a larger device. Ships on `app_redesign` ahead of the C14 merge.
