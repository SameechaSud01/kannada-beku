import { supabase } from './supabase';
import {
  BASIC_PRINCIPLES,
  VOWEL_PAIRS,
  VOWEL_LONERS,
  TRY_IT,
  type BasicPrinciple,
  type VowelPair,
  type VowelLoner,
} from '../../constants/guide';

/**
 * Source of truth for the Beginners' Guide is the DB: the lesson row at
 * slug='basics' carries the structured guide payload at
 * content_json.reference.guide (see migration 2026-06-15_basics_guide_content).
 *
 * constants/guide.ts is kept only as an OFFLINE FALLBACK — the guide runs during
 * first-run onboarding, so a flaky fetch must never leave the primer blank. The
 * fallback is assembled from the same constants below.
 *
 * Onboarding-simplification (2026-06-22): the flow is now 3 screens, so only
 * principles/vowels/tryIt are consumed. The live DB row may still carry the old
 * consonantFamilies/readingRows/chart fields — they're simply ignored here.
 */

export interface GuideTryIt {
  transliteration: string;
  kannada: string;
  english: string;
}

/** The curated, linguistic content the 3-step flow renders. */
export interface GuideContent {
  principles: BasicPrinciple[];
  vowelPairs: VowelPair[];
  vowelLoners: VowelLoner[];
  tryIt: GuideTryIt;
}

/** Bundled fallback, mirrored from constants/guide.ts. */
export const FALLBACK_GUIDE: GuideContent = {
  principles: BASIC_PRINCIPLES,
  vowelPairs: VOWEL_PAIRS,
  vowelLoners: VOWEL_LONERS,
  tryIt: TRY_IT,
};

/**
 * Validate the raw `reference.guide` blob. Returns a typed GuideContent on a
 * structurally-sound payload, or null so callers fall back. Owner-authored
 * content, so this is a light structural gate, not a deep schema check.
 */
function parseGuide(raw: unknown): GuideContent | null {
  if (!raw || typeof raw !== 'object') return null;
  const g = raw as Record<string, unknown>;

  const nonEmptyArray = (v: unknown): v is unknown[] => Array.isArray(v) && v.length > 0;
  const arrayKeys = ['principles', 'vowelPairs', 'vowelLoners'] as const;
  for (const k of arrayKeys) {
    if (!nonEmptyArray(g[k])) return null;
  }

  const tryIt = g.tryIt as Record<string, unknown> | undefined;
  if (!tryIt || typeof tryIt.kannada !== 'string') return null;

  return {
    principles: g.principles as BasicPrinciple[],
    vowelPairs: g.vowelPairs as VowelPair[],
    vowelLoners: g.vowelLoners as VowelLoner[],
    tryIt: tryIt as unknown as GuideTryIt,
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
