import { AUDIO_MANIFEST } from '../../constants/audioManifest';

/**
 * Normalize a Kannada string to its manifest key.
 *
 * MUST stay in lockstep with `normalizeForAudio` in scripts/generateAudio.mjs,
 * otherwise generated keys won't match runtime lookups. Mirrors the historic
 * `speakable()` transform (strips `[name]` placeholders) plus NFC + whitespace
 * collapse so e.g. the combined vowel-pair strings ("ಅ ಆ") match.
 */
export function normalizeForAudio(text: string): string {
  return text
    .replace(/\[name\]/g, '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns the bundled MP3 asset (a Metro require id) for a Kannada string, or
 * `undefined` if no pre-generated clip exists (caller should fall back to TTS).
 */
export function getBundledAudio(text: string): number | undefined {
  return AUDIO_MANIFEST[normalizeForAudio(text)];
}
