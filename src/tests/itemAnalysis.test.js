import { describe, expect, it } from 'vitest';
import { analyzeItems, difficultyLabel, discriminationLabel } from '../utils/itemAnalysis';
import { OMR_RESPONSES, STUDENTS, DEMO_CSV, parseSyntheticDemoCsv } from '../data/mockData';
describe('item analysis', () => {
  it('partitions 50 into 14, 22, 14 (rounded 27%)', () => {
    const a = analyzeItems(OMR_RESPONSES);
    expect([a.groups.upper.length, a.groups.middle.length, a.groups.lower.length]).toEqual([14, 22, 14]);
    expect(a.items).toHaveLength(20);
  });
  it('provides a range of difficulty and at least one negative discrimination', () => {
    const a = analyzeItems(OMR_RESPONSES);
    expect(a.items.some((r) => r.d < 0)).toBe(true);
    expect(a.items.some((r) => r.difficulty === 'Very Easy')).toBe(true);
    expect(a.items.some((r) => r.difficulty === 'Very Difficult')).toBe(true);
  });
  it('uses inclusive, unrounded threshold comparisons', () => {
    expect(difficultyLabel(.20)).toBe('Very Difficult');
    expect(difficultyLabel(.40)).toBe('Difficult');
    expect(difficultyLabel(.80)).toBe('Easy');
    expect(discriminationLabel(-.3)).toBe('Poor (Drop)');
    expect(discriminationLabel(.20)).toBe('Marginal (Revise)');
    expect(discriminationLabel(.40)).toBe('Excellent (Keep)');
  });
  it('safely handles empty cohorts and rejects nonbinary items', () => {
    expect(analyzeItems([]).items).toEqual([]);
    expect(() => analyzeItems([{ id: 'DEMO', answers: Array(20).fill(null) }])).toThrow();
  });
  it('validates only the built-in synthetic CSV without accepting altered rows', () => {
    expect(parseSyntheticDemoCsv(DEMO_CSV)).toHaveLength(50);
    expect(() => parseSyntheticDemoCsv(DEMO_CSV.replace('DEMO-HON-001', 'REAL-123'))).toThrow();
    expect(STUDENTS).toHaveLength(60);
  });
});
