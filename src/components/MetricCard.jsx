import React from 'react';

export default function MetricCard({ title, value, description, icon: Icon, color = 'text-blue-800', onClick, actionLabel }) {
  const content = <>
    <div className="flex items-start justify-between gap-2"><p className="text-xs font-semibold leading-5 text-slate-500">{title}</p><span className={`rounded-xl bg-slate-50 p-2 ${color}`}><Icon size={18} aria-hidden="true" /></span></div>
    <div className={`mt-3 text-3xl font-extrabold tracking-tight ${color}`}>{value}</div>
    <p className="mt-1 text-xs text-slate-400">{description}</p>
    {onClick && <p className="mt-2 text-xs font-semibold text-blue-700" aria-hidden="true">View learners →</p>}
  </>;
  return onClick
    ? <button type="button" onClick={onClick} aria-label={actionLabel || `View learners for ${title}`} className="panel min-w-0 w-full cursor-pointer text-left transition hover:border-blue-300 hover:bg-blue-50/60 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{content}</button>
    : <article className="panel min-w-0">{content}</article>;
}
