# Lesson content flags (verification pass)

**Date:** 2026-06-10
**Scope:** Lessons 1–8, now authored in `constants/lessons/lessonContent.ts`.

The TS content is a **verbatim mirror** of the live `public.lessons` reference
content (all rows `verified: false`). The sub-section split changed *structure
only* — no Kannada/transliteration was altered. The inconsistencies below were
present in the source and are carried through unchanged; they need a
native-speaker decision, not a code change. Once decided, fix in **both** the TS
content and the DB row so they stay in sync.

## High confidence — likely typos

1. **L7 "Write (casual)" transliteration.** Kannada `ಬರೆ` (= *bare*) is
   transliterated **`bareyu`**. The respectful form is `ಬರೆಯಿರಿ` / *bareyiri*.
   `bareyu` looks like a copy error → should almost certainly be **`bare`**.

2. **L7 "Please send" mismatch.** Phrase Kannada is `ದಯವಿಟ್ಟು ಕಳುಹಿಸಿ`
   (*kaḷuhisi*) but its transliteration is `dayavittu kalisi`, and the taught
   word "Send (respectful)" is `ಕಳಿಸಿ` / *kalisi*. The phrase's Kannada and
   transliteration disagree — pick one form (`ಕಳಿಸಿ`/*kalisi* matches the word).

## Medium — cross-lesson disagreement

3. **"Take (respectful)" spelled two ways.** L5 = `ತೆಗೊಳಿ`, L7 = `ತೆಗೊಳ್ಳಿ`
   (both transliterated `tegolli`). `ತೆಗೊಳ್ಳಿ` is the standard form. Unify.

4. **"Less" vs "reduce" — kammi/kaḍime.** L3 teaches "Less" as `ಕಡಿಮೆ`
   (*kaḍime*), but every "reduce the price" phrase uses `ಕಮ್ಮಿ` (*kammi*) —
   L3 `ಇದು ಕಮ್ಮಿ ಮಾಡಿ`, L8 `ಸ್ವಲ್ಪ ಕಮ್ಮಿ ಮಾಡಿ`. Spoken Bengaluru favours
   *kammi*; the textbook word is *kaḍime*. Decide which to teach so the word and
   the phrases agree.

5. **Two words for "Why".** L3 "Why" = `ಯಾಕೆ` (*yāke*); L6 "Why" = `ಏಕೆ`
   (*eke*). Both are valid; confirm this is intentional (colloquial vs formal).

## Low — style consistency

6. **Mixed transliteration scheme.** L1–L4 use diacritics (`bēku`, `hēge`,
   `eṣṭu`, `ā/ē/ī/ō/ū`, `ṭ`, `ḷ`); L5–L8 use plain ASCII (`beku`, `hege`,
   `estu`, `maadu`, `nodi`). The same word renders differently across lessons —
   e.g. "How much" `eṣṭu` (L3) vs `estu` (L6); "How are you?" `hēgiddīrā` (L6)
   vs `heegiddiraa` (L8). Pick one scheme app-wide for a consistent read.

7. **Single-word "phrases."** L3 has a phrase `ಸ್ವಲ್ಪ` / *svalpa* / "A little"
   that duplicates the word of the same name. Harmless, but in the
   practice-phrases multiple-choice it produces a one-word "phrase."

## Notes

- L5 "Get up" is `ಏಳು`/`ಏಳಿ` (*elu/eli*) — this matches the latest split map
  (an earlier repo seed had `ಎದ್ದು`/*eddu*; the live DB has since been updated).
- Lesson 0 (basics) is unchanged and still loads from the DB.
