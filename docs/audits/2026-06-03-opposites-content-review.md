# Opposites — Content Review (by lesson)

**Date:** 2026-06-03
**Purpose:** Lay out every opposite pair from the `opposites` table, grouped by lesson, so questionable pairs can be spotted and corrected. This is a **review note**, not a spec — no code or data has been changed. Flagged rows need an owner decision before any edit; DB changes are run manually in the Supabase dashboard.

**Legend:** ✅ looks correct · ⚠️ questionable — see note

Each row shows the prompt word and its stored opposite (`word → opposite`). The "distractors" are the other 3 options shown in the game (the correct answer is always the stored opposite).

---

## Lesson `e6f22705` — Action verbs

| # | Word | Transliteration | Meaning | Opposite (correct answer) | Verdict |
|---|------|-----------------|---------|---------------------------|---------|
| 1 | ಬಾ | bā | come | ಹೋಗು (go) | ✅ |
| 2 | ಕೊಡು | koḍu | give | ತೆಗೊ (take) | ✅ ¹ |
| 3 | ಮಲಗು | malagu | sleep | ಎದ್ದು (get up) | ✅ |
| 4 | ಕುಳಿತುಕೋ | kuḷituko | sit | ನಿಲ್ಲು (stand) | ✅ |
| 5 | ಬೇಗ | bēga | fast | ನಿಧಾನ (slow) | ✅ |

¹ The Kannada in the row is **ತೆಗೊ** but the option's transliteration is `tegeduko` (which belongs to **ತೆಗೆದುಕೋ**). Pick one spelling so word and transliteration match — either `ತೆಗೊ` / `tego` or `ತೆಗೆದುಕೋ` / `tegeduko`.

---

## Lesson `891e589e` — Pronouns

| # | Word | Transliteration | Meaning | Opposite (correct answer) | Verdict |
|---|------|-----------------|---------|---------------------------|---------|
| 1 | ಇವರು | ivaru | this person | ಅವರು (that person) | ✅ |
| 2 | ಇವನು | ivanu | this person (he) | ಅವನು (that person, he) | ✅ |
| 3 | ಇವಳು | ivaḷu | this person (she) | ಅವಳು (that person, she) | ✅ |
| 4 | ನಾನು | nānu | I | ನೀನು (you, neutral) | ⚠️ ² |
| 5 | ನಿನ್ನ | ninna | your (neutral) | ನಿಮ್ಮ (your, respectful) | ⚠️ ³ |

² **"I" vs "you" is a contrast, not an antonym.** Defensible for a beginner pronoun drill, but it's a different kind of pair than this/that. Flag for a decision: keep as a "contrast" pair, or replace.

³ **Not an opposite — it's a register difference** (neutral vs respectful "your"). `ನಿನ್ನ` and `ನಿಮ್ಮ` both mean "your"; one is just more polite. This is the clearest mismatch in the pronoun set. Same issue as ⁴ below.

---

## Lesson `e12dbb2d` — Yes/no & register

| # | Word | Transliteration | Meaning | Opposite (correct answer) | Verdict |
|---|------|-----------------|---------|---------------------------|---------|
| 1 | ನೀವು | nīvu | you (respectful) | ನೀನು (you, neutral) | ⚠️ ⁴ |
| 2 | ಚೆನ್ನಾಗಿ | chennāgi | well | ಕೆಟ್ಟದಾಗಿ (badly) | ✅ |
| 3 | ಹೌದು | haudu | yes | ಇಲ್ಲ (no) | ⚠️ ⁵ |

⁴ **Register difference, not an opposite** — `ನೀವು` (respectful "you") vs `ನೀನು` (neutral "you") are the same word at different politeness levels. Same problem as ³.

⁵ **`ಹೌದు` (yes) → `ಇಲ್ಲ` is arguably the wrong "no".** The natural negation of `ಹೌದು` ("yes, it is so") is **`ಅಲ್ಲ` (alla, "no, it is not")**. `ಇಲ್ಲ` (illa) means "there isn't / not present" — the negation of existence, not of "yes." Recommend changing the opposite to `ಅಲ್ಲ`, or keep `ಇಲ್ಲ` only if "yes/no" is meant in the colloquial broad sense. Owner decision needed.

---

## Lesson `58c7a04f` — Place & position

