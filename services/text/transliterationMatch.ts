/**
 * Normalize a transliteration string for fuzzy matching.
 * Lowercase, trim, strip diacritics, collapse whitespace.
 */
export function normalizeTransliteration(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Check if user input matches the expected transliteration.
 * Handles [name] placeholders by accepting any non-empty token in that position.
 */
export function transliterationMatches(input: string, expected: string): boolean {
  const normInput = normalizeTransliteration(input);
  const normExpected = normalizeTransliteration(expected);

  if (normInput === normExpected) return true;

  if (normExpected.includes('[name]')) {
    const pattern = normExpected
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\\[name\\\]/g, '\\S+');
    return new RegExp(`^${pattern}$`).test(normInput);
  }

  return false;
}
