---
doc: spec_content_integrity
status: proposed
owner: samee
last-reviewed: 2026-06-02
related:
  - CONTENT.md
  - STATE.md
  - spec_db_wiring_games_and_overall_progress.md
  - spec_lesson_content_source.md
  - spec_home_fun_fact.md
---

# Content integrity & DB-only data

> **Decision layer.** `[LOCKED]` means decided — do not reopen or build the opposite. `[OPEN]` means genuinely undecided. `[PROPOSED]` is in this doc only — pending owner sign-off; once approved, promote to `[LOCKED]`.

Owns: a one-pass cleanup of served Kannada/English content (brackets, repetitions, spellings/ottus, opposites, "ivaḷu") **and** the removal of all local hardcoded content so Supabase is the single source of truth.

**Why:** Investigation confirmed every live game/lesson string is served from Supabase (`fetchLessonBySlug`, `fetchOppositesItemsByLessonNo`, `fetchAllEmergency…`). The local `src/games/*/data/*.ts` banks and JSON fallbacks are dead code. Content fixes must therefore land in seed migrations under [services/api/migrations/](../../services/api/migrations/) + the DB, not in local files. Foundation [CONTENT.md](../../docs/foundation/CONTENT.md) governs the lesson schema and wins on any conflict.

---

## 1. Scope

`[PROPOSED]`