| # | Word | Transliteration | Meaning | Opposite (correct answer) | Verdict |
|---|------|-----------------|---------|---------------------------|---------|
| 1 | ಇಲ್ಲಿ | illi | here | ಅಲ್ಲಿ (there) | ✅ |
| 2 | ಇದು | idu | this | ಅದು (that) | ✅ |
| 3 | ಮೇಲೆ | mēle | above | ಕೆಳಗೆ (below) | ✅ |
| 4 | ಮುಂದೆ | munde | in front | ಹಿಂದೆ (behind) | ✅ |
| 5 | ಹಗಲು | hagalu | daytime | ರಾತ್ರಿ (night) | ✅ ⁶ |

⁶ Fine. (Strictest "day" opposite is `ಇರುಳು`, but `ರಾತ್ರಿ` for daytime↔night is natural and clear.)

---

## Lesson `18806243` — Wants & qualities

| # | Word | Transliteration | Meaning | Opposite (correct answer) | Verdict |
|---|------|-----------------|---------|---------------------------|---------|
| 1 | ಬೇಕು | bēku | want / need | ಬೇಡ (don't want) | ✅ |
| 3 | ಕಡಿಮೆ | kaḍime | less | ಜಾಸ್ತಿ (a lot / too much) | ✅ |
| 4 | ಮಾಡಿ | māḍi | please do | ಮಾಡಬೇಡಿ (please don't do) | ✅ |
| 5 | ಹೊಸ | hosa | new | ಹಳೆಯ (old) | ✅ |

*(No `sort_order = 2` row exists in this lesson — there's a gap between #1 and #3. Worth confirming a row wasn't dropped.)*

---

## Lesson `e7e6f0a6` — Feelings & states

| # | Word | Transliteration | Meaning | Opposite (correct answer) | Verdict |
|---|------|-----------------|---------|---------------------------|---------|
| 1 | ಗೊತ್ತಾ | gottā | do you know? (neutral) | ಗೊತ್ತಿಲ್ಲ (don't know) | ⚠️ ⁷ |
| 3 | ಸಂತೋಷ | santoṣa | happiness | ದುಃಖ (sadness) | ✅ |
| 4 | ಒಳ್ಳೆಯ | oḷḷeya | good | ಕೆಟ್ಟ (bad) | ✅ |
| 5 | ಶೀತ | śīta | cold | ಬಿಸಿ (hot) | ⚠️ ⁸ |

⁷ **Form mismatch.** `ಗೊತ್ತಾ` is a *question* ("do you know?"), `ಗೊತ್ತಿಲ್ಲ` is a *statement* ("don't know"). The clean antonym pair is `ಗೊತ್ತು` (know) ↔ `ಗೊತ್ತಿಲ್ಲ` (don't know). Consider changing the prompt word to `ಗೊತ್ತು`.

⁸ **`ಶೀತ` is the wrong word for the adjective "cold."** `ಶೀತ` usually means "a cold / chill (illness)" or "coldness." The everyday adjective opposite of `ಬಿಸಿ` (hot) is **`ತಣ್ಣಗೆ` / `ತಂಪು`** (taṇṇage / tampu). Recommend replacing `ಶೀತ` with `ತಣ್ಣಗೆ` (or `ತಂಪು`). *(Also note sort_order gap: no #2 in this lesson.)*

---

## Summary of flags

| Lesson | Word | Issue | Suggested fix |
|--------|------|-------|---------------|
| `891e589e` | ನಿನ್ನ → ನಿಮ್ಮ | Register, not opposite | Replace pair or move out of "opposites" |
| `891e589e` | ನಾನು → ನೀನು | Contrast, not antonym | Decision: keep or replace |
| `e12dbb2d` | ನೀವು → ನೀನು | Register, not opposite | Replace pair |
| `e12dbb2d` | ಹೌದು → ಇಲ್ಲ | "no" should be `ಅಲ್ಲ` | Change opposite to `ಅಲ್ಲ` |
| `e7e6f0a6` | ಗೊತ್ತಾ → ಗೊತ್ತಿಲ್ಲ | Question vs statement | Prompt word → `ಗೊತ್ತು` |
| `e7e6f0a6` | ಶೀತ → ಬಿಸಿ | `ಶೀತ` = illness, not "cold" | Prompt word → `ತಣ್ಣಗೆ` / `ತಂಪು` |

**Data hygiene (separate from correctness):**
- `ತೆಗೊ` row: Kannada spelling and transliteration (`tegeduko`) don't match — align them.
- `18806243` and `e7e6f0a6` each have a missing `sort_order = 2` — confirm no row was accidentally deleted.

> Next step: confirm which of the ⚠️ rows you want changed. The fixes are DB content edits (run manually in Supabase, per project process) — I can draft the exact `UPDATE` statements once you decide.
