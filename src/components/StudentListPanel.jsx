import React from 'react';
import StatusBadge from './StatusBadge';
const fmt = (value) => value === null ? '—' : `${value.toFixed(1)}%`;
export default function StudentListPanel({ title, subtitle, rows, onProfile, emptyText }) {
  return <section className="panel min-w-0">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-2"><div><h2 className="panel-title">{title}</h2><p className="subtle mt-1">{subtitle}</p></div><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{rows.length} learners</span></div>
    {rows.length === 0 ? <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">{emptyText}</p> :
    <div className="max-h-[370px] space-y-2 overflow-y-auto pr-1">
      {rows.map((row) => <div key={row.student.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{row.student.name}</p><p className="mt-0.5 text-xs text-slate-500">{row.student.section} · Standing {fmt(row.standing)} · Encoded {row.completion.toFixed(0)}%</p><div className="mt-2"><StatusBadge status={row.classification} /></div></div>
        <button className="btn-outline shrink-0" onClick={() => onProfile(row.student)}>Profile</button>
      </div>)}
    </div>}
  </section>;
}
