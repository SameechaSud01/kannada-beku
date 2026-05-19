import { WORD_BANK } from '../../src/games/dictation/data/wordBank';

describe('WORD_BANK', () => {
  it('has exactly 10 items', () => {
    expect(WORD_BANK).toHaveLength(10);
  });

  it('every entry has at least 1 accepted spelling', () => {
    WORD_BANK.forEach((word) => {
      expect(word.accepted.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('every accepted spelling is a non-empty string', () => {
    WORD_BANK.forEach((word) => {
      word.accepted.forEach((spelling) => {
        expect(typeof spelling).toBe('string');
        expect(spelling.length).toBeGreaterThan(0);
      });
    });
  });

  it('every kn and phonetic is a non-empty string', () => {
    WORD_BANK.forEach((word) => {
      expect(typeof word.kn).toBe('string');
      expect(word.kn.length).toBeGreaterThan(0);
      expect(typeof word.phonetic).toBe('string');
      expect(word.phonetic.length).toBeGreaterThan(0);
    });
  });

  it('no entry has duplicate values within its accepted array', () => {
    WORD_BANK.forEach((word) => {
      const unique = new Set(word.accepted.map((s) => s.toLowerCase()));
      expect(unique.size).toBe(word.accepted.length);
    });
  });
});
