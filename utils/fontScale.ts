/**
 * Pick a display font size that shrinks for longer strings so long words and
 * phrases don't get clipped or awkwardly wrapped on the big lesson cards.
 *
 * Returns the *unscaled* point size — callers still wrap it in `moderateScale()`
 * so device scaling is applied on top. `adjustsFontSizeToFit` stays on the
 * `<Text>` as a final backstop; this just sets a smarter starting point so the
 * step-down is proactive (driven by length) rather than only reactive (driven by
 * overflow), which keeps shorter siblings at their full, intended size.
 *
 * TODO(T020): drives the dynamic-font-size requirement.
 */
export function fitFontSize(
  text: string | undefined | null,
  opts: {
    /** Size used at or under `comfortable` length. */
    max: number;
    /** Floor — never shrink below this. */
    min: number;
    /** Character count that still fits comfortably at `max`. */
    comfortable: number;
  },
): number {
  const { max, min, comfortable } = opts;
  const len = text?.trim().length ?? 0;
  if (len <= comfortable) return max;
  // Interpolate linearly from `max` down to `min`, reaching `min` once the
  // string is ~2.2x the comfortable length; clamp beyond that.
  const span = comfortable * 1.2;
  const over = Math.min(len - comfortable, span);
  const size = max - ((max - min) * over) / span;
  return Math.round(size);
}
