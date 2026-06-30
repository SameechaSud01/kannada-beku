# Hand-recorded audio clips

Clips here are **committed human recordings**, used instead of Azure TTS for
strings the neural voice gets wrong. That's every isolated **letter** — both
Kannada Azure voices mispronounce a lone vowel *and* a lone consonant, and the
IPA `<phoneme>` hint is ignored, so we record them by hand. (Whole words and
sentences still use Azure synthesis — only the bare letters are recorded.)

## How it works

`scripts/generateAudio.mjs` has a `MANUAL_OVERRIDES` map (manifest glyph →
filename stem). During `npm run gen:audio`, any key whose file exists in this
folder is wired into `constants/audioManifest.ts` pointing here, and **Azure
synthesis is skipped** for it. If a file is missing, that key falls back to
normal Azure synthesis — nothing breaks. Re-running `gen:audio` never clobbers
these files.

## Expected filenames (stem → vowel)

| file        | glyph | sound            |
|-------------|-------|------------------|
| `a.mp3`     | ಅ     | a                |
| `aa.mp3`    | ಆ     | ā                |
| `i.mp3`     | ಇ     | i (igloo)        |
| `ii.mp3`    | ಈ     | ī (seed)         |
| `u.mp3`     | ಉ     | u (push)         |
| `uu.mp3`    | ಊ     | ū (moon)         |
| `vr.mp3`    | ಋ     | r̥ (rupees)       |
| `e.mp3`     | ಎ     | e (cake)         |
| `ee.mp3`    | ಏ     | ē (crane)        |
| `ai.mp3`    | ಐ     | ai (ice)         |
| `o.mp3`     | ಒ     | o (opener)       |
| `oo.mp3`    | ಓ     | ō (go)           |
| `au.mp3`    | ಔ     | au (owl)         |

### Consonants — retroflex vs dental (Lesson 0 step 4)

Stems are case-safe (the macOS filesystem is case-insensitive, so `Ta.mp3` /
`ta.mp3` would collide). Doubled stem = retroflex (the capital romanisation),
single = dental.

| file        | glyph | sound                  |
|-------------|-------|------------------------|
| `tta.mp3`   | ಟ     | Ta (retroflex, curled) |
| `ta.mp3`    | ತ     | ta (dental, teeth)     |
| `dda.mp3`   | ಡ     | Da (retroflex, curled) |
| `da.mp3`    | ದ     | da (dental, teeth)     |

### Geminated words (Lesson 0 step 5)

The doubled-consonant demo words — Azure doesn't hold the doubled consonant and
the result doesn't sound Kannada, so these are hand-recorded too.

| file        | glyph  | word            |
|-------------|--------|-----------------|
| `appa.mp3`  | ಅಪ್ಪ   | appa (father)   |
| `amma.mp3`  | ಅಮ್ಮ   | amma (mother)   |

## Format

All `.mp3`. Normalized to match the Azure clips: mono, 24 kHz, level-matched,
silence trimmed. Drop raw recordings (any format) anywhere and they'll be
converted/normalized to these filenames before committing.
