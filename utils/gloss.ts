/**
 * Splits an English gloss into its primary meaning and an optional trailing
 * register/gender qualifier carried in parentheses.
 *
 * Per spec_content_integrity §3.2 (D1): cosmetic parens are dropped from the
 * visible gloss and the qualifier is rendered as a separate chip — never inline.
 *
 *   "you (neutral)"        -> { text: "you", tag: "neutral" }
 *   "How are you? (respectful)" -> { text: "How are you?", tag: "respectful" }
 *   "this person (he)"     -> { text: "this person", tag: "he" }
 *   "Stop here"            -> { text: "Stop here", tag: null }
 */
export type SplitGloss = { text: string; tag: string | null };

const TRAILING_PAREN = /^(.*?)\s*\(([^()]+)\)\s*$/;

export function splitGloss(raw: string): SplitGloss {
  const match = raw.trim().match(TRAILING_PAREN);
  if (!match) return { text: raw.trim(), tag: null };
  return { text: match[1].trim(), tag: match[2].trim() };
}