In scope (triage issues #1, #4, #5, #6, #10, #12, #13, #14 + the DB-only directive):

| # | Issue | Surface |
|---|---|---|
| 1 | Remove the leftover `[Unverified]` prompt | Emergency screen |
| 6 | Brackets in glosses — "keep meaning, drop clutter" | Lessons + games + emergency |
| 5 | Repeated opposite pairs / distractors | Opposites game seed |
| 4/10/14 | Kannada spellings & ottus (conjuncts) misspelled | Lessons + games seed |
| 12 | Opposites pairs correctness | Opposites game seed |
| 13 | "ivaḷu" wrongly joined (spacing) | Lessons/phrases content |
| — | No local hardcoded content data | `src/games/*/data`, `data/*.json`, fallbacks |

Out of scope: any new content authoring, audio assets, schema changes to `docs/foundation/CONTENT.md`.

---

## 2. Locked-from-owner decisions

`[PROPOSED]`

- **D1 — Brackets:** Remove cosmetic parentheses from user-facing English glosses, but **preserve register (neutral/respectful) and gender (he/she) meaning** by carrying it in a structured field and rendering it as a small chip/label beside the gloss — never as inline `(…)`. (Owner-confirmed: "keep meaning, drop clutter".)
- **D2 — Source of truth:** All content edits ship as a **new dated seed migration**; the DB is patched from it. No content is hardcoded in app code.

---

## 3. Behavior / changes

### 3.1 Emergency `[Unverified]` note (#1)
`[PROPOSED]`

Delete the hardcoded italic line `[Unverified — pending Kannada-speaker review]` rendered at [emergency.tsx:144-148](../../app/emergency.tsx#L144-L148). Remove the internal `_warning` `[Unverified]` string in `data/emergency.json` (or delete the file per §3.6 if it is dead).

### 3.2 Brackets reword (#6)
`[PROPOSED]`

Audit English-gloss fields in [2026-05-20_lessons_content.sql](../../services/api/migrations/2026-05-20_lessons_content.sql) and [2026-05-27_db_wiring_games_seed.sql](../../services/api/migrations/2026-05-27_db_wiring_games_seed.sql). Per D1:

- Strip cosmetic parens: `you (neutral)` → `you` + register tag `neutral`; `this person (he)` → `this person` + gender tag `he`.
- Fix awkward glosses: `"this he"` / `"that she"` (seed line ~63) → `this person` / `that person` + gender tag.
- Replace slash-glosses like `that person/those people` with a single primary gloss + tag where it reads as a qualifier.

**Mechanism `[IMPLEMENTED 2026-06-02]` — render-time extraction (owner-approved).** Rather than a structured DB field, a shared helper [utils/gloss.ts](../../utils/gloss.ts) `splitGloss()` strips a trailing `(…)` qualifier at render and a shared chip [components/ui/GlossTag.tsx](../../components/ui/GlossTag.tsx) renders it beside the gloss. No schema change; chip styling uses [DESIGN.md](../../docs/foundation/DESIGN.md) tokens (`Colors.secondaryFixed`/`onSecondaryContainer`, `moderateScale`, no hex). Parenthetical glosses therefore stay in the served data and are converted to chips on screen; the migration only fixes glosses the extractor can't parse (awkward/slash forms).

**Corrected render surfaces.** The original surface list above was inaccurate against the code and is superseded:
- ~~`LessonSelector.tsx`~~ — renders only lesson number/theme/glyph; **no gloss**, so no chip applies.
- ~~`emergency.tsx`~~ — meanings are plain ("Stop here", "No, don't want"); **no parenthetical register/gender**, so no chip applies (it only needed the §3.1 removal).
- **Implemented in:** [TeachWordsPhase.tsx](../../components/lesson/TeachWordsPhase.tsx) (`word.english`), [TeachPhrasesPhase.tsx](../../components/lesson/TeachPhrasesPhase.tsx) (`phrase.english`), and the Opposites game — [QuestionCard.tsx](../../src/games/opposites/components/QuestionCard.tsx) (`meaning`) + [OptionButton.tsx](../../src/games/opposites/components/OptionButton.tsx) (`option.en`). The latter three were omitted from the original list.

### 3.3 Repetitions (#5)
`[PROPOSED]`

In [2026-05-27_db_wiring_games_seed.sql](../../services/api/migrations/2026-05-27_db_wiring_games_seed.sql): the pair **ಹೌದು ↔ ಇಲ್ಲ** (yes ↔ no) is seeded three times (L1 S3, L3 S2, L6 S2). De-dup so each opposite pair appears once across the course; replace the freed slots with lesson-appropriate pairs. Also de-dup distractor options that repeat the answer word within a single lesson's slots.

`[IMPLEMENTED 2026-06-02 — remove duplicates only]` Owner chose to **delete** the L3 S2 and L6 S2 duplicate rows and keep L1 S3 as canonical, with **no replacement authoring** (new content authoring is out of scope, §1). L3 and L6 keep their other four opposites items. Done in [2026-06-02_content_integrity.sql](../../services/api/migrations/2026-06-02_content_integrity.sql). The "de-dup distractor options" sub-item was not acted on: an audit found no slot whose distractor equals its own answer; cross-slot distractor reuse is normal and was left untouched.

### 3.4 Spellings & ottus (#4 / #10 / #14)
`[PROPOSED]`

Deliverable: a generated **inventory of every ottu-bearing (conjunct-consonant) word** in served content — Kannada + transliteration + gloss + `file:line` — written to this doc's appendix (§6) as a review checklist. Owner/Kannada-reviewer marks the wrong ones; corrections ship in the seed migration. No blind edits to Kannada orthography.

> **TODO (needs owner input):** list the specific misspelled ottu words.

### 3.5 Opposites correctness (#12)
`[PROPOSED]`

All current pairs scan as valid opposites. Correct only the specific pair(s) the owner flags.

> **TODO (needs owner input):** which opposite pair(s) are wrong?

### 3.6 "ivaḷu" spacing (#13)
`[PROPOSED]`

ಇವಳು / `ivaḷu` is a single word — no internal space. The issue is presumed to be a phrase where it is wrongly joined to the next word. Fix the exact occurrence in the seed once located.

`[BLOCKED — not reproduced]` Searched all served content for `ivaḷu`/`ಇವಳು`: it occurs twice and both are correct standalone words — [2026-05-20_lessons_content.sql:71](../../services/api/migrations/2026-05-20_lessons_content.sql#L71) (`"ಇವಳು" / "ivaḷu" / "This person (she)"`) and [2026-05-27_db_wiring_games_seed.sql:56-58](../../services/api/migrations/2026-05-27_db_wiring_games_seed.sql#L56-L58) (opposites L2 S3). No wrongly-joined occurrence exists in the seed. **Owner: please point at the exact screen/phrase if this still shows on device** — it may be a rendering artifact, not a data bug.

> **TODO (needs owner input):** the screen/phrase where `ivaḷu` appears wrongly joined.

### 3.7 DB-only data cleanup
`[PROPOSED]`

- **Delete (confirmed dead — not imported anywhere):** `src/games/opposites/data/wordPairs.ts` (`RAW_PAIRS`), `src/games/imagematch/data/vocabBank.ts` (`VOCAB_BANK`), `src/games/dictation/data/wordBank.ts` (`WORD_BANK`).
- **Remove fallback:** `FUN_FACTS_FALLBACK` import + usage at [index.tsx:19, 85-88](../../app/(tabs)/index.tsx#L85-L88); rely solely on `useKarnatakaFunFacts` (DB) with an explicit empty/error state.
- **Verify & remove if dead:** `data/emergency.json`, `data/karnataka_fun_facts.json`.
- **⚠️ Confirm before touching:** `constants/lessons/plannedLessons.ts` (`PLANNED_LESSON_SLOTS`, `TOTAL_LESSON_SLOTS`) drives unlock + progress math in Home/Learn/`useLessons`. Moving it to the DB is a larger migration with its own spec — out of scope unless owner confirms.

---

## 4. Acceptance criteria

`[PROPOSED]`

- Emergency screen shows no `[Unverified]` line and no stray brackets.
- Re-querying games/lessons from the DB returns no duplicate opposite pair and no inline `(…)` qualifiers in glosses; register/gender appears as a chip instead.
- Owner-flagged spelling/ottu, opposites, and `ivaḷu` corrections are reflected in served content.
- `grep` finds no import of `RAW_PAIRS`/`VOCAB_BANK`/`WORD_BANK`/`FUN_FACTS_FALLBACK`; deleted JSON files have no remaining references.
- `tsc` + lint clean; app builds and all content loads from Supabase only.

---

## 5. Verification

`[PROPOSED]`

Run on iOS sim (`npx expo start`), screenshot Emergency + each game + a lesson teach screen on iPhone SE and a larger device. Confirm chip rendering, no brackets, no duplicate pairs. Confirm games/facts still load with local data removed (test the empty/error path by simulating a failed query).

---

## 6. Appendix — ottu inventory

`[OPEN — awaiting owner annotation]` Generated 2026-06-02 by scanning served-content seed files (`2026-05-20_lessons_content.sql`, `2026-05-27_db_wiring_games_seed.sql`, `2026-06-02_content_integrity.sql`) for Kannada tokens containing the virama ್ (U+0CCD) — i.e. every conjunct/ottu-bearing word. 59 distinct tokens. **Mark the "OK?" column ✗ for any misspelled ottu; corrections then ship as a follow-up seed migration (no blind orthography edits, §3.4).** Blank translit/gloss cells are words that appear as a question/answer column rather than an option JSON object — their gloss is on the adjacent column at the cited line.

| # | Kannada | Translit | Gloss | First seen | OK? |
|---|---|---|---|---|---|
| 1 | ನಮಸ್ಕಾರ | namaskāra | Hello / greetings | 2026-05-20_lessons_content.sql:32 | |
| 2 | ನಮಸ್ತೆ | namaste | Hello | 2026-05-20_lessons_content.sql:33 | |
| 3 | ಹೇಗಿದ್ದೀರ | hēgiddīra | How are you? (respectful) | 2026-05-20_lessons_content.sql:34 | |
| 4 | ಹೇಗಿದ್ದೀಯ | hēgiddīya | How are you? (neutral) | 2026-05-20_lessons_content.sql:35 | |
| 5 | ಚೆನ್ನಾಗಿದ್ದೇನೆ | chennāgiddēne | I am fine | 2026-05-20_lessons_content.sql:36 | |
| 6 | ಚೆನ್ನಾಗಿದ್ದೇವೆ | chennāgiddēve | We are fine | 2026-05-20_lessons_content.sql:37 | |
| 7 | ಚೆನ್ನಾಗಿದ್ದೀರಾ | chennāgiddīrā | Are you fine? (respectful) | 2026-05-20_lessons_content.sql:44 | |
| 8 | ಚೆನ್ನಾಗಿದ್ದೀಯಾ | chennāgiddīyā | Are you fine? (neutral) | 2026-05-20_lessons_content.sql:45 | |
| 9 | ನಿನ್ನ | ninna | Your (neutral) | 2026-05-20_lessons_content.sql:67 | |
| 10 | ನಿಮ್ಮ | nimma | Your (respectful) | 2026-05-20_lessons_content.sql:68 | |
| 11 | ಪ್ರಿಯಾ | priyā | Priya (name) | 2026-05-20_lessons_content.sql:81 | |
| 12 | ಎಲ್ಲಿ | elli | Where | 2026-05-20_lessons_content.sql:82 | |
| 13 | ಇಲ್ಲ | illa | No | 2026-05-20_lessons_content.sql:106 | |
| 14 | ಇಲ್ಲಿ | illi | Here | 2026-05-20_lessons_content.sql:107 | |
| 15 | ಎಷ್ಟು | eṣṭu | How much | 2026-05-20_lessons_content.sql:108 | |
| 16 | ಸ್ವಲ್ಪ | svalpa | A little | 2026-05-20_lessons_content.sql:111 | |
| 17 | ಜಾಸ್ತಿ | jāsti | A lot / too much | 2026-05-20_lessons_content.sql:112 | |
| 18 | ದಯವಿಟ್ಟು | dayaviṭṭu | Please | 2026-05-20_lessons_content.sql:115 | |
| 19 | ಧನ್ಯವಾದಗಳು | dhanyavādagaḷu | Thank you | 2026-05-20_lessons_content.sql:116 | |
| 20 | ಕಮ್ಮಿ | kammi | Less | 2026-05-20_lessons_content.sql:127 | |
| 21 | ಅಲ್ಲಿ | alli | There | 2026-05-20_lessons_content.sql:150 | |
| 22 | ಬನ್ನಿ | banni | Come (respectful) | 2026-05-20_lessons_content.sql:180 | |
| 23 | ತಿನ್ನು | thinnu | Eat | 2026-05-20_lessons_content.sql:181 | |
| 24 | ತಿನ್ನಿ | tinni | Eat (respectful) | 2026-05-20_lessons_content.sql:181 | |
| 25 | ಕುಳಿತುಕೊಳ್ಳಿ | kuḷitukoḷḷi | Sit (respectful) | 2026-05-20_lessons_content.sql:188 | |
| 26 | ನಿಲ್ಲು | nillu | Stand / stop | 2026-05-20_lessons_content.sql:189 | |
| 27 | ನಿಲ್ಲಿ | nilli | Stand (respectful) | 2026-05-20_lessons_content.sql:189 | |
| 28 | ಎದ್ದು | eddu | Get up | 2026-05-20_lessons_content.sql:191 | |
| 29 | ಎದ್ದೇಳಿ | eddēḷi | Get up (respectful) | 2026-05-20_lessons_content.sql:191 | |
| 30 | ಮುಚ್ಚು | mucchu | Close | 2026-05-20_lessons_content.sql:194 | |
| 31 | ಮುಚ್ಚಿ | mucchi | Close (respectful) | 2026-05-20_lessons_content.sql:194 | |
| 32 | ಎಲ್ಲಿಗೆ | ellige | To where | 2026-05-20_lessons_content.sql:224 | |
| 33 | ಗೊತ್ತಾ | gottā | Do you know? (neutral) | 2026-05-20_lessons_content.sql:231 | |
| 34 | ಗೊತ್ತೇ | gottē | Do you know? (respectful) | 2026-05-20_lessons_content.sql:231 | |
| 35 | ಗೊತ್ತಿಲ್ಲ | gottilla | Don't know | 2026-05-20_lessons_content.sql:232 | |
| 36 | ಹೇಗಿದ್ದೀರಾ | hēgiddīrā | How are you? (respectful) | 2026-05-20_lessons_content.sql:236 | |
| 37 | ನನ್ನ | nanna | My | 2026-05-20_lessons_content.sql:239 | |
| 38 | ಚೆನ್ನಾಗಿ | chennāgi | Well | 2026-05-27_db_wiring_games_seed.sql:42 | |
| 39 | ಕೆಟ್ಟದಾಗಿ | keṭṭadāgi | Badly | 2026-05-27_db_wiring_games_seed.sql:42 | |
| 40 | ಶ್ರೇಷ್ಠ | śrēṣṭha | Great | 2026-05-27_db_wiring_games_seed.sql:80 | |
| 41 | ಕಷ್ಟ | kaṣṭa | Difficult | 2026-05-27_db_wiring_games_seed.sql:80 | |
| 42 | ಹತ್ತಿರ | hattira | Near | 2026-05-27_db_wiring_games_seed.sql:91 | |
| 43 | ಪಕ್ಕ | pakka | Beside | 2026-05-27_db_wiring_games_seed.sql:94 | |
| 44 | ಮಧ್ಯ | madhya | Middle | 2026-05-27_db_wiring_games_seed.sql:94 | |
| 45 | ರಾತ್ರಿ | rātri | Night | 2026-05-27_db_wiring_games_seed.sql:96 | |
| 46 | ಮಧ್ಯಾಹ್ನ | madhyāhna | Noon | 2026-05-27_db_wiring_games_seed.sql:97 | |
| 47 | ಬೆಳಿಗ್ಗೆ | beḷigge | Morning | 2026-05-27_db_wiring_games_seed.sql:97 | |
| 48 | ಮೆಲ್ಲ | mella | Gently | 2026-05-27_db_wiring_games_seed.sql:114 | |
| 49 | ತಕ್ಷಣ | takṣaṇa | Instant | 2026-05-27_db_wiring_games_seed.sql:114 | |
| 50 | ಪ್ರೀತಿ | prīti | Love | 2026-05-27_db_wiring_games_seed.sql:125 | |
| 51 | ಒಳ್ಳೆಯ | oḷḷeya | Good | 2026-05-27_db_wiring_games_seed.sql:127 | |
| 52 | ಕೆಟ್ಟ | keṭṭa | Bad | 2026-05-27_db_wiring_games_seed.sql:127 | |
| 53 | ತಪ್ಪು | tappu | Wrong | 2026-05-27_db_wiring_games_seed.sql:128 | |
| 54 | ಬೆಚ್ಚ | becca | Warm | 2026-05-27_db_wiring_games_seed.sql:131 | |
| 55 | ನಿಲ್ಲಿಸಿ | nillisi | Stop (here) | 2026-05-27_db_wiring_games_seed.sql:276 | |
| 56 | ಮೀಟರ್ | mīṭar | Meter | 2026-05-27_db_wiring_games_seed.sql:277 | |
| 57 | ಕನ್ನಡ | kannaḍa | Kannada | 2026-05-27_db_wiring_games_seed.sql:281 | |
| 58 | ಬರಲ್ಲ | baralla | (I) don't know / can't | 2026-05-27_db_wiring_games_seed.sql:281 | |
| 59 | ಪರವಾಗಿಲ್ಲ | paravāgilla | It's okay | 2026-05-27_db_wiring_games_seed.sql:286 | |

> Blank-cell translits/glosses (#3,4,7,8,11,20,22,24,25,27,29,31,33,34,36,37,38,51,55–59) were filled in by hand from the cited line's adjacent columns; double-check these against the source rows when annotating.
