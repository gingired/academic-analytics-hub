/** Pure, deterministic Three-Term grading logic. No DepEd transmutation is applied. */
export const TERM_KEYS = ['term1', 'term2', 'term3'];
export const ASSESSMENT_CONFIG = Object.freeze({
  ww: { label: 'Written Works', count: 5, weight: 0.20 },
  pt: { label: 'Performance Tasks', count: 3, weight: 0.50 },
  st: { label: 'Summative Tests', count: 2, weight: 0.30 },
  te: { label: 'Term Exam', count: 1, weight: 0.30 },
});
export const COMPONENTS = [
  { key: 'ww', label: 'Written Works', weight: 0.20, keys: ['ww'] },
  { key: 'pt', label: 'Performance Tasks', weight: 0.50, keys: ['pt'] },
  { key: 'exam', label: 'Summative Tests & Term Exam', weight: 0.30, keys: ['st', 'te'] },
];
const VALID_SCORE = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
export const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

export function assertValidTerm(term) {
  for (const [key, { count }] of Object.entries(ASSESSMENT_CONFIG)) {
    if (!Array.isArray(term?.[key]) || term[key].length !== count) throw new Error(`Expected exactly ${count} ${key} assessments`);
    for (const record of term[key]) {
      if (!record || !VALID_SCORE(record.max) || record.max === 0) throw new Error('Assessment maximum must be positive');
      if (record.score !== null && (!VALID_SCORE(record.score) || record.score > record.max)) {
        throw new Error('Score must be null or within 0..max');
      }
    }
  }
  return true;
}

export function calculateTerm(term) {
  assertValidTerm(term);
  const groups = {};
  let encoded = 0;
  for (const [key, config] of Object.entries(ASSESSMENT_CONFIG)) {
    const records = term[key];
    const completed = records.filter(({ score }) => score !== null);
    encoded += completed.length;
    const earned = completed.reduce((sum, r) => sum + r.score, 0);
    const possible = completed.reduce((sum, r) => sum + r.max, 0);
    groups[key] = {
      count: records.length, completed: completed.length, earned, possible,
      percent: possible > 0 ? round2((earned / possible) * 100) : null,
      completion: round2(100 * completed.length / records.length),
    };
  }
  const components = COMPONENTS.map((definition) => {
    const earned = definition.keys.reduce((sum, k) => sum + groups[k].earned, 0);
    const possible = definition.keys.reduce((sum, k) => sum + groups[k].possible, 0);
    return { ...definition, earned, possible, percent: possible > 0 ? round2(earned / possible * 100) : null };
  });
  const availableComponents = components.filter((c) => c.percent !== null);
  const availableWeight = availableComponents.reduce((sum, c) => sum + c.weight, 0);
  const weightedTotal = availableComponents.reduce((sum, c) => sum + c.percent * c.weight, 0);
  const completion = round2(encoded / 11 * 100);
  const complete = encoded === 11;
  // Standing normalizes weights of available components, not raw achieved points.
  const standing = availableWeight > 0 ? round2(weightedTotal / availableWeight) : null;
  const finalWeightedGrade = complete ? round2(weightedTotal) : null;
  // Incomplete ALWAYS takes precedence; never label partial evidence as passing/failing.
  const classification = !complete ? 'Assessment Incomplete'
    : standing < 75 ? 'Intervention Needed'
    : standing < 80 ? 'Monitor Closely' : 'On Track';
  return { groups, components, encoded, required: 11, completion, complete, standing, finalWeightedGrade, classification };
}

export function calculateSection(students, termKey) {
  if (!TERM_KEYS.includes(termKey)) throw new Error('Unknown term');
  const rows = students.map((student) => ({ student, ...calculateTerm(student.terms[termKey]) }));
  const sum = (nums) => nums.reduce((a, b) => a + b, 0);
  const standingValues = rows.map((r) => r.standing).filter((n) => n !== null);
  const counts = Object.fromEntries(['On Track', 'Monitor Closely', 'Intervention Needed', 'Assessment Incomplete']
    .map((status) => [status, rows.filter((r) => r.classification === status).length]));
  return {
    rows, counts, total: rows.length,
    completion: rows.length ? round2(sum(rows.map((r) => r.encoded)) / (rows.length * 11) * 100) : 0,
    averageStanding: standingValues.length ? round2(sum(standingValues) / standingValues.length) : null,
    encoding: Object.fromEntries(['ww', 'pt', 'st', 'te'].map((key) => [key, rows.length
      ? round2(sum(rows.map((r) => r.groups[key].completed)) / (rows.length * ASSESSMENT_CONFIG[key].count) * 100) : 0])),
  };
}
