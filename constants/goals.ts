/**
 * Goal-related tuning constants.
 *
 * `WEEKLY_WORD_TARGET` backs the Home "Words learnt" reward banner
 * (chunky_v3 — Home §5). Owner decision (2026-06-13): a fixed sensible default
 * for now rather than a per-user stored target; revisit if we personalise it.
 */
export const WEEKLY_WORD_TARGET = 35;

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
