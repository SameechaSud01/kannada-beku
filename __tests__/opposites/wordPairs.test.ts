import { RAW_PAIRS } from '../../src/games/opposites/data/wordPairs';

describe('wordPairs', () => {
  it('has exactly 10 pairs', () => {
    expect(RAW_PAIRS).toHaveLength(10);
  });

  it('every pair has exactly 4 opts', () => {
    RAW_PAIRS.forEach((pair) => {
      expect(pair.opts).toHaveLength(4);
    });
  });

  it('every answer appears in its opts', () => {
    RAW_PAIRS.forEach((pair) => {
      const found = pair.opts.some((opt) => opt.kn === pair.answer);
      expect(found).toBe(true);
    });
  });

  it('no pair has duplicate opt.kn values', () => {
    RAW_PAIRS.forEach((pair) => {
      const kns = pair.opts.map((opt) => opt.kn);
      const unique = new Set(kns);
      expect(unique.size).toBe(kns.length);
    });
  });

  it('every word, tr, meaning, and answer is a non-empty string', () => {
    RAW_PAIRS.forEach((pair) => {
      expect(typeof pair.word).toBe('string');
      expect(pair.word.length).toBeGreaterThan(0);
      expect(typeof pair.tr).toBe('string');
      expect(pair.tr.length).toBeGreaterThan(0);
      expect(typeof pair.meaning).toBe('string');
      expect(pair.meaning.length).toBeGreaterThan(0);
      expect(typeof pair.answer).toBe('string');
      expect(pair.answer.length).toBeGreaterThan(0);
    });
  });
});
