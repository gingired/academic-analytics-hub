import React, { useMemo, useState } from 'react';
import { BarChart3, Download, ShieldCheck } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import { analyzeItems } from '../utils/itemAnalysis';
import { classReteachingTargets, competencyForItem } from '../utils/remediationEngine';
import { DEMO_CSV, OMR_RESPONSES, parseSyntheticDemoCsv } from '../data/mockData';

export default function ItemAnalysisView() {
  const [validated, setValidated] = useState(false);
  const analysis = useMemo(() => analyzeItems(OMR_RESPONSES), []);
  const targets = useMemo(() => classReteachingTargets(analysis), [analysis]);
  function downloadDemoCsv() {
    const blob = new Blob([DEMO_CSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); const url = URL.createObjectURL(blob);
    link.href = url; link.download = 'synthetic-demo-omr-50x20.csv'; link.click();
    URL.revokeObjectURL(url);
  }
  function validateBundledCsv() { parseSyntheticDemoCsv(DEMO_CSV); setValidated(true); }
  return <div className="space-y-5"><div><p className="eyebrow">20-item diagnostic / synthetic OMR cohort</p><h1 className="mt-1 text-2xl font-extrabold">Item Analysis</h1><p className="subtle mt-1">Independent diagnostic cohort · 50 demo learners, not linked to selected grading term</p></div>
    <section className="panel"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="panel-title">Diagnostic Overview</h2><p className="subtle mt-1">Upper and lower groups use the top/bottom 27% of ranked scores (stable-ID tie break).</p></div><div className="flex flex-wrap gap-2"><button className="btn-outline inline-flex items-center gap-2" onClick={validateBundledCsv}><ShieldCheck size={16} />Validate Bundled CSV</button><button className="btn-outline inline-flex items-center gap-2" onClick={downloadDemoCsv}><Download size={16} />Download Demo CSV</button></div></div>
      {validated && <p role="status" className="mt-3 text-sm font-medium text-emerald-700">Bundled synthetic CSV passed schema and content validation via Papa Parse.</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-4">{[['Responses', analysis.sampleSize], ['Upper Group', analysis.groups.upper.length], ['Middle Group', analysis.groups.middle.length], ['Lower Group', analysis.groups.lower.length]].map(([label, val]) => <div className="rounded-xl bg-slate-50 p-4" key={label}><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-blue-900">{val}</p></div>)}</div>
    </section>
    <div className="grid gap-4 xl:grid-cols-2"><section className="panel"><h2 className="panel-title">Item Difficulty (p-value)</h2><p className="subtle mt-1">Share of all 50 learners answering correctly</p><div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={analysis.items} margin={{ top: 5, right: 10, left: -18, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="item" tick={{ fontSize: 11 }} /><YAxis domain={[0, 1]} tick={{ fontSize: 11 }} /><Tooltip formatter={(v) => Number(v).toFixed(2)} /><ReferenceLine y={0.4} stroke="#f59e0b" strokeDasharray="4 4" /><Bar dataKey="p" name="p-value" fill="#2563eb" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div></section>
      <section className="panel"><h2 className="panel-title">Discrimination Index (D)</h2><p className="subtle mt-1">Upper minus lower group correct, divided by group size</p><div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={analysis.items} margin={{ top: 5, right: 10, left: -18, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="item" tick={{ fontSize: 11 }} /><YAxis domain={[-1, 1]} tick={{ fontSize: 11 }} /><Tooltip formatter={(v) => Number(v).toFixed(2)} /><ReferenceLine y={0} stroke="#64748b" /><Bar dataKey="d" name="Discrimination" fill="#7c3aed" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div></section></div>
    <section className="panel"><h2 className="panel-title">Class-wide Reteaching Targets</h2><p className="subtle mt-1">Competencies containing one or more items with difficulty p ≤ 0.40</p>
      {targets.length === 0 ? <p className="mt-4 text-sm text-slate-500">No competencies currently cross the reteaching threshold.</p>
        : <div className="mt-4 grid gap-3 md:grid-cols-2">{targets.map((target) => <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4" key={target.id}><p className="text-sm font-bold text-slate-800">{target.title}</p><p className="mt-1 text-xs text-amber-800">Low p-value item(s): {target.flaggedItems.join(', ')}</p><p className="mt-1 text-xs text-slate-500">Competency mean p: {target.meanP.toFixed(2)}</p></div>)}</div>}
    </section>
    <section className="panel"><div className="flex items-center gap-2"><BarChart3 size={19} className="text-blue-800" /><h2 className="panel-title">Item-Level Details</h2></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr><th className="pb-3">Item</th><th className="pb-3">Competency</th><th className="pb-3">Correct</th><th className="pb-3">p-value</th><th className="pb-3">Difficulty</th><th className="pb-3">Upper/Lower</th><th className="pb-3">D</th><th className="pb-3">Discrimination</th></tr></thead><tbody>{analysis.items.map((r) => <tr key={r.item} className="border-b border-slate-100"><td className="py-3 font-semibold">{r.item}</td><td className="max-w-48 text-xs">{competencyForItem(r.item)?.title}</td><td>{r.correct}/{analysis.sampleSize}</td><td className="tabular-nums">{r.p.toFixed(2)}</td><td>{r.difficulty}</td><td>{r.upperCorrect}/{r.lowerCorrect}</td><td className={`font-semibold tabular-nums ${r.d < 0 ? 'text-rose-600' : ''}`}>{r.d?.toFixed(2) ?? '—'}</td><td className={r.d < 0 ? 'font-semibold text-rose-600' : ''}>{r.discrimination}</td></tr>)}</tbody></table></div>
      <p className="mt-3 text-xs text-slate-500">Negative discrimination is a review flag; item rejection should also consider the answer key, item wording, curriculum alignment and assessment context.</p>
    </section>
  </div>;
}
