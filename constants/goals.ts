/**
 * Goal-related tuning constants.
 *
 * (`WEEKLY_WORD_TARGET` removed 2026-07-05 per spec_home_stats_emergency_polish
 * D1 — the Home words-learnt card is a plain all-time stat, no weekly target.)
 */

/**
 * Per-day targets for the three "daily goal" activity dimensions
 * (Listen / Speak / Practice). These back the local, client-only daily
 * counters in progressStore — there is no DB table for per-day activity, so
 * Listen (audio plays) and Speak (practice-phase reps) cannot be derived
 * server-side. Owner-tunable defaults (2026-06-13):
 *   - Listen: audio plays in-app (auto-play counts).
 *   - Speak:  practice-phase "I said it" reps in a lesson.
 *   - Practice: questions answered across games.
 */
export const DAILY_LISTEN_TARGET = 10;
export const DAILY_SPEAK_TARGET = 8;
export const DAILY_PRACTICE_TARGET = 10;

/**
 * Weight of the "learning" track (vs. the "doing"/games track) in the overall
 * progress rollup — α in `mastery = α·learn + (1−α)·practice`. The single
 * principled knob that replaced the old hand-tuned 50/25/25 split. 0.5 = a
 * lesson is half learnt-it, half can-use-it. See services/progress/overallMastery.ts.
 */
export const LEARN_ALPHA = 0.5;
