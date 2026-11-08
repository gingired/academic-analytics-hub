import { describe, expect, it } from 'vitest';
import { classReteachingTargets, competencyForItem, individualRemediation } from '../utils/remediationEngine';
import { analyzeItems } from '../utils/itemAnalysis';
describe('remediation engine', () => {
  it('maps all 20 items exactly once', () => {
    expect(Array.from({ length: 20 }, (_, i) => competencyForItem(i + 1)?.id).every(Boolean)).toBe(true);
  });
  it('identifies specific missed items', () => {
    const answers = Array(20).fill(1); answers[0] = 0; answers[4] = 0; answers[5] = 0;
    const gaps = individualRemediation(answers);
    expect(gaps.find((g) => g.id === 'wages').missedItems).toEqual([1]);
    expect(gaps.find((g) => g.id === 'percent').missedItems).toEqual([5, 6]);
  });
  it('flags competence when item p ≤ 0.40', () => {
    const rows = Array.from({ length: 10 }, (_, index) => ({ id: `DEMO-${index}`, answers: Array.from({ length: 20 }, (_, item) => item === 0 ? +(index < 4) : 1) }));
    const targets = classReteachingTargets(analyzeItems(rows));
    expect(targets.find((r) => r.id === 'wages').flaggedItems).toContain(1);
  });
});
