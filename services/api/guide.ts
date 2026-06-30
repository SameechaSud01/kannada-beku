import { supabase } from './supabase';
import {
  WELCOME_POINTS,
  VOWEL_SOUNDS,
  SHORT_LONG_PAIR,
  RETROFLEX_ROWS,
  DOUBLE_WORDS,
  RHYTHM_SENTENCE,
  RECAP_POINTS,
  type WelcomePoint,
  type VowelSound,
  type GuideWord,
  type ShortLongPair,
  type RetroflexRow,
  type RhythmSentence,
} from '../../constants/guide';

/**
 * Source of truth for the Lesson 0 / Kannada-basics content is the DB: the
 * lesson row at slug='basics' carries the structured payload at
 * content_json.reference.guide.
 *
 * constants/guide.ts is kept only as an OFFLINE FALLBACK — the guide runs during
 * first-run onboarding, so a flaky fetch must never leave the primer blank.
 *
 * Redesign 2026-06-30 (spec_lesson0_redesign.md): GuideContent is reshaped for
 * the paced, listen-first 7-step flow. Phase 1 ships the new fallback; the live
 * DB row still carries the OLD guide shape (principles/vowelPairs/chart/…), so
 * parseGuide() rejects it and the loader falls back to the new constants. Phase 2
 * runs the seed migration that replaces content_json.reference.guide with the new
 * shape below — after which this loader reads it straight from the DB.
 */

/** The curated content the 7-step flow renders. Mirrors constants/guide.ts. */
export interface GuideContent {
  welcomePoints: WelcomePoint[];
  vowels: VowelSound[];
  shortLong: ShortLongPair;
  retroflexRows: RetroflexRow[];
  doubles: GuideWord[];
  rhythm: RhythmSentence;
  recap: string[];
}

/** Bundled fallback, mirrored from constants/guide.ts. */
export const FALLBACK_GUIDE: GuideContent = {
  welcomePoints: WELCOME_POINTS,
  vowels: VOWEL_SOUNDS,
  shortLong: SHORT_LONG_PAIR,
  retroflexRows: RETROFLEX_ROWS,
  doubles: DOUBLE_WORDS,
  rhythm: RHYTHM_SENTENCE,
  recap: RECAP_POINTS,
};

/**
 * Validate the raw `reference.guide` blob. Returns a typed GuideContent on a
 * structurally-sound payload, or null so callers fall back. Owner-authored
 * content, so this is a light structural gate, not a deep schema check — it is
 * also what rejects the pre-redesign DB shape (no `welcomePoints`/`vowels`) so
 * Phase 1 cleanly falls back until the Phase 2 migration runs.
 */
function parseGuide(raw: unknown): GuideContent | null {
  if (!raw || typeof raw !== 'object') return null;
  const g = raw as Record<string, unknown>;

  const nonEmptyArray = (v: unknown): v is unknown[] => Array.isArray(v) && v.length > 0;
  const arrayKeys = ['welcomePoints', 'vowels', 'retroflexRows', 'doubles', 'recap'] as const;
  for (const k of arrayKeys) {
    if (!nonEmptyArray(g[k])) return null;
  }

  const shortLong = g.shortLong as Record<string, unknown> | undefined;
  if (!shortLong || typeof shortLong.short !== 'object' || typeof shortLong.long !== 'object') {
    return null;
  }

  const rhythm = g.rhythm as Record<string, unknown> | undefined;
  if (!rhythm || typeof rhythm.kannada !== 'string' || !nonEmptyArray(rhythm.syllables)) {
    return null;
  }

  return {
    welcomePoints: g.welcomePoints as WelcomePoint[],
    vowels: g.vowels as VowelSound[],
    shortLong: g.shortLong as unknown as ShortLongPair,
    retroflexRows: g.retroflexRows as RetroflexRow[],
    doubles: g.doubles as GuideWord[],
    rhythm: g.rhythm as unknown as RhythmSentence,
    recap: g.recap as string[],
  };
}

// Successful DB reads are cached for the session; failures are NOT cached, so a
// later entry (e.g. after reconnecting) can still reach the live row.
let cached: GuideContent | null = null;

/**
 * Fetch the guide content from the DB, parse + validate it, and cache the
 * result. On any failure (network, missing row, malformed payload) returns the
 * bundled fallback without caching so the next call can retry.
 */
export async function fetchGuideContent(): Promise<GuideContent> {
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('content_json')
      .eq('slug', 'basics')
      .maybeSingle();

    if (error) throw error;

    const raw = (data?.content_json as { reference?: { guide?: unknown } } | null)?.reference
      ?.guide;
    const parsed = parseGuide(raw);

    if (!parsed) {
      console.warn('[guide] DB payload missing/invalid; using bundled fallback');
      return FALLBACK_GUIDE;
    }

    cached = parsed;
    return cached;
  } catch (err) {
    console.warn('[guide] fetch failed; using bundled fallback', err);
    return FALLBACK_GUIDE;
  }
}

export function resetGuideCache(): void {
  cached = null;
}
