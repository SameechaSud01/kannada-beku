import { scoreAnswer, classifyScore } from '../../src/games/dictation/utils/fuzzyScore';

describe('scoreAnswer', () => {
  it('returns 100 for exact match on first accepted', () => {
    expect(scoreAnswer('neeru', ['neeru', 'niru'])).toBe(100);
  });

  it('is case-insensitive', () => {
    expect(scoreAnswer('NEERU', ['neeru'])).toBe(100);
  });

  it('returns 100 for exact match on second accepted', () => {
    expect(scoreAnswer('niru', ['neeru', 'niru'])).toBe(100);
  });

  it('returns 60–99 for a close but non-exact answer', () => {
    const score = scoreAnswer('neru', ['neeru']);
    expect(score).toBeGreaterThanOrEqual(60);
    expect(score).toBeLessThan(100);
  });

  it('returns below 40 for a clearly wrong answer', () => {
    expect(scoreAnswer('xyz', ['neeru'])).toBeLessThan(40);
  });

  it('returns 0 for an empty answer', () => {
    expect(scoreAnswer('', ['neeru'])).toBe(0);
  });
});

describe('classifyScore', () => {
  it('classifies 100 as correct', () => {
    expect(classifyScore(100)).toBe('correct');
  });

  it('classifies 75 as partial', () => {
    expect(classifyScore(75)).toBe('partial');
  });

  it('classifies 99 as partial', () => {
    expect(classifyScore(99)).toBe('partial');
  });

  it('classifies 39 as wrong', () => {
    expect(classifyScore(39)).toBe('wrong');
  });

  it('classifies 0 as wrong', () => {
    expect(classifyScore(0)).toBe('wrong');
  });
});
