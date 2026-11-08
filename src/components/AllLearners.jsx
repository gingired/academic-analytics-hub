import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import StatusBadge from './StatusBadge';
const fmt = (value) => value === null ? '—' : `${value.toFixed(2)}%`;
export default function AllLearners({ summary, termLabel, onProfile, initialFilter = 'All', onFilterChange }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(initialFilter);
  const headingRef = useRef(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  useEffect(() => { setFilter(initialFilter); }, [initialFilter]);
  const filtered = useMemo(() => summary.rows.filter((row) =>
    (filter === 'All' || row.classification === filter) &&
    `${row.student.id} ${row.student.name} ${row.student.section}`.toLowerCase().includes(search.trim().toLowerCase())), [summary.rows, search, filter]);
  return <div className="space-y-5"><div><p className="eyebrow">Learner directory / {termLabel}</p><h1 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-extrabold outline-none">All Learners</h1><p className="subtle mt-1">Search synthetic learner records · {summary.total} in selected section</p></div>
    <section className="panel">{filter !== 'All' && <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900"><span>Showing learners classified as <strong>{filter}</strong> for {termLabel}.</span><button type="button" className="font-semibold underline underline-offset-2" onClick={() => { setFilter('All'); onFilterChange?.('All'); }}>Clear filter</button></div>}<div className="mb-4 flex flex-wrap gap-3"><label className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><span className="sr-only">Search learners</span><input className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm" placeholder="Search demo name, ID, section" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
      <select className="rounded-lg border border-slate-200 bg-white p-2 text-sm" aria-label="Filter by classification" value={filter} onChange={(e) => { setFilter(e.target.value); onFilterChange?.(e.target.value); }}>{['All', 'On Track', 'Monitor Closely', 'Intervention Needed', 'Assessment Incomplete'].map((v) => <option key={v}>{v}</option>)}</select></div>
      <p className="mb-3 text-xs text-slate-500">{filtered.length} matching synthetic learners</p>
      <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="pb-3">Learner</th><th className="pb-3">Section</th><th className="pb-3">Standing</th><th className="pb-3">Completion</th><th className="pb-3">Classification</th><th className="pb-3 text-right">Action</th></tr></thead>
        <tbody>{filtered.map((r) => <tr key={r.student.id} className="border-b border-slate-100"><td className="py-3"><p className="font-semibold">{r.student.name}</p><p className="text-xs text-slate-400">{r.student.id}</p></td><td>{r.student.section}</td><td className="tabular-nums">{fmt(r.standing)}</td><td className="tabular-nums">{r.completion.toFixed(1)}%</td><td><StatusBadge status={r.classification} /></td><td className="text-right"><button className="btn-outline" onClick={() => onProfile(r.student)}>Profile</button></td></tr>)}</tbody></table>
      {filtered.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No demo learners match those filters.</p>}</div>
    </section></div>;
}
