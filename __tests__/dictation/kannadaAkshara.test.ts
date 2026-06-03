import { splitAksharas, isTileable } from '../../src/games/dictation/utils/kannadaAkshara';

describe('splitAksharas', () => {
  it('keeps a base consonant and its vowel sign together', () => {
    // ನ (na) + ◌ಮ... use ನಮಸ್ಕಾರ (namaskaara)
    // ನ | ಮ | ಸ್ಕಾ | ರ
    expect(splitAksharas('ನಮಸ್ಕಾರ')).toEqual(['ನ', 'ಮ', 'ಸ್ಕಾ', 'ರ']);
  });

  it('binds a virama-joined conjunct into one akshara', () => {
    // ಸ + ್ + ಕ + ಾ → ಸ್ಕಾ stays one cluster
    expect(splitAksharas('ಸ್ಕಾ')).toEqual(['ಸ್ಕಾ']);
  });

  it('attaches a standalone vowel sign to its base', () => {
    // ಕ (ka) + ಾ (aa sign) = ಕಾ
    expect(splitAksharas('ಕಾ')).toEqual(['ಕಾ']);
  });

  it('splits a simple two-syllable word', () => {
    // ಮನೆ (mane): ಮ | ನೆ
    expect(splitAksharas('ಮನೆ')).toEqual(['ಮ', 'ನೆ']);
  });

  it('losslessly recomposes the input', () => {
    const words = ['ನಮಸ್ಕಾರ', 'ಮನೆ', 'ಕಾ', 'ಹೆಸರು', 'ಊಟ'];
    for (const w of words) {
      expect(splitAksharas(w).join('')).toBe(w);
    }
  });
});

describe('isTileable', () => {
  it('accepts multi-akshara single words', () => {
    expect(isTileable('ನಮಸ್ಕಾರ')).toBe(true);
    expect(isTileable('ಮನೆ')).toBe(true);
  });

  it('rejects single-akshara words', () => {
    expect(isTileable('ಕಾ')).toBe(false);
  });

  it('rejects words containing whitespace', () => {
    expect(isTileable('ಒಂದು ಎರಡು')).toBe(false);
  });
});
