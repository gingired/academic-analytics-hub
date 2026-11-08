import { describe, expect, it } from 'vitest';
import { calculateSection, calculateTerm } from '../utils/gradeCalculations';
import { STUDENTS } from '../data/mockData';
const make = (score = 80) => Object.fromEntries(Object.entries({ ww: 5, pt: 3, st: 2, te: 1 }).map(([key, count]) =>
  [key, Array.from({ length: count }, () => ({ score, max: 100 }))]));
describe('three-term grading', () => {
  it('accepts 0 as encoded but null as missing', () => {
    const term = make(0);
    expect(calculateTerm(term)).toMatchObject({ encoded: 11, completion: 100, finalWeightedGrade: 0, classification: 'Intervention Needed' });
    term.ww[0].score = null;
    expect(calculateTerm(term)).toMatchObject({ encoded: 10, classification: 'Assessment Incomplete', finalWeightedGrade: null });
  });
  it('correctly applies 20% / 50% / 30% weights', () => {
    const term = make();
    term.ww.forEach((r) => { r.score = 100; });
    term.pt.forEach((r) => { r.score = 60; });
    term.st.forEach((r) => { r.score = 50; });
    term.te.forEach((r) => { r.score = 50; });
    expect(calculateTerm(term).finalWeightedGrade).toBe(65);
  });
  it('normalizes only available categories and avoids 0/0', () => {
    const term = make(null);
    expect(calculateTerm(term).standing).toBeNull();
    term.ww[0].score = 100;
    expect(calculateTerm(term).standing).toBe(100);
    expect(calculateTerm(term).finalWeightedGrade).toBeNull();
  });
  it('handles classification thresholds', () => {
    for (const [score, expected] of [[74, 'Intervention Needed'], [75, 'Monitor Closely'], [79, 'Monitor Closely'], [80, 'On Track']]) {
      expect(calculateTerm(make(score)).classification).toBe(expected);
    }
  });
  it('rejects malformed grading arrays and invalid scores', () => {
    expect(() => calculateTerm({ ...make(), te: [] })).toThrow();
    const term = make(); term.pt[0].score = 101;
    expect(() => calculateTerm(term)).toThrow();
  });
  it('restricts dashboard computations to selected term', () => {
    const fake = [{ ...STUDENTS[0], terms: { term1: make(90), term2: make(60), term3: make(75) } }];
    expect(calculateSection(fake, 'term1').averageStanding).toBe(90);
    expect(calculateSection(fake, 'term2').averageStanding).toBe(60);
    expect(calculateSection(fake, 'term3').averageStanding).toBe(75);
  });
});
