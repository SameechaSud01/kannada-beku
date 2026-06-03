/**
 * Split a Kannada string into aksharas (orthographic syllables)
 * — spec_dictation_syllable_builder §3.
 *
 * An akshara = a base letter plus any trailing dependent signs that must stay
 * attached: vowel signs, anusvara/visarga/candrabindu, nukta, length marks, and
 * — crucially — virama (್) which binds the *following* consonant into a
 * conjunct cluster.
 *
 * This deterministic splitter is authoritative (rather than `Intl.Segmenter`,
 * whose Indic cluster support varies by JS engine), so the unit tests pin exact
 * behaviour.
 */

const VIRAMA = 0x0ccd;

// Code points that attach to the preceding base (combining marks).
function isCombining(code: number): boolean {
  return (
    code === 0x0c81 || // candrabindu
    code === 0x0c82 || // anusvara
    code === 0x0c83 || // visarga
    code === 0x0cbc || // nukta
    (code >= 0x0cbe && code <= 0x0cc4) || // vowel signs aa..vocalic rr
    (code >= 0x0cc6 && code <= 0x0cc8) || // vowel signs e..ai
    (code >= 0x0cca && code <= 0x0ccc) || // vowel signs o..au
    code === 0x0cd5 || // length mark
    code === 0x0cd6 || // ai length mark
    code === 0x200c || // ZWNJ
    code === 0x200d // ZWJ
  );
}

export function splitAksharas(input: string): string[] {
  const clusters: string[] = [];
  let pendingVirama = false;

  for (const ch of Array.from(input)) {
    const code = ch.codePointAt(0) ?? 0;

    if (clusters.length === 0) {
      clusters.push(ch);
      pendingVirama = code === VIRAMA;
      continue;
    }

    if (isCombining(code)) {
      clusters[clusters.length - 1] += ch;
      continue;
    }

    if (code === VIRAMA) {
      clusters[clusters.length - 1] += ch;
      pendingVirama = true;
      continue;
    }

    if (pendingVirama) {
      // This consonant joins the previous cluster as a conjunct.
      clusters[clusters.length - 1] += ch;
      pendingVirama = false;
      continue;
    }

    clusters.push(ch);
  }

  return clusters;
}

/**
 * Whether a word can be presented as a tile puzzle: it splits into ≥2 aksharas
 * that losslessly recompose the original (no whitespace / stray runs). Words
 * that fail this fall back to typed input.
 */
export function isTileable(word: string): boolean {
  if (/\s/.test(word)) return false;
  const parts = splitAksharas(word);
  return parts.length >= 2 && parts.join('') === word;
}
