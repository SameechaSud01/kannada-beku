import { AnswerState } from '../types';

export function levenshtein(a: string, b: string): number {
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  const m = al.length;
  const n = bl.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (al[i - 1] === bl[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export function scoreAnswer(answer: string, accepted: string[]): number {
  const norm = answer.trim().toLowerCase();
  if (norm.length === 0) return 0;

  for (const a of accepted) {
    if (norm === a.toLowerCase()) return 100;
  }

  let best = 0;
  for (const a of accepted) {
    const normA = a.toLowerCase();
    const dist = levenshtein(norm, normA);
    const similarity = Math.round((1 - dist / Math.max(norm.length, normA.length)) * 100);
    if (similarity > best) best = similarity;
  }
  return Math.max(0, Math.min(100, best));
}

export function classifyScore(score: number): AnswerState {
  if (score === 100) return 'correct';
  if (score >= 40) return 'partial';
  return 'wrong';
}
