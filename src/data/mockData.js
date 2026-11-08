/** SYNTHETIC DEMO DATA ONLY. No names, identifiers or actual school records. */
import Papa from 'papaparse';
import { analyzeItems } from '../utils/itemAnalysis';

export const SECTIONS = ['Honesty', 'Integrity', 'Perseverance', 'Respect', 'Excellence'];
const MAXIMUMS = { ww: [20, 25, 30, 20, 25], pt: [50, 40, 60], st: [30, 30], te: [60] };
const HASH = (n) => { let x = (n + 1) * 2654435761 >>> 0; x ^= x >>> 16; x = Math.imul(x, 2246822507) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; };
function makeTerm(index, termNumber) {
  // Distinct learner archetypes; deterministic, repeatable and audit-friendly.
  const archetype = index % 12;
  const base = archetype <= 3 ? .90 : archetype <= 6 ? .81 : archetype <= 8 ? .77 : .66;
  const result = {};
  let slot = 0;
  for (const [key, maxList] of Object.entries(MAXIMUMS)) {
    result[key] = maxList.map((max) => {
      const r = HASH(index * 61 + termNumber * 101 + slot++);
      const score = Math.min(max, Math.max(0, Math.round(max * (base + (r - .5) * .12))));
      const missing = (archetype === 11 && slot % 3 === 0) || (archetype === 8 && termNumber === 3 && slot === 10)
        || (archetype === 6 && termNumber === 2 && slot === 4);
      return { score: missing ? null : score, max };
    });
  }
  return result;
}
export const STUDENTS = SECTIONS.flatMap((section, sectionIndex) => Array.from({ length: 12 }, (_, i) => {
  const serial = sectionIndex * 12 + i + 1;
  return {
    id: `DEMO-${section.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
    name: `Demo Learner ${String(serial).padStart(2, '0')}`,
    section,
    terms: { term1: makeTerm(serial, 1), term2: makeTerm(serial, 2), term3: makeTerm(serial, 3) },
  };
}));

// 50 × 20 deterministic OMR; item 16 intentionally inverted, producing negative D.
// Broad item probabilities guarantee different difficulty tiers by design.
const ITEM_PROBABILITIES = [.94, .88, .75, .18, .34, .54, .78, .91, .27, .59, .83, .44, .68, .16, .37, .50, .92, .65, .22, .76];
export const OMR_RESPONSES = STUDENTS.slice(0, 50).map((student, index) => {
  const ability = index % 10 / 9; // stable ability ladder
  return {
    id: student.id,
    answers: ITEM_PROBABILITIES.map((probability, itemIndex) => {
      // Most items discriminate positively; item 16 deliberately reverses the slope.
      if (itemIndex === 15) return +(index % 10 <= 4); // intentionally negative discrimination
      const effective = probability + (ability - .5) * .30;
      return +(HASH(index * 271 + itemIndex * 1709 + 415) < Math.min(.99, Math.max(.01, effective)));
    }),
  };
});
export const DIAGNOSTIC_BY_ID = Object.fromEntries(OMR_RESPONSES.map((r) => [r.id, r.answers]));

// Papa Parse works only with generated in-repo synthetic content; no user upload path.
export const DEMO_CSV = Papa.unparse(OMR_RESPONSES.map((r) => ({ id: r.id, ...Object.fromEntries(r.answers.map((a, i) => [`item${i + 1}`, a])) })));
export function parseSyntheticDemoCsv(csv) {
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true, dynamicTyping: false });
  if (parsed.errors.length) throw new Error('Malformed demo CSV');
  const allowedIds = new Set(OMR_RESPONSES.map((r) => r.id));
  const rows = parsed.data.map((r) => ({ id: r.id, answers: Array.from({ length: 20 }, (_, i) => Number(r[`item${i + 1}`])) }));
  if (rows.length !== 50 || rows.some((r) => !allowedIds.has(r.id)) || new Set(rows.map((r) => r.id)).size !== 50) {
    throw new Error('DEMO MODE: only the bundled 50 synthetic learner IDs are supported');
  }
  const original = Object.fromEntries(OMR_RESPONSES.map((r) => [r.id, r.answers]));
  if (rows.some((r) => r.answers.some((v, i) => v !== original[r.id][i]))) {
    throw new Error('DEMO MODE: data must exactly match bundled synthetic responses');
  }
  analyzeItems(rows); // schema validation
  return rows;
}
