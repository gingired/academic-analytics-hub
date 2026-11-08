export const COMPETENCIES = [
  { id: 'wages', title: 'Calculate wages and incomes', items: [1, 2, 3, 4] },
  { id: 'percent', title: 'Percentage increase and decrease', items: [5, 6, 7] },
  { id: 'patterns', title: 'Identify rules of patterns', items: [8, 9, 10] },
  { id: 'sequences', title: 'Arithmetic and geometric sequences', items: [11, 12, 13] },
  { id: 'measurement', title: 'Measurement conversions', items: [14, 15, 16] },
  { id: 'functions', title: 'Classify and sketch functions', items: [17, 18, 19, 20] },
];
export const competencyForItem = (itemNumber) => COMPETENCIES.find((c) => c.items.includes(itemNumber));

export function individualRemediation(answers) {
  if (!Array.isArray(answers) || answers.length !== 20 || answers.some((a) => a !== 0 && a !== 1)) {
    throw new Error('Expected a 20-item binary diagnostic response');
  }
  return COMPETENCIES.map((c) => {
    const missedItems = c.items.filter((i) => answers[i - 1] === 0);
    return { ...c, missedItems, missed: missedItems.length, accuracy: (c.items.length - missedItems.length) / c.items.length };
  }).filter((c) => c.missed > 0).sort((a, b) => b.missed / b.items.length - a.missed / a.items.length || a.items[0] - b.items[0]);
}

export function classReteachingTargets(analysis) {
  return COMPETENCIES.map((c) => {
    const flaggedItems = c.items.filter((i) => {
      const metric = analysis.items.find((m) => m.item === i);
      return metric && metric.p <= 0.40 + 1e-9;
    });
    const available = analysis.items.filter((m) => c.items.includes(m.item));
    const meanP = available.length ? available.reduce((a, m) => a + m.p, 0) / available.length : null;
    return { ...c, flaggedItems, meanP };
  }).filter((c) => c.flaggedItems.length > 0)
    .sort((a, b) => b.flaggedItems.length - a.flaggedItems.length || a.meanP - b.meanP);
}
