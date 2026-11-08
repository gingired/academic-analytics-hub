/** Deterministic item analysis. Tied scores use stable learner IDs for ranking. */
const DIFFICULTY = [
  [0.20, 'Very Difficult'], [0.40, 'Difficult'], [0.60, 'Moderate'],
  [0.80, 'Easy'], [1, 'Very Easy'],
];
export function difficultyLabel(p) { return DIFFICULTY.find(([max]) => p <= max + 1e-9)?.[1] ?? 'Unknown'; }
export function discriminationLabel(d) {
  if (d < 0.20) return 'Poor (Drop)';
  if (d < 0.30) return 'Marginal (Revise)';
  if (d < 0.40) return 'Good';
  return 'Excellent (Keep)';
}

export function analyzeItems(responses) {
  if (!Array.isArray(responses) || responses.length === 0) return { items: [], sampleSize: 0, groupSize: 0, groups: { upper: [], middle: [], lower: [] } };
  const width = responses[0]?.answers?.length;
  if (width !== 20) throw new Error('Diagnostic tests must contain exactly 20 items');
  const seen = new Set();
  for (const row of responses) {
    if (typeof row.id !== 'string' || seen.has(row.id) || !Array.isArray(row.answers)
      || row.answers.length !== 20 || row.answers.some((a) => a !== 0 && a !== 1)) {
      throw new Error('Each learner needs a unique ID and exactly 20 binary answers');
    }
    seen.add(row.id);
  }
  const ranked = responses.map((r) => ({ ...r, total: r.answers.reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.total - a.total || a.id.localeCompare(b.id));
  // Rounded to nearest whole learner; clamp to prevent upper/lower overlap.
  const groupSize = Math.min(Math.round(responses.length * .27), Math.floor(responses.length / 2));
  const upper = ranked.slice(0, groupSize);
  const lower = groupSize ? ranked.slice(-groupSize) : [];
  const middle = ranked.slice(groupSize, ranked.length - groupSize);
  const items = Array.from({ length: width }, (_, index) => {
    const correct = responses.reduce((n, r) => n + r.answers[index], 0);
    const upperCorrect = upper.reduce((n, r) => n + r.answers[index], 0);
    const lowerCorrect = lower.reduce((n, r) => n + r.answers[index], 0);
    const p = correct / responses.length;
    const d = groupSize ? (upperCorrect - lowerCorrect) / groupSize : null;
    return {
      item: index + 1, correct, p, difficulty: difficultyLabel(p),
      upperCorrect, lowerCorrect, d, discrimination: d === null ? 'Insufficient Data' : discriminationLabel(d),
    };
  });
  return { items, sampleSize: responses.length, groupSize, groups: { upper, middle, lower } };
}
