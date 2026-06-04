/**
 * Canonical TTS playback-speed options. Single source of truth so the Settings
 * screen and the in-lesson speed control stay in sync (spec_lesson_runner_ux §2.4).
 * Values mirror `public.users.tts_rate` and are clamped by the audio service.
 */
export const RATE_OPTIONS: { label: string; value: number }[] = [
  { label: '0.75x', value: 0.75 },
  { label: '1.0x', value: 1.0 },
  { label: '1.25x', value: 1.25 },
];

/** Human label for a rate value; falls back to `${value}x` for off-list values. */
export function rateLabel(value: number): string {
  return RATE_OPTIONS.find((o) => o.value === value)?.label ?? `${value}x`;
}
