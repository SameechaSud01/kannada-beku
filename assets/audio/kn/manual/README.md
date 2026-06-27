# Hand-recorded audio clips

Clips here are **committed human recordings**, used instead of Azure TTS for
strings the neural voice gets wrong. Right now that's the isolated **vowel
sounds** — both Kannada Azure voices mispronounce a lone vowel letter, and the
IPA `<phoneme>` hint is ignored, so we record them by hand.

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

## Format

All `.mp3`. Normalized to match the Azure clips: mono, 24 kHz, level-matched,
silence trimmed. Drop raw recordings (any format) anywhere and they'll be
converted/normalized to these filenames before committing.
